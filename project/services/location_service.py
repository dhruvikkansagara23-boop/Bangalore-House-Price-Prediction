import pandas as pd
from services.analytics_service import load_dataset

def get_location_score(location):
    df = load_dataset()
    loc_df = df[df['location'].str.lower() == location.lower()]
    
    if loc_df.empty:
        return {
            "location_score": 5.0,
            "label": "Unknown Area",
            "insights": ["Insufficient historical data"]
        }
        
    total_props = len(df)
    loc_props = len(loc_df)
    
    score = 5.0
    insights = []
    
    # Demand assessment
    if loc_props > 100:
        score += 2.5
        insights.append("High demand area with abundant listings")
    elif loc_props > 30:
        score += 1.0
        insights.append("Moderate demand area")
    else:
        score -= 1.0
        insights.append("Low inventory/exclusive area")
        
    # Pricing tier assessment
    avg_price = loc_df['price'].mean()
    if avg_price > 150:
        score += 2.0
        insights.append("Premium pricing zone")
        label = "Premium Area"
    elif avg_price < 50:
        score += 0.5
        insights.append("Budget-friendly zone")
        label = "Budget Area"
    else:
        score += 1.5
        insights.append("Balanced market zone")
        label = "Standard Area"
        
    score = min(max(round(score, 1), 0.0), 10.0)
    
    return {
        "location_score": score,
        "label": label,
        "insights": insights
    }
