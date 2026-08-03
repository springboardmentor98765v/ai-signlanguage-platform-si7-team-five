assessment_db = {}

def save(assessment):
    assessment_db[assessment.assessment_id] =assessment
    
def get(assessment_id):
    return assessment_db.get(assessment_id)

def update(assessment_id, assessment):
    assessment_db[assessment_id] = assessment