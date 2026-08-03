def calculate_average(scores):
    if not scores:
        return 0
    return round(sum(scores) / len(scores), 2  )

def best_scores(scores):
    if not scores:
        return 0
    return max(scores)