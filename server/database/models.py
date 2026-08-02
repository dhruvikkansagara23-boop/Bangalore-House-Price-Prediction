from database.db import db
from datetime import datetime, timezone

class PredictionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    area = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    bhk = db.Column(db.Integer, nullable=False)
    bath = db.Column(db.Integer, nullable=False)
    predicted_price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'area': self.area,
            'location': self.location,
            'bhk': self.bhk,
            'bath': self.bath,
            'predicted_price': self.predicted_price,
            'timestamp': self.timestamp.isoformat()
        }
