from fastapi import APIRouter

from BD_Logic.schemas.report_schema import ReportRequest, ReportSchema
from BD_Logic.reports.reports_service import ReportService

router = APIRouter()

service = ReportService

@router.post("/report")
 
def report(request:ReportRequest):
   return service.generate_report(request.user_id,request.student_name)