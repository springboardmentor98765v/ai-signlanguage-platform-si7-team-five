from pathlib import Path
import glob
import os

import numpy as np
import pandas as pd
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "hand_landmarker.task"
RAW_DIR = BASE_DIR.parent / "data" / "samples" / "raw"
OUTPUT_CSV = BASE_DIR.parent / "data" / "features_dataset_m3.csv"

# J and Z are motion-based signs incompatible with this static single-frame
# architecture. Photos were collected but are excluded from training.
# See docs/MODEL_CARD.md for details.
EXCLUDED_LETTERS = {"J", "Z"}

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.HandLandmarkerOptions(
    base_options=base_options, num_hands=1, min_hand_detection_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)


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
    return f


FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)

all_files = sorted(glob.glob(str(RAW_DIR / "*.jpg")))
rows = []
skipped_detection = []
skipped_excluded = []

for path in all_files:
    filename = os.path.basename(path)
    label = filename.split("_")[0].upper()

    if label in EXCLUDED_LETTERS:
        skipped_excluded.append(filename)
        continue

    img = Image.create_from_file(path)
    result = detector.detect(img)

    if not result.hand_landmarks:
        skipped_detection.append(filename)
        continue

    features = extract_features(result.hand_landmarks[0])
    rows.append([filename, label, "real"] + features)

df = pd.DataFrame(rows, columns=["filename", "label", "source"] + FEATURE_NAMES)
df.to_csv(OUTPUT_CSV, index=False)

print(f"Dataset built: {len(df)} real samples across {df['label'].nunique()} classes")
print(df['label'].value_counts().sort_index())
print(f"\nSaved to {OUTPUT_CSV}")
print(f"\nExcluded (J/Z, motion signs): {len(skipped_excluded)} files")
print(f"Skipped (detection failed): {len(skipped_detection)} files")
if skipped_detection:
    print(f"  {skipped_detection}")
