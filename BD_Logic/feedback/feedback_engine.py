# INTERN 4 CHECKPOINT: Feedback Engine
# This engine generates personalized feedback for sign language practice
# It provides actionable feedback based on assessment scores to help users improve

from .feedback_rules import RULES

class FeedbackEngine:
    # INTERN 4 CHECKPOINT: Feedback generation method
    # Generates feedback based on assessment scores
    # For each factor scoring below 70%, it provides specific improvement suggestions
    def generate(self, score):
        feedback = []
        for key, value in score.items():
            if value < 70:
                feedback.append(RULES[key])
        return feedback