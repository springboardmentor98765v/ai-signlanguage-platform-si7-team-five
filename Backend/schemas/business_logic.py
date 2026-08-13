from typing import Literal

from pydantic import BaseModel, Field, model_validator


class PracticeAttemptCreate(BaseModel):
    expected_label: str = Field(min_length=1, max_length=32)
    predicted_label: str = Field(min_length=1, max_length=32)
    confidence: float = Field(ge=0, le=1)
    lesson_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="before")
    @classmethod
    def accept_legacy_course_id(cls, value):
        if isinstance(value, dict) and "lesson_id" not in value and "course_id" in value:
            return {**value, "lesson_id": value["course_id"]}
        return value


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


class CertificationAnswer(BaseModel):
    expected_label: str = Field(min_length=1, max_length=32)
    predicted_label: str = Field(min_length=1, max_length=32)
    confidence: float = Field(ge=0, le=1)


class CertificationExamSubmit(BaseModel):
    level: Literal["Beginner", "Intermediate", "Advanced", "Professional"]
    answers: list[CertificationAnswer] = Field(min_length=1)


Metric = Literal["accuracy", "streak"]
