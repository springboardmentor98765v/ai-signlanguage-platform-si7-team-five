from fastapi import APIRouter

from schemas.practice_schema import (
    StartPracticeRequest,
    AttemptRequest,
    EndPracticeResponse 
)

from services.practice_service import (
    start_practice,
    record_practice,
    end_practice
)

router = APIRouter(prefix="/practice", tags=["Practice"])


@router.post("/start")

def start_session(request: StartPracticeRequest):
    
    return start_practice(request)

@router.post("/attempt")
def attempt(request: AttemptRequest):
   
    return record_practice(request)



@router.post("/end")

def end_session(request = EndPracticeResponse):
    
    return end_practice(request)