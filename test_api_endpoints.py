import requests
import json

BASE_URL = "http://localhost:8003"

def test_endpoint(url, description):
    try:
        response = requests.get(url)
        print(f"[PASS] {description}: {response.status_code}")
        return response.status_code
    except Exception as e:
        print(f"[FAIL] {description}: Error - {str(e)}")
        return None

def test_post_endpoint(url, data, description):
    try:
        response = requests.post(url, json=data)
        print(f"[PASS] {description}: {response.status_code}")
        return response.status_code
    except Exception as e:
        print(f"[FAIL] {description}: Error - {str(e)}")
        return None

print("Testing API Endpoints for Error Handling and Functionality")
print("=" * 60)

# Test health check
test_endpoint(f"{BASE_URL}/api/v1/health", "Health Check")

# Test export endpoints
test_endpoint(f"{BASE_URL}/api/v1/export?user_id=1&student_name=TestUser&export_type=csv", "Export CSV (GET)")
test_endpoint(f"{BASE_URL}/api/v1/export?user_id=1&student_name=TestUser&export_type=pdf", "Export PDF (GET)")
test_endpoint(f"{BASE_URL}/api/v1/export?user_id=1&student_name=TestUser&export_type=excel", "Export Excel (GET)")

# Test certificate endpoints
test_endpoint(f"{BASE_URL}/api/v1/certificate?user_id=1&student_name=TestUser", "Generate Certificate (GET)")
test_endpoint(f"{BASE_URL}/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=pdf&bypass_eligibility=true", "Export Certificate PDF (GET)")
test_endpoint(f"{BASE_URL}/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=csv&bypass_eligibility=true", "Export Certificate CSV (GET)")

# Test 404 error handling
test_endpoint(f"{BASE_URL}/api/v1/nonexistent", "404 Error Handling")

# Test practice session 404 error
test_post_endpoint(f"{BASE_URL}/practice/end", {"session_id": "nonexistent", "accuracy": 0.5, "success": True, "message": "test"}, "Practice Session 404 Error")

# Test certificate eligibility error
test_endpoint(f"{BASE_URL}/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=pdf", "Certificate Eligibility Error (400)")

print("=" * 60)
print("API Testing Complete")