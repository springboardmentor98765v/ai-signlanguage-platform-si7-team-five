import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI

from BD_Logic.routers.practice_router import router as practice_router
from BD_Logic.routers.assessment_router import router as assessment_router
from BD_Logic.routers.feedback_routers import router as feedback_router
from BD_Logic.routers.analytics_router import router as analytics_router
from BD_Logic.routers.workflow_routers import router as workflow_router
from BD_Logic.assessment.scoring_engine import WeightedScoringEngine
from BD_Logic.feedback.feedback_engine import FeedbackEngine
from BD_Logic.analytics.analytics_engine import AnalyticsEngine
from BD_Logic.recommendation.recommendation_engine import RecommendationEngine
from BD_Logic.api.assessment_api import router as api_router
from BD_Logic.api.analytics_api import router as analytics_api_router
from BD_Logic.api.recommendation_api import router as recommendation_router
from BD_Logic.api.certificate_api import router as certificate_router
from BD_Logic.api.export_api import router as export_router
from BD_Logic.api.report_api import router as report_router
from BD_Logic.database.connection import Base
from BD_Logic.database.connection import engine
from BD_Logic.api.health_check_api import router as health_router
from BD_Logic.middleware.exception_handler import exception_handler as global_exception_handler
from BD_Logic.api.version_api import (
    router as version_router
)

from BD_Logic.deployment.startup import initialize_logger

initialize_logger()


app = FastAPI(
    title="AI Sign Language Platform",
    version="2.0.0"
    
)



Base.metadata.create_all(bind=engine)


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
app.add_exception_handler(Exception, global_exception_handler)
app.include_router(version_router, prefix="/api/v1")
