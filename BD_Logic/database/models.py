from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)

from BD_Logic.database.connection import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    lesson_id = Column("course_id", Integer)
    expected_sign = Column(String)
    predicted_sign = Column(String)
    score = Column(Float)


class CertificationExamResult(Base):
    __tablename__ = "certification_exam_results"

    id = Column(Integer, primary_key=True, index=True)

    # Existing users table is already present in Supabase.
    # Foreign key is intentionally omitted here because the
    # users model is not registered in this Base.metadata.
    user_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    level = Column(String(50), nullable=False)

    score = Column(Float, nullable=False)

    passed = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    total_questions = Column(Integer, nullable=False)

    correct_answers = Column(Integer, nullable=False)

    attempt_number = Column(
        Integer,
        nullable=False,
        default=1,
    )

    started_at = Column(DateTime, nullable=True)

    completed_at = Column(DateTime, nullable=True)


class TrainerLearnerMapping(Base):
    __tablename__ = "trainer_learner_mapping"

    id = Column(Integer, primary_key=True, index=True)

    # Existing users table is already present in Supabase.
    trainer_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    learner_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    assigned_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )