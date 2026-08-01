def test_login_success(client):
    response = client.post("/auth/login", json={"email": "test@example.com", "password": "password123"})
    assert response.status_code == 200
    assert "Login successful" in response.json()["message"]

def test_login_failure(client):
    response = client.post("/auth/login", json={"email": "test@example.com", "password": "wrong"})
    assert response.status_code == 401

def test_forgot_password_rate_limit(client):
    for _ in range(3):
        client.post("/auth/forgot-password", json={"email": "test@example.com"})
    response = client.post("/auth/forgot-password", json={"email": "test@example.com"})
    assert response.status_code == 429
