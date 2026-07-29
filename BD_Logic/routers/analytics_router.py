from fastapi import APIRouter
from schemas.analytics_schema import AnalyticRequest
from services.analytics_service import generate_dashboard

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/dashboard")
def dashboard(request: AnalyticRequest):
    return generate_dashboard(request)  