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
        doc = SimpleDocTemplate(output, pagesize=landscape(letter),
                              leftMargin=72, rightMargin=72,
                              topMargin=72, bottomMargin=72)

        elements = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = styles['Title']
        title_style.alignment = TA_CENTER
        title_style.fontSize = 40
        title_style.textColor = colors.HexColor('#1A5276')
        title_style.fontName = 'Helvetica-Bold'

        name_style = styles['Heading1']
        name_style.alignment = TA_CENTER
        name_style.fontSize = 52
        name_style.textColor = colors.HexColor('#2E4053')
        name_style.fontName = 'Helvetica-Bold'

        subtitle_style = styles['Heading2']
        subtitle_style.alignment = TA_CENTER
        subtitle_style.fontSize = 24
        subtitle_style.textColor = colors.HexColor('#5D6D7E')
        subtitle_style.fontName = 'Helvetica'

        # Create decorative border
        border_data = [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', '']
        ]
        border_table = Table(border_data, colWidths=[1.5*inch, 5*inch, 5*inch, 1.5*inch],
                           rowHeights=[0.3*inch, 2.5*inch, 2*inch, 0.3*inch])
        border_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 4, colors.HexColor('#1A5276')),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9F9')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))

        # Certificate content
        elements.append(Spacer(1, 0.4*inch))

        # Title with decorative line
        title = Paragraph("CERTIFICATE OF ACHIEVEMENT", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.2*inch))

        # Decorative line
        line_data = [['']]
        line_table = Table(line_data, colWidths=[6*inch], rowHeights=[0.1*inch])
        line_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, 0), 2, colors.HexColor('#1A5276')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#1A5276')),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 0.4*inch))

        # Student name section
        present_text = Paragraph("This is to certify that", subtitle_style)
        present_text.alignment = TA_CENTER
        elements.append(present_text)
        elements.append(Spacer(1, 0.1*inch))

        student_name = Paragraph(certificate_data['student_name'], name_style)
        elements.append(student_name)
        elements.append(Spacer(1, 0.3*inch))

        # Course completion text
        completion_text = Paragraph("Has successfully completed the course", subtitle_style)
        completion_text.alignment = TA_CENTER
        elements.append(completion_text)
        elements.append(Spacer(1, 0.1*inch))

        course_name = Paragraph(certificate_data['course_name'], styles['Heading2'])
        course_name.alignment = TA_CENTER
        course_name.fontSize = 28
        course_name.textColor = colors.HexColor('#1A5276')
        elements.append(course_name)
        elements.append(Spacer(1, 0.5*inch))

        # Certificate details in a table
        details_data = [
            [f"<b>Certificate ID:</b> {certificate_data['certificate_id']}",
             f"<b>Issue Date:</b> {certificate_data['issue_date']}"]
        ]
        details_table = Table(details_data, colWidths=[3*inch, 3*inch])
        details_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#5D6D7E')),
        ]))
        elements.append(details_table)

        # Build PDF
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