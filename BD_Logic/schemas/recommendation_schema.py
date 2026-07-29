from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    user_id: str
    
class RecommendationResponse(BaseModel):
    recommendations: list