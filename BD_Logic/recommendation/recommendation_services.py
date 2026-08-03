from BD_Logic.analytics.services import AnalyticsService
from BD_Logic.analytics.analytics_engine import AnalyticsEngine
from BD_Logic.recommendation.recommendation_engine import RecommendationEngine


class RecommendationService:

    def __init__(self):

        self.analytics=AnalyticsService()

        self.engine=AnalyticsEngine()

        self.recommendation=RecommendationEngine()


    def get_recommendations(self,user_id):

        history=self.analytics.get_user_history(user_id)

        summary=self.engine.generate_summary(history)

        return self.recommendation.generate(

            summary["weak_signs"]

        )