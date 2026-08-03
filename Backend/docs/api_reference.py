# Day 9 - API Documentation (Swagger/OpenAPI)
from fastapi import FastAPI
from api_gateway import routers
from utils import error_handler_day7

app = FastAPI(
    title="Sign Language Platform - Milestone 3",
    description="""
    API Documentation for Milestone 3:
    - Auth: login, register, update profile, reset/change password
    - Notifications: create, list, mark as read
    - Admin: bulk activate/deactivate, bulk CSV upload
    - Lessons: CRUD, search, pagination
    """,
    version="3.0.0",
    contact={
        "name": "Intern 2 - Backend/API Developer",
        "email": "intern2@example.com"
    }
)

# Register error handlers
error_handler_day7.init_error_handlers(app)

# Include all routers
for router in routers:
    app.include_router(router)

@app.get("/health", tags=["System"])
def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "message": "Milestone 3 backend running"}
