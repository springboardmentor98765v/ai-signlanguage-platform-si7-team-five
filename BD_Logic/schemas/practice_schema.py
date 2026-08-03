from pydantic import BaseModel


class StartPracticeRequest(BaseModel):
    user_id: int
    lesson_id: int
    expected_sign: str
    
class AttemptRequest(BaseModel):
    session_id: str
    
class EndPracticeResponse(BaseModel):
    session_id: str
    accuracy: float
    success: bool
    message: str
    
