from BD_Logic.assessment.scoring_engine import WeightedScoringEngine

def test_score():
    engine = WeightedScoringEngine()
    score = engine.calculate_score(
        90,
        90,
        90,
        90,
        90
        
    )
    
    assert score == 90