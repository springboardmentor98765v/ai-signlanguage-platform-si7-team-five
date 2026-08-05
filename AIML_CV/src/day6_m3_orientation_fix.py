from pathlib import Path
import glob
import os

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "hand_landmarker.task"
RAW_DIR = BASE_DIR.parent / "data" / "samples" / "raw"
MODEL_OUT = BASE_DIR / "models" / "knn_classifier_m3_oriented.joblib"

EXCLUDED_LETTERS = {"J", "Z"}
WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
MIDDLE_MCP = 9

base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1, min_hand_detection_confidence=0.5)
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


def hand_orientation_angle(norm_points):
    """Angle (degrees) between wrist->middle-MCP vector and vertical.
    NEW feature -- distinguishes orientation-dependent pairs like K/P."""
    up_vector = norm_points[MIDDLE_MCP][:2]
    vertical = np.array([0, -1])
    cos_a = np.dot(up_vector, vertical) / (np.linalg.norm(up_vector) * np.linalg.norm(vertical) + 1e-6)
    return np.degrees(np.arccos(np.clip(cos_a, -1.0, 1.0)))


def extract_features_with_orientation(hl):
    points = landmarks_to_array(hl)
    norm = normalize_landmarks(points)
    f = [np.linalg.norm(norm[i]) for i in FINGERTIPS]
    for base, mid, tip in [(1,2,4),(5,6,8),(9,10,12),(13,14,16),(17,18,20)]:
        f.append(compute_angle(norm[base], norm[mid], norm[tip]))
    for i in range(len(FINGERTIPS)-1):
        f.append(np.linalg.norm(norm[FINGERTIPS[i]] - norm[FINGERTIPS[i+1]]))
    f.append(hand_orientation_angle(norm))
    return f


FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)] +
    ["hand_orientation"]
)

all_files = sorted(glob.glob(str(RAW_DIR / "*.jpg")))
rows = []
for path in all_files:
    filename = os.path.basename(path)
    label = filename.split("_")[0].upper()
    if label in EXCLUDED_LETTERS:
        continue
    img = Image.create_from_file(path)
    result = detector.detect(img)
    if not result.hand_landmarks:
        continue
    features = extract_features_with_orientation(result.hand_landmarks[0])
    rows.append([filename, label, "real"] + features)

df = pd.DataFrame(rows, columns=["filename", "label", "source"] + FEATURE_NAMES)
print(f"Rebuilt dataset with orientation feature: {len(df)} samples\n")

rng = np.random.default_rng(seed=42)
MIN_SAMPLES = 12
augmented_rows = []
for label in sorted(df["label"].unique()):
    class_df = df[df["label"] == label]
    real_features = class_df[FEATURE_NAMES].values
    real_count = len(class_df)
    for _, row in class_df.iterrows():
        augmented_rows.append(row.tolist())
    needed = MIN_SAMPLES - real_count
    if needed > 0:
        for i in range(needed):
            base = real_features[rng.integers(0, real_count)]
            noise = rng.normal(0, 0.03, base.shape) * (np.abs(base) + 0.01)
            aug = base + noise
            augmented_rows.append([f"{label}_aug{i}.jpg", label, "synthetic"] + aug.tolist())

aug_df = pd.DataFrame(augmented_rows, columns=["filename", "label", "source"] + FEATURE_NAMES)

X = aug_df[FEATURE_NAMES].values
y = aug_df["label"].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

clf = KNeighborsClassifier(n_neighbors=5)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"WITH orientation feature -- Test accuracy: {acc*100:.1f}% (was 93.1% without it)\n")

labels = sorted(aug_df["label"].unique())
cm = confusion_matrix(y_test, y_pred, labels=labels)
cm_df = pd.DataFrame(cm, index=labels, columns=labels)
print("Misclassifications with orientation feature:")
found_any = False
for true_label in labels:
    row = cm_df.loc[true_label]
    for pred_label in labels:
        if true_label != pred_label and row[pred_label] > 0:
            print(f"  {true_label} -> predicted as {pred_label}: {row[pred_label]} time(s)")
            found_any = True
if not found_any:
    print("  None! Perfect classification on this test split.")

joblib.dump(clf, MODEL_OUT)
print(f"\nModel saved to {MODEL_OUT}")
