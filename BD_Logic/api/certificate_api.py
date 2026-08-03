from fastapi import APIRouter
from BD_Logic.schemas.certificate_schemas import CertificateRequest
from BD_Logic.certificates.certificates_service import CertificateService


router = APIRouter()

service = CertificateService()

@router.post("/certificate")

def generate_certificate(request:CertificateRequest):
    
    return service.generate_certificate(
        request.user_id,
        request.student_name
    )