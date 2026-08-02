def get_advisor_insights(sqft, location, bhk, bath, price):
    """Generates smart insights based on inputs and price prediction."""
    insights = []
    
    price_per_sqft = (price * 100000) / sqft
    
    insights.append({
        "type": "info",
        "message": f"Estimated price per sqft is roughly ₹{round(price_per_sqft)}."
    })

    # Basic logic for BHK suggestion
    ideal_bhk = max(1, round(sqft / 600))
    if bhk > ideal_bhk:
        insights.append({
            "type": "warning",
            "message": f"A {bhk} BHK in {sqft} sqft might feel cramped. Consider a {ideal_bhk} BHK for better spaciousness."
        })
    elif bhk < ideal_bhk:
        insights.append({
            "type": "success",
            "message": f"Excellent! A {bhk} BHK in {sqft} sqft offers very spacious rooms."
        })
        
    # Bathroom logic
    if bath > bhk + 1:
        insights.append({
            "type": "warning",
            "message": f"Having {bath} bathrooms for {bhk} bedrooms is unusual and might reduce living space."
        })
        
    # Investment score
    investment_score = 75
    if price_per_sqft < 6000:
        investment_score += 15
        insights.append({
            "type": "success",
            "message": "Strong investment potential. The price per sqft is below average for premium areas."
        })
    elif price_per_sqft > 12000:
        investment_score -= 10
        insights.append({
            "type": "warning",
            "message": "Premium pricing. Ensure the property offers top-tier amenities."
        })

    return {
        "score": investment_score,
        "insights": insights
    }
