
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return render_template('app.html')


@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        "locations": util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    sqft = float(request.form['sqft'])
    location = request.form['location']
    bhk = int(request.form['bhk'])
    bath = int(request.form['bath'])

    estimated_price = util.get_estimated_price(location, sqft, bhk, bath)

    response = jsonify({
        'estimated_price': estimated_price
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response



    # print("Starting Flask Server...")
  



print("Loading saved artifacts...")
util.load_saved_artifacts()

if __name__ == "__main__":
    print("Starting Flask Server...")
    app.run(debug=True)






























# from flask import Flask, request, jsonify
# import util
# from flask_cors import CORS

# print(">>> THIS app.py FILE IS RUNNING <<<")

# app = Flask(__name__)
# CORS(app)

# @app.route('/')
# def home():
#     return "Flask server is running!"
#     return app.send_static_file('app.html')

# @app.route('/get_location_names', methods=['GET'])
# def get_location_names():
#     print("ROUTE HIT")
#     response = jsonify({
#         "locations": util.get_location_names()
#     })
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     return response

# @app.route('/predict_home_price', methods=['POST'])
# def predict_home_price():
#     sqft = float(request.form['sqft'])
#     location = request.form['location']
#     bhk = int(request.form['bhk'])
#     bath = int(request.form['bath'])

#     estimated_price = util.get_estimated_price(location, sqft, bhk, bath)

#     response = jsonify({
#         'estimated_price': estimated_price
#     })
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     return response

# if __name__ == "__main__":
#     print("starting flask server")
#     util.load_saved_artifacts()
#     app.run()
