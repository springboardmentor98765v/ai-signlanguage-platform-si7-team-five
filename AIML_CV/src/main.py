import io
import numpy as np
import joblib
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image, ImageFormat
import cv2

app = FastAPI(title="Sign Language AI Prediction Service")

MODEL_PATH = "models/hand_landmarker.task"
CLASSIFIER_PATH = "models/knn_classifier.joblib"

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

base_options = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=1,
    min_hand_detection_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)
classifier = joblib.load(CLASSIFIER_PATH)


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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)

    mp_image = Image(image_format=ImageFormat.SRGB, data=rgb_img)
    result = detector.detect(mp_image)

    if not result.hand_landmarks:
        return JSONResponse(
            status_code=200,
            content={"predicted_sign": None, "confidence": 0.0, "message": "No hand detected"}
        )

    features = extract_features(result.hand_landmarks[0])
    prediction = classifier.predict(features)[0]
    probabilities = classifier.predict_proba(features)[0]
    confidence = float(max(probabilities))

    return {"predicted_sign": prediction, "confidence": round(confidence, 3)}
