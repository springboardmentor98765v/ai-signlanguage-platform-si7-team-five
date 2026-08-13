"""Instructor APIs use the canonical term `learner`.

The old student-named routes are retained only as non-breaking aliases while
clients migrate to `/assignments` and `/learners`.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session

from db import get_db
from models.business_logic import InstructorLearnerAssignment, PracticeAttempt
from models.users import User
from services.auth import get_current_user

r = APIRouter()


class AssignLearnerRequest(BaseModel):
    learner_id: int = Field(gt=0)

    @model_validator(mode="before")
    @classmethod
    def accept_legacy_student_id(cls, value):
        if isinstance(value, dict) and "learner_id" not in value and "student_id" in value:
            return {**value, "learner_id": value["student_id"]}
        return value


def _instructor(token: dict, db: Session) -> User:
    instructor = db.query(User).filter_by(username=token.get("sub")).first()
    if not instructor:
        raise HTTPException(status_code=401, detail="Authenticated user no longer exists")
    if instructor.role != "Instructor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Instructor access is required")
    return instructor


def _summary(learner: User, db: Session) -> dict:
    attempts = db.query(PracticeAttempt).filter_by(user_id=learner.id).all()
    accuracy = round(100 * sum(item.is_correct for item in attempts) / len(attempts), 2) if attempts else 0.0
    return {"learner_id": learner.id, "username": learner.username, "practice_attempts": len(attempts), "average_accuracy": accuracy}


@r.post("/assignments", status_code=status.HTTP_201_CREATED)
def assign_learner(payload: AssignLearnerRequest, db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """Assign one Learner to the signed-in Instructor."""
    instructor = _instructor(token, db)
    learner = db.get(User, payload.learner_id)
    if not learner or learner.role != "Learner":
        raise HTTPException(status_code=422, detail="learner_id must belong to a Learner")
    assignment = db.query(InstructorLearnerAssignment).filter_by(instructor_id=instructor.id, learner_id=learner.id).first()
    if assignment:
        return {"assignment_id": assignment.id, "instructor_id": instructor.id, "learner_id": learner.id, "created": False}
    assignment = InstructorLearnerAssignment(instructor_id=instructor.id, learner_id=learner.id)
    db.add(assignment); db.commit(); db.refresh(assignment)
    return {"assignment_id": assignment.id, "instructor_id": instructor.id, "learner_id": learner.id, "created": True}


@r.get("/learners")
def my_learners(db: Session = Depends(get_db), token: dict = Depends(get_current_user)):
    """Return progress summaries only for the signed-in Instructor's learners."""
    instructor = _instructor(token, db)
    rows = db.query(InstructorLearnerAssignment).filter_by(instructor_id=instructor.id).all()
    return [_summary(learner, db) for learner_id in [row.learner_id for row in rows] if (learner := db.get(User, learner_id))]


# Deprecated compatibility aliases. They deliberately accept the historical
# `student_id` spelling but return the canonical `learner_id` field.
@r.post("/assign-student", deprecated=True, include_in_schema=False)
def assign_student_legacy(request: AssignLearnerRequest):
    return {"message": "Deprecated: use POST /instructors/assignments", "learner_id": request.learner_id}


@r.get("/students", deprecated=True, include_in_schema=False)
def view_students_legacy(instructor_id: int):
    return {"message": "Deprecated: use GET /instructors/learners", "instructor_id": instructor_id, "learners": []}
