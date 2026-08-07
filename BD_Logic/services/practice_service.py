from fastapi import HTTPException
from BD_Logic.model.practice_session import PracticeSession
from BD_Logic.repository.assessment_repository import (
    save,
    get,
    update
)

practice_sessions = {}

def start_practice(data):
    try:
        session = PracticeSession(
            user_id=data.user_id,
            lesson_id=data.lesson_id,
            expected_sign=data.expected_sign
        )

        save(session)

        return {
            "session_id": session.session_id,
            "status": session.status,
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start practice session: {str(e)}")

def record_practice(session_id, accuracy):
    session = get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Practice session not found")
        
    session.attempt_count += 1
    session.accuracy = accuracy
    update(session)
    
    return {
         "success": True,

        "attempts": session.attempt_count,
        
        "accuracy": session.accuracy
    }
        
        
def end_practice(session_id):
    session = get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Practice session not found")
    session.finish()
    update(session)
    
    return {
        "success": True,

        "duration": session.duration,

        "attempts": session.attempt_count,

        "status": session.status
        
         
        
    }   
   
    
    