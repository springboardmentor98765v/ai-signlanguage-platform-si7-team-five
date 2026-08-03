from BD_Logic.reports.reports_engine import ReportEngine

def test_report():
    engine = ReportEngine()
    report = engine.generate({
        "student": "Test",
        "analytics": {},
        "recommendations": [],
        "certificate": {}
    })
    
    assert report["student"] == "Test"