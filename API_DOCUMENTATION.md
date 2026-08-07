# API Documentation - Download Endpoints

## Overview
This document provides information about the download endpoints for progress reports and certificates in the AI Sign Language Platform. These endpoints work independently without requiring the frontend, making them perfect for testing and practice sessions.

## Base URL
```
http://localhost:8005/api/v1
```

## Progress Report Download Endpoints

### Export Progress Report (GET)
Download progress reports in various formats without frontend.

**Endpoint:** `/export`

**Method:** `GET`

**Parameters:**
- `user_id` (integer, required): User ID for the report
- `student_name` (string, required): Student name for the report
- `export_type` (string, required): Export format - `csv`, `pdf`, `excel`, `xlsx`, or `json`

**Example URLs:**
```
GET /api/v1/export?user_id=1&student_name=JohnDoe&export_type=csv
GET /api/v1/export?user_id=1&student_name=JohnDoe&export_type=pdf
GET /api/v1/export?user_id=1&student_name=JohnDoe&export_type=excel
```

**Response:** File download with appropriate content-type headers

### Export Progress Report (POST)
Alternative POST method for exporting progress reports.

**Endpoint:** `/export`

**Method:** `POST`

**Request Body:**
```json
{
  "user_id": 1,
  "student_name": "JohnDoe",
  "export_type": "csv"
}
```

## Certificate Download Endpoints

### Generate Certificate (GET)
Check certificate eligibility and generate certificate information.

**Endpoint:** `/certificate`

**Method:** `GET`

**Parameters:**
- `user_id` (integer, required): User ID for the certificate
- `student_name` (string, required): Student name for the certificate

**Example URL:**
```
GET /api/v1/certificate?user_id=1&student_name=JohnDoe
```

**Response:**
```json
{
  "student_name": "JohnDoe",
  "average_score": 92,
  "eligible": true,
  "certificate_id": "a8df7ef8"
}
```

### Export Certificate (GET)
Download certificates in various formats without frontend.

**Endpoint:** `/certificate/export`

**Method:** `GET`

**Parameters:**
- `user_id` (integer, required): User ID for the certificate
- `student_name` (string, required): Student name for the certificate
- `export_format` (string, required): Export format - `csv`, `pdf`, `excel`, or `xlsx`
- `course_name` (string, optional): Course name for the certificate (default: "Sign Language Mastery")
- `bypass_eligibility` (boolean, optional): Bypass eligibility check for testing (default: false)

**Example URLs:**
```
GET /api/v1/certificate/export?user_id=1&student_name=JohnDoe&export_format=pdf
GET /api/v1/certificate/export?user_id=1&student_name=JohnDoe&export_format=csv
GET /api/v1/certificate/export?user_id=1&student_name=JohnDoe&export_format=excel&bypass_eligibility=true
```

**Response:** File download with appropriate content-type headers

### Export Certificate (POST)
Alternative POST method for exporting certificates.

**Endpoint:** `/certificate/export`

**Method:** `POST`

**Parameters:**
- `user_id` (integer, required): User ID for the certificate
- `student_name` (string, required): Student name for the certificate
- `export_format` (string, required): Export format - `csv`, `pdf`, `excel`, or `xlsx`
- `course_name` (string, optional): Course name for the certificate (default: "Sign Language Mastery")
- `bypass_eligibility` (boolean, optional): Bypass eligibility check for testing (default: false)

## Supported Formats

### Progress Reports
- **CSV**: Spreadsheet-compatible format for data analysis
- **PDF**: Professional format for printing and sharing
- **Excel**: Formatted Excel workbook with multiple sheets
- **JSON**: Data exchange format for API integration

### Certificates
- **CSV**: Spreadsheet-compatible format for record keeping
- **PDF**: Professional certificate design for printing
- **Excel**: Formatted Excel workbook with certificate data

## Error Handling

### 400 Bad Request
- Invalid export format
- Student not eligible for certificate (average score < 85%)

### 404 Not Found
- Practice session not found
- Resource not found

### 500 Internal Server Error
- Server-side processing errors

## Testing Examples

### Using curl
```bash
# Download progress report as CSV
curl "http://localhost:8005/api/v1/export?user_id=1&student_name=TestUser&export_type=csv" -o report.csv

# Download certificate as PDF (with eligibility bypass)
curl "http://localhost:8005/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=pdf&bypass_eligibility=true" -o certificate.pdf
```

### Using Python
```python
import requests

# Download progress report
response = requests.get("http://localhost:8005/api/v1/export?user_id=1&student_name=TestUser&export_type=csv")
with open("report.csv", "wb") as f:
    f.write(response.content)

# Download certificate
response = requests.get("http://localhost:8005/api/v1/certificate/export?user_id=1&student_name=TestUser&export_format=pdf&bypass_eligibility=true")
with open("certificate.pdf", "wb") as f:
    f.write(response.content)
```

## Eligibility Requirements

For certificate generation, students must have:
- **Minimum average score**: 85%
- The system checks user assessment history to calculate the average score

For testing purposes, use the `bypass_eligibility=true` parameter to generate certificates without meeting the score requirement.

## Health Check

Check if the API is running:

**Endpoint:** `/health`

**Method:** `GET`

**Example:**
```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Business Logic API"
}
```

## Notes

- All download endpoints return files with proper content-type headers for browser download
- The API works independently without requiring the frontend
- For practice sessions and testing, use the GET endpoints with query parameters
- Certificate eligibility is based on average score from user assessment history
- Use `bypass_eligibility=true` for testing certificate generation without meeting score requirements