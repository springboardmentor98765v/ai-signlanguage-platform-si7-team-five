import json
import csv
import os

class ExportRequest:
    
    REPORT_DIR= "generated_reports"
    def __init__(self):
        os.makedirs(self.REPORT_DIR, exist_ok=True)
    def export_json(self, data, filename):
        path = os.path.join(self.REPORT_DIR, f"{filename}.json")
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)        
        return path
    def export_csv(self, data, filename):
        path = os.path.join(self.REPORT_DIR, f"{filename}.csv")
        with open(path, 'w', newline='') as f:
            writer = csv.writer(f)
          
            writer.writerow(["Field","Value"])
            for key, value in data.items():
                writer.writerow([key, str(value)])
           
     
        return path
    