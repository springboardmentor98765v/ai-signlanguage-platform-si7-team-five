from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    user_id: int


class RecommendationResponse(BaseModel):
    recommendations: list