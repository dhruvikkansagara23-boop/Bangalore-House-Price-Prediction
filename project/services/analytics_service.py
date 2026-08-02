import os
import pandas as pd
import numpy as np

_dataset = None

def load_dataset():
    global _dataset
    if _dataset is None:
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'Bengaluru_House_Data.csv')
        if os.path.exists(csv_path):
            _dataset = pd.read_csv(csv_path)
            # Create bhk column from size
            if 'size' in _dataset.columns:
                _dataset['bhk'] = _dataset['size'].apply(lambda x: int(x.split(' ')[0]) if isinstance(x, str) else np.nan)
        else:
            _dataset = pd.DataFrame()
    return _dataset

def filter_dataframe(df, loc=None, bhk=None, min_p=None, max_p=None):
    if df.empty: return df
    if loc and loc != "":
        df = df[df['location'].str.lower() == loc.lower()]
    if bhk and bhk != "":
        b_val = float(bhk)
        if b_val == 4.0:
            df = df[df['bhk'] >= 4.0] # 4 means 4+ BHK
        else:
            df = df[df['bhk'] == b_val]
    if min_p and min_p != "":
        p_val = float(min_p)
        if p_val > 10000: p_val = p_val / 100000.0 # Auto-convert raw rupees to Lakhs
        df = df[df['price'] >= p_val]
    if max_p and max_p != "":
        p_val = float(max_p)
        if p_val > 10000: p_val = p_val / 100000.0 # Auto-convert raw rupees to Lakhs
        df = df[df['price'] <= p_val]
    return df

def get_summary_stats(loc=None, bhk=None, min_p=None, max_p=None):
    df = load_dataset()
    if df.empty:
        return {"avg_price": 0, "median_price": 0, "expensive_loc": "N/A", "cheap_loc": "N/A"}
    
    if 'price' in df.columns and 'location' in df.columns:
        valid_df = df.dropna(subset=['price', 'location', 'bhk'])
        valid_df = filter_dataframe(valid_df, loc, bhk, min_p, max_p)
        
        if valid_df.empty:
            return {"avg_price": 0, "median_price": 0, "expensive_loc": "N/A", "cheap_loc": "N/A"}
            
        avg_price = float(valid_df['price'].mean())
        median_price = float(valid_df['price'].median())
        
        loc_group = valid_df.groupby('location')['price'].mean()
        expensive_loc = str(loc_group.idxmax()) if not loc_group.empty else "N/A"
        cheap_loc = str(loc_group.idxmin()) if not loc_group.empty else "N/A"
        
        return {
            "avg_price": float(round(avg_price, 2)) if not np.isnan(avg_price) else 0,
            "median_price": float(round(median_price, 2)) if not np.isnan(median_price) else 0,
            "expensive_loc": expensive_loc,
            "cheap_loc": cheap_loc
        }
    return {"avg_price": 0, "median_price": 0, "expensive_loc": "N/A", "cheap_loc": "N/A"}

def get_charts_data(loc=None, bhk=None, min_p=None, max_p=None):
    df = load_dataset()
    if df.empty or 'price' not in df.columns:
        return {"scatter": [], "bhk_dist": {"labels": [], "values": []}, "price_trends": {"labels": [], "values": []}, "price_per_sqft": {"labels": [], "values": []}}

    valid_df = df.dropna(subset=['price', 'total_sqft', 'bhk', 'location'])
    valid_df = filter_dataframe(valid_df, loc, bhk, min_p, max_p)
    
    if valid_df.empty:
        return {"scatter": [], "bhk_dist": {"labels": [], "values": []}, "price_trends": {"labels": [], "values": []}, "price_per_sqft": {"labels": [], "values": []}}
    
    valid_df['total_sqft_num'] = pd.to_numeric(valid_df['total_sqft'], errors='coerce')
    valid_df = valid_df.dropna(subset=['total_sqft_num'])
    
    # Add price per sqft column for our bar chart
    valid_df['price_per_sqft'] = (valid_df['price'] * 100000) / valid_df['total_sqft_num']
    
    scatter_df = valid_df.sample(min(500, len(valid_df)))
    scatter = [{"x": float(row['total_sqft_num']), "y": float(row['price'])} for _, row in scatter_df.iterrows()]
    
    bhk_dist_series = valid_df['bhk'].value_counts().sort_index().head(10)
    bhk_dist = {
        "labels": bhk_dist_series.index.astype(str).tolist(),
        "values": [int(v) for v in bhk_dist_series.values]
    }
    
    top_locs = valid_df['location'].value_counts().head(10).index
    loc_prices = valid_df[valid_df['location'].isin(top_locs)].groupby('location')['price'].mean().fillna(0)
    price_trends = {
        "labels": loc_prices.index.tolist(),
        "values": [float(v) if not np.isnan(v) else 0 for v in round(loc_prices, 2).tolist()]
    }
    
    # Price per sqft by location
    loc_sqft_prices = valid_df[valid_df['location'].isin(top_locs)].groupby('location')['price_per_sqft'].mean().fillna(0)
    price_per_sqft_chart = {
        "labels": loc_sqft_prices.index.tolist(),
        "values": [float(v) if not np.isnan(v) else 0 for v in round(loc_sqft_prices, 2).tolist()]
    }

    # Price Tiers (Pie Chart)
    budget = int((valid_df['price'] < 50).sum())
    mid = int(((valid_df['price'] >= 50) & (valid_df['price'] < 150)).sum())
    prime = int(((valid_df['price'] >= 150) & (valid_df['price'] < 300)).sum())
    luxury = int((valid_df['price'] >= 300).sum())
    
    price_tiers = {
        "labels": ["Budget (<50L)", "Mid-Range (50-150L)", "Prime (150-300L)", "Luxury (>300L)"],
        "values": [budget, mid, prime, luxury]
    }

    return {
        "scatter": scatter,
        "bhk_dist": bhk_dist,
        "price_trends": price_trends,
        "price_per_sqft": price_per_sqft_chart,
        "price_tiers": price_tiers
    }
