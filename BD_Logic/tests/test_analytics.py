from analytics.analytics_engine import AnalyticsEngine

def test_summary():
    engine = AnalyticsEngine()
    result = engine.generatet_summary([
        {
            "score": 90,
            "expected_sign": "A",
            
        },
        {
            "score": 80,
            "expected_sign": "B",
            
        },  
    ])
    
    assert result["average_score"] == 85
    