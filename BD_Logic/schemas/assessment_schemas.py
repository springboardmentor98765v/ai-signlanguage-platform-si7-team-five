from pydantic import BaseModel

class AssessmentRequest(BaseModel):
    
    session_id: str
    user_id: int

    lesson_id: int

    expected_sign: str

    predicted_sign: str

  
    
class AssessmentResponse(BaseModel):
    
    accuracy: float
    result: str
    
       