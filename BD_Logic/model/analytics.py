from datetime import datetime
from uuid import uuid4

class Analytics:
    def __init__(
        self,
        user_id,
        course_id,
        expected_sign, 
        best_accuracy,
        average_accuracy,
        week_signs,
        total_sessions 
        ):
        
        self.analytics_id = str(uuid4())
        
        self.user_id = user_id
        self.course_id = course_id
        self.expected_sign = expected_sign
        self.best_accuracy = best_accuracy
        self.average_accuracy = average_accuracy
        self.week_signs = week_signs
        self.total_sessions = total_sessions
        
        self.created_at = datetime.utcnow()