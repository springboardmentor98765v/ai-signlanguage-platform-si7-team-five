from fastapi import APIRouter
from schemas.assessment_schemas import AssessmentRequest
from schemas.analytics_schema import AnalyticRequest
from services.workflow_services import complete_practice

router = APIRouter(prefix="/workflow", tags=["Workflow"])

@router.post("/complete_practice")
def workflow(
    
    assessment: AssessmentRequest, 
    analytics: AnalyticRequest
    
    
):
    return complete_practice(
        assessment, 
        analytics
        
    )