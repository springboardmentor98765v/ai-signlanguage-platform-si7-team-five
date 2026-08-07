# INTERN 4 CHECKPOINT: Business Logic Application Entry Point
# This main.py file serves as the entry point for the Business Logic domain
# It implements scoring, feedback, analytics, recommendation, and assessment engines
# Now includes real-time gamification APIs for badges, streaks, and leaderboard

import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI

# INTERN 4 CHECKPOINT: Router imports for all business logic modules
# Imports routers for practice, assessment, feedback, analytics, and workflow
from BD_Logic.routers.practice_router import router as practice_router
from BD_Logic.routers.assessment_router import router as assessment_router
from BD_Logic.routers.feedback_routers import router as feedback_router
from BD_Logic.routers.analytics_router import router as analytics_router
from BD_Logic.routers.workflow_routers import router as workflow_router

# INTERN 4 CHECKPOINT: Core business engine imports
# Imports the main engines for scoring, feedback, analytics, and recommendations
from BD_Logic.assessment.scoring_engine import WeightedScoringEngine
from BD_Logic.feedback.feedback_engine import FeedbackEngine
from BD_Logic.analytics.analytics_engine import AnalyticsEngine
from BD_Logic.recommendation.recommendation_engine import RecommendationEngine

# INTERN 4 CHECKPOINT: API router imports for business logic endpoints
# Imports API routers for assessment, analytics, recommendations, certificates, exports, and reports
from BD_Logic.api.assessment_api import router as api_router
from BD_Logic.api.analytics_api import router as analytics_api_router
from BD_Logic.api.recommendation_api import router as recommendation_router
from BD_Logic.api.certificate_api import router as certificate_router
from BD_Logic.api.export_api import router as export_router
from BD_Logic.api.report_api import router as report_router

# INTERN 4 CHECKPOINT: Real-time gamification API imports
# Imports new APIs for badges, streaks, and leaderboard with WebSocket support
from BD_Logic.api.badge_api import router as badge_router
from BD_Logic.api.streak_api import router as streak_router
from BD_Logic.api.leaderboard_api import router as leaderboard_router
from BD_Logic.api.gamification_api import router as gamification_router

# INTERN 4 CHECKPOINT: Database and middleware imports
# Imports database connection, exception handling, and health check APIs
from BD_Logic.database.connection import Base
from BD_Logic.database.connection import engine
from BD_Logic.api.health_check_api import router as health_router
from BD_Logic.middleware.exception_handler import exception_handler as global_exception_handler
from BD_Logic.middleware.auth_middleware import AuthMiddleware
from BD_Logic.api.version_api import (
    router as version_router
)

# INTERN 4 CHECKPOINT: Logger initialization
# Initializes the application logger for monitoring and debugging
from BD_Logic.deployment.startup import initialize_logger

initialize_logger()


# INTERN 4 CHECKPOINT: FastAPI application initialization
# Creates the main FastAPI app for business logic with version 2.0.0
app = FastAPI(
    title="AI Sign Language Platform",
    version="2.0.0"

)

# INTERN 4 CHECKPOINT: Add authentication middleware
# Adds authentication middleware for API security using same tokens as Backend
app.add_middleware(AuthMiddleware)

# INTERN 4 CHECKPOINT: Database table creation
# Creates all database tables defined in the models
Base.metadata.create_all(bind=engine)


# INTERN 4 CHECKPOINT: Router registration
# Registers all business logic routers with appropriate prefixes
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
app.include_router(export_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")

# INTERN 4 CHECKPOINT: Real-time gamification router registration
# Registers new routers for badges, streaks, and leaderboard with WebSocket support
app.include_router(badge_router, prefix="/api/v1")
app.include_router(streak_router, prefix="/api/v1")
app.include_router(leaderboard_router, prefix="/api/v1")
app.include_router(gamification_router, prefix="/api/v1")

# INTERN 4 CHECKPOINT: Global exception handler
# Adds global exception handling for consistent error responses
app.add_exception_handler(Exception, global_exception_handler)
app.include_router(version_router, prefix="/api/v1")
