from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from database.db import db
from services.prediction_service import load_artifacts

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    db.init_app(app)

    # Load ML artifacts
    load_artifacts(app.config['ARTIFACTS_DIR'])

    # Register Blueprints
    from routes.prediction_routes import prediction_bp
    from routes.analytics_routes import analytics_bp
    from routes.history_routes import history_bp

    app.register_blueprint(prediction_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(history_bp)

    # Frontend routes
    @app.route('/')
    def home():
        return render_template('home.html')
        
    @app.route('/predict')
    def predict():
        return render_template('predict.html')

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html')


    @app.route('/compare')
    def compare():
        return render_template('compare.html')

    @app.route('/about')
    def about():
        return render_template('about.html')

    @app.route('/history')
    def history():
        return render_template('history.html')

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
