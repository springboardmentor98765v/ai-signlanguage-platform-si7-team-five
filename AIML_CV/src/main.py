import io
import os
import urllib.request
from pathlib import Path

import cv2
import joblib
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mediapipe import Image, ImageFormat
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
try:
    from .database import initialise_database, log_prediction
except ImportError:
    from src.database import initialise_database, log_prediction

app = FastAPI(title="Sign Language AI Prediction Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "hand_landmarker.task"
# M2: use the augmented-dataset classifier (real train/test split) instead of
# the Milestone 1 single-sample classifier.
CLASSIFIER_PATH = MODELS_DIR / "knn_classifier_m2.joblib"
STATS_PATH = MODELS_DIR / "class_feature_stats.joblib"
HAND_LANDMARKER_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

# See docs/MODEL_CARD.md: this threshold is NOT reliably calibrated yet.
# Synthetic-augmentation-dominated per-class stats produce high z-scores even
# for correct predictions, so we only flag extreme deviations to reduce false
# positives until real diverse per-class data is collected.
ISSUE_Z_THRESHOLD = 30

FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)
FEATURE_HINTS = {
    "tip_wrist_dist_0": "thumb extension",
    "tip_wrist_dist_1": "index finger extension",
    "tip_wrist_dist_2": "middle finger extension",
    "tip_wrist_dist_3": "ring finger extension",
    "tip_wrist_dist_4": "pinky extension",
    "curl_angle_0": "thumb curl",
    "curl_angle_1": "index finger curl",
    "curl_angle_2": "middle finger curl",
    "curl_angle_3": "ring finger curl",
    "curl_angle_4": "pinky curl",
    "adj_tip_dist_0": "thumb-index spread",
    "adj_tip_dist_1": "index-middle spread",
    "adj_tip_dist_2": "middle-ring spread",
    "adj_tip_dist_3": "ring-pinky spread",
}


def ensure_model_assets() -> None:
    MODELS_DIR.mkdir(exist_ok=True)
    if not MODEL_PATH.exists():
        print(f"Downloading hand landmarker model to {MODEL_PATH}...")
        urllib.request.urlretrieve(HAND_LANDMARKER_URL, MODEL_PATH)


ensure_model_assets()
initialise_database()


def create_detector():
    try:
        base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.5,
        )
        return vision.HandLandmarker.create_from_options(options)
    except Exception as exc:
        print(f"Could not initialize hand detector: {exc}")
        return None


def load_classifier():
    if not CLASSIFIER_PATH.exists():
        print(f"Classifier model not found at {CLASSIFIER_PATH}. Prediction endpoint will return 'unknown'.")
        return None
    try:
        return joblib.load(CLASSIFIER_PATH)
    except Exception as exc:
        print(f"Could not load classifier: {exc}")
        return None


def load_class_stats():
    if not STATS_PATH.exists():
        print(f"Class feature stats not found at {STATS_PATH}. possible_issue hints disabled.")
        return None
    try:
        return joblib.load(STATS_PATH)
    except Exception as exc:
        print(f"Could not load class stats: {exc}")
        return None


detector = create_detector()
classifier = load_classifier()
class_stats = load_class_stats()


def landmarks_to_array(hand_landmarks):
    return np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks])


def normalize_landmarks(points):
    wrist = points[WRIST]
    translated = points - wrist
    scale = np.linalg.norm(translated[MIDDLE_MCP])
    if scale < 1e-6:
        scale = 1e-6
    return translated / scale


def compute_angle(p1, p2, p3):
    v1 = p1 - p2
    v2 = p3 - p2
    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
    cos_angle = np.clip(cos_angle, -1.0, 1.0)
    return np.degrees(np.arccos(cos_angle))


def extract_features(hand_landmarks):
    points = landmarks_to_array(hand_landmarks)
    norm_points = normalize_landmarks(points)
    features = []
    for tip_idx in FINGERTIPS:
        features.append(np.linalg.norm(norm_points[tip_idx]))
    finger_joint_triplets = [(1, 2, 4), (5, 6, 8), (9, 10, 12), (13, 14, 16), (17, 18, 20)]
    for base, mid, tip in finger_joint_triplets:
        features.append(compute_angle(norm_points[base], norm_points[mid], norm_points[tip]))
    for i in range(len(FINGERTIPS) - 1):
        features.append(np.linalg.norm(norm_points[FINGERTIPS[i]] - norm_points[FINGERTIPS[i + 1]]))
    return np.array(features).reshape(1, -1)


def get_possible_issue(features, predicted_label):
    if class_stats is None or predicted_label not in class_stats:
        return None
    features_flat = np.array(features).flatten()
    mean = class_stats[predicted_label]["mean"]
    std = class_stats[predicted_label]["std"]
    z_scores = np.abs((features_flat - mean) / std)
    max_idx = np.argmax(z_scores)
    max_z = z_scores[max_idx]
    if max_z < ISSUE_Z_THRESHOLD:
        return None
    feature_name = FEATURE_NAMES[max_idx]
    return f"{FEATURE_HINTS[feature_name]} looks off"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "detector_ready": detector is not None,
        "classifier_ready": classifier is not None,
        "class_stats_ready": class_stats is not None,
        "model_path": str(MODEL_PATH),
        "classifier_path": str(CLASSIFIER_PATH),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...), expected_label: str | None = Form(default=None)):
    if detector is None:
        return JSONResponse(
            status_code=503,
            content={"predicted_sign": None, "confidence": 0.0, "message": "AI model is not ready"},
        )

    if classifier is None:
        return JSONResponse(
            status_code=200,
            content={"predicted_sign": "unknown", "confidence": 0.0, "message": "Classifier model not trained yet"},
        )

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr_img is None:
        return JSONResponse(
            status_code=400,
            content={"predicted_sign": None, "confidence": 0.0, "message": "Invalid image file"},
        )

    rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    mp_image = Image(image_format=ImageFormat.SRGB, data=rgb_img)
    result = detector.detect(mp_image)

    if not result.hand_landmarks:
        return JSONResponse(
            status_code=200,
            content={
                "predicted_sign": None,
                "confidence": 0.0,
                "hand_detected": False,
                "message": "No hand detected. Center one hand inside the guide and hold still.",
            },
        )

    features = extract_features(result.hand_landmarks[0])
    prediction = classifier.predict(features)[0]
    probabilities = classifier.predict_proba(features)[0]
    confidence = float(max(probabilities))

    predicted_sign = str(prediction).upper()
    rounded_confidence = round(confidence, 3)
    possible_issue = get_possible_issue(features, str(prediction))

    log_prediction(expected_label.upper() if expected_label else None, predicted_sign, rounded_confidence)

    return {
        "predicted_sign": predicted_sign,
        "confidence": rounded_confidence,
        "hand_detected": True,
        "possible_issue": possible_issue,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
