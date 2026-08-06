# INTERN 2 CHECKPOINT: Bulk admin operations test
# Tests bulk user activation functionality
# This ensures admin can activate multiple users at once

def test_bulk_activate_users(client):
    response = client.put("/admin/users/bulk-status", json={"user_ids": [1, 2], "active": True})
    assert response.status_code == 200
    assert response.json()["users"][0]["active"] is True
