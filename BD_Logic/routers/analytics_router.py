from fastapi import APIRouter
from BD_Logic.schemas.analytics_schema import AnalyticsRequest
from BD_Logic.services.analytics_service import generate_dashboard

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/dashboard")
def dashboard(request: AnalyticsRequest):
    return generate_dashboard(request)  