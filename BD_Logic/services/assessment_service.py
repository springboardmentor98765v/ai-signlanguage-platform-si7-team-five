# BD_Logic/services/assessment_service.py
from AIML_CV.src.day5_train_classifier import predict_sign_from_frame

from model.assessment import Assessment
from repository.assessment_repository import save
from utils.score_calculator import calculate_accuracy
import cv2
import os 
def create_assessment(request):
    video_path = os.path.join("data", "sessions", f"{request.session_id}.mp4")
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret: 
        return{"error": f"Could not read video {video_path} request {request.session_id}"}


    prediction = predict_sign_from_frame(frame) 

    accuracy = calculate_accuracy(
        request.expected_sign,
        prediction["predicted_sign"],
        prediction["confidence"]
    )
       

    
    assessment = Assessment(
        session_id=request.session_id,
        expected_sign=request.expected_sign,
        predicted_sign=prediction["predicted_sign"],
        confidence=prediction["confidence"],
        accuracy=accuracy
    )

    # ✅ Save the assessment to repository
    save(assessment)

    # ✅ Return a clean response dictionary
    return {
        "assessment_id": assessment.assessment_id,
        "expected_sign": assessment.expected_sign,
        "predicted_sign": assessment.predicted_sign,
        "confidence": assessment.confidence,
        "accuracy": assessment.accuracy
    }
