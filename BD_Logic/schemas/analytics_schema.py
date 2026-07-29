from pydantic import BaseModel

class AnalyticRequest(BaseModel):
    user_id: int
    scores: list[float]
    weak_signs: list[str]
    
class AnalyticsResponse(BaseModel):
    average_score: float
    total_attempts: int
    best_score: float
    weak_signs: list