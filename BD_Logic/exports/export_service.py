# INTERN 4 CHECKPOINT: Export Service for Reports and Certificates
# This service handles export requests and delegates to the appropriate export engine
# It supports CSV, PDF, Excel, and JSON formats with proper file download capabilities

from BD_Logic.reports.reports_service import ReportService
from BD_Logic.exports.export_engine import ExportRequest 

class ExportService:
    def __init__(self):
        self.report_service = ReportService()
        self.engine = ExportRequest()
        
    def export(self, user_id, student_name, export_type):
        """Export report in specified format with file download capability"""
        report = self.report_service.generate_report(user_id, student_name)
        
        if export_type.lower() == "json":
            return self.engine.export_json(report, f"{student_name}")
        elif export_type.lower() == "csv":
            return self.engine.export_csv(report, f"{student_name}")
        elif export_type.lower() == "pdf":
            return self.engine.export_pdf(report, f"{student_name}")
        elif export_type.lower() == "excel" or export_type.lower() == "xlsx":
            return self.engine.export_excel(report, f"{student_name}")
        else:
            return {"error": "Invalid export type. Please choose 'json', 'csv', 'pdf', or 'excel'."}