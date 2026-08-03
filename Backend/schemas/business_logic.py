from typing import Literal

from pydantic import BaseModel, Field


class PracticeAttemptCreate(BaseModel):
    expected_label: str = Field(min_length=1, max_length=32)
    predicted_label: str = Field(min_length=1, max_length=32)
    confidence: float = Field(ge=0, le=1)
    course_id: int | None = Field(default=None, gt=0)


class AssessmentResult(BaseModel):
    attempt_id: int
    is_correct: bool
    score: int
    feedback: str
    streak: int
    new_badges: list[str]


class PracticeAttemptOut(AssessmentResult):
    """Returned by POST /business/attempts.  Kept separate so Intern 1 has one stable contract."""

    expected_label: str
    predicted_label: str
    confidence: float


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    accuracy: float
    current_streak: int
    attempts: int


class Recommendation(BaseModel):
    label: str
    reason: str
    weighted_accuracy: float | None


class BadgeOut(BaseModel):
    code: str
    name: str
    description: str
    earned_at: str | None = None


Metric = Literal["accuracy", "streak"]
