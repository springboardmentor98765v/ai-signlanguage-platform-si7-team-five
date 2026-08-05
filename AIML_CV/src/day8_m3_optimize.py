from pathlib import Path
import glob
import os
import time

import numpy as np
import joblib
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "hand_landmarker.task"
CLASSIFIER_PATH = BASE_DIR / "models" / "knn_classifier_m3.joblib"
RAW_DIR = BASE_DIR.parent / "data" / "samples" / "raw"
EXCLUDED_LETTERS = {"J", "Z"}

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1, min_hand_detection_confidence=0.5)
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
test_files = [f for f in all_files if os.path.basename(f).split("_")[0].upper() not in EXCLUDED_LETTERS]

timings_detect = []
timings_classify = []
detected_count = 0
failed = []

for path in test_files:
    filename = os.path.basename(path)
    img = Image.create_from_file(path)

    t0 = time.perf_counter()
    result = detector.detect(img)
    t1 = time.perf_counter()

    if not result.hand_landmarks:
        failed.append(filename)
        continue

    features = extract_features(result.hand_landmarks[0])
    _ = classifier.predict(features)
    t2 = time.perf_counter()

    timings_detect.append((t1 - t0) * 1000)
    timings_classify.append((t2 - t1) * 1000)
    detected_count += 1

model_size_kb = CLASSIFIER_PATH.stat().st_size / 1024
landmarker_size_kb = MODEL_PATH.stat().st_size / 1024

print(f"Tested {len(test_files)} images (24-class model, J/Z excluded)")
print(f"Detected: {detected_count}, Failed: {len(failed)} ({len(failed)/len(test_files)*100:.1f}%)\n")

print(f"Detection time  -- mean: {np.mean(timings_detect):.1f}ms, max: {np.max(timings_detect):.1f}ms")
print(f"Classify time   -- mean: {np.mean(timings_classify):.1f}ms, max: {np.max(timings_classify):.1f}ms")
total_mean = np.mean(timings_detect) + np.mean(timings_classify)
print(f"Total (detect+classify) mean: {total_mean:.1f}ms\n")

print(f"Classifier file size: {model_size_kb:.1f} KB (24 classes)")
print(f"HandLandmarker model size: {landmarker_size_kb:.1f} KB (unchanged, third-party model)\n")

print("Comparison to Milestone 2 baseline (5-class model): 30.4ms mean, ~few KB classifier")
print(f"SRS target: ~1-2 seconds. Current: {'PASS' if total_mean < 2000 else 'FAIL'} "
      f"({2000/total_mean:.0f}x faster than target)" if total_mean > 0 else "")
