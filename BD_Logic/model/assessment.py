from datetime import datetime
from uuid import uuid4

class Assessment:
   
    def __init__(
        self,
        session_id,
        expected_sign,
        predicted_sign,
        confidence,
        accuracy
    ):
        self.assessment_id = str(uuid4())
        
        self.session_id = session_id
        self.expected_sign = expected_sign
        self.predicted_sign = predicted_sign
        self.confidence = confidence
        self.accuracy = accuracy
        self.created_at = datetime.utcnow()