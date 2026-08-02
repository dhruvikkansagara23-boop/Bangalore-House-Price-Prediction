from flask import Blueprint, jsonify
from services.analytics_service import get_summary_stats, get_charts_data

analytics_bp = Blueprint('analytics', __name__)

from flask import request

@analytics_bp.route('/analytics/summary', methods=['GET'])
def summary():
    loc = request.args.get('location')
    bhk = request.args.get('bhk')
    min_p = request.args.get('min_price')
    max_p = request.args.get('max_price')
    return jsonify(get_summary_stats(loc, bhk, min_p, max_p))

@analytics_bp.route('/analytics/charts', methods=['GET'])
def charts():
    loc = request.args.get('location')
    bhk = request.args.get('bhk')
    min_p = request.args.get('min_price')
    max_p = request.args.get('max_price')
    return jsonify(get_charts_data(loc, bhk, min_p, max_p))
