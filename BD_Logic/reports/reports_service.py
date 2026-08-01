from analytics.services import AnalyticsService
from analytics.analytics_engine import AnalyticsEngine
from recommendation.recommendation_services import RecommendationService

from certificates.certificates_service import CertificateService

from reports.reports_engine import ReportEngine


class ReportService:
    def __init__(self):
        self.analytics=AnalyticsService()
        self.engine=AnalyticsEngine()
        self.recommendation=RecommendationService()
        self.certificate=CertificateService()
        self.report_engine=ReportEngine()
        
    def generate_report(self, user_id,student_name):
        history=self.analytics.get_user_history(user_id)

        summary=self.engine.generate_summary(history)

        recommendation=self.recommendation.get_recommendations(user_id)

        certificate=self.certificate.generate_certificate(user_id,student_name)
        
        report = self.report_engine.generate({
            
        "student": student_name,
        "analytics": summary,
                        
                        
        "recommendations": recommendation,
        "certificate": certificate
                        
        })
        