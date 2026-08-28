# report_generator.py - Report generation

import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

class ReportGenerator:
    def __init__(self, reports_dir='reports'):
        self.reports_dir = reports_dir
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)

    def generate(self, report_type, data):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{report_type}_{timestamp}.pdf"
        filepath = os.path.join(self.reports_dir, filename)

        # Create PDF
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.green,
            alignment=TA_CENTER,
            spaceAfter=30
        )
        story.append(Paragraph("🌾 CropDoc Pro Health Report", title_style))
        story.append(Spacer(1, 0.2*inch))

        # Meta info
        meta_style = ParagraphStyle(
            'Meta',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.gray,
            alignment=TA_CENTER
        )
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", meta_style))
        story.append(Paragraph(f"Type: {report_type.title()}", meta_style))
        story.append(Spacer(1, 0.3*inch))

        # Diagnosis section
        diagnosis = data.get('diagnosis', {})
        if diagnosis:
            story.append(Paragraph("Diagnosis Summary", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))

            diag_data = [
                ['Crop', diagnosis.get('crop', 'N/A')],
                ['Condition', diagnosis.get('condition', 'N/A')],
                ['Confidence', f"{diagnosis.get('confidence', 0)}%"],
                ['Symptoms', ', '.join(diagnosis.get('symptoms', ['N/A']))]
            ]
            diag_table = Table(diag_data, colWidths=[2*inch, 3*inch])
            diag_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            story.append(diag_table)
            story.append(Spacer(1, 0.2*inch))

        # Treatment section
        treatment = diagnosis.get('treatment', {})
        if treatment:
            story.append(Paragraph("Treatment Recommendations", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))

            treat_data = [
                ['Treatment', 'Recommendation'],
                ['Fertilizer', treatment.get('fertilizer', 'N/A')],
                ['Organic Alternative', treatment.get('organic', 'N/A')],
                ['Dosage', treatment.get('dosage', 'N/A')]
            ]
            treat_table = Table(treat_data, colWidths=[2*inch, 3*inch])
            treat_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.green),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            story.append(treat_table)
            story.append(Spacer(1, 0.2*inch))

        # NPK section
        npk = data.get('npk', {})
        if npk:
            story.append(Paragraph("NPK Analysis", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))

            npk_data = [
                ['Nutrient', 'Value', 'Status'],
                ['Nitrogen', f"{npk.get('nitrogen', 0)}%", 'Normal'],
                ['Phosphorus', f"{npk.get('phosphorus', 0)}%", 'Normal'],
                ['Potassium', f"{npk.get('potassium', 0)}%", 'Normal']
            ]
            npk_table = Table(npk_data, colWidths=[1.5*inch, 1.5*inch, 2*inch])
            npk_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.blue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            story.append(npk_table)

        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.gray,
            alignment=TA_CENTER
        )
        story.append(Paragraph("© 2026 CropDoc Pro · Advanced Agricultural AI", footer_style))
        story.append(Paragraph("This report is for informational purposes only.", footer_style))

        # Build PDF
        doc.build(story)

        return {
            'id': timestamp,
            'filename': filename,
            'path': filepath,
            'type': report_type,
            'timestamp': datetime.now().isoformat()
        }

    def get_report(self, report_id):
        filename = f"{report_id}.pdf"
        filepath = os.path.join(self.reports_dir, filename)
        if os.path.exists(filepath):
            return filepath
        return None
