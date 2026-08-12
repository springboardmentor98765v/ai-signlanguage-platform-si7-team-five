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
    try:
        return start_practice(request)
    except Exception as e:
        return {"status": "failed", "message": str(e), "status_code": 500}

@router.post("/attempt")
def attempt(request: AttemptRequest):
    try:
        return record_practice(request.session_id, request.accuracy)
    except Exception as e:
        return {"status": "failed", "message": str(e), "status_code": 500}



@router.post("/end")

def end_session(request: EndPracticeResponse):
    try:
        return end_practice(request.session_id)
    except Exception as e:
        return {"status": "failed", "message": str(e), "status_code": 500}