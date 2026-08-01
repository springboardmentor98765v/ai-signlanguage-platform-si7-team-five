from BD_Logic.analytics.services import AnalyticsService
from BD_Logic.analytics.analytics_engine import AnalyticsEngine
from BD_Logic.recommendation.recommendation_services import RecommendationService
from BD_Logic.certificates.certificates_service import CertificateService
from BD_Logic.reports.reports_engine import ReportEngine


class ReportService:
    def __init__(self):
        self.analytics = AnalyticsService()
        self.engine = AnalyticsEngine()
        self.recommendation = RecommendationService()
        self.certificate = CertificateService()
        self.report_engine = ReportEngine()
        
    def generate_report(self, user_id, student_name):
        history = self.analytics.get_user_history(user_id)
        summary = self.engine.generate_summary(history)
        recommendation = self.recommendation.get_recommendations(user_id)
        certificate = self.certificate.generate_certificate(user_id, student_name)
        
        report = self.report_engine.generate({
            "student": student_name,
            "analytics": summary,
            "recommendations": recommendation,
            "certificate": certificate
        })
        return report