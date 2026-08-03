"""DAY 8: regression tests for assessment, streak and badge rules.

Run from Backend: pytest tests/test_business_logic_rules.py -q
"""

import os
from datetime import date, datetime, timezone

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db import Base
import models.business_logic  # noqa: F401
import models.course  # noqa: F401
import models.users  # noqa: F401
from models.business_logic import PracticeAttempt
from models.users import User
from services.business_logic_service import _award_earned_badges, _feedback, _update_streak


def _session():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


def _attempt(user_id: int, label: str, correct: bool = True) -> PracticeAttempt:
    return PracticeAttempt(
        user_id=user_id,
        expected_label=label,
        predicted_label=label if correct else "X",
        confidence=0.95 if correct else 0.40,
        is_correct=correct,
        created_at=datetime.now(timezone.utc),
    )


def test_correct_attempt_returns_positive_feedback():
    # Scenario 1: learner gets the sign right.
    assert _feedback("A", "A", 0.95) == "Great work - you signed A correctly."


def test_wrong_high_confidence_attempt_gives_hand_shape_guidance():
    # Scenario 2: model confidently sees the wrong sign.
    feedback = _feedback("B", "D", 0.92)
    assert "model saw d" in feedback.lower()
    assert "B" in feedback


def test_same_day_attempts_do_not_increase_streak_twice():
    # Scenario 3: repeat attempts on a single day do not inflate the streak.
    db = _session()
    db.add(User(username="same-day", email="same-day@test.local", hashed_password="x"))
    db.commit()
    learner = db.query(User).filter_by(username="same-day").one()

    first = _update_streak(db, learner.id, date(2026, 8, 1))
    second = _update_streak(db, learner.id, date(2026, 8, 1))

    assert first.current_streak == 1
    assert second.current_streak == 1


def test_consecutive_day_increases_streak_and_missed_day_resets_it():
    # Scenario 4: next day increments; a gap resets current streak.
    db = _session()
    db.add(User(username="streak", email="streak@test.local", hashed_password="x"))
    db.commit()
    learner = db.query(User).filter_by(username="streak").one()

    _update_streak(db, learner.id, date(2026, 8, 1))
    consecutive_streak = _update_streak(db, learner.id, date(2026, 8, 2)).current_streak
    after_gap = _update_streak(db, learner.id, date(2026, 8, 4))

    assert consecutive_streak == 2
    assert after_gap.current_streak == 1
    assert after_gap.longest_streak == 2


def test_first_practice_badge_is_awarded_once():
    # Scenario 5: a badge cannot be earned multiple times.
    db = _session()
    db.add(User(username="badge", email="badge@test.local", hashed_password="x"))
    db.commit()
    learner = db.query(User).filter_by(username="badge").one()
    attempt = _attempt(learner.id, "A")
    db.add(attempt)
    db.flush()

    first_award = _award_earned_badges(db, learner.id, [attempt], streak=1)
    second_award = _award_earned_badges(db, learner.id, [attempt], streak=1)

    assert first_award == ["First Sign"]
    assert second_award == []


def test_alphabet_master_requires_all_letters_at_eighty_percent_or_more():
    db = _session()
    db.add(User(username="alphabet", email="alphabet@test.local", hashed_password="x"))
    db.commit()
    learner = db.query(User).filter_by(username="alphabet").one()
    attempts = [_attempt(learner.id, chr(letter)) for letter in range(ord("A"), ord("Z") + 1)]
    db.add_all(attempts)
    db.flush()

    badges = _award_earned_badges(db, learner.id, attempts, streak=1)

    assert "Alphabet Master" in badges
