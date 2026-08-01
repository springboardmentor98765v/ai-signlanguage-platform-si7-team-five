import sys
import os 
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI

from routers.practice_router import router as practice_router
from routers.assessment_router import router as assessment_router
from routers.feedback_routers import router as feedback_router
from routers.analytics_router import router as analytics_router
from routers.workflow_routers import router as workflow_router
from assessment.scoring_engine import WeightedScoringEngine
from feedback.feedback_engine import FeedbackEngine
from analytics.analytics_engine import AnalyticsEngine
from recommendation.recommendation_engine import RecommendationEngine
from api.assessment_api import router as api_router
from api.analytics_api import router as analytics_api_router
from api.recommendation_api import router as recommendation_router
from api.certificate_api import router as certificate_router
from api.export_api import router as export_router
from api.report_api import router as report_router
from database.connection import Base
from database.connection import engine
from api.health_check_api import router as health_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    
    title="AI Sign Language Platform"
    
)
app.include_router(practice_router)
app.include_router(feedback_router)
app.include_router(analytics_router)
app.include_router(workflow_router)
app.include_router(assessment_router, prefix="/api/v1")
app.include_router(analytics_api_router, prefix="/api/v1")
app.include_router(recommendation_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api/v1")
app.include_router(report_router, prefix="/api/v1")
app.include_router(certificate_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")