from pydantic import BaseModel

class AssessmentRequest(BaseModel):
    
    session_id: str
    
    expected_sign: str