# 🎓 Academic Early Warning System (SAT)
## Sistema de Alerta Temprana Académica

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.0+-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**A Machine Learning-based academic risk prediction system to identify students at risk of dropout or low academic performance.**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Description

The **Academic Early Warning System (SAT)** is a full-stack application developed as a thesis project that uses Machine Learning techniques to predict academic risk for students. The system analyzes socioeconomic data, academic history, and educational barriers to generate a personalized risk score and intervention recommendations.

### 🎯 Objective

Provide educational institutions with a data-driven tool to:
- **Early identification** of students at risk of low performance or dropout
- **Prioritize interventions** based on calculated risk level
- **Analyze factors** (socioeconomic and academic) that impact performance
- **Generate insights** for institutional decision-making

---

## ✨ Features

### 🤖 Machine Learning
- **Logistic Regression** model optimized for academic risk prediction
- Analysis of **47 socioeconomic variables** (no data leakage)
- **Feature Importance** with interpretable coefficients
- Model validated with real student data (CV Score: 0.681)

### 📊 Institutional Dashboard
- **Overview** with KPIs and key metrics
- **Data exploration** with histograms, box plots, and distributions
- **Advanced analysis** of correlations and comparisons
- Interactive charts with **Recharts**

### 👤 Student Profiles
- Individualized risk score (0-100)
- Risk factor breakdown
- Alert history and tracking
- Personalized intervention recommendations

### 🎨 Modern Interface
- **Responsive** design (mobile-first)
- Automatic **light/dark mode**
- Intuitive tab navigation
- Reusable components

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + TypeScript)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ SAT Dashboard│  │Institutional │  │Student Profile│          │
│  │    View      │  │    View      │  │    View       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼───────┐                            │
│                    │  API Services │                            │
│                    │   (Axios)     │                            │
│                    └───────┬───────┘                            │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┼────────────────────────────────────┐
│                    ┌───────▼───────┐      Backend (Flask)       │
│                    │   Flask API   │                            │
│                    │   Routes      │                            │
│                    └───────┬───────┘                            │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                  │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌─────▼─────┐           │
│  │  Students   │    │Institutional│    │Predictions│           │
│  │   Routes    │    │   Routes    │    │  Routes   │           │
│  └──────┬──────┘    └──────┬──────┘    └─────┬─────┘           │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼───────┐                            │
│                    │   Services    │                            │
│                    │ Risk Calculator                            │
│                    └───────┬───────┘                            │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                  │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌─────▼─────┐           │
│  │  Supabase   │    │  Logistic   │    │   NumPy   │           │
│  │   Client    │    │  Regression │    │   Pandas  │           │
│  └──────┬──────┘    └─────────────┘    └───────────┘           │
└─────────┼───────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   students   │  │  academic_   │  │ socioeconomic│          │
│  │              │  │  performance │  │    _data     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Python 3.9+** (3.11 recommended for best compatibility)
- **Node.js 18+**
- **npm** or **yarn**
- **Supabase** account (PostgreSQL)

### Backend

```bash
# 1. Clone the repository
git clone https://github.com/samuelcampozano/Academic-Early-Warning-System.git
cd Academic-Early-Warning-System

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 5. Run the server
python app.py
```

Backend will be available at `http://localhost:5000`

### Frontend

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run in development mode
npm start
```

Frontend will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
Academic-Early-Warning-System/
│
├── 📄 app.py                    # Flask entry point
├── 📄 config.py                 # Application configuration
├── 📄 requirements.txt          # Python dependencies
│
├── 📁 models/                   # Data and ML models
│   ├── database.py              # Database schemas
│   ├── schema.sql               # PostgreSQL DDL
│   └── trained/                 # Trained ML models
│
├── 📁 routes/                   # API endpoints
│   ├── students.py              # Student CRUD
│   ├── predictions.py           # ML predictions
│   └── institutional.py         # Institutional statistics
│
├── 📁 services/                 # Business logic
│   ├── supabase_client.py       # Supabase client
│   └── risk_calculator.py       # Risk score calculation
│
├── 📁 utils/                    # Utilities
│   ├── validators.py            # Data validators
│   └── formatters.py            # Response formatters
│
├── 📁 analysis/                 # Analysis scripts
│   ├── train_comprehensive_model.py  # Model training
│   ├── predictive_early_warning.py   # Prediction service
│   └── comprehensive_model_output/   # Model outputs
│
├── 📁 scripts/                  # Maintenance scripts
│   ├── import_fase2_csv.py      # Data import
│   └── clean_tables.py          # Data cleaning
│
└── 📁 frontend/                 # React application
    ├── 📁 src/
    │   ├── 📁 components/       # React components
    │   ├── 📁 pages/            # Main pages
    │   ├── 📁 hooks/            # Custom React hooks
    │   ├── 📁 services/         # API services
    │   └── 📁 context/          # React Context providers
    └── 📄 package.json
```

---

## 🔌 API Endpoints

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | List all students |
| `GET` | `/api/students/{id}` | Get student details |
| `GET` | `/api/sat-list` | Prioritized SAT list |

### Institutional Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/institutional-stats` | General statistics |
| `GET` | `/api/score-distributions` | Statistical distributions |
| `GET` | `/api/academic-insights` | Academic insights |
| `GET` | `/api/model-comparison` | ML model comparison |
| `GET` | `/api/feature-importance` | Feature importance |
| `GET` | `/api/education-level-analysis` | Risk by education level |

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Risk prediction |
| `POST` | `/api/batch-predict` | Batch predictions |

---

## 📊 Machine Learning Model

### Comprehensive Model (47 Features)

The model analyzes **ONLY socioeconomic variables** (excluding age and grade to prevent data leakage):

| Category | Features | Top Coefficient |
|----------|----------|-----------------|
| **Education** | Education level, age-grade status | **+1.31** (nivel_educativo) |
| **Subject Enrollment** | Which subjects student takes | **-1.51** (takes_lengua) |
| **Family** | Parent age, relationship, education, marital status | ±0.31 |
| **Housing** | Wall/floor material, housing type, bathrooms | ±0.33 |
| **Assets** | Refrigerator, washing machine, vehicles, TVs | ±0.41 |
| **Technology** | Laptop, internet, computer | **-0.42** (internet) |
| **Digital Habits** | Internet use, email, social media | ±0.30 |
| **Health** | Public/private insurance coverage | **-0.58** (private insurance) |
| **Economic** | Quintile, shopping habits | ±0.68 |

### Key Findings

| Finding | Coefficient | Interpretation |
|---------|-------------|----------------|
| **Lengua y Literatura enrollment** | **-1.51** | Most protective factor - core literacy skills transfer |
| **Education level** | **+1.31** | Higher levels = harder curriculum = more risk |
| **Private insurance** | **-0.58** | Higher SES indicator, protective |
| **Internet access** | **-0.42** | Enables homework, research, learning |
| **Laptop ownership** | **+0.12** | Confounded with education level (see documentation) |

### Model Performance (Production)

```
┌────────────────────────────────────────────────────────────┐
│       Final Model: Logistic Regression (Comprehensive)     │
├────────────────────────────────────────────────────────────┤
│  ROC-AUC:              0.610                               │
│  CV Score:             0.681 ± 0.033 (best generalization) │
│  Recall (threshold 0.50): 56.9%                            │
│  Recall (threshold 0.25): 92.2% ← Recommended for SAT      │
│  Precision:            40.2% (threshold 0.25)              │
│  Missed students:      Only 4 of 51 (threshold 0.25)       │
├────────────────────────────────────────────────────────────┤
│  Features:             47 socioeconomic variables          │
│  EXCLUDED variables:   edad, grado, subject GRADES         │
│  Dataset:              687 students                        │
│  At-risk rate:         254 (37.0%)                         │
└────────────────────────────────────────────────────────────┘
```

> **Note:** The model uses ONLY socioeconomic variables (excluding age, grade, and subject grades) to make truly early predictions, before seeing any academic performance.

### Risk by Education Level

| Level | Grades | Students | At-Risk Rate |
|-------|--------|----------|--------------|
| Basica Elemental | 1-4 | 98 | **8.2%** (lowest) |
| Basica Media | 5-7 | 149 | 35.6% |
| Basica Superior | 8-10 | 235 | **45.1%** (highest) |
| Bachillerato | 11-12 | 205 | 42.4% |

---

## 🖼 Screenshots

### SAT Dashboard
Main view with prioritized list of at-risk students.

### Institutional View
Aggregated analysis with distribution charts, correlations, and trends.

### Student Profile
Individual detail with risk score, factors, and recommendations.

---

## 📖 Additional Documentation

- [📋 Setup Guide](SETUP_GUIDE.md)
- [📊 Complete Technical Documentation](TECHNICAL_DOCUMENTATION.md)
- [📈 Data Exploration Report](DATA_EXPLORATION_REPORT.md)
- [🔬 Thesis vs Implementation Analysis](THESIS_VS_IMPLEMENTATION_ANALYSIS.md)

---

## 🛠 Technologies Used

### Backend
- **Flask** - Python web framework
- **Supabase** - PostgreSQL database as a service
- **Scikit-learn** - Machine Learning (Logistic Regression)
- **NumPy/Pandas** - Data processing
- **Joblib** - Model serialization

### Frontend
- **React 18** - UI library
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library
- **React Router** - SPA navigation

---

## 👨‍💻 Authors

<div align="center">

### Development Team

**Samuel S. Campozano López** & **Jonathan Marcos Vera Parrales**

Thesis Project - Universidad Laica Eloy Alfaro de Manabí (ULEAM)

[![Portfolio](https://img.shields.io/badge/Portfolio-Samuel-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://portfolio-seven-jade-tg9cqnc8rj.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-samuelcampozano-181717?style=for-the-badge&logo=github)](https://github.com/samuelcampozano)

</div>

---

## 📄 License

This project was developed as part of an academic thesis project. All rights reserved.

© 2025 Samuel S. Campozano López & Jonathan Marcos Vera Parrales - ULEAM

---

<div align="center">

**⭐ If you found this project useful, consider giving it a star on GitHub ⭐**

</div>
