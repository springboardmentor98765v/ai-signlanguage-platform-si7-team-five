from BD_Logic.recommendation.recommendation_engine import RecommendationEngine

def test_recommendation():
    engine = RecommendationEngine()
    result = engine.generate(
        [
            "M",
            "Q"
        ]
    )
    assert len(result) == 2
