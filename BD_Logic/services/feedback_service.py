from BD_Logic.model.feedback import Feedback
from BD_Logic.repository.feedback_repo import save
from BD_Logic.utils.feedback_rules import generate_feedback

def create_feedback, message = generate_feedback(
    
    request.expected_sign,
    request.predicted_sign,
    request.confidence,
    request.accuracy
)

feedback  = Feedback(
    request.assessment_id,
    feedback_type,
    message
)

save(feedback)
 return{
    "feedback_id": feedback.feedback_id,
    "feedback_type": feedback.feedback_type,
    "message": feedback.message
 }