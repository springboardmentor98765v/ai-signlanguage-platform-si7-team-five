
from AIML_CV.src.day5_train_classifier import predict_sign_from_frame

from BD_Logic.model.assessment import Assessment
from BD_Logic.repository.assessment_repository import save
from BD_Logic.utils.score_calculator import calculate_accuracy
from BD_Logic.assessment.scoring_engine import WeightedScoringEngine
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
class AssessmentService:

    def __init__(self):

        self.engine = WeightedScoringEngine()

    def assess(self, request):

        score = self.engine.calculate_score(

            hand_shape=request.hand_shape,

            finger_position=request.finger_position,

            motion=request.motion,

            timing=request.timing,

            confidence=request.confidence

        )

        if request.expected_sign == request.predicted_sign:

            score = min(score + 10, 100)

        else:

            score = max(score - 10, 0)

        result = "PASS" if score >= 80 else "FAIL"

        return {

            "accuracy": round(score, 2),

            "result": result

        }
        analytics.save_assessment({

               "user_id":request.user_id,

               "course_id":request.course_id,

                "expected_sign":request.expected_sign,

                "predicted_sign":request.predicted_sign,

                "score":score

    })