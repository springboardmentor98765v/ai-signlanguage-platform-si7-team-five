from fastapi import APIRouter
from BD_Logic.schemas.export_schema import ExportRequest
from BD_Logic.exports.export_service import ExportService

router = APIRouter()

service = ExportService()

@router.post("/export")
def export(request: ExportRequest):
    return service.export(
        request.user_id,
        request.student_name,
        request.export_type
    )