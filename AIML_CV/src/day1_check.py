import mediapipe as mp
print("MediaPipe:", mp.__version__)

from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
from mediapipe import Image

import urllib.request
import os

os.makedirs("models", exist_ok=True)
os.makedirs("data/samples", exist_ok=True)

model_path = "models/hand_landmarker.task"
if not os.path.exists(model_path):
    print("Downloading model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        model_path
    )
print("Model ready.")

base_options = mp_tasks.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)

test_img_path = "data/samples/test_hand.jpg"
if not os.path.exists(test_img_path):
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-tasks/hand_landmarker/woman_hands.jpg",
        test_img_path
    )

img = Image.create_from_file(test_img_path)
result = detector.detect(img)

print("Hands detected:", len(result.hand_landmarks))
if result.hand_landmarks:
    print("Landmarks per hand:", len(result.hand_landmarks[0]))
