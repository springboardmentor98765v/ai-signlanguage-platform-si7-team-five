from fastapi import FastAPI

from BD_Logic.routers.practice_router import router as practice_router
from BD_Logic.routers.assessment_router import router as assessment_router
from BD_Logic.routers.feedback_routers import router as feedback_router
from BD_Logic.routers.analytics_router import router as analytics_router
from BD_Logic.routers.workflow_routers import router as workflow_router


app = FastAPI(
    
    title="AI Sign Language Platform"
    
)
app.include_router(practice_router)
app.include_router(assessment_router)
app.include_router(feedback_router)
app.include_router(analytics_router)
app.include_router(workflow_router)