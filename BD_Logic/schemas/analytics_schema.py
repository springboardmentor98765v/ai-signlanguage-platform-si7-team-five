from pydantic import BaseModel

class AnalyticRequest(BaseModel):
    user_id: int
    scores: list[float]
    weak_signs: list[str]