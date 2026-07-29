from database.fake_db import assessment_db
from analytics.services import Analyticsservices



class AnalyticsService:
    def save_assessment(self,record):
        assessment_db.append(record)
        return True
    
    

    
    
    def get_user_history(self,user_id):
        return[
            x for x in assessment_db
            if x["user_id"] == user_id
        ]


analytics = Analyticsservices()

analytics.save_assessment({

    "user_id": request.user_id,

    "lesson_id": request.lesson_id,

    "expected_sign": request.expected_sign,

    "predicted_sign": request.predicted_sign,

    "score": score

})