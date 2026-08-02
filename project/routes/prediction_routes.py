from flask import Blueprint, request, jsonify
from services.prediction_service import get_estimated_price, get_location_names, get_price_range
from services.advisor_service import get_advisor_insights
from services.deal_score_service import get_deal_score
from services.explainability_service import explain_prediction
from services.location_service import get_location_score
from database.db import db
from database.models import PredictionHistory

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/get_location_names', methods=['GET'])
def locations():
    return jsonify({"locations": get_location_names()})

@prediction_bp.route('/predict_home_price', methods=['POST'])
def predict():
    sqft = float(request.form.get('sqft'))
    location = request.form.get('location')
    bhk = int(request.form.get('bhk'))
    bath = int(request.form.get('bath'))

    estimated_price = get_estimated_price(location, sqft, bhk, bath)
    insights = get_advisor_insights(sqft, location, bhk, bath, estimated_price)
    
    price_range = get_price_range(estimated_price)
    deal_score = get_deal_score(sqft, bhk, location, estimated_price)
    explanation = explain_prediction(sqft, bhk, bath, location)
    location_score = get_location_score(location)

    # Save to history
    history = PredictionHistory(
        area=sqft,
        location=location,
        bhk=bhk,
        bath=bath,
        predicted_price=estimated_price
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({
        'price': estimated_price,
        'range': price_range,
        'deal_score': deal_score,
        'explanation': explanation['explanation'],
        'location_score': location_score,
        'advice': insights,
        'history_id': history.id,
        # backward compatibility:
        'estimated_price': estimated_price,
        'advisor_insights': insights
    })
