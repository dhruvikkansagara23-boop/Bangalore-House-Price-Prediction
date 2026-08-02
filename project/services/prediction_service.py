import os
import json
import pickle
import numpy as np
import pandas as pd

__location = None
__data_columns = None
__model = None

def load_artifacts(artifacts_dir):
    global __location
    global __data_columns
    global __model

    columns_path = os.path.join(artifacts_dir, "columns.json")
    model_path = os.path.join(artifacts_dir, "banglore_home_prices_model.pickle")

    with open(columns_path, "r") as f:
        __data_columns = json.load(f)["data_columns"]
        __location = __data_columns[3:]

    with open(model_path, "rb") as f:
        __model = pickle.load(f)

def get_location_names():
    return __location

def get_estimated_price(location, sqft, bhk, bath):
    try:
        loc_index = __data_columns.index(location.lower())
    except ValueError:
        loc_index = -1

    x = np.zeros(len(__data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk

    if loc_index >= 0:
        x[loc_index] = 1

    x_df = pd.DataFrame([x], columns=__model.feature_names_in_)

    return round(__model.predict(x_df)[0], 2)

def get_model_details():
    return __model, __data_columns

def get_price_range(predicted_price):
    lower = round(predicted_price * 0.9, 2)
    upper = round(predicted_price * 1.1, 2)
    return [lower, upper]
