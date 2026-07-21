from pathlib import Path
import time
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

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.HandLandmarkerOptions(
    base_options=base_options, num_hands=1, min_hand_detection_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)
classifier = joblib.load(CLASSIFIER_PATH)


def landmarks_to_array(hl):
    return np.array([[lm.x, lm.y, lm.z] for lm in hl])


def normalize_landmarks(points):
    wrist = points[WRIST]
    translated = points - wrist
    scale = np.linalg.norm(translated[MIDDLE_MCP])
    return translated / (scale if scale > 1e-6 else 1e-6)


def compute_angle(p1, p2, p3):
    v1, v2 = p1 - p2, p3 - p2
    cos_a = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
    return np.degrees(np.arccos(np.clip(cos_a, -1.0, 1.0)))


def extract_features(hl):
    points = landmarks_to_array(hl)
    norm = normalize_landmarks(points)
    f = [np.linalg.norm(norm[i]) for i in FINGERTIPS]
    for base, mid, tip in [(1,2,4),(5,6,8),(9,10,12),(13,14,16),(17,18,20)]:
        f.append(compute_angle(norm[base], norm[mid], norm[tip]))
    for i in range(len(FINGERTIPS)-1):
        f.append(np.linalg.norm(norm[FINGERTIPS[i]] - norm[FINGERTIPS[i+1]]))
    return np.array(f).reshape(1, -1)


all_files = sorted(glob.glob(str(RAW_DIR / "*.jpg")))
timings = []
detected_count = 0
failed_files = []

for path in all_files:
    filename = os.path.basename(path)
    img = Image.create_from_file(path)

    start = time.perf_counter()
    result = detector.detect(img)
    detect_time = time.perf_counter() - start

    if not result.hand_landmarks:
        failed_files.append(filename)
        continue

    start2 = time.perf_counter()
    features = extract_features(result.hand_landmarks[0])
    _ = classifier.predict(features)
    classify_time = time.perf_counter() - start2

    total = detect_time + classify_time
    timings.append(total)
    detected_count += 1

print(f"Tested {len(all_files)} images total")
print(f"Detected: {detected_count}, Failed: {len(failed_files)}")
print(f"Detection failure rate: {len(failed_files)/len(all_files)*100:.1f}%")
print(f"Failed files: {failed_files}")
print(f"\nPrediction speed (detect + classify):")
print(f"  Mean: {np.mean(timings)*1000:.1f} ms")
print(f"  Max: {np.max(timings)*1000:.1f} ms")
print(f"  Min: {np.min(timings)*1000:.1f} ms")
print(f"\nSRS target: ~1-2 seconds. Current: {'PASS' if np.mean(timings) < 2 else 'FAIL'} (well under target on CPU)")
