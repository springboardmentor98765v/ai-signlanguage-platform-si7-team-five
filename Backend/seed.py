import sys, os
sys.path.insert(0, '.')
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from db import SessionLocal
from models.users import User
from models.business_logic import TrainerLearnerAssignment, PracticeAttempt

def seed():
    db = SessionLocal()
    trainer = db.query(User).filter_by(email='trainer@aslsignai.edu').first()
    learner = db.query(User).filter_by(email='learner@aslsignai.edu').first()
    if trainer and learner:
        # Check if already assigned
        existing = db.query(TrainerLearnerAssignment).filter_by(trainer_id=trainer.id, learner_id=learner.id).first()
        if not existing:
            db.add(TrainerLearnerAssignment(trainer_id=trainer.id, learner_id=learner.id))
        
        # Add varied practice attempts to generate analytics
        db.add(PracticeAttempt(user_id=learner.id, expected_label='A', predicted_label='A', confidence=0.9, is_correct=True, created_at=datetime.now(timezone.utc)))
        db.add(PracticeAttempt(user_id=learner.id, expected_label='B', predicted_label='B', confidence=0.85, is_correct=True, created_at=datetime.now(timezone.utc)))
        db.add(PracticeAttempt(user_id=learner.id, expected_label='C', predicted_label='D', confidence=0.4, is_correct=False, created_at=datetime.now(timezone.utc)))
        db.add(PracticeAttempt(user_id=learner.id, expected_label='E', predicted_label='E', confidence=0.92, is_correct=True, created_at=datetime.now(timezone.utc)))
        
        db.commit()
        print('Dummy assignments and analytics injected securely.')
    else:
        print('Users missing')

if __name__ == '__main__':
    seed()
