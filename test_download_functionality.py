import requests
import os

BASE_URL = "http://localhost:8006"

def test_download_file(url, filename, description):
    """Test file download and verify file creation"""
    try:
        response = requests.get(url)
        if response.status_code == 200:
            # Save the file
            with open(filename, 'wb') as f:
                f.write(response.content)
            file_size = os.path.getsize(filename)
            print(f"[PASS] {description}: Downloaded {file_size} bytes")
            return True
        else:
            print(f"[FAIL] {description}: Status {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] {description}: Error - {str(e)}")
        return False

print("Testing Download Functionality for Reports and Certificates")
print("=" * 70)

# Test report downloads
print("\n--- Report Downloads ---")
test_download_file(
    f"{BASE_URL}/api/v1/export?user_id=1&student_name=TestUser&export_type=csv",
    "progress_report.csv",
    "Progress Report CSV Download"
)

test_download_file(
    f"{BASE_URL}/api/v1/export?user_id=1&student_name=TestUser&export_type=pdf",
    "progress_report.pdf",
    "Progress Report PDF Download"
)

test_download_file(
    f"{BASE_URL}/api/v1/export?user_id=1&student_name=TestUser&export_type=excel",
    "progress_report.xlsx",
    "Progress Report Excel Download"
)

# Test certificate downloads
print("\n--- Certificate Downloads ---")
test_download_file(
    f"{BASE_URL}/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=pdf&bypass_eligibility=true",
    "certificate.pdf",
    "Certificate PDF Download"
)

test_download_file(
    f"{BASE_URL}/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=csv&bypass_eligibility=true",
    "certificate.csv",
    "Certificate CSV Download"
)

test_download_file(
    f"{BASE_URL}/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=excel&bypass_eligibility=true",
    "certificate.xlsx",
    "Certificate Excel Download"
)

print("\n" + "=" * 70)
print("Download Testing Complete")
print("\nGenerated Files:")
for file in ["progress_report.csv", "progress_report.pdf", "progress_report.xlsx",
             "certificate.pdf", "certificate.csv", "certificate.xlsx"]:
    if os.path.exists(file):
        size = os.path.getsize(file)
        print(f"  [OK] {file}: {size} bytes")
    else:
        print(f"  [MISSING] {file}: Not created")