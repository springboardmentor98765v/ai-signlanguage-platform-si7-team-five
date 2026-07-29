import sys
import os 
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI

from routers.practice_router import router as practice_router
from routers.assessment_router import router as assessment_router
from routers.feedback_routers import router as feedback_router
from routers.analytics_router import router as analytics_router
from routers.workflow_routers import router as workflow_router


app = FastAPI(
    
    title="AI Sign Language Platform"
    
)
app.include_router(practice_router)
app.include_router(assessment_router)
app.include_router(feedback_router)
app.include_router(analytics_router)
app.include_router(workflow_router)