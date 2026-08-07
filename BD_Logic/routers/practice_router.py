from fastapi import APIRouter

from BD_Logic.schemas.practice_schema import (
    StartPracticeRequest,
    AttemptRequest,
    EndPracticeResponse
)

from BD_Logic.services.practice_service import (
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

    return record_practice(request.session_id, request.accuracy)



@router.post("/end")

def end_session(request: EndPracticeResponse):

    return end_practice(request.session_id)