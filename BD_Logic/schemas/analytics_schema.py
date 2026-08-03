from pydantic import BaseModel

class AnalyticsRequest(BaseModel):
    user_id: int
    lesson_id: int | None = None
    expected_sign: str | None = None
    scores: list[float] = []
    weak_signs: list[str] = []
    total_sessions: int = 0

class AnalyticsResponse(BaseModel):
    average_score: float
    total_attempts: int
    best_score: float
    weak_signs: list[str]