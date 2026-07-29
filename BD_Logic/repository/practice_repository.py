practice_db = {}

def save(session):

    practice_db[session.session_id] = session


def get(session_id):

    return practice_db.get(session_id)


def update(session):

    practice_db[session.session_id] = session