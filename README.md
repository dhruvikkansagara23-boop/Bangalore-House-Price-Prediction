# 🏠 Bangalore House Price Prediction using Machine Learning

A Machine Learning web application that predicts house prices in Bangalore based on **Area (Square Feet), Location, Number of Bedrooms (BHK), and Bathrooms**.

The application uses a trained **Linear Regression** model and is deployed with a **Flask** backend and an interactive HTML/CSS/JavaScript frontend.

---

## 📸 Project Screenshot

> Save your screenshot inside an `assets` folder and rename it to `home.png`.

```text
assets/
    home.png
```

Then display it in GitHub using:

```markdown
![Home Page](assets/home.png)
```

---

## 📖 Project Overview

The Bangalore House Price Prediction System is a Machine Learning-based web application that estimates the price of residential properties in Bangalore.

Users simply enter:

- 📐 Area (Square Feet)
- 🛏 Number of Bedrooms (BHK)
- 🛁 Number of Bathrooms
- 📍 Location

The trained Linear Regression model predicts the estimated house price instantly.

---

## ✨ Features

- 🏠 Predict Bangalore house prices
- 📍 Dynamic Location Dropdown
- 📐 Area Input
- 🛏 BHK Selection (1–7)
- 🛁 Bathroom Selection (1–7)
- ✅ Bathroom validation (Maximum = BHK + 2)
- 🚫 Disabled invalid bathroom options
- ⚡ Real-time Prediction
- 🌐 Flask REST API Backend
- 📱 Responsive User Interface
- 🎨 Modern Glassmorphism Design

---

## 🧠 Machine Learning Workflow

```text
Dataset Collection
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
One-Hot Encoding
        │
        ▼
Train-Test Split
        │
        ▼
Linear Regression Model
        │
        ▼
Model Evaluation
        │
        ▼
Flask Deployment
        │
        ▼
Web Application
```

---

## 📊 Dataset Information

| Property | Details |
|----------|---------|
| Dataset | Bengaluru House Data |
| Source | Kaggle |
| Rows | 13,320 |
| Columns | 9 |
| File | Bengaluru_House_Data.csv |

---

## 🛠 Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- jQuery

### Backend

- Flask
- Flask-CORS

### Machine Learning

- Python
- NumPy
- Pandas
- Scikit-learn
- Joblib

---

## 📂 Project Structure

```text
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
│   └── util.py
│
├── Bengaluru_House_Data.csv
├── requirements.txt
├── README.md
├── LICENSE
└── .gitignore
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/Bangalore-House-Price-Prediction.git
```

---

### Move into the project

```bash
cd Banglore_house_price_prediction
```

---

### Install dependencies

```bash
pip install -r requirements.txt
```

---

### Start Flask Server

```bash
cd server
python app.py
```

---

### Open in Browser

```
http://127.0.0.1:5000
```

---

![Home Page](assets/home.png)

## 🚀 How to Use

1. Enter Area (Square Feet)
2. Select Number of Bedrooms (BHK)
3. Select Number of Bathrooms
4. Select Location
5. Click **Estimate Price**
6. View Predicted House Price

---

## 📌 Validation Rules

✔ Bathrooms cannot exceed **BHK + 2**

Example:

| BHK | Maximum Bathrooms |
|-----|-------------------|
| 1 | 3 |
| 2 | 4 |
| 3 | 5 |
| 4 | 6 |
| 5 | 7 |
| 6 | 7 |
| 7 | 7 |

Invalid selections are automatically disabled.

---

## 📈 Future Enhancements

- Deep Learning Model
- Random Forest & XGBoost Comparison
- House Image Upload
- Interactive Price Charts
- Nearby Schools & Hospitals
- Google Maps Integration
- Dark Mode
- User Login System
- Property Recommendation System

---

## 📜 Requirements

Install all required packages using:

```bash
pip install -r requirements.txt
```

---

## 👨‍💻 Author

**Dhruvik Kansagra**

---



## ⭐ If you like this project

Give this repository a ⭐ on GitHub.