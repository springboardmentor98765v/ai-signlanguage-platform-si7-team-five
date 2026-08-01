from fastapi import APIRouter
from BD_Logic.schemas.analytics_schema import AnalyticRequest
from BD_Logic.services.analytics_service import generate_dashboard

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/dashboard")
def dashboard(request: AnalyticRequest):
    return generate_dashboard(request)  