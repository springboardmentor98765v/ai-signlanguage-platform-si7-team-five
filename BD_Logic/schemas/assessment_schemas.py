from pydantic import BaseModel

class AssessmentRequest(BaseModel):
    
    session_id: str
    user_id: int

    lesson_id: int

    expected_sign: str

    predicted_sign: str

    confidence: float

    hand_shape: float

    finger_position: float

    motion: float

    timing: float
    
 class AssessmentResponse(BaseModel):
    
    accuracy: float
    result: str
    
       