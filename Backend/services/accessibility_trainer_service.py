"""Protected API for the Accessibility Trainer dashboard.

Metrics are computed from the platform's real practice attempts.  A trainer can
never request an arbitrary learner: every response is constrained by the
trainer-to-learner assignment table.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from models.business_logic import PracticeAttempt, TrainerLearnerAssignment
from models.users import User
from services.auth import get_current_user

r = APIRouter()
TRAINER_ROLE = "Accessibility Trainer"


def _trainer(token: dict, db: Session) -> User:
    user = db.query(User).filter(User.username == token.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticated user no longer exists")
    if user.role != TRAINER_ROLE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accessibility Trainer access is required")
    return user


def _learner_summary(learner: User, attempts: list[PracticeAttempt]) -> dict:
    total = len(attempts)
    correct = sum(attempt.is_correct for attempt in attempts)
    accuracy = round((correct / total) * 100, 2) if total else 0.0
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    recent = [attempt for attempt in attempts if (attempt.created_at.replace(tzinfo=timezone.utc) if attempt.created_at.tzinfo is None else attempt.created_at) >= cutoff]
    split = max(1, total // 2)
    earlier, later = attempts[:split], attempts[split:]
    earlier_accuracy = (sum(item.is_correct for item in earlier) / len(earlier) * 100) if earlier else 0.0
    later_accuracy = (sum(item.is_correct for item in later) / len(later) * 100) if later else 0.0
    return {
        "learner_id": learner.id,
        "username": learner.username,
        "engagement": {"total_practice_attempts": total, "practice_attempts_last_7_days": len(recent)},
        "skill_development": {"accuracy_change": round(later_accuracy - earlier_accuracy, 2), "current_accuracy": accuracy},
        "assessment_analytics": {"average_score": accuracy, "attempts": total, "correct_attempts": correct},
        "certification_status": {"eligible": total > 0 and accuracy >= 85, "minimum_average_score": 85},
    }


def _assigned_learner(trainer: User, learner_id: int, db: Session) -> User:
    assignment = db.query(TrainerLearnerAssignment).filter_by(trainer_id=trainer.id, learner_id=learner_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner is not assigned to this trainer")
    learner = db.get(User, learner_id)
    if not learner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner not found")
    return learner


@r.get("/me/learners")
def assigned_learners(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    trainer = _trainer(token, db)
    learner_ids = [row.learner_id for row in db.query(TrainerLearnerAssignment).filter_by(trainer_id=trainer.id).all()]
    learners = db.query(User).filter(User.id.in_(learner_ids)).order_by(User.username).all() if learner_ids else []
    return [_learner_summary(learner, db.query(PracticeAttempt).filter_by(user_id=learner.id).order_by(PracticeAttempt.created_at).all()) for learner in learners]


@r.get("/me/learners/{learner_id}")
def learner_analytics(learner_id: int, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    trainer = _trainer(token, db)
    learner = _assigned_learner(trainer, learner_id, db)
    attempts = db.query(PracticeAttempt).filter_by(user_id=learner.id).order_by(PracticeAttempt.created_at).all()
    return _learner_summary(learner, attempts)
