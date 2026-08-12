from datetime import datetime
from uuid import uuid4

class PracticeSession:
    def __init__(self, user_id, lesson_id, expected_sign, score=0, accuracy=0, duration_seconds=0, feedback=""):

        self.session_id = str(uuid4())
        self.assessment_id = str(uuid4())  # For repository compatibility
        self.date = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.learner_id = user_id
        self.lesson_id = lesson_id
        self.expected_sign = expected_sign
        self.score = score
        self.accuracy = accuracy
        self.duration_seconds = duration_seconds
        self.feedback = feedback
        self.status = "Active"
        self.start_time = datetime.now()
        self.end_time = None
        self.duration = 0
        self.attempt_count = 0
        
    def finish(self):
        self.end_time = datetime.now()
        self.duration = (self.end_time - self.start_time).total_seconds()
        self.status = "Completed"