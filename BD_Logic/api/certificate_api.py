# INTERN 4 CHECKPOINT: Certificate API for Generating and Exporting Certificates
# This API provides endpoints for certificate generation and export
# It supports CSV, PDF, Excel, and JSON formats with proper file download capability
# The endpoints are designed to work seamlessly with Swagger UI for testing

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from BD_Logic.schemas.certificate_schemas import CertificateRequest
from BD_Logic.certificates.certificates_service import CertificateService
from typing import Literal


router = APIRouter()

service = CertificateService()

@router.post("/certificate")
def generate_certificate(request: CertificateRequest):
    """
    Generate certificate and check eligibility

    Returns certificate information including eligibility status
    """
    return service.generate_certificate(
        request.user_id,
        request.student_name
    )

@router.get("/certificate")
def generate_certificate_get(
    user_id: int = Query(..., description="User ID for the certificate"),
    student_name: str = Query(..., description="Student name for the certificate")
):
    """
    Generate certificate and check eligibility using GET request (for direct API access)

    Returns certificate information including eligibility status
    This endpoint allows direct API access without frontend for testing and practice sessions
    Example: /api/v1/certificate?user_id=1&student_name=John
    """
    return service.generate_certificate(
        user_id,
        student_name
    )

@router.post("/certificate/export")
def export_certificate(
    user_id: int = Query(..., description="User ID for the certificate"),
    student_name: str = Query(..., description="Student name for the certificate"),
    export_format: Literal["csv", "pdf", "excel", "xlsx"] = Query(..., description="Export format"),
    course_name: str = Query("Sign Language Mastery", description="Course name for the certificate"),
    bypass_eligibility: bool = Query(False, description="Bypass eligibility check for testing purposes")
):
    """
    Export certificate in specified format with file download capability

    Supports multiple formats:
    - csv: CSV format for spreadsheet applications
    - pdf: PDF format with professional certificate design
    - excel/xlsx: Excel format with formatting

    The response includes proper content headers for browser download
    This endpoint is fully compatible with Swagger UI for testing
    Set bypass_eligibility=true to test certificate generation without meeting score requirements
    """
    try:
        result = service.export_certificate(
            user_id,
            student_name,
            export_format,
            course_name,
            bypass_eligibility
        )

        # Check if result is a StreamingResponse (for CSV, PDF, Excel)
        if hasattr(result, 'media_type'):
            return result
        # For errors
        elif isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        else:
            return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Certificate export failed: {str(e)}")

@router.get("/certificate/export")
def export_certificate_get(
    user_id: int = Query(..., description="User ID for the certificate"),
    student_name: str = Query(..., description="Student name for the certificate"),
    export_format: Literal["csv", "pdf", "excel", "xlsx"] = Query(..., description="Export format"),
    course_name: str = Query("Sign Language Mastery", description="Course name for the certificate"),
    bypass_eligibility: bool = Query(False, description="Bypass eligibility check for testing purposes")
):
    """
    Export certificate in specified format using GET request (for direct API access)

    Supports multiple formats:
    - csv: CSV format for spreadsheet applications
    - pdf: PDF format with professional certificate design
    - excel/xlsx: Excel format with formatting

    This endpoint allows direct API access without frontend for testing and practice sessions
    Example: /api/v1/certificate/export?user_id=1&student_name=John&export_format=pdf
    Set bypass_eligibility=true to test certificate generation without meeting score requirements
    """
    try:
        result = service.export_certificate(
            user_id,
            student_name,
            export_format,
            course_name,
            bypass_eligibility
        )

        # Check if result is a StreamingResponse (for CSV, PDF, Excel)
        if hasattr(result, 'media_type'):
            return result
        # For errors
        elif isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        else:
            return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Certificate export failed: {str(e)}")

@router.get("/certificate/formats")
def get_certificate_formats():
    """
    Get list of supported certificate export formats
    """
    return {
        "supported_formats": ["csv", "pdf", "excel", "xlsx"],
        "descriptions": {
            "csv": "CSV format for spreadsheet applications and data analysis",
            "pdf": "PDF format with professional certificate design for printing",
            "excel": "Excel format with formatting and professional appearance",
            "xlsx": "Alternative name for Excel format"
        },
        "eligibility_requirements": {
            "minimum_average_score": 85,
            "description": "Students must have an average score of 85% or higher to be eligible for certificates"
        }
    }