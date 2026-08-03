def test_full_user_journey(client):
    # Register user
    response = client.post("/auth/register", params={"name": "TestUser", "email": "test@example.com", "password": "password123"})
    assert response.status_code == 200

    # Login
    response = client.post("/auth/login", json={"email": "test@example.com", "password": "password123"})
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens

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
