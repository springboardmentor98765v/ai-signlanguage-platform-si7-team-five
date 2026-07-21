import os
import glob
from pathlib import Path

import numpy as np
import pandas as pd
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "hand_landmarker.task"
RAW_DIR = BASE_DIR.parent / "data" / "samples" / "raw"
OUTPUT_CSV = BASE_DIR.parent / "data" / "features_dataset_augmented.csv"

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9
SAMPLES_PER_REAL_IMAGE = 40  # -> ~40 synthetic samples per real photo

base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
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


def features_from_normalized(norm_points):
    features = []
    for tip_idx in FINGERTIPS:
        features.append(np.linalg.norm(norm_points[tip_idx]))
    finger_joint_triplets = [(1, 2, 4), (5, 6, 8), (9, 10, 12), (13, 14, 16), (17, 18, 20)]
    for base, mid, tip in finger_joint_triplets:
        features.append(compute_angle(norm_points[base], norm_points[mid], norm_points[tip]))
    for i in range(len(FINGERTIPS) - 1):
        features.append(np.linalg.norm(norm_points[FINGERTIPS[i]] - norm_points[FINGERTIPS[i + 1]]))
    return features


def augment_landmarks(norm_points, rng):
    """Apply small random rotation (about z-axis), scale jitter, and per-point noise."""
    angle = rng.uniform(-15, 15) * np.pi / 180  # +/- 15 degrees
    cos_a, sin_a = np.cos(angle), np.sin(angle)
    rot_matrix = np.array([[cos_a, -sin_a, 0], [sin_a, cos_a, 0], [0, 0, 1]])

    scale_jitter = rng.uniform(0.9, 1.1)
    noise = rng.normal(0, 0.01, norm_points.shape)

    augmented = (norm_points @ rot_matrix.T) * scale_jitter + noise
    return augmented


FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)

rng = np.random.default_rng(seed=42)
rows = []
skipped = []

image_paths = sorted(glob.glob(str(RAW_DIR / "*.jpg")) + glob.glob(str(RAW_DIR / "*.jpeg")))

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

        points = landmarks_to_array(result.hand_landmarks[0])
        norm_points = normalize_landmarks(points)

        # Original (real) sample
        rows.append([filename, label, "real"] + features_from_normalized(norm_points))

        # Synthetic augmented samples
        for i in range(SAMPLES_PER_REAL_IMAGE):
            aug_points = augment_landmarks(norm_points, rng)
            rows.append([f"{filename}_aug{i}", label, "synthetic"] + features_from_normalized(aug_points))

    df = pd.DataFrame(rows, columns=["filename", "label", "source"] + FEATURE_NAMES)
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"\nDataset built: {len(df)} samples ({(df['source']=='real').sum()} real, {(df['source']=='synthetic').sum()} synthetic)")
    print(df['label'].value_counts())
    print(f"\nSaved to {OUTPUT_CSV}")
    if skipped:
        print(f"\nSkipped ({len(skipped)}): {skipped}")
