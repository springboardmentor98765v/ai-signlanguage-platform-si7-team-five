assessment_db = {}

def save(assessment):
    assessment_db[assessment.session_id] = assessment

def get(assessment_id):
    return assessment_db.get(assessment_id)

def update(assessment):
    assessment_db[assessment.session_id] = assessment