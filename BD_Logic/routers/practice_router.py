from fastapi import APIRouter

from BD_Logic.schemas.practice_schema import (
    StartPracticeRequest,
    AttemptRequest,
    EndPracticeResponse
)

from BD_Logic.sevices.practice_service import (
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



@router.post("/end", response_model=EndPracticeResponse)

def end_session(session_id: str):
    response = end_practice(session_id)
    return response