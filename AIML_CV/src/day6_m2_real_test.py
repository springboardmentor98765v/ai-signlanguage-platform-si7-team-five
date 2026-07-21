from pathlib import Path
import glob
import os

import numpy as np
import joblib
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "hand_landmarker.task"
CLASSIFIER_PATH = BASE_DIR / "models" / "knn_classifier_m2.joblib"
RAW_DIR = BASE_DIR.parent / "data" / "samples" / "raw"

# Files used in original training (Milestone 1 Day 4) -- excluded from this test
ORIGINAL_TRAINING_FILES = {"A_1.jpg", "B_2.jpg", "C_3.jpg", "L_4.jpg", "Y_5.jpg"}

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
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


all_files = sorted(glob.glob(str(RAW_DIR / "*.jpg")))
new_files = [f for f in all_files if os.path.basename(f) not in ORIGINAL_TRAINING_FILES]

print(f"Testing on {len(new_files)} genuinely new photos (excluded {len(ORIGINAL_TRAINING_FILES)} training files)\n")

correct = 0
results = []

for path in new_files:
    filename = os.path.basename(path)
    true_label = filename.split("_")[0].upper()

    img = Image.create_from_file(path)
    result = detector.detect(img)

    if not result.hand_landmarks:
        print(f"  {filename}: NO HAND DETECTED")
        results.append((filename, true_label, None, None))
        continue

    features = extract_features(result.hand_landmarks[0])
    pred = classifier.predict(features)[0]
    conf = float(max(classifier.predict_proba(features)[0]))
    is_correct = pred == true_label
    correct += is_correct

    status = "OK" if is_correct else "WRONG"
    print(f"  {filename}: true={true_label}, predicted={pred}, confidence={conf:.2f} [{status}]")
    results.append((filename, true_label, pred, conf))

valid_results = [r for r in results if r[2] is not None]
if valid_results:
    real_accuracy = correct / len(valid_results) * 100
    print(f"\nREAL generalization accuracy: {correct}/{len(valid_results)} = {real_accuracy:.1f}%")
else:
    print("\nNo valid predictions to score.")
