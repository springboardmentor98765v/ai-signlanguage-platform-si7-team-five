from fastapi import APIRouter

from app.schemas.assessment_schema import AssessmentRequest

from app.assessment.assessment_service import AssessmentService

from app.utils.response import success

router = APIRouter()

service = AssessmentService()


@router.post("/assessment")

def assessment(request: AssessmentRequest):

    result = service.assess(request)

    return success(result)