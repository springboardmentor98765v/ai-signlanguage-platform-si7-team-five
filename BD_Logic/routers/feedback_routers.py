from fastapi import APIRouter
from BD_Logic.schemas.feedback_schema import FeedbackRequest
from BD_Logic.sevices.feedback_service import create_feedback

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/generate")

def feedback(request: FeedbackRequest):
    return create_feedback(request)