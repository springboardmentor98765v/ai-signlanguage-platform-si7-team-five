from fastapi import FastAPI, Request
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



app = FastAPI()

# Include course service router
app.include_router(course_service.r, prefix="/courses", tags=["Courses"])
app.include_router(user_services.r, prefix="/auth", tags=["Authenticate"])
app.include_router(instructor_service.r, prefix="/instructors", tags=["Instructors"])
app.include_router(admin_services.r, prefix="/admin", tags=["Admin"])



# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    rate_limiter(request)
    return await call_next(request)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


app.include_router(health_router)
app.include_router(user_router, prefix="/auth", tags=["Authenticate"])
app.include_router(course_router, prefix="/courses", tags=["Courses"])


@app.get("/")
def root():
    return {"message": "Backend skeleton running"}
