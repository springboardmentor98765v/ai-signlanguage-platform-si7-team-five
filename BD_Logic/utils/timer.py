from datetime import datetime, timedelta

def calculate_duration(strat_time):
    return (datetime.now() - strat_time).total_seconds()