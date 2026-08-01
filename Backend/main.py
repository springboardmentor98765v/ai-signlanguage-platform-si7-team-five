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

from BD_Logic.main import app as bd_logic_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Database initialization skipped: {exc}")
    yield


app = FastAPI(lifespan=lifespan)

# Include course service router
app.include_router(course_service.r, prefix="/courses", tags=["Courses"])
app.include_router(user_services.r, prefix="/auth", tags=["Authenticate"])
app.include_router(instructor_service.r, prefix="/instructors", tags=["Instructors"])
app.include_router(admin_services.r, prefix="/admin", tags=["Admin"])
app.include_router(predictions.r, prefix="/predictions", tags=["Predictions"])
app.mount("/bd_logic", bd_logic_app)




# Add CORS middleware
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

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    rate_limiter(request)
    return await call_next(request)


app.include_router(health_router)
app.include_router(user_router, prefix="/auth", tags=["Authenticate"])
app.include_router(course_router, prefix="/courses", tags=["Courses"])


@app.get("/")
def root():
    return {"message": "Backend skeleton running"}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
