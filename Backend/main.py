# INTERN 2 CHECKPOINT: Backend API Framework and Authentication System
# This main.py file serves as the entry point for the FastAPI backend application
# It implements the core backend functionality including authentication, routing, and middleware

import os
import sys
from contextlib import asynccontextmanager

# Ensure Backend package imports work regardless of current working directory.
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.dirname(backend_dir))

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from routers.health import health_router
from routers.users import r as user_router
from routers.course import r as course_router
from services.rate_limit import rate_limiter
from db import engine, Base
import models.users  # noqa: F401
import models.course  # noqa: F401
from services import course_service
from services import user_services
from services import instructor_service
from services import admin_services
from services import predictions
from api_gateway import routers as gateway_routers
from BD_Logic.main import app as bd_logic_app
from utils import error_handdler

# INTERN 2 CHECKPOINT: Database initialization and lifespan management
# This lifespan handler ensures database tables are created on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Database initialization skipped: {exc}")
    yield


# INTERN 2 CHECKPOINT: FastAPI application initialization
# Creates the main FastAPI app with version 3.0.0 for Milestone 3
app = FastAPI(
     title="Sign Language Platform",
   
    version="3.0.0"
    
    
  )

# INTERN 2 CHECKPOINT: API Routing for core services
# Includes routers for lessons, authentication, instructors, admin, and predictions
# These routers handle the main API endpoints for the platform
app.include_router(course_service.r, prefix="/lessons", tags=["Lessons"])
app.include_router(user_services.r, prefix="/auth", tags=["Authenticate"])
app.include_router(instructor_service.r, prefix="/instructors", tags=["Instructors"])
app.include_router(admin_services.r, prefix="/admin", tags=["Admin"])
app.include_router(predictions.r, prefix="/predictions", tags=["Predictions"])

# INTERN 2 CHECKPOINT: Integration with Business Logic (Intern 4)
# Mounts the BD_Logic application for business logic processing
app.mount("/bd_logic", bd_logic_app)

# INTERN 2 CHECKPOINT: Error handling and API gateway integration
# Initializes global error handlers and includes API gateway routers
error_handdler.init_error_handlers(app)
for router in gateway_routers:
    app.include_router(router)


# INTERN 2 CHECKPOINT: CORS middleware configuration
# Enables Cross-Origin Resource Sharing for frontend integration
# Allows requests from localhost:3000 (Frontend) and localhost:5173 (dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INTERN 2 CHECKPOINT: Rate limiting middleware
# Implements per-user rate limiting for sensitive endpoints like login and password reset
# This security enhancement prevents brute force attacks
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    rate_limiter(request)
    return await call_next(request)


# INTERN 2 CHECKPOINT: Additional API routers
# Includes health check, user authentication, and course routers
app.include_router(health_router)
app.include_router(user_router, prefix="/auth", tags=["Authenticate"])
app.include_router(course_router, prefix="/lessons", tags=["Lessons"])

# INTERN 2 CHECKPOINT: Health check endpoint
# Provides system health status for monitoring and load balancers
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "message": "Milestone 3 backend running"}

# INTERN 2 CHECKPOINT: Root endpoint
# Basic endpoint to verify backend is running
@app.get("/")
def root():
    return {"message": "Backend skeleton running"}

# INTERN 2 CHECKPOINT: Favicon handler
# Returns 204 for favicon requests to avoid 404 errors
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
