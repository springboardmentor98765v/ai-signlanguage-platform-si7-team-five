from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR.parent / "data" / "features_dataset_m3.csv"
AUGMENTED_CSV = BASE_DIR.parent / "data" / "features_dataset_m3_augmented.csv"
MODEL_OUT = BASE_DIR / "models" / "knn_classifier_m3.joblib"
STATS_OUT = BASE_DIR / "models" / "class_feature_stats_m3.joblib"

FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)

MIN_SAMPLES_PER_CLASS = 12  # top up thin classes to this count via augmentation


def augment_features(features, rng):
    """Light noise jitter directly on the feature vector (not landmarks --
    we don't have landmarks saved, only extracted features, so we jitter
    those directly with small proportional noise)."""
    noise = rng.normal(0, 0.03, features.shape) * (np.abs(features) + 0.01)
    return features + noise


df = pd.read_csv(CSV_PATH)
rng = np.random.default_rng(seed=42)

augmented_rows = []
for label in sorted(df["label"].unique()):
    class_df = df[df["label"] == label]
    real_features = class_df[FEATURE_NAMES].values
    real_count = len(class_df)

    # Keep all real samples as-is
    for _, row in class_df.iterrows():
        augmented_rows.append(row.tolist())

    # Top up with augmented samples if this class is thin
    needed = MIN_SAMPLES_PER_CLASS - real_count
    if needed > 0:
        for i in range(needed):
            base_idx = rng.integers(0, real_count)
            base_features = real_features[base_idx]
            aug_features = augment_features(base_features, rng)
            fname = f"{label}_aug{i}.jpg"
            augmented_rows.append([fname, label, "synthetic"] + aug_features.tolist())

aug_df = pd.DataFrame(augmented_rows, columns=["filename", "label", "source"] + FEATURE_NAMES)
aug_df.to_csv(AUGMENTED_CSV, index=False)

print(f"Augmented dataset: {len(aug_df)} samples ({(aug_df['source']=='real').sum()} real, {(aug_df['source']=='synthetic').sum()} synthetic)")
print(aug_df["label"].value_counts().sort_index())

# --- Train/test split -- stratified, using the augmented dataset ---
X = aug_df[FEATURE_NAMES].values
y = aug_df["label"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

print(f"\nTrain: {len(X_train)}, Test: {len(X_test)}")

clf = KNeighborsClassifier(n_neighbors=5)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\nTest-set accuracy: {acc*100:.1f}%")
print(f"\n{classification_report(y_test, y_pred, zero_division=0)}")

MODEL_OUT.parent.mkdir(exist_ok=True)
joblib.dump(clf, MODEL_OUT)
print(f"\nModel saved to {MODEL_OUT}")

# --- Per-class stats for possible_issue hints (M3 version, 24 classes) ---
stats = {}
for label in sorted(aug_df["label"].unique()):
    class_features = aug_df[aug_df["label"] == label][FEATURE_NAMES]
    stats[label] = {
        "mean": class_features.mean().values,
        "std": class_features.std().values + 1e-6,
    }
joblib.dump(stats, STATS_OUT)
print(f"Class stats saved to {STATS_OUT}")
