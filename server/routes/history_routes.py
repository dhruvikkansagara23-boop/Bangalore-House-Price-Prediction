from flask import Blueprint, jsonify, send_file
from database.db import db
from database.models import PredictionHistory
from services.pdf_service import generate_prediction_pdf
from services.advisor_service import get_advisor_insights
from services.deal_score_service import get_deal_score
from services.explainability_service import explain_prediction
from services.location_service import get_location_score
from services.prediction_service import get_price_range

history_bp = Blueprint('history', __name__)

@history_bp.route('/api/history', methods=['GET'])
def get_history():
    records = PredictionHistory.query.order_by(PredictionHistory.timestamp.desc()).all()
    return jsonify([record.to_dict() for record in records])

@history_bp.route('/history/<int:id>', methods=['DELETE'])
def delete_history(id):
    record = PredictionHistory.query.get_or_404(id)
    db.session.delete(record)
    db.session.commit()
    return jsonify({"success": True})

@history_bp.route('/download-report', methods=['GET'])
def download_report():
    from flask import request
    history_id = request.args.get('id')
    if not history_id:
        return "ID is required", 400
        
    record = PredictionHistory.query.get_or_404(history_id)
    advisor_data = get_advisor_insights(record.area, record.location, record.bhk, record.bath, record.predicted_price)
    deal_score = get_deal_score(record.area, record.bhk, record.location, record.predicted_price)
    explanation = explain_prediction(record.area, record.bhk, record.bath, record.location)['explanation']
    location_score = get_location_score(record.location)
    price_range = get_price_range(record.predicted_price)
    
    pdf_buffer = generate_prediction_pdf(record, advisor_data, deal_score, explanation, location_score, price_range)
    
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"report_{history_id}.pdf",
        mimetype='application/pdf'
    )

@history_bp.route('/export/csv', methods=['GET'])
def export_csv():
    import csv
    import io
    from flask import Response
    
    records = PredictionHistory.query.order_by(PredictionHistory.timestamp.desc()).all()
    
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['ID', 'Location', 'Area (sqft)', 'BHK', 'Bathrooms', 'Predicted Price (Lakhs)', 'Timestamp'])
    
    for r in records:
        cw.writerow([r.id, r.location, r.area, r.bhk, r.bath, r.predicted_price, r.timestamp])
        
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=prediction_history.csv"}
    )
