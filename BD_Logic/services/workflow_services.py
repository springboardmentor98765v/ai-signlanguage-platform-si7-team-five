from services.assessment_service import evaluate
from services.feedback_service import create_feedback
from services.analytics_service import generate_dashboard

def complete_practice(
    assesment_request,
    analytics_request
):
    
    assessment = evaluate(assesment_request)
    feedback = create_feedback(
        type(
            "FeedbackRequest",
            (),
            {
                "assessment_id": assessment["assessment_id"],
                "expected_sign": assessment["expected_sign"],
                "predicted_sign": assessment["predicted_sign"],
                "confidence": assessment["confidence"],
                "accuracy": assessment["accuracy"]
            }
        )
    )
    
    analytics = generate_dashboard(
        analytics_request
        )
    
    return { 
            "assessment": assessment,
            "feedback": feedback,
            "analytics": analytics
            }
    