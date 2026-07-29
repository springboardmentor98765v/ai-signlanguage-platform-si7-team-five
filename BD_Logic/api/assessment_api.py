from fastapi import APIRouter

from schemas.assessment_schemas import AssessmentRequest

from services.assessment_service import AssessmentService

from utils.response import success

router = APIRouter()

service = AssessmentService()


@router.post("/assessment")

def assessment(request: AssessmentRequest):

    result = service.assess(request)

    return success(result)