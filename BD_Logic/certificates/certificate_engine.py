# INTERN 4 CHECKPOINT: Certificate Engine for Generating and Exporting Certificates
# This engine handles certificate generation and export functionality
# It supports CSV, PDF, Excel, and JSON formats with proper file download capabilities

import uuid
from io import BytesIO
from fastapi.responses import StreamingResponse
import pandas as pd
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER

class CertificateEngine:
    def generate_id(self):
        """Generate unique certificate ID"""
        return str(uuid.uuid4())[:8]
    
    def generate_certificate_data(self, user_id, student_name, course_name="Sign Language Mastery"):
        """Generate certificate data"""
        return {
            "certificate_id": self.generate_id(),
            "student_name": student_name,
            "user_id": user_id,
            "course_name": course_name,
            "issue_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
            "status": "Issued"
        }
    
    def export_csv(self, certificate_data, filename):
        """Export certificate to CSV format"""
        output = BytesIO()
        
        # Convert to DataFrame
        df = pd.DataFrame([certificate_data])
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}_certificate.csv"}
        )
    
    def export_pdf(self, certificate_data, filename):
        """Export certificate to PDF format with professional design"""
        output = BytesIO()
        doc = SimpleDocTemplate(output, pagesize=landscape(letter))
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = styles['Title']
        title_style.alignment = TA_CENTER
        title_style.fontSize = 36
        title_style.textColor = colors.HexColor('#2E4053')
        
        name_style = styles['Heading1']
        name_style.alignment = TA_CENTER
        name_style.fontSize = 48
        name_style.textColor = colors.HexColor('#1A5276')
        
        # Certificate border
        border_style = TableStyle([
            ('GRID', (0, 0), (-1, -1), 3, colors.HexColor('#1A5276')),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9F9')),
        ])
        
        # Certificate content
        elements.append(Spacer(1, 0.5*inch))
        
        # Title
        title = Paragraph("Certificate of Achievement", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Student name
        name = Paragraph(f"This is to certify that", styles['Normal'])
        name.alignment = TA_CENTER
        elements.append(name)
        
        student_name = Paragraph(certificate_data['student_name'], name_style)
        elements.append(student_name)
        elements.append(Spacer(1, 0.2*inch))
        
        # Course info
        course = Paragraph(f"Has successfully completed the course", styles['Normal'])
        course.alignment = TA_CENTER
        elements.append(course)
        
        course_name = Paragraph(certificate_data['course_name'], styles['Heading2'])
        course_name.alignment = TA_CENTER
        elements.append(course_name)
        elements.append(Spacer(1, 0.3*inch))
        
        # Certificate details
        details = Paragraph(
            f"Certificate ID: {certificate_data['certificate_id']}<br/>"
            f"Issue Date: {certificate_data['issue_date']}",
            styles['Normal']
        )
        details.alignment = TA_CENTER
        elements.append(details)
        
        doc.build(elements)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}_certificate.pdf"}
        )
    
    def export_excel(self, certificate_data, filename):
        """Export certificate to Excel format with formatting"""
        output = BytesIO()
        
        # Convert to DataFrame
        df = pd.DataFrame([certificate_data])
        
        # Create Excel writer with formatting
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Certificate', index=False)
            
            # Get the workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Certificate']
            
            # Add certificate formatting
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#1A5276',
                'font_color': 'white',
                'font_size': 14,
                'border': 1,
                'align': 'center'
            })
            
            cell_format = workbook.add_format({
                'bg_color': '#F8F9F9',
                'border': 1,
                'align': 'left',
                'font_size': 12
            })
            
            # Apply header formatting
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)
                worksheet.set_column(col_num, col_num, 25)
            
            # Apply cell formatting
            for row_num in range(1, len(df) + 1):
                for col_num in range(len(df.columns)):
                    worksheet.write(row_num, col_num, df.iloc[row_num-1, col_num], cell_format)
        
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}_certificate.xlsx"}
        )