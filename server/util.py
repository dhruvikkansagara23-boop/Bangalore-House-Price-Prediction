
import os
import json
import pickle
import numpy as np
import pandas as pd

__location = None
__data_columns = None
__model = None

# Absolute path to the server folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")


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

    # Create DataFrame using model feature names
    x_df = pd.DataFrame([x], columns=__model.feature_names_in_)

    return round(__model.predict(x_df)[0], 2)


def get_location_names():
    return __location


def load_saved_artifacts():
    print("Loading saved artifacts...")

    global __location
    global __data_columns
    global __model

    columns_path = os.path.join(ARTIFACTS_DIR, "columns.json")
    model_path = os.path.join(ARTIFACTS_DIR, "banglore_home_prices_model.pickle")

    print("Columns Path:", columns_path)
    print("Model Path:", model_path)

    with open(columns_path, "r") as f:
        __data_columns = json.load(f)["data_columns"]
        __location = __data_columns[3:]

    print("Total Locations:", len(__location))
    print("First Location:", __location[0])

    with open(model_path, "rb") as f:
        __model = pickle.load(f)

    print("Artifacts loaded successfully!")


if __name__ == "__main__":
    load_saved_artifacts()

    print(get_location_names())
    print(get_estimated_price("1st block jp nagar", 1000, 3, 3))
    print(get_estimated_price("1st phase jp nagar", 1000, 2, 2))
    print(get_estimated_price("kalhalli", 1000, 2, 2))
    print(get_estimated_price("ejipura", 1000, 2, 2))
























# import  json
# import pickle
# import numpy as np
# import pandas as pd

# __location = None
# __data_columns = None
# __model = None


# def get_estimated_price(location, sqft, bhk, bath):
#     try:
#         loc_index = __data_columns.index(location.lower())
#     except:
#         loc_index = -1

#     x = np.zeros(len(__data_columns))
#     x[0] = sqft
#     x[1] = bath
#     x[2] = bhk

#     if loc_index >= 0:
#         x[loc_index] = 1

#     # 🔥 Use model's trained feature names
#     x_df = pd.DataFrame([x], columns=__model.feature_names_in_)
#     return round(__model.predict(x_df)[0], 2)


# def get_location_names():
#     return __location

# def load_saved_artifacts():
#     print("Loading saved artifacts..start")
#     global __location
#     global __data_columns
#     global __model

#     with open("./artifacts/columns.json", "r") as f:
#        __data_columns =  json.load(f)['data_columns']
#        __location = __data_columns[3:]

#     with open("./artifacts/banglore_home_prices_model.pickle", "rb") as f:
#         __model = pickle.load(f)
#     print("Loading saved artifacts..end")

# if __name__ == '__main__':
#     load_saved_artifacts()
#     print(get_location_names())
#     print(get_estimated_price("1st block JP Nagar",1000,3,3))
#     print(get_estimated_price("1st phase JP Nagar",1000,2,2))
#     print(get_estimated_price("Kalhalli",1000,2,2))
#     print(get_estimated_price("Ejipura",1000,2,2))