from fastapi import APIRouter
from BD_Logic.schemas.assessment_schemas import AssessmentRequest
from BD_Logic.services.assessment_service import create_assessment

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.post("/evaluate")
def evaluate(request: AssessmentRequest):
    return create_assessment(request)
