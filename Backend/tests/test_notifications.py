def test_create_notification(client):
    response = client.post("/notifications", params={"user_id": 1, "message": "Test notification"})
    assert response.status_code == 200
    assert response.json()["notification"]["message"] == "Test notification"

def test_list_notifications(client):
    response = client.get("/notifications", params={"user_id": 1})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_mark_as_read_requires_an_authenticated_owner(client):
    # The active notification read endpoint is protected; an anonymous request
    # must not be able to alter another learner's notification.
    response = client.put("/notifications/1/read")
    assert response.status_code == 401
