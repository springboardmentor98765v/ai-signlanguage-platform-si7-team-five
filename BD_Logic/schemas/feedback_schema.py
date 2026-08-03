from pydantic import BaseModel

class FeedbackRequest(BaseModel):
    assessment_id: str
    expected_sign: str
    predicted_sign: str
    confidence: float
    accuracy: float