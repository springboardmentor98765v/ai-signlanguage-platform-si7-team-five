from analytics.services import AnalyticsService
from analytics.analytics_engine import AnalyticsEngine
from certificates.certificate_engine import CertificatesEngine



class CertificateService:
    
    
    def __init__(self):
        
        self.analytics=AnalyticsService()
        
        self.engine=AnalyticsEngine()
        
        self.certificates=CertificatesEngine()
    def generate_certificate(self,user_id,student_name):
        
        history=self.analytics.get_user_history(user_id)
        summary = self.engine.generate_summary(history)
        average= summary["average_score"]
        
        eligible = average >= 85
        
        if eligible:
            certificate_id=self.certificates.generate_id()
            
        else:
            certificate_id=None
            
        return{
             "student_name":student_name,

            "average_score":average,

            "eligible":eligible,

            "certificate_id":certificate_id
        }
       
        
       