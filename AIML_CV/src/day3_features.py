import numpy as np
import cv2
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

MODEL_PATH = "models/hand_landmarker.task"

base_options = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)

WRIST = 0
FINGERTIPS = [4, 8, 12, 16, 20]
FINGER_BASES = [2, 5, 9, 13, 17]
MIDDLE_MCP = 9


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
        dist = np.linalg.norm(norm_points[tip_idx])
        features.append(dist)

    finger_joint_triplets = [
        (1, 2, 4),
        (5, 6, 8),
        (9, 10, 12),
        (13, 14, 16),
        (17, 18, 20)
    ]
    for base, mid, tip in finger_joint_triplets:
        angle = compute_angle(norm_points[base], norm_points[mid], norm_points[tip])
        features.append(angle)

    for i in range(len(FINGERTIPS) - 1):
        dist = np.linalg.norm(norm_points[FINGERTIPS[i]] - norm_points[FINGERTIPS[i + 1]])
        features.append(dist)

    return np.array(features)


def run_on_image(image_path):
    img = Image.create_from_file(image_path)
    result = detector.detect(img)

    print(f"Hands detected: {len(result.hand_landmarks)}\n")
    for i, hand_landmarks in enumerate(result.hand_landmarks):
        handedness = result.handedness[i][0].category_name
        features = extract_features(hand_landmarks)
        print(f"Hand {i} ({handedness}):")
        print(f"  Feature vector shape: {features.shape}")
        print(f"  Fingertip-wrist distances: {np.round(features[0:5], 3)}")
        print(f"  Finger curl angles (deg):  {np.round(features[5:10], 1)}")
        print(f"  Adjacent-tip distances:    {np.round(features[10:14], 3)}")
        print()


if __name__ == "__main__":
    run_on_image("data/samples/test_hand.jpg")
