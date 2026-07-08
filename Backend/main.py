from fastapi import FastAPI
from routers import user_router, auth_router, post_router,health_router
app = FastAPI()
app.include_router(health_router.router)
@app.get("/")
def root():
    return {"message": "Backend skeleton running"}
