from fastapi import APIRouter

from BD_Logic.schemas.assessment_schemas import AssessmentRequest
from BD_Logic.services.assessment_service import AssessmentService
from BD_Logic.utils.response import success

router = APIRouter()

service = AssessmentService()


@router.post("/assessment")

def assessment(request: AssessmentRequest):

    result = service.assess(request)

    return success(result)