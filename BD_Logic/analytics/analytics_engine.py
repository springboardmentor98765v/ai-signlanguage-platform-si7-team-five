# INTERN 4 CHECKPOINT: Analytics Engine
# This engine generates performance analytics for sign language practice
# It provides summary statistics including average score, total attempts, best score, and weak signs

class AnalyticsEngine:
    # INTERN 4 CHECKPOINT: Analytics summary generation
    # Generates comprehensive analytics summary from practice history
    # Calculates average score, total attempts, best score, and identifies weak signs
    def generate_summary(self, history, scores=None, weak=None):
        if scores is None:
            scores = [x["score"] for x in history]
        if weak is None:
            weak = [x["expected_sign"] for x in history]

        if len(history) == 0:
            return {
                "average_score": 0,
                "total_attempts": 0,
                "best_score": 0,
                "weak_signs": []
            }

        avg = sum(scores) / len(scores)
        best = max(scores)
        weak_signs = list(set(weak))

        return {
            "average_score": round(avg, 2),
            "total_attempts": len(history),
            "best_score": best,
            "weak_signs": weak_signs
        }