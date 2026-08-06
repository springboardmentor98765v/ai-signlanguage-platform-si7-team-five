# INTERN 4 CHECKPOINT: Export Engine for Reports and Certificates
# This engine handles export functionality for CSV, PDF, and Excel formats
# It provides proper file download capabilities with correct content types

import json
import csv
import os
from io import BytesIO
from fastapi.responses import StreamingResponse
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

class ExportRequest:
    
    REPORT_DIR = "generated_reports"
    
    def __init__(self):
        os.makedirs(self.REPORT_DIR, exist_ok=True)
    
    def export_json(self, data, filename):
        """Export data to JSON format"""
        path = os.path.join(self.REPORT_DIR, f"{filename}.json")
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)        
        return path
    
    def export_csv(self, data, filename):
        """Export data to CSV format with proper headers and content"""
        output = BytesIO()
        
        # Convert data to list of dictionaries for CSV export
        if isinstance(data, dict):
            # If it's a single report, convert to list format
            csv_data = []
            for key, value in data.items():
                csv_data.append({"Field": key, "Value": str(value)})
            df = pd.DataFrame(csv_data)
        else:
            df = pd.DataFrame(data)
        
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}.csv"}
        )
    
    def export_pdf(self, data, filename):
        """Export data to PDF format with proper formatting"""
        output = BytesIO()
        doc = SimpleDocTemplate(output, pagesize=letter)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Add title
        title = Paragraph(f"Report: {filename}", styles['Title'])
        elements.append(title)
        
        # Convert data to table format
        if isinstance(data, dict):
            table_data = [["Field", "Value"]]
            for key, value in data.items():
                table_data.append([str(key), str(value)])
        else:
            table_data = [list(data.keys())] if data else []
            if data:
                for item in data:
                    table_data.append([str(item.get(k, "")) for k in data.keys()])
        
        if table_data:
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
        
        doc.build(elements)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}.pdf"}
        )
    
    def export_excel(self, data, filename):
        """Export data to Excel format with proper formatting"""
        output = BytesIO()
        
        # Convert data to DataFrame
        if isinstance(data, dict):
            excel_data = []
            for key, value in data.items():
                excel_data.append({"Field": key, "Value": str(value)})
            df = pd.DataFrame(excel_data)
        else:
            df = pd.DataFrame(data)
        
        # Create Excel writer with formatting
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Report', index=False)
            
            # Get the workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Report']
            
            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#4CAF50',
                'font_color': 'white',
                'border': 1
            })
            
            # Apply header formatting
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)
                
                # Auto-adjust column width
                column_len = max(df[value].astype(str).str.len().max(), len(value))
                worksheet.set_column(col_num, col_num, column_len + 2)
        
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}.xlsx"}
        )