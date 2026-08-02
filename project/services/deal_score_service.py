import pandas as pd
from services.analytics_service import load_dataset

def get_deal_score(area, bhk, location, predicted_price_lakhs):
    price_per_sqft = (predicted_price_lakhs * 100000) / area
    df = load_dataset()
    loc_df = df[df['location'].str.lower() == location.lower()].copy()
    
    if not loc_df.empty:
        # Convert total_sqft to numeric and compute average price per sqft for location
        loc_df['sqft_num'] = pd.to_numeric(loc_df['total_sqft'], errors='coerce')
        valid_df = loc_df.dropna(subset=['sqft_num']).copy()
        if not valid_df.empty:
            avg_price_per_sqft = ((valid_df['price'] * 100000) / valid_df['sqft_num']).mean()
        else:
            avg_price_per_sqft = price_per_sqft
    else:
        avg_price_per_sqft = price_per_sqft

    reasons = []
    score = 7.0 # Base score

    # Pricing value
    if price_per_sqft < avg_price_per_sqft * 0.95:
        score += 1.5
        reasons.append("Under market average per sqft")
    elif price_per_sqft > avg_price_per_sqft * 1.05:
        score -= 1.0
        reasons.append("Above market average per sqft")
    else:
        reasons.append("Good location value")
        
    # Space utilization
    bhk_ratio = area / bhk
    if bhk_ratio > 600:
        score += 1.0
        reasons.append("Spacious layout")
    elif bhk_ratio < 400:
        score -= 1.5
        reasons.append("Compact layout")
    else:
        reasons.append("Efficient space usage")
        
    score = min(max(round(score, 1), 0.0), 10.0)
    
    if score >= 8.0:
        verdict = "Excellent Deal"
    elif score >= 6.0:
        verdict = "Good Deal"
    elif score >= 4.0:
        verdict = "Fair Deal"
    else:
        verdict = "Poor Deal"
        
    return {
        "score": score,
        "verdict": verdict,
        "reasons": reasons
    }
