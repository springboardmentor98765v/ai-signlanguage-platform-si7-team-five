"""Intern 4: Milestone 3 practice, assessment, feedback and analytics APIs.

All business rules live here so the frontend and AI service stay thin.  The service
uses the authenticated learner from the JWT; callers never submit a user id.
"""

from __future__ import annotations

import csv
import io
import uuid
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from db import get_db
from models.business_logic import Badge, CertificationExamResult, PracticeAttempt, UserBadge, UserStreak
from models.users import User
from schemas.business_logic import (
    AssessmentResult,
    BadgeOut,
    CertificationExamSubmit,
    LeaderboardEntry,
    Metric,
    PracticeAttemptCreate,
    PracticeAttemptOut,
    Recommendation,
)
from services.auth import get_current_user
from services.notification_service import create_notification_record

r = APIRouter()

# =============================================================================
# DAY 1 - BUSINESS LOGIC PLAN / SHARED CONTRACTS
# This file is the single home for Intern 4's practice, assessment, feedback,
# leaderboard, badge, streak, export and recommendation rules.
# =============================================================================

# =============================================================================
# DAY 2 - STREAKS AND BADGES
# Edit this list only when the mentor changes the achievement rules.
# =============================================================================
BADGE_RULES = (
    ("first-practice", "First Sign", "Completed your first practice attempt.", lambda a, _s: len(a) >= 1),
    ("seven-day-streak", "7-Day Streak", "Practiced on seven consecutive days.", lambda _a, s: s >= 7),
    (
        "alphabet-master",
        "Alphabet Master",
        "Scored at least 80% on every attempted alphabet letter.",
        lambda a, _s: _is_alphabet_master(a),
    ),
)

EXAM_LEVELS = {
    "Beginner": {"signs": ("A", "B", "C", "D", "E"), "pass_score": 70},
    "Intermediate": {"signs": ("F", "G", "H", "I", "K", "L", "M", "N"), "pass_score": 75},
    "Advanced": {"signs": ("O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"), "pass_score": 80},
    "Professional": {"signs": ("Y", "Z", "HELLO", "THANK YOU", "PLEASE", "GOODBYE"), "pass_score": 85},
}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _learner_from_token(token: dict, db: Session) -> User:
    learner = db.query(User).filter(User.username == token.get("sub")).first()
    if not learner:
        raise HTTPException(status_code=401, detail="Authenticated user no longer exists")
    return learner


def _feedback(expected: str, predicted: str, confidence: float) -> str:
    # DAY 7 - Assessment feedback for full-alphabet AI predictions.
    if expected.upper() == predicted.upper():
        return f"Great work - you signed {expected.upper()} correctly."
    if confidence >= 0.80:
        return f"The model saw {predicted.upper()}. Compare your hand shape with {expected.upper()} and try again."
    return f"Try {expected.upper()} again with your hand fully visible and steady in the camera frame."


def _is_alphabet_master(attempts: list[PracticeAttempt]) -> bool:
    # DAY 2 - Badge rule: every A-Z letter must have at least 80% accuracy.
    """Award only when all 26 letters were attempted and each has >=80% accuracy."""
    per_label: dict[str, list[PracticeAttempt]] = defaultdict(list)
    for attempt in attempts:
        label = attempt.expected_label.upper()
        if len(label) == 1 and "A" <= label <= "Z":
            per_label[label].append(attempt)
    if set(per_label) != {chr(letter) for letter in range(ord("A"), ord("Z") + 1)}:
        return False
    return all(sum(item.is_correct for item in items) / len(items) >= 0.80 for items in per_label.values())


def _update_streak(db: Session, user_id: int, practiced_on: date) -> UserStreak:
    # DAY 2 - One practice day equals one streak increment.
    streak = db.get(UserStreak, user_id)
    if streak is None:
        streak = UserStreak(user_id=user_id, current_streak=1, longest_streak=1, last_practice_date=practiced_on)
        db.add(streak)
        return streak
    if streak.last_practice_date == practiced_on:
        return streak  # Multiple attempts on one day do not inflate a streak.
    if streak.last_practice_date == practiced_on - timedelta(days=1):
        streak.current_streak += 1
    else:
        streak.current_streak = 1
    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_practice_date = practiced_on
    streak.updated_at = _utc_now()
    return streak


def _ensure_badges(db: Session) -> None:
    existing = {badge.code for badge in db.query(Badge).all()}
    for code, name, description, _rule in BADGE_RULES:
        if code not in existing:
            db.add(Badge(code=code, name=name, description=description))
    db.flush()


def _award_earned_badges(db: Session, user_id: int, attempts: list[PracticeAttempt], streak: int) -> list[str]:
    # DAY 2 - Awards only badges the learner has not already earned.
    _ensure_badges(db)
    owned = {row.badge_id for row in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    new_badges: list[str] = []
    for code, name, _description, rule in BADGE_RULES:
        badge = db.query(Badge).filter(Badge.code == code).one()
        if badge.id not in owned and rule(attempts, streak):
            db.add(UserBadge(user_id=user_id, badge_id=badge.id))
            new_badges.append(name)
    return new_badges


@r.post("/attempts", response_model=PracticeAttemptOut, status_code=201)
def record_attempt(payload: PracticeAttemptCreate, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """DAY 7: Intern 3's AI prediction enters assessment, feedback, badges and streaks here."""
    learner = _learner_from_token(token, db)
    expected, predicted = payload.expected_label.strip().upper(), payload.predicted_label.strip().upper()
    attempt = PracticeAttempt(
        user_id=learner.id,
        course_id=payload.lesson_id,
        expected_label=expected,
        predicted_label=predicted,
        confidence=payload.confidence,
        is_correct=expected == predicted,
    )
    db.add(attempt)
    db.flush()
    streak = _update_streak(db, learner.id, _utc_now().date())
    attempts = db.query(PracticeAttempt).filter(PracticeAttempt.user_id == learner.id).all()
    new_badges = _award_earned_badges(db, learner.id, attempts, streak.current_streak)
    # DAY 4 - A newly earned badge creates a stored in-app notification.
    for badge_name in new_badges:
        create_notification_record(db, learner.id, "badge_earned", "Badge unlocked!", f"You earned the {badge_name} badge.")
    db.commit()
    db.refresh(attempt)
    return PracticeAttemptOut(
        attempt_id=attempt.id,
        is_correct=attempt.is_correct,
        score=100 if attempt.is_correct else 0,
        feedback=_feedback(expected, predicted, attempt.confidence),
        streak=streak.current_streak,
        new_badges=new_badges,
        expected_label=expected,
        predicted_label=predicted,
        confidence=attempt.confidence,
    )


@r.get("/badges/me", response_model=list[BadgeOut])
def my_badges(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    learner = _learner_from_token(token, db)
    rows = db.query(UserBadge, Badge).join(Badge, Badge.id == UserBadge.badge_id).filter(UserBadge.user_id == learner.id).all()
    return [BadgeOut(code=badge.code, name=badge.name, description=badge.description, earned_at=earned.earned_at.isoformat()) for earned, badge in rows]


@r.get("/streak/me")
def my_streak(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    learner = _learner_from_token(token, db)
    streak = db.get(UserStreak, learner.id)
    return {"current_streak": streak.current_streak if streak else 0, "longest_streak": streak.longest_streak if streak else 0}


@r.get("/leaderboard", response_model=list[LeaderboardEntry])
def global_leaderboard(metric: Metric = Query("accuracy"), db: Session = Depends(get_db)):
    """All-time leaderboard across every practice attempt, regardless of lesson.

    Most practice happens outside a specific lesson (course_id is null), so the
    per-lesson /leaderboard/{lesson_id} endpoint below rarely has any matching
    rows. This endpoint aggregates every learner's attempts platform-wide.
    """
    attempts = db.query(PracticeAttempt).all()
    by_user: dict[int, list[PracticeAttempt]] = defaultdict(list)
    for attempt in attempts:
        by_user[attempt.user_id].append(attempt)
    rows: list[LeaderboardEntry] = []
    for user_id, user_attempts in by_user.items():
        user = db.get(User, user_id)
        streak = db.get(UserStreak, user_id)
        accuracy = round(100 * sum(item.is_correct for item in user_attempts) / len(user_attempts), 2)
        rows.append(LeaderboardEntry(rank=0, user_id=user_id, username=user.username if user else f"Learner {user_id}", accuracy=accuracy, current_streak=streak.current_streak if streak else 0, attempts=len(user_attempts)))
    if metric == "streak":
        rows.sort(key=lambda item: (-item.current_streak, -item.accuracy, item.username.lower()))
    else:
        rows.sort(key=lambda item: (-item.accuracy, -item.current_streak, item.username.lower()))
    for rank, item in enumerate(rows, start=1):
        item.rank = rank
    return rows


@r.get("/leaderboard/{lesson_id}", response_model=list[LeaderboardEntry])
def leaderboard(lesson_id: int, metric: Metric = Query("accuracy"), db: Session = Depends(get_db)):
    """DAY 3: Intern 1 uses this to show class ranking by accuracy or streak."""
    attempts = db.query(PracticeAttempt).filter(PracticeAttempt.course_id == lesson_id).all()
    by_user: dict[int, list[PracticeAttempt]] = defaultdict(list)
    for attempt in attempts:
        by_user[attempt.user_id].append(attempt)
    rows: list[LeaderboardEntry] = []
    for user_id, user_attempts in by_user.items():
        user = db.get(User, user_id)
        streak = db.get(UserStreak, user_id)
        accuracy = round(100 * sum(item.is_correct for item in user_attempts) / len(user_attempts), 2)
        rows.append(LeaderboardEntry(rank=0, user_id=user_id, username=user.username if user else f"Learner {user_id}", accuracy=accuracy, current_streak=streak.current_streak if streak else 0, attempts=len(user_attempts)))
    if metric == "streak":
        rows.sort(key=lambda item: (-item.current_streak, -item.accuracy, item.username.lower()))
    else:
        rows.sort(key=lambda item: (-item.accuracy, -item.current_streak, item.username.lower()))
    for rank, item in enumerate(rows, start=1):
        item.rank = rank
    return rows


@r.get("/recommendations/me", response_model=list[Recommendation])
def recommendations(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """DAY 6: Recent attempts count more than old ones (14-day half-life)."""
    learner = _learner_from_token(token, db)
    attempts = db.query(PracticeAttempt).filter(PracticeAttempt.user_id == learner.id).all()
    by_label: dict[str, list[PracticeAttempt]] = defaultdict(list)
    for attempt in attempts:
        by_label[attempt.expected_label.upper()].append(attempt)
    now = _utc_now()
    result: list[Recommendation] = []
    for label in (chr(value) for value in range(ord("A"), ord("Z") + 1)):
        items = by_label.get(label, [])
        if not items:
            result.append(Recommendation(label=label, reason="Not practiced yet", weighted_accuracy=None))
            continue
        weights: list[float] = []
        for item in items:
            attempted_at = item.created_at.replace(tzinfo=timezone.utc) if item.created_at.tzinfo is None else item.created_at
            age_in_days = max(0, (now - attempted_at).days)
            weights.append(0.5 ** (age_in_days / 14))
        weighted_accuracy = round(100 * sum(weight * item.is_correct for weight, item in zip(weights, items)) / sum(weights), 2)
        if weighted_accuracy < 80:
            result.append(Recommendation(label=label, reason="Recent accuracy needs practice", weighted_accuracy=weighted_accuracy))
    return sorted(result, key=lambda item: (item.weighted_accuracy is not None, item.weighted_accuracy or -1))[:5]


def _export_rows(db: Session, user_id: int) -> list[dict[str, object]]:
    attempts = db.query(PracticeAttempt).filter(PracticeAttempt.user_id == user_id).order_by(PracticeAttempt.created_at.desc()).all()
    return [{"date": item.created_at.isoformat(), "expected_label": item.expected_label, "predicted_label": item.predicted_label, "confidence": item.confidence, "correct": item.is_correct, "course_id": item.course_id or ""} for item in attempts]


@r.get("/summary/me")
def my_live_summary(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """Small real-time summary consumed by the learner dashboard after login."""
    learner = _learner_from_token(token, db)
    attempts = db.query(PracticeAttempt).filter_by(user_id=learner.id).all()
    streak = db.get(UserStreak, learner.id)
    total = len(attempts)
    correct = sum(item.is_correct for item in attempts)
    return {
        "practice_sessions": total,
        "average_accuracy": round(100 * correct / total, 2) if total else 0.0,
        "streak": streak.current_streak if streak else 0,
        "lessons_completed": len({item.course_id for item in attempts if item.course_id is not None}),
    }


@r.get("/analytics/me")
def my_live_analytics(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """Live, JSON-safe attempt data for the frontend analytics screen."""
    learner = _learner_from_token(token, db)
    attempts = db.query(PracticeAttempt).filter_by(user_id=learner.id).order_by(PracticeAttempt.created_at.asc()).all()
    history = [{
        "id": item.id,
        "date": item.created_at.date().isoformat(),
        "lesson_name": item.course_id or "Practice session",
        "sign_symbol": item.expected_label,
        "accuracy": round(item.confidence * 100, 2),
        "is_correct": item.is_correct,
        "feedback": "Correct sign recognised" if item.is_correct else f"Recognised {item.predicted_label}; practise {item.expected_label}",
    } for item in attempts]
    by_sign: dict[str, list[PracticeAttempt]] = defaultdict(list)
    for item in attempts:
        by_sign[item.expected_label].append(item)
    category_accuracy = [{"name": label, "accuracy": round(100 * sum(item.is_correct for item in items) / len(items), 2)} for label, items in sorted(by_sign.items())]
    by_date: dict[str, int] = defaultdict(int)
    for item in attempts:
        by_date[item.created_at.date().isoformat()] += 1
    return {"history": history, "daily_attempts": [{"date": date, "time": count} for date, count in sorted(by_date.items())], "category_accuracy": category_accuracy}


@r.get("/certification/levels")
def certification_levels():
    """The fixed, transparent sign sets and thresholds for the four formal exams."""
    return [{"level": name, "required_signs": details["signs"], "pass_score": details["pass_score"]} for name, details in EXAM_LEVELS.items()]


@r.post("/certification/exams", status_code=201)
def submit_certification_exam(payload: CertificationExamSubmit, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    learner = _learner_from_token(token, db)
    rules = EXAM_LEVELS[payload.level]
    expected_set = {item.upper() for item in rules["signs"]}
    submitted_set = {answer.expected_label.strip().upper() for answer in payload.answers}
    if submitted_set != expected_set or len(payload.answers) != len(rules["signs"]):
        raise HTTPException(status_code=422, detail=f"{payload.level} requires exactly these signs: {', '.join(rules['signs'])}")
    weighted_scores = [100 * answer.confidence if answer.expected_label.strip().upper() == answer.predicted_label.strip().upper() else 0 for answer in payload.answers]
    score = round(sum(weighted_scores) / len(weighted_scores), 2)
    passed = score >= rules["pass_score"]
    certificate_id = f"CERT-{uuid.uuid4().hex[:10].upper()}" if passed else None
    result = CertificationExamResult(user_id=learner.id, level=payload.level, score=score, passed=passed, certificate_id=certificate_id)
    db.add(result)
    if passed:
        create_notification_record(db, learner.id, "certificate_ready", "Certification exam passed!", f"You passed the {payload.level} exam. Certificate {certificate_id} is ready.")
    db.commit()
    return {"exam_id": result.id, "level": result.level, "score": result.score, "pass_score": rules["pass_score"], "passed": result.passed, "certificate_id": result.certificate_id}


def _report_data(report_type: str, learner: User, db: Session) -> list[dict[str, object]]:
    attempts = db.query(PracticeAttempt).filter_by(user_id=learner.id).order_by(PracticeAttempt.created_at).all()
    total = len(attempts); correct = sum(item.is_correct for item in attempts); accuracy = round(100 * correct / total, 2) if total else 0.0
    exams = db.query(CertificationExamResult).filter_by(user_id=learner.id).order_by(CertificationExamResult.completed_at.desc()).all()
    if report_type == "learning": return [{"learner": learner.username, "practice_attempts": total, "unique_signs": len({item.expected_label for item in attempts})}]
    if report_type == "assessment": return [{"learner": learner.username, "attempts": total, "correct_attempts": correct, "average_score": accuracy}]
    if report_type == "accuracy": return [{"sign": sign, "accuracy": round(100 * sum(i.is_correct for i in items) / len(items), 2), "attempts": len(items)} for sign, items in sorted(((label, [a for a in attempts if a.expected_label == label]) for label in {a.expected_label for a in attempts}), key=lambda pair: pair[0])]
    if report_type == "certification": return [{"level": exam.level, "score": exam.score, "passed": exam.passed, "certificate_id": exam.certificate_id or "", "completed_at": exam.completed_at.isoformat()} for exam in exams]
    return [{"learner": learner.username, "practice_attempts": total, "average_accuracy": accuracy, "recommendations": len(recommendations(db, token={"sub": learner.username})), "certifications_passed": sum(exam.passed for exam in exams)}]


@r.get("/reports/me")
def download_report(report_type: str = Query(..., pattern="^(learning|assessment|accuracy|certification|progress)$"), format: str = Query(..., pattern="^(pdf|xlsx)$"), db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    learner = _learner_from_token(token, db)
    rows = _report_data(report_type, learner, db)
    if format == "xlsx":
        from openpyxl import Workbook
        book = Workbook(); sheet = book.active; sheet.title = report_type.title()
        headers = list(rows[0].keys()) if rows else ["message"]; sheet.append(headers)
        for row in rows: sheet.append([row.get(header, "") for header in headers])
        data = io.BytesIO(); book.save(data); data.seek(0)
        return StreamingResponse(data, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename={report_type}-report.xlsx"})
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    data = io.BytesIO(); styles = getSampleStyleSheet(); table_rows = [list(rows[0].keys())] + [[str(row.get(key, "")) for key in rows[0].keys()] for row in rows] if rows else [["Message"], ["No data available"]]
    table = Table(table_rows); table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1D4ED8")), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("GRID", (0,0), (-1,-1), .5, colors.grey), ("VALIGN", (0,0), (-1,-1), "TOP")]))
    SimpleDocTemplate(data, pagesize=letter).build([Paragraph(f"{report_type.title()} Report", styles["Title"]), Spacer(1, 12), table]); data.seek(0)
    return StreamingResponse(data, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={report_type}-report.pdf"})


@r.get("/exports/me")
def export_my_progress(format: str = Query("csv", pattern="^(csv|xlsx)$"), db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """DAY 5: Intern 1's Export Report button downloads CSV or Excel here."""
    learner = _learner_from_token(token, db)
    rows = _export_rows(db, learner.id)
    headers = ["date", "expected_label", "predicted_label", "confidence", "correct", "course_id"]
    if format == "csv":
        buffer = io.StringIO(newline="")
        writer = csv.DictWriter(buffer, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
        return Response(content=buffer.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=progress-report.csv"})
    try:
        from openpyxl import Workbook
    except ImportError as exc:
        raise HTTPException(status_code=501, detail="Excel export requires openpyxl. Run pip install openpyxl.") from exc
    book, sheet = Workbook(), None
    sheet = book.active
    sheet.title = "Progress"
    sheet.append(headers)
    for row in rows:
        sheet.append([row[header] for header in headers])
    data = io.BytesIO()
    book.save(data)
    data.seek(0)
    return StreamingResponse(data, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=progress-report.xlsx"})