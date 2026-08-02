from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)


# ── Page routes ──────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('home.html')


@app.route('/predict')
def predict():
    return render_template('predict.html')


@app.route('/compare')
def compare():
    return render_template('compare.html')


@app.route('/about')
def about():
    return render_template('about.html')


# ── API routes (kept exactly as-is: same paths, same request/ ─
#    response shape) ────────────────────────────────────────
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


print("Loading saved artifacts...")
util.load_saved_artifacts()

if __name__ == "__main__":
    print("Starting Flask Server...")
    app.run(debug=True)
