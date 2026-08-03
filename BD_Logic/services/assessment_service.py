
from AIML_CV.src.day5_train_classifier import predict_sign_from_frame

from BD_Logic.database.crud import DatabaseService
from BD_Logic.model.assessment import Assessment
from BD_Logic.utils.score_calculator import calculate_accuracy
from BD_Logic.assessment.scoring_engine import WeightedScoringEngine
import cv2
import os 

_db_service = DatabaseService()


def create_assessment(request):
    video_path = os.path.join("data", "sessions", f"{request.session_id}.mp4")
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        return {"status": "error", "message": f"Could not read video {video_path} for session {request.session_id}"}

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

    _db_service.save_assessment({
        "user_id": request.user_id,
        "lesson_id": request.lesson_id,
        "expected_sign": request.expected_sign,
        "predicted_sign": prediction["predicted_sign"],
        "score": accuracy
    })

    return {
        "status": "success",
        "assessment_id": assessment.assessment_id,
        "session_id": assessment.session_id,
        "expected_sign": assessment.expected_sign,
        "predicted_sign": assessment.predicted_sign,
        "confidence": assessment.confidence,
        "accuracy": assessment.accuracy
    }


class AssessmentService:
    def __init__(self):
        self.engine = WeightedScoringEngine()

    def assess(self, request):
        return create_assessment(request)
