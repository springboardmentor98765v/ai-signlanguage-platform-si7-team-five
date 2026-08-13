import os

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret")

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db import Base, get_db
import models.business_logic  # noqa: F401
import models.users  # noqa: F401
from models.business_logic import PracticeAttempt, TrainerLearnerAssignment
from models.users import User
from services.accessibility_trainer_service import r
from services.auth import create_access_token


def _client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    trainer = User(username="trainer", email="trainer@test.local", hashed_password="x", role="Accessibility Trainer")
    learner = User(username="learner", email="learner@test.local", hashed_password="x", role="Learner")
    other = User(username="other", email="other@test.local", hashed_password="x", role="Learner")
    session.add_all([trainer, learner, other]); session.flush()
    session.add(TrainerLearnerAssignment(trainer_id=trainer.id, learner_id=learner.id))
    session.add(PracticeAttempt(user_id=learner.id, expected_label="A", predicted_label="A", confidence=.99, is_correct=True))
    session.commit()
    app = FastAPI(); app.include_router(r, prefix="/accessibility-trainers")
    def override_db():
        yield session
    app.dependency_overrides[get_db] = override_db
    return TestClient(app), trainer, learner, other


def _headers(username, role):
    return {"Authorization": "Bearer " + create_access_token({"sub": username, "role": role})}


def test_trainer_sees_only_assigned_learners_and_real_metrics():
    client, trainer, learner, _ = _client()
    response = client.get("/accessibility-trainers/me/learners", headers=_headers(trainer.username, trainer.role))
    assert response.status_code == 200
    assert response.json()[0]["learner_id"] == learner.id
    assert response.json()[0]["assessment_analytics"]["average_score"] == 100


def test_trainer_cannot_read_unassigned_learner_and_other_roles_are_forbidden():
    client, trainer, _learner, other = _client()
    response = client.get(f"/accessibility-trainers/me/learners/{other.id}", headers=_headers(trainer.username, trainer.role))
    assert response.status_code == 404
    response = client.get("/accessibility-trainers/me/learners", headers=_headers(other.username, other.role))
    assert response.status_code == 403
