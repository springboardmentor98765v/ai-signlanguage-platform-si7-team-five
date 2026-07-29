from datetime import datetime
from uuid import uuid4

class Feedback: 
    def __init__(
        self,
        assessment_id,
        feedback,
        message
    ):
        
        self.feedback_id = str(uuid4())
        self.assessment_id = assessment_id
        self.feedback_type = feedback_type
        self.message = message
        self.created_at = datetime.utcnow()
    