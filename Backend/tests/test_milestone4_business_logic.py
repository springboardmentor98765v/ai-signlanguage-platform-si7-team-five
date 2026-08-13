"""Acceptance tests for Intern 4's Milestone 4 exam and five-report requirements."""

import os

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret")

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db import Base, get_db
import models.business_logic  # noqa: F401
import models.course  # noqa: F401
import models.users  # noqa: F401
from models.users import User
from services.auth import create_access_token
from services.business_logic_service import EXAM_LEVELS, r


def _client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine, expire_on_commit=False)()
    learner = User(username="exam-learner", email="exam@test.local", hashed_password="x", role="Learner")
    db.add(learner); db.commit()
    app = FastAPI(); app.include_router(r, prefix="/business")
    def override_db():
        yield db
    app.dependency_overrides[get_db] = override_db
    return TestClient(app), learner


def _headers(learner):
    return {"Authorization": "Bearer " + create_access_token({"sub": learner.username, "role": learner.role})}


def _answers(level, correct=True):
    return [{"expected_label": sign, "predicted_label": sign if correct else "WRONG", "confidence": 1.0} for sign in EXAM_LEVELS[level]["signs"]]


def test_all_four_exam_levels_have_fixed_multi_sign_structures_and_thresholds():
    client, _ = _client()
    levels = client.get("/business/certification/levels").json()
    assert [item["level"] for item in levels] == ["Beginner", "Intermediate", "Advanced", "Professional"]
    assert all(len(item["required_signs"]) > 1 and item["pass_score"] >= 70 for item in levels)


def test_passed_exam_stores_result_and_triggers_certificate_identifier():
    client, learner = _client()
    response = client.post("/business/certification/exams", headers=_headers(learner), json={"level": "Beginner", "answers": _answers("Beginner")})
    assert response.status_code == 201
    assert response.json()["passed"] is True
    assert response.json()["certificate_id"].startswith("CERT-")


def test_exam_rejects_incomplete_or_wrong_level_sign_set():
    client, learner = _client()
    response = client.post("/business/certification/exams", headers=_headers(learner), json={"level": "Beginner", "answers": _answers("Beginner")[:-1]})
    assert response.status_code == 422


def test_each_required_report_type_downloads_as_pdf_and_excel():
    client, learner = _client()
    headers = _headers(learner)
    client.post("/business/attempts", headers=headers, json={"expected_label": "A", "predicted_label": "A", "confidence": 0.9})
    client.post("/business/certification/exams", headers=headers, json={"level": "Beginner", "answers": _answers("Beginner")})
    for report_type in ("learning", "assessment", "accuracy", "certification", "progress"):
        pdf = client.get(f"/business/reports/me?report_type={report_type}&format=pdf", headers=headers)
        excel = client.get(f"/business/reports/me?report_type={report_type}&format=xlsx", headers=headers)
        assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")
        assert excel.status_code == 200 and excel.content.startswith(b"PK")


def test_live_analytics_returns_only_the_signed_in_learners_attempts():
    client, learner = _client()
    headers = _headers(learner)
    client.post("/business/attempts", headers=headers, json={"expected_label": "A", "predicted_label": "A", "confidence": 0.9})
    response = client.get("/business/analytics/me", headers=headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["history"][0]["sign_symbol"] == "A"
    assert payload["history"][0]["accuracy"] == 90.0
    assert payload["daily_attempts"][0]["time"] == 1
