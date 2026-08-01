from BD_Logic.model.analytics import Analytics
from BD_Logic.repository.analytics_repo import save
from BD_Logic.utils.analytics_utils import (
    calculate_average,
    best_scores
)

def generate_dashboard(request):
    average = calculate_average(request.scores)
    best = best_scores(request.scores)
    analytics = Analytics(
        user_id=request.user_id,
        course_id=request.course_id,
        expected_sign=request.expected_sign,
        best_accuracy=best,
        average_accuracy=average,
        weak_signs=request.weak_signs,
        total_sessions=request.total_sessions
        )
    save(analytics)
    return {
        
        "analytics_id": analytics.analytics_id,
        "user_id": analytics.user_id,
        "course_id": analytics.course_id,
        "expected_sign": analytics.expected_sign,
        "best_accuracy": analytics.best_accuracy,
        "average_accuracy": analytics.average_accuracy,
        "week_signs": analytics.week_signs,
        "total_sessions": analytics.total_sessions
        
        }