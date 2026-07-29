feedback_db = {}

def save(feedback):
    
    feedback_db[feedback.feedback_id] = feedback
    
def get(feedback_id):
    
    return feedback_db.get(feedback_id)