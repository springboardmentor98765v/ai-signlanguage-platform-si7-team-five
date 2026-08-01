from fastapi import APIRouter

from schemas.report_schema import ReportRequest, ReportSchema

from reports.reports_service import ReportService

router = APIRouter()

service = ReportService

@router.post("/report")
 
def report(request:ReportRequest):
   return service.generate_report(request.user_id,request.student_name)