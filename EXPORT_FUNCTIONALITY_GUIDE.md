# Export Functionality Guide

## Overview
This guide explains the export functionality for reports and certificates, supporting CSV, PDF, and Excel formats with proper file download capabilities via Swagger UI.

## ✅ Implemented Features

### 1. Report Export (`/bd_logic/api/v1/export`)
- **Endpoint**: `POST /bd_logic/api/v1/export`
- **Formats**: JSON, CSV, PDF, Excel (XLSX)
- **File Download**: Yes, with proper content headers

#### Request Format:
```json
{
  "user_id": 1,
  "student_name": "John Doe",
  "export_type": "csv"  // Options: json, csv, pdf, excel, xlsx
}
```

#### Response:
- For CSV/PDF/Excel: File download with proper content headers
- For JSON: File download with JSON content type
- For errors: JSON error message

### 2. Certificate Export (`/bd_logic/api/v1/certificate/export`)
- **Endpoint**: `POST /bd_logic/api/v1/certificate/export`
- **Formats**: CSV, PDF, Excel (XLSX)
- **File Download**: Yes, with proper content headers
- **Eligibility**: Average score >= 85%

#### Request Parameters:
- `user_id`: User ID (required)
- `student_name`: Student name (required)
- `export_format`: Export format (csv, pdf, excel, xlsx)
- `course_name`: Course name (optional, default: "Sign Language Mastery")

#### Response:
- For CSV/PDF/Excel: Professional certificate file download
- For ineligible students: Error message
- For errors: JSON error message

### 3. Helper Endpoints

#### Get Supported Export Formats
- **Endpoint**: `GET /bd_logic/api/v1/export/formats`
- **Response**: List of supported formats with descriptions

#### Get Supported Certificate Formats
- **Endpoint**: `GET /bd_logic/api/v1/certificate/formats`
- **Response**: List of supported formats and eligibility requirements

## 📋 Format Details

### CSV Export
- **Content-Type**: `text/csv`
- **File Extension**: `.csv`
- **Features**: 
  - Proper field-value mapping
  - Compatible with Excel, Google Sheets
  - Easy data analysis

### PDF Export
- **Content-Type**: `application/pdf`
- **File Extension**: `.pdf`
- **Features**:
  - Professional formatting
  - Color-coded tables
  - Print-ready quality
  - For reports: Clean table layout
  - For certificates: Professional certificate design with borders

### Excel Export
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **File Extension**: `.xlsx`
- **Features**:
  - Green header formatting
  - Auto-adjusted column widths
  - Professional appearance
  - Multiple sheet support capability

## 🧪 Testing via Swagger UI

### Steps to Test:
1. Start the backend server:
   ```bash
   cd Backend
   python main.py
   ```

2. Open Swagger UI:
   - Navigate to `http://localhost:8000/docs`
   - Or `http://localhost:8000/bd_logic/docs` for BD_Logic endpoints

3. Test Report Export:
   - Find `POST /bd_logic/api/v1/export`
   - Click "Try it out"
   - Enter parameters:
     ```json
     {
       "user_id": 1,
       "student_name": "TestStudent",
       "export_type": "pdf"
     }
     ```
   - Click "Execute"
   - Click "Download file" in the response

4. Test Certificate Export:
   - Find `POST /bd_logic/api/v1/certificate/export`
   - Click "Try it out"
   - Enter parameters:
     - user_id: `1`
     - student_name: `TestStudent`
     - export_format: `pdf`
     - course_name: `Sign Language Mastery`
   - Click "Execute"
   - Click "Download file" in the response

## 🔧 Technical Implementation

### Key Files Modified:
1. `BD_Logic/exports/export_engine.py` - Export engine with file download support
2. `BD_Logic/exports/export_service.py` - Export service coordination
3. `BD_Logic/api/export_api.py` - Export API endpoints
4. `BD_Logic/certificates/certificate_engine.py` - Certificate generation and export
5. `BD_Logic/certificates/certificates_service.py` - Certificate service
6. `BD_Logic/api/certificate_api.py` - Certificate API endpoints
7. `requirements.txt` - Added reportlab, openpyxl, xlsxwriter

### Content Headers:
All file downloads include proper headers:
```python
headers={
    "Content-Disposition": f"attachment; filename={filename}.{extension}"
}
```

### StreamingResponse:
Uses FastAPI's `StreamingResponse` for efficient file downloads:
```python
return StreamingResponse(
    output,
    media_type="application/pdf",
    headers={"Content-Disposition": f"attachment; filename={filename}.pdf"}
)
```

## 📦 Dependencies Added
- `reportlab` - PDF generation
- `openpyxl` - Excel file handling
- `xlsxwriter` - Excel file creation with formatting
- `pandas` - Data manipulation (already present)

## 🎯 Usage Examples

### Python Script Example:
```python
import requests

# Export report as PDF
response = requests.post(
    "http://localhost:8000/bd_logic/api/v1/export",
    json={
        "user_id": 1,
        "student_name": "John Doe",
        "export_type": "pdf"
    }
)

# Save the file
with open("report.pdf", "wb") as f:
    f.write(response.content)

# Export certificate as Excel
response = requests.post(
    "http://localhost:8000/bd_logic/api/v1/certificate/export",
    params={
        "user_id": 1,
        "student_name": "John Doe",
        "export_format": "excel"
    }
)

# Save the file
with open("certificate.xlsx", "wb") as f:
    f.write(response.content)
```

## 🐛 Troubleshooting

### Issue: Port already in use
- **Solution**: Change port in `main.py` or stop the existing server

### Issue: Missing dependencies
- **Solution**: Run `pip install reportlab openpyxl xlsxwriter`

### Issue: Certificate not eligible
- **Solution**: Ensure user has average score >= 85%

### Issue: File not downloading in Swagger
- **Solution**: Check browser popup settings, click "Download file" link in response

## ✨ Features
- ✅ Multiple format support (CSV, PDF, Excel)
- ✅ Professional file formatting
- ✅ Proper content headers for browser download
- ✅ Swagger UI compatible
- ✅ Certificate eligibility checking
- ✅ Error handling and validation
- ✅ Professional certificate design
- ✅ Color-coded Excel formatting
- ✅ Auto-adjusted column widths
- ✅ Print-ready PDF quality

## 📝 Notes
- All exports are generated in memory for efficiency
- Files are not stored on the server (download-only)
- Certificate design is professional and print-ready
- Excel exports include professional formatting
- PDF exports include proper page layouts
- CSV exports are compatible with major spreadsheet applications