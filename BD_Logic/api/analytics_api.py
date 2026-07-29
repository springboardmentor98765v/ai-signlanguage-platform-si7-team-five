from fastapi import APIRouter

from schemas.analytics_schema import AnalyticsRequest

from analytics.services import AnalyticsService

from analytics.analytics_engine import AnalyticsEngine

router = APIRouter()

service = AnalyticsService()

engine = AnalyticsEngine()


@router.post("/analytics")

def analytics(request: AnalyticsRequest):

    history = service.get_user_history(

        request.user_id

    )

    return engine.generate_summary(history)