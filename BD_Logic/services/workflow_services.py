from BD_Logic.services.assessment_service import create_assessment
from BD_Logic.services.feedback_service import create_feedback
from BD_Logic.services.analytics_service import generate_dashboard

def complete_practice(
    assessment_request,
    analytics_request
):
    assessment = create_assessment(assessment_request)
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
    analytics = generate_dashboard(analytics_request)
    return {
        "assessment": assessment,
        "feedback": feedback,
        "analytics": analytics
    }
    