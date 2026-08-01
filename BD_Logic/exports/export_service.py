from reports.reports_service import ReportService
from exports.export_engine import ExportRequest 

class ExportService:
    def __init__(self):
        self.report_service = ReportService()
        self.engine= ExportRequest()
        
    def export(self,user_id,student_name,export_type):
        report = self.report_service.generate_report(user_id, student_name)
        if export_type.lower() == "json":
            return self.engine.export_json(report, f"{student_name}")
        elif export_type.lower() == "csv":
            return self.engine.export_csv(report, f"{student_name}")
        else:
            return {"error": "Invalid export type. Please choose 'json' or 'csv'."}
        
        return {

            "status": "success",

            "file_path": path,

            "report": report

        }