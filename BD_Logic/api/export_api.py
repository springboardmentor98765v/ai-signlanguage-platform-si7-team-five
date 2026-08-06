# INTERN 4 CHECKPOINT: Export API for Reports and Certificates
# This API provides endpoints for exporting reports and certificates
# It supports CSV, PDF, Excel, and JSON formats with proper file download capability
# The endpoints are designed to work seamlessly with Swagger UI for testing

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from BD_Logic.schemas.export_schema import ExportRequest
from BD_Logic.exports.export_service import ExportService
from typing import Literal

router = APIRouter()

service = ExportService()

@router.post("/export")
def export(request: ExportRequest):
    """
    Export report in specified format with file download capability
    
    Supports multiple formats:
    - json: JSON format for data exchange
    - csv: CSV format for spreadsheet applications
    - pdf: PDF format for printing and sharing
    - excel/xlsx: Excel format with formatting
    
    The response includes proper content headers for browser download
    """
    try:
        result = service.export(
            request.user_id,
            request.student_name,
            request.export_type
        )
        
        # Check if result is a StreamingResponse (for CSV, PDF, Excel)
        if hasattr(result, 'media_type'):
            return result
        # For JSON export, return the file path
        elif isinstance(result, str) and result.endswith('.json'):
            return FileResponse(
                result,
                media_type="application/json",
                filename=f"{request.student_name}.json"
            )
        # For errors
        elif isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        else:
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/export/formats")
def get_supported_formats():
    """
    Get list of supported export formats
    """
    return {
        "supported_formats": ["json", "csv", "pdf", "excel", "xlsx"],
        "descriptions": {
            "json": "JSON format for data exchange and API integration",
            "csv": "CSV format for spreadsheet applications and data analysis",
            "pdf": "PDF format for printing, sharing, and official documentation",
            "excel": "Excel format with formatting and multiple sheets support",
            "xlsx": "Alternative name for Excel format"
        }
    }