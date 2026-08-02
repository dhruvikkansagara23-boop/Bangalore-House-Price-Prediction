from services.prediction_service import get_model_details

def explain_prediction(sqft, bhk, bath, location):
    model, data_columns = get_model_details()
    if not model or not data_columns:
        return {"explanation": ["Model not loaded correctly."]}
    
    # Calculate feature importances based on input * coef
    coef = model.coef_
    
    # Indices based on training data:
    # 0: total_sqft, 1: bath, 2: bhk, 3+: locations
    sqft_impact = sqft * coef[0]
    bath_impact = bath * coef[1]
    bhk_impact = bhk * coef[2]
    
    try:
        loc_index = data_columns.index(location.lower())
        loc_impact = coef[loc_index]
    except ValueError:
        loc_impact = 0
        
    impacts = {
        "Property Size (Area)": sqft_impact,
        "Bathrooms": bath_impact,
        "Bedrooms (BHK)": bhk_impact,
        f"Location ({location.title()})": loc_impact
    }
    
    sorted_impacts = sorted(impacts.items(), key=lambda item: abs(item[1]), reverse=True)
    
    explanation = []
    for feature, impact in sorted_impacts[:3]:
        if impact > 0:
            explanation.append(f"{feature} positively increased the valuation")
        else:
            explanation.append(f"{feature} slightly reduced the valuation")
            
    return {"explanation": explanation}
