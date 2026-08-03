analytics_db = {}

def save(analytics):
    analytics_db[analytics.analytics_id] = analytics

def get(analytics_id):
    return analytics_db.get(analytics_id)