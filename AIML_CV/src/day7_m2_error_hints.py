from pathlib import Path
import numpy as np
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR.parent / "data" / "features_dataset_augmented.csv"
CLASSIFIER_PATH = BASE_DIR / "models" / "knn_classifier_m2.joblib"
STATS_OUT = BASE_DIR / "models" / "class_feature_stats.joblib"

FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)

# Human-readable label for each feature -- used to build the hint message
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


def build_class_stats():
    """Compute per-class mean/std for each feature, from real samples only
    (excludes synthetic augmentation to avoid understating natural variance)."""
    df = pd.read_csv(CSV_PATH)
    real_df = df[df["source"] == "real"] if "source" in df.columns else df

    stats = {}
    for label in sorted(df["label"].unique()):
        class_df = df[df["label"] == label][FEATURE_NAMES]
        stats[label] = {
            "mean": class_df.mean().values,
            "std": class_df.std().values + 1e-6,  # avoid div by zero
        }

    joblib.dump(stats, STATS_OUT)
    print(f"Class feature stats saved to {STATS_OUT}")
    return stats


def get_possible_issue(features, predicted_label, class_stats, z_threshold=1.5):
    """
    Compare a feature vector against the predicted class's normal range.
    Returns a hint about which aspect of the hand shape deviates most,
    or None if everything looks within normal range.
    """
    features = np.array(features).flatten()
    mean = class_stats[predicted_label]["mean"]
    std = class_stats[predicted_label]["std"]

    z_scores = np.abs((features - mean) / std)
    max_idx = np.argmax(z_scores)
    max_z = z_scores[max_idx]

    if max_z < z_threshold:
        return None  # shape looks normal for this class

    feature_name = FEATURE_NAMES[max_idx]
    hint_text = FEATURE_HINTS[feature_name]
    return f"{hint_text} looks off (z-score: {max_z:.1f})"


if __name__ == "__main__":
    stats = build_class_stats()

    # Quick demo: check a real image against its own class stats
    import glob, os
    from mediapipe.tasks import python as mp_tasks
    from mediapipe.tasks.python import vision
    from mediapipe import Image

    MODEL_PATH = BASE_DIR / "models" / "hand_landmarker.task"
    base_options = mp_tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
    options = vision.HandLandmarkerOptions(
        base_options=base_options, num_hands=1, min_hand_detection_confidence=0.5
    )
    detector = vision.HandLandmarker.create_from_options(options)
    classifier = joblib.load(CLASSIFIER_PATH)

    WRIST, FINGERTIPS, MIDDLE_MCP = 0, [4, 8, 12, 16, 20], 9

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
        return np.array(f)

    RAW_DIR = BASE_DIR.parent / "data" / "samples" / "raw"
    test_files = ["L_1.jpg", "B_1.jpg", "Y_1.jpg"]  # includes the known L->B miss

    print("\nDemo: possible_issue hints on new test photos\n")
    for fname in test_files:
        path = RAW_DIR / fname
        if not path.exists():
            continue
        true_label = fname.split("_")[0].upper()
        img = Image.create_from_file(str(path))
        result = detector.detect(img)
        if not result.hand_landmarks:
            print(f"  {fname}: no hand detected")
            continue

        features = extract_features(result.hand_landmarks[0])
        pred = classifier.predict(features.reshape(1, -1))[0]
        issue = get_possible_issue(features, pred, stats)

        print(f"  {fname}: true={true_label}, predicted={pred}, possible_issue={issue}")
