from fastapi import APIRouter

from BD_Logic.schemas.analytics_schema import AnalyticsRequest
from BD_Logic.analytics.services import AnalyticsService
from BD_Logic.analytics.analytics_engine import AnalyticsEngine

router = APIRouter()

service = AnalyticsService()

engine = AnalyticsEngine()


@router.post("/analytics")

def analytics(request: AnalyticsRequest):

    history = service.get_user_history(

        request.user_id

    )

    return engine.generate_summary(history)