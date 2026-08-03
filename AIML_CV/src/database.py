"""Shared database connection for the AI service.

By default this points to Backend/app.db so local AI predictions and backend
assessment records use the same SQLite database. Set DATABASE_URL for Postgres
or another shared database in a team environment.
"""

import os
from pathlib import Path

from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

DEFAULT_DB = Path(__file__).resolve().parents[2] / "Backend" / "app.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB.as_posix()}")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AIPredictionLog(Base):
    __tablename__ = "ai_prediction_logs"

    id = Column(Integer, primary_key=True)
    expected_label = Column(String(32), nullable=True, index=True)
    predicted_label = Column(String(32), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)


def initialise_database() -> None:
    Base.metadata.create_all(bind=engine)


def log_prediction(expected_label: str | None, predicted_label: str, confidence: float) -> None:
    db = SessionLocal()
    try:
        db.add(AIPredictionLog(expected_label=expected_label, predicted_label=predicted_label, confidence=confidence))
        db.commit()
    finally:
        db.close()
