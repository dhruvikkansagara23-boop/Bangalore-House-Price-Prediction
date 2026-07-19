# 🏠 Bangalore House Price Prediction using Machine Learning

A Machine Learning web application that predicts **Bangalore house prices** based on property features such as **Area, BHK, Bathrooms, and Location**.

The application is built with **Python, Flask, Scikit-learn, HTML, CSS, and vanilla JavaScript**, and is deployed on **Render**.

---

# 🌐 Live Demo

🔗 **Live Website**

https://bangalore-house-price-prediction-2xdu.onrender.com/

> Hosted on Render's free tier — the first request after a period of inactivity may take ~30 seconds while the server wakes up.

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
- 📍 Dynamic Location Dropdown (240+ locations), with a clear loading state while it fetches
- ⚡ Flask REST API Backend, called via native `fetch()` (no external JS library dependency)

## Smart Validation
- 📐 Area Validation (300 – 10,000 sqft)
- 🛏 BHK Selection (1–7), checked against area using an area-per-bedroom ratio rather than a rigid lookup table
- 🛁 Bathroom Selection (1–7), validated against BHK (Bathrooms ≥ BHK − 1 and ≤ BHK + 2)
- 🚫 Invalid bathroom options disabled automatically based on selected BHK
- 🔄 Live re-validation — errors appear/clear instantly as you change any field, not just on submit
- ⚠ Inline warnings for unusually large properties (luxury-area threshold)
- 💡 Non-blocking suggestions when a spacious area could support more bedrooms
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
- Vanilla JavaScript (`fetch` API — no jQuery or other external JS runtime dependency)

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

All validation happens client-side, live, as you interact with the form — no need to click "Estimate Price" to see errors appear or clear.

## 🚫 Hard Blocks
*(Prediction is prevented until fixed)*

| # | Rule | Condition | Message |
|---|---|---|---|
| 1 | Area required | Empty or non-numeric area field | ⚠ Please enter the property area. |
| 2 | Area too small | Area < 300 sqft | ❌ Area cannot be less than 300 sqft. |
| 3 | Area too large | Area > 10,000 sqft | ❌ Area exceeds the supported limit. Please enter a value between 300 and 10,000 sqft. |
| 4 | Too many bedrooms for area | BHK exceeds `floor(area ÷ 220)` (capped at 7) | ❌ [area] sqft is too small for [BHK] BHK. Either choose fewer BHK, or increase the area to at least [BHK × 220] sqft. |
| 5 | Too many bathrooms | Bathrooms > BHK + 2 | ❌ [BHK] BHK cannot have [bath] bathrooms. Maximum allowed is [BHK+2]. |
| 6 | Too few bathrooms | Bathrooms < BHK − 1 | ❌ Too few bathrooms for a [BHK] BHK. Minimum recommended is [BHK−1]. |
| 7 | No location selected | Location dropdown left empty | ⚠ Please select a location before predicting. |

## ⚠ Warnings
*(Shown for awareness — does not block prediction)*

| # | Rule | Condition | Message |
|---|---|---|---|
| 8 | Large property | Area > 3,000 sqft | ⚠ Large property detected. Prediction accuracy may be slightly lower for very large homes. |

## 💡 Soft Suggestions
*(Informational only — never blocks prediction)*

| # | Rule | Condition | Message |
|---|---|---|---|
| 9 | Bedroom count looks low for the space | Area ÷ BHK > 1,400 sqft/bedroom (and BHK < 7) | 💡 This area could comfortably support more bedrooms — consider [BHK+1]+ BHK if that suits your needs. |

## 🔄 Automatic UI Behavior
*(Not validation errors — just interface logic)*

| # | Behavior | Trigger |
|---|---|---|
| 10 | Bathroom options auto-disable | Any bathroom radio outside `[BHK−1, BHK+2]` is disabled and unclickable |
| 11 | Bathroom auto-reset to a valid value | If the currently selected bathroom count falls outside the new valid range after a BHK change, it resets to `clamp(BHK, minBath, maxBath)` — always a valid option, never a hardcoded fallback |
| 12 | Live re-validation on every change | Editing area, BHK, bathrooms, or location instantly re-runs the relevant checks |

## Bathrooms vs BHK — Quick Reference

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

## 📊 Post-Prediction Insights
*(Generated after a successful prediction — not validation)*

- Price formatted as **Lakhs** (< ₹100L) or **Crore** (≥ ₹100L) automatically
- Price range shown as **±7%** of the point estimate
- Category badge: **Budget** (<30L) / **Mid-Range** (30–70L) / **Premium** (70–150L) / **Luxury** (150L+), with a matching star rating
- **Confidence score** (70–97%) based on how close the BHK is to the ideal bedroom count for that area, bathroom balance, and a luxury-area penalty
- **Smart Advisor** tips generated dynamically from area, BHK, bathrooms, and predicted price

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

# 🩹 Recent Fixes & Changelog

- Removed the jQuery CDN dependency (was causing `$ is not defined` failures when the CDN was blocked); replaced all AJAX calls with native `fetch()`
- Replaced the rigid BHK-vs-area lookup table with a proportional area-per-bedroom check, fixing false-positive blocks on realistic combinations (e.g. 2600 sqft / 3 BHK, 2000 sqft / 2 BHK)
- Fixed the bathroom selector auto-resetting to an invalid value ("1") after a BHK change, which caused an immediate false validation error
- Added a `change` listener on bathroom radios so validation messages clear live, not only on submit
- Added a clear "Loading locations..." state (with the Estimate button disabled) to prevent submitting before the location list has finished loading, especially relevant on Render's free tier cold starts

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