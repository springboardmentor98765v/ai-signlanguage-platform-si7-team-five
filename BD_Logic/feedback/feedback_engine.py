from .feedback_rules import RULES

class FeedbackEngine:
    def generate(self,scores):
        def generate(self,score):
            feedback = []
            for key, value in scores.items():
                if value < 70:
                    feedback.append(RULES[key])
            return feedback