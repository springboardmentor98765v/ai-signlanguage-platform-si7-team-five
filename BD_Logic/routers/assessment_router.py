from fastapi import APIRouter
from schemas.assessment_schemas import AssessmentRequest
from services.assessment_service import create_assessment

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.post("/evaluate")
def evaluate(request: AssessmentRequest):
    return create_assessment(request)
