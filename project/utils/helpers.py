def format_currency(value):
    """Format float to Indian Rupee representation (e.g., Lakhs/Crores)"""
    if value >= 100:
        return f"₹ {value/100:.2f} Cr"
    return f"₹ {value:.2f} Lakh"
