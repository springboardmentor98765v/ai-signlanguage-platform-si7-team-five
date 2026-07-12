import os
import glob
import numpy as np
import pandas as pd
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

MODEL_PATH = "models/hand_landmarker.task"
RAW_DIR = "data/samples/raw"
OUTPUT_CSV = "data/features_dataset.csv"

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

    return features


FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)

rows = []
skipped = []

image_paths = sorted(glob.glob(os.path.join(RAW_DIR, "*.jpg")) + glob.glob(os.path.join(RAW_DIR, "*.jpeg")))

if not image_paths:
    print(f"No images found in {RAW_DIR}/.")
else:
    for path in image_paths:
        filename = os.path.basename(path)
        label = filename.split("_")[0].upper()

        img = Image.create_from_file(path)
        result = detector.detect(img)

        if not result.hand_landmarks:
            print(f"  No hand detected in {filename}, skipping.")
            skipped.append(filename)
            continue

        features = extract_features(result.hand_landmarks[0])
        rows.append([filename, label] + features)

    df = pd.DataFrame(rows, columns=["filename", "label"] + FEATURE_NAMES)
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"\nDataset built: {len(df)} samples across {df['label'].nunique()} classes")
    print(df['label'].value_counts())
    print(f"\nSaved to {OUTPUT_CSV}")
    if skipped:
        print(f"\nSkipped ({len(skipped)}): {skipped}")
