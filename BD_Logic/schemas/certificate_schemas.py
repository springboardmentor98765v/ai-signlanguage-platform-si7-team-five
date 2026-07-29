from pydantic import BaseModel

class CertificateRequest(BaseModel):
    user_id: str
    
    student_name: str
    
class CertificateResponse(BaseModel):
    eligible: bool
    certificate_id:str
    average_score: float