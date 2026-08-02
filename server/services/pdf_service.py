import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from utils.helpers import format_currency

def generate_prediction_pdf(history_record, advisor_data, deal_score, explanation, location_score, price_range):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, 750, "Bangalore House Price Predictor - AI Report")
    
    p.setFont("Helvetica", 10)
    p.drawString(50, 730, f"Report ID: #{history_record.id}   |   Date: {history_record.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
    
    p.line(50, 715, 550, 715)
    
    # Section 1: Property Summary
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 680, "1. Property Summary")
    p.setFont("Helvetica", 12)
    p.drawString(60, 660, f"Location: {history_record.location.title()}")
    p.drawString(60, 640, f"Total Area: {history_record.area} sqft")
    p.drawString(60, 620, f"Bedrooms (BHK): {history_record.bhk}")
    p.drawString(60, 600, f"Bathrooms: {history_record.bath}")
    
    # Section 2: Estimated Price & Range
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 560, "2. Estimated Market Value")
    p.setFont("Helvetica-Bold", 16)
    p.drawString(60, 535, f"{format_currency(history_record.predicted_price)}")
    p.setFont("Helvetica", 12)
    p.drawString(60, 515, f"Confidence Interval: {format_currency(price_range[0])} - {format_currency(price_range[1])}")
    
    # Section 3: Deal Quality Score
    p.setFont("Helvetica-Bold", 14)
    p.drawString(300, 680, "3. Deal Quality Score")
    p.setFont("Helvetica", 12)
    p.drawString(310, 660, f"Score: {deal_score.get('score', 0)} / 10.0 ({deal_score.get('verdict', '')})")
    y = 640
    for reason in deal_score.get('reasons', []):
        p.drawString(320, y, f"- {reason}")
        y -= 20

    # Section 4: Location Intelligence
    p.setFont("Helvetica-Bold", 14)
    p.drawString(300, y - 20, "4. Location Intelligence")
    p.setFont("Helvetica", 12)
    p.drawString(310, y - 40, f"Score: {location_score.get('location_score', 0)} / 10.0 ({location_score.get('label', '')})")
    y -= 60
    for ins in location_score.get('insights', []):
        p.drawString(320, y, f"- {ins}")
        y -= 20
        
    # Section 5: AI Explanation
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 470, "5. AI Price Explanation")
    p.setFont("Helvetica", 12)
    y = 450
    for exp in explanation:
        p.drawString(60, y, f"- {exp}")
        y -= 20
        
    # Section 6: Advisor Insights
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y - 20, "6. Smart Advisor Insights")
    p.setFont("Helvetica", 12)
    y -= 40
    for insight in advisor_data.get('insights', []):
        text = f"- {insight['message']}"
        p.drawString(60, y, text[:90])
        y -= 20
        if len(text) > 90:
            p.drawString(70, y, text[90:180])
            y -= 20
            
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer
