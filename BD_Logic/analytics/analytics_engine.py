class AnalyticsEngine:
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