"""
Test script for export functionality
This script tests the export endpoints for reports and certificates
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/bd_logic/api/v1"

def test_export_formats():
    """Test getting supported export formats"""
    print("Testing export formats endpoint...")
    response = requests.get(f"{BASE_URL}/export/formats")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_report_export():
    """Test report export in different formats"""
    print("Testing report export...")
    
    export_formats = ["csv", "pdf", "excel"]
    
    for fmt in export_formats:
        print(f"Testing {fmt} export...")
        response = requests.post(
            f"{BASE_URL}/export",
            json={
                "user_id": 1,
                "student_name": "TestStudent",
                "export_type": fmt
            }
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check if it's a file download response
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            print(f"Content-Type: {content_type}")
            print(f"Content-Disposition: {content_disposition}")
            
            if 'attachment' in content_disposition:
                print(f"✓ {fmt.upper()} export successful - file download ready")
            else:
                print(f"Response content: {response.text[:200]}")
        else:
            print(f"Error: {response.text}")
        print()

def test_certificate_formats():
    """Test getting supported certificate formats"""
    print("Testing certificate formats endpoint...")
    response = requests.get(f"{BASE_URL}/certificate/formats")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_certificate_export():
    """Test certificate export in different formats"""
    print("Testing certificate export...")
    
    export_formats = ["csv", "pdf", "excel"]
    
    for fmt in export_formats:
        print(f"Testing {fmt} certificate export...")
        response = requests.post(
            f"{BASE_URL}/certificate/export",
            params={
                "user_id": 1,
                "student_name": "TestStudent",
                "export_format": fmt,
                "course_name": "Sign Language Mastery"
            }
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check if it's a file download response
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            print(f"Content-Type: {content_type}")
            print(f"Content-Disposition: {content_disposition}")
            
            if 'attachment' in content_disposition:
                print(f"✓ {fmt.upper()} certificate export successful - file download ready")
            else:
                print(f"Response content: {response.text[:200]}")
        else:
            print(f"Error: {response.text}")
        print()

if __name__ == "__main__":
    print("=" * 60)
    print("EXPORT FUNCTIONALITY TEST")
    print("=" * 60)
    print()
    
    try:
        # Test export formats
        test_export_formats()
        
        # Test report exports
        test_report_export()
        
        # Test certificate formats
        test_certificate_formats()
        
        # Test certificate exports
        test_certificate_export()
        
        print("=" * 60)
        print("TEST COMPLETED")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server.")
        print("Make sure the backend server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"Error: {e}")