import os
import cv2
import numpy as np
from AIML_CV.src.main import detector, classifier, extract_features
from mediapipe import Image, ImageFormat


def predict_sign_from_frame(frame):
    """
    Predicts the sign from a single video frame using the AIML_CV detector and classifier.
    Returns a dictionary with predicted sign and confidence score.
    """
    if frame is None:
        return {"predicted_sign": "Unknown", "confidence": 0.0}

    if detector is None or classifier is None:
        return {"predicted_sign": "Unknown", "confidence": 0.0}

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if frame.ndim == 3 else frame
    mp_image = Image(image_format=ImageFormat.SRGB, data=rgb_frame)
    result = detector.detect(mp_image)

    if not result.hand_landmarks:
        return {"predicted_sign": "Unknown", "confidence": 0.0}

    features = extract_features(result.hand_landmarks[0])
    if features is None:
        return {"predicted_sign": "Unknown", "confidence": 0.0}

    probs = classifier.predict_proba(features)[0]
    predicted_idx = int(np.argmax(probs))
    confidence = float(np.max(probs))
    predicted_sign = classifier.classes_[predicted_idx]

    return {"predicted_sign": predicted_sign, "confidence": confidence}


if __name__ == "__main__":
    print("This module contains prediction utilities only. Train a model with a separate script.")
