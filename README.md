# 🏠 Bangalore House Price Prediction using Machine Learning

A Machine Learning web application that predicts **Bangalore house prices** based on property features such as **Area, BHK, Bathrooms, and Location**.

The application is built with **Python, Flask, Scikit-learn, HTML, CSS, JavaScript, and jQuery**, and is deployed on **Render**.

---

# 🌐 Live Demo

🔗 **Live Website**

https://bangalore-house-price-prediction-2xdu.onrender.com/

---

# 📸 Application Preview

Create an **assets** folder and add your screenshots.

```
assets/
│
├── home.png
├── prediction.png
```

Then display them:

```markdown
![Home](assets/home.png)

![Prediction](assets/prediction.png)
```

---

# 📖 Project Overview

The Bangalore House Price Prediction System is a regression-based Machine Learning application that estimates residential property prices using a trained Linear Regression model.

Users can enter:

- 📐 Area (Square Feet)
- 🛏 Number of Bedrooms (BHK)
- 🛁 Number of Bathrooms
- 📍 Location

The trained model predicts the estimated property price instantly through a Flask REST API, along with a price range, confidence score, category, and personalized insights.

---

# ✨ Features

## Core Prediction
- 🏠 Predict Bangalore house prices instantly
- 📍 Dynamic Location Dropdown (240+ locations)
- ⚡ Flask REST API Backend

## Smart Validation
- 📐 Area Validation (300 – 10,000 sqft)
- 🛏 BHK Selection (1–7) with realistic BHK-to-area range checking
- 🛁 Bathroom Selection (1–7), validated against BHK (Bathrooms ≥ BHK − 1 and ≤ BHK + 2)
- 🚫 Invalid bathroom options disabled automatically based on selected BHK
- ⚠ Inline warnings for unusually large properties (luxury-area threshold)
- ❌ Clear, inline error messages instead of browser alerts

## Prediction Insights
- 💰 Estimated price displayed in Lakhs or Crore automatically
- 📊 Possible price range (±7% of estimate)
- 🏷 Price category badge (Budget / Mid-Range / Premium / Luxury) with star rating
- 📈 Prediction confidence meter
- 📶 Mini bar-charts for area, bedrooms, and bathrooms
- 🤖 Smart Advisor — contextual tips generated from the entered property configuration
- 📋 Property Summary card shown alongside the prediction

## UI / UX
- 🎨 Modern, card-based UI with a hero section
- 🌗 Light / Dark mode toggle (persisted across visits)
- 📱 Fully responsive design (desktop, tablet, mobile)
- ⏳ Loading state with spinner while a prediction is in progress
- ✅ Animated result reveal with success confirmation

## Deployment
- ☁️ Deployed on Render with auto-deploy on push to `main`

---

# 🛠 Technologies Used

## Programming Language

- Python

## Frontend

- HTML5
- CSS3
- JavaScript
- jQuery

## Backend

- Flask
- Flask-CORS
- Gunicorn

## Machine Learning

- NumPy
- Pandas
- Scikit-learn
- Joblib

## Deployment

- Render

## Version Control

- Git
- GitHub

---

# 🧠 Machine Learning Workflow

```
Dataset
    │
    ▼
Data Cleaning
    │
    ▼
Feature Engineering
    │
    ▼
Outlier Removal
    │
    ▼
One Hot Encoding
    │
    ▼
Train Test Split
    │
    ▼
Linear Regression
    │
    ▼
Model Evaluation
    │
    ▼
Model Serialization
    │
    ▼
Flask API
    │
    ▼
Web Application
```

---

# 📊 Dataset Information

| Property | Details |
|----------|----------|
| Dataset | Bengaluru House Data |
| Source | Kaggle |
| Rows | 13,320 |
| Columns | 9 |
| ML Problem | Regression |

---

# 🏗 Project Architecture

```
                User
                  │
                  ▼
          HTML / CSS / JavaScript
                  │
                  ▼
             Flask Backend
                  │
        --------------------
        │                  │
        ▼                  ▼
   util.py           Trained Model
        │                  │
        └──────────┬───────┘
                   ▼
        Price Prediction
                   │
                   ▼
              JSON Response
                   │
                   ▼
        Client-side Insights
   (range, confidence, category,
        advisor, charts)
                   │
                   ▼
            Display Result
```

---

# 📂 Project Structure

```
Banglore_house_price_prediction/

│
├── client/
│
├── jnotebook/
│   ├── BHP.ipynb
│   ├── banglore_home_prices_model.pickle
│   └── columns.json
│
├── server/
│   │
│   ├── artifacts/
│   │   ├── banglore_home_prices_model.pickle
│   │   └── columns.json
│   │
│   ├── static/
│   │   ├── app.css
│   │   └── app.js
│   │
│   ├── templates/
│   │   └── app.html
│   │
│   ├── app.py
│   ├── util.py
│   └── wsgi.py
│
├── Bengaluru_House_Data.csv
├── requirements.txt
├── README.md
├── LICENSE
└── .gitignore
```

---

# ⚙️ Installation Guide

## 1 Clone Repository

```bash
git clone https://github.com/dhruvikkansagara23-boop/Bangalore-House-Price-Prediction.git
```

---

## 2 Move into Project

```bash
cd Banglore_house_price_prediction
```

---

## 3 Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4 Start Flask Server

```bash
cd server
python app.py
```

---

## 5 Open Browser

```
http://127.0.0.1:5000
```

---

# 🚀 API Endpoints

## Get Locations

```
GET /get_location_names
```

Response

```json
{
  "locations": [
    "whitefield",
    "electronic city",
    "indira nagar"
  ]
}
```

---

## Predict Price

```
POST /predict_home_price
```

Parameters

```
sqft
bhk
bath
location
```

Response

```json
{
   "estimated_price": 83.52
}
```

---

# 📌 Validation Rules

## Area
- Minimum: 300 sqft
- Maximum: 10,000 sqft
- Above 3,000 sqft: shown as a luxury-property warning (accuracy may be lower)

## BHK vs Area

| Area Range (sqft) | Realistic BHK |
|---|---|
| ≤ 600 | 1–2 |
| 601–900 | 1–3 |
| 901–1300 | 2–4 |
| 1301–1800 | 3–5 |
| 1801–2500 | 4–6 |
| 2501+ | 5–7 |

## Bathrooms vs BHK

✔ Bathrooms must be between **BHK − 1** and **BHK + 2**

| BHK | Minimum Bathrooms | Maximum Bathrooms |
|------|-------------------|-------------------|
| 1 | 1 | 3 |
| 2 | 1 | 4 |
| 3 | 2 | 5 |
| 4 | 3 | 6 |
| 5 | 4 | 7 |
| 6 | 5 | 7 |
| 7 | 6 | 7 |

Invalid bathroom options are automatically disabled based on the selected BHK.

---

# ☁️ Deployment

The application is deployed on **Render** using:

- Gunicorn
- Flask
- Python
- GitHub Integration (auto-deploy on push to `main`)

Live URL

https://bangalore-house-price-prediction-2xdu.onrender.com/

---

# 📈 Future Enhancements

- XGBoost Model
- Random Forest Comparison
- House Image Upload
- Interactive Price Visualization (advanced charts)
- Google Maps Integration
- Nearby Schools & Hospitals
- User Authentication
- Save Prediction History
- Downloadable / Shareable Prediction Report
- Mobile App Version

---

# 📦 Requirements

Install all required packages:

```bash
pip install -r requirements.txt
```

---

# 👨‍💻 Author

**Dhruvik Kansagra**

MCA Student | Data Science & Machine Learning Enthusiast

GitHub:

https://github.com/dhruvikkansagara23-boop

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.