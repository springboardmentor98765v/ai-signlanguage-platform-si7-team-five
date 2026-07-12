import cv2
import numpy as np
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

MODEL_PATH = "models/hand_landmarker.task"

# Standard 21-point MediaPipe hand connections (finger bones + palm)
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),          # thumb
    (0, 5), (5, 6), (6, 7), (7, 8),          # index
    (5, 9), (9, 10), (10, 11), (11, 12),     # middle
    (9, 13), (13, 14), (14, 15), (15, 16),   # ring
    (13, 17), (17, 18), (18, 19), (19, 20),  # pinky
    (0, 17)                                   # palm base
]

base_options = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)


def draw_landmarks_on_image(bgr_image, detection_result):
    annotated = np.copy(bgr_image)
    h, w, _ = annotated.shape

    for idx, hand_landmarks in enumerate(detection_result.hand_landmarks):
        points = [(int(lm.x * w), int(lm.y * h)) for lm in hand_landmarks]

        for start_idx, end_idx in HAND_CONNECTIONS:
            cv2.line(annotated, points[start_idx], points[end_idx], (54, 205, 88), 2)

        for point in points:
            cv2.circle(annotated, point, 4, (88, 205, 54), -1)

        handedness = detection_result.handedness[idx][0].category_name
        text_x, text_y = min(points, key=lambda p: p[1])[0], min(p[1] for p in points) - 10
        cv2.putText(annotated, handedness, (text_x, max(text_y, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (88, 205, 54), 2, cv2.LINE_AA)

    return annotated


def run_on_image(image_path, output_path):
    img = Image.create_from_file(image_path)
    result = detector.detect(img)

    print(f"Hands detected: {len(result.hand_landmarks)}")
    for i, hand in enumerate(result.hand_landmarks):
        print(f"  Hand {i}: {len(hand)} landmarks, handedness={result.handedness[i][0].category_name}")

    rgb = img.numpy_view()
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    annotated = draw_landmarks_on_image(bgr, result)
    cv2.imwrite(output_path, annotated)
    print(f"Saved annotated image to {output_path}")


if __name__ == "__main__":
    run_on_image("data/samples/test_hand.jpg", "data/samples/test_hand_annotated.jpg")
