def test_bulk_activate_users(client):
    response = client.put("/admin/users/bulk-status", params={"user_ids": [1, 2], "active": True})
    assert response.status_code == 200
    assert response.json()["users"][0]["active"] is True
