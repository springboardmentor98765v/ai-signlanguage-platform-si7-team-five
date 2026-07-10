from fastapi import FastAPI
from routers.health import health_router,user_router, course_router


app = FastAPI()

app.include_router(health_router)
app.include_router(user_router, prefix = "/auth", tags=["Authenticate"])

app.include_router(course_router,prefix="/courses",tags=["Courses"])

@app.get("/")
def root():
    return {"message": "Backend skeleton running"}
