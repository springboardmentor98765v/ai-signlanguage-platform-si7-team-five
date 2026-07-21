from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_lessons_route_is_available_at_courses_prefix():
    response = client.get("/courses")
    assert response.status_code == 200


def test_instructor_assign_student_route_uses_instructors_prefix():
    response = client.post(
        "/instructors/assign-student",
        json={"student_id": 1, "instructor_id": 2},
    )
    assert response.status_code == 200
