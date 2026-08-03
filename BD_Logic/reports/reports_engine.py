from datetime import datetime

class ReportEngine:
    def generate(self, data):
        return {
            "generated_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "student": data["student"],
            "analytics": data["analytics"],
            "recommendations": data["recommendations"],
            "certificate": data["certificate"]
        }
