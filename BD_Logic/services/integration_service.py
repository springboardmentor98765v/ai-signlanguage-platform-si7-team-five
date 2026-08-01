from services.assessment_service import AssessmentService
from analytics.services import AnalyticsService
from recommendation.recommendation_services import RecommendationService
from certificates.certificates_service import CertificateService

from reports.reports_service import ReportService

from exports.export_service import ExportService

class IntegrationService:
    def __init__(self):
        self.assessment_service = AssessmentService()
        self.analytics_service = AnalyticsService()
        self.recommendation_service = RecommendationService()
        self.certificate_service = CertificateService()
        self.report_service = ReportService()
        self.export_service = ExportService()

    def system_status(self):
        return{
            "assessment": True,
            "analytics": True,
            "recommendation": True,
            "certificate": True,
            "report": True,
            "export": True
            
        }