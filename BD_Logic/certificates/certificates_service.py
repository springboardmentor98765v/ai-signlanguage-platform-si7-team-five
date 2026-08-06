# INTERN 4 CHECKPOINT: Certificate Service for Generating and Exporting Certificates
# This service handles certificate generation and export in multiple formats
# It supports CSV, PDF, Excel, and JSON formats with proper file download capabilities

from BD_Logic.analytics.services import AnalyticsService
from BD_Logic.analytics.analytics_engine import AnalyticsEngine
from BD_Logic.certificates.certificate_engine import CertificateEngine


class CertificateService:
    def __init__(self):
        self.analytics = AnalyticsService()
        self.engine = AnalyticsEngine()
        self.certificates = CertificateEngine()
    
    def generate_certificate(self, user_id, student_name):
        """Generate certificate data and check eligibility"""
        history = self.analytics.get_user_history(user_id)
        summary = self.engine.generate_summary(history)
        average = summary["average_score"]
        
        eligible = average >= 85
        
        if eligible:
            certificate_id = self.certificates.generate_id()
        else:
            certificate_id = None
            
        return {
            "student_name": student_name,
            "average_score": average,
            "eligible": eligible,
            "certificate_id": certificate_id
        }
    
    def export_certificate(self, user_id, student_name, export_format, course_name="Sign Language Mastery"):
        """Export certificate in specified format with file download capability"""
        # First check eligibility
        certificate_info = self.generate_certificate(user_id, student_name)
        
        if not certificate_info["eligible"]:
            return {"error": "Student not eligible for certificate. Average score must be >= 85%."}
        
        # Generate full certificate data
        certificate_data = self.certificates.generate_certificate_data(
            user_id, student_name, course_name
        )
        
        # Add additional info
        certificate_data.update({
            "average_score": certificate_info["average_score"],
            "eligible": certificate_info["eligible"]
        })
        
        # Export in requested format
        if export_format.lower() == "csv":
            return self.certificates.export_csv(certificate_data, student_name)
        elif export_format.lower() == "pdf":
            return self.certificates.export_pdf(certificate_data, student_name)
        elif export_format.lower() == "excel" or export_format.lower() == "xlsx":
            return self.certificates.export_excel(certificate_data, student_name)
        else:
            return {"error": "Invalid export format. Please choose 'csv', 'pdf', or 'excel'."}