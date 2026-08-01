from BD_Logic.database.connection import SessionLocal
from BD_Logic.database.models import Assessment

class DatabaseService:
    def save_assessment(self, data):
        session = SessionLocal()
        assessment = Assessment(
            user_id=data["user_id"],
            course_id=data["lesson_id"],
            expected_sign=data["expected_sign"],
            predicted_sign=data["predicted_sign"],
            score=data["score"]
        )
        session.add(assessment)
        session.commit()
        session.close()
        
        def get_history(self, user_id):
            session = SessionLocal()
            history = session.query(Assessment).filter_by(user_id=user_id).all()
            session.close()
            return history