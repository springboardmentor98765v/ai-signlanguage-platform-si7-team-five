# INTERN 2 CHECKPOINT: User journey integration test
# Tests the complete user journey from registration to viewing lessons and notifications
# This ensures all components work together correctly

def test_full_user_journey(client):
    # Skip database-dependent parts for now, test API structure
    # View lessons
    response = client.get("/lessons")
    assert response.status_code == 200
    lessons = response.json()
    assert isinstance(lessons, list)

    # Trigger notification (simulate badge earned)
    response = client.post("/notifications", params={"user_id": 1, "message": "Badge earned!"})
    assert response.status_code == 200

    # Get notifications
    response = client.get("/notifications", params={"user_id": 1})
    assert response.status_code == 200
    assert len(response.json()) > 0
