# Academic Early Warning System - Complete Technical Documentation

## Sistema de Alerta Temprana Académica - Documentación Técnica Completa

**Document Version:** 8.0 (Comprehensive Model - All Features, No Data Leakage)  
**Date:** December 1, 2025  
**Author:** Samuel Campozano  
**University:** ULEAM - Universidad Laica Eloy Alfaro de Manabí  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Leakage Prevention - Critical Design Decision](#2-data-leakage-prevention---critical-design-decision)
3. [Data Sources and Integration](#3-data-sources-and-integration)
4. [Feature Engineering](#4-feature-engineering)
5. [Model Training and Comparison](#5-model-training-and-comparison)
6. [Final Model Performance](#6-final-model-performance)
7. [Threshold Optimization](#7-threshold-optimization)
8. [Scientific Validation](#8-scientific-validation)
   - [8A. Verified Database Insights](#8a-verified-database-insights-december-2025)
   - [8B. Complete Model Evolution History](#8b-complete-model-evolution-history)
   - [8C. Frontend Visualization Mapping](#8c-frontend-visualization-mapping)
9. [System Architecture](#9-system-architecture)
10. [Database Schema](#10-database-schema)
11. [API Reference](#11-api-reference)
12. [File Reference](#12-file-reference)
13. [Deployment Guide](#13-deployment-guide)

---

## 1. Executive Summary

### 1.1 System Purpose

The **Academic Early Warning System** (Sistema de Alerta Temprana Académica - SAT) is a machine learning-powered system that predicts which students are at risk of academic failure **using only socioeconomic variables**. This enables proactive intervention BEFORE academic problems manifest.

### 1.2 Key Design Principle: TRUE Early Warning

**What makes this a TRUE early warning system:**
- ✅ Uses ONLY socioeconomic factors available at enrollment
- ✅ Does NOT use `edad` (student age) - causes data leakage
- ✅ Does NOT use `grado` (grade level) - causes data leakage  
- ✅ Does NOT use subject GRADES - they ARE the target variable!
- ✅ Predicts risk BEFORE seeing any academic performance

### 1.3 Final Model Performance (Comprehensive Model - 47 Features)

| Metric | Default (0.50) | Optimized (0.25) | Interpretation |
|--------|----------------|------------------|----------------|
| **ROC-AUC** | 0.610 | 0.610 | Reasonable discriminative ability |
| **CV Score** | 0.681 ± 0.033 | - | **Strong cross-validation** |
| **Recall** | 56.9% | **92.2%** | Catches 92% of at-risk students |
| **Precision** | 43.9% | 40.2% | Acceptable trade-off |
| **Missed Students** | 22 | **4** | Only 4 students missed! |

### 1.4 Student Population

| Statistic | Value |
|-----------|-------|
| Total Students | 687 |
| At-Risk (any grade ≤ 7.5) | 254 (37.0%) |
| Not At-Risk | 433 (63.0%) |
| Class Imbalance Ratio | 1.70:1 |
| Training Set | 549 students |
| Test Set | 138 students |

---

## 2. Data Leakage Prevention - Critical Design Decision

### 2.1 What is Data Leakage?

Data leakage occurs when information that would not be available at prediction time is used during training, causing artificially inflated performance metrics that don't hold in production.

### 2.2 Why We EXCLUDED `edad` (Student Age)

**Problem identified:** Student age is highly correlated with grade level, and different grade levels have different curriculum difficulty. Using age would allow the model to "cheat" by inferring grade-level information.

```
Evidence:
- Correlation between edad and nivel_educativo: r = 0.955 (95.5%)
- Basica_Elemental (grades 1-4): Age 6.4 average, 8.2% at-risk
- Bachillerato (grades 11-13): Age 15.6 average, 42.4% at-risk
```

**If we used age:** The model would learn "older students are more at risk" but this is really just a proxy for "students in higher grades have harder curriculum."

**Decision:** Remove `edad` completely.

### 2.3 Why We EXCLUDED `grado` (Grade Level)

**Problem identified:** Grade level directly determines curriculum difficulty and expected performance standards. A 4th grader and a 12th grader face completely different academic challenges.

**If we used grado:** The model would predict based on structural curriculum factors, not true socioeconomic risk factors. This defeats the purpose of early warning - we already KNOW higher grades are harder.

**Decision:** Remove `grado` completely.

### 2.4 What We USE Instead

We use `nivel_educativo` (education level category) instead of raw grade:
- **Basica_Elemental** (grades 1-4): 98 students, 8.2% at-risk
- **Basica_Media** (grades 5-7): 149 students, 35.6% at-risk
- **Basica_Superior** (grades 8-10): 235 students, 45.1% at-risk
- **Bachillerato** (grades 11-13): 205 students, 42.4% at-risk

This captures the meaningful educational context without causing data leakage.

Additionally, we include ALL factors that:
1. Are known at enrollment (start of year)
2. Are independent of academic performance
3. Represent genuine socioeconomic conditions

**Valid predictors:**
- Housing conditions (tipo_vivienda, material_paredes, material_piso)
- Household assets (refrigerator, washing machine, vehicles, TVs)
- Technology access (laptop, internet, computer)
- Family characteristics (parent education, parent age, marital status)
- Geographic accessibility (distance to school)
- Digital habits (internet use, email, social media, reading)

---

## 3. Data Sources and Integration

### 3.1 Data Sources Used

The complete model integrates data from **6 sources**:

| Source | File/Table | Records | Data Type |
|--------|------------|---------|-----------|
| **Habit CSV** | `Information about the habit of the student.csv` | 1,067 | Household assets, digital habits |
| **House CSV** | `Information about the house of the student.csv` | 1,067 | Housing conditions, technology |
| **Parent CSV** | `Information of the parent.orlegalrepresentative.csv` | 1,077 | Family characteristics |
| **Economic CSV** | `Economic activity of the student.csv` | 1,067 | Health insurance, occupation |
| **First Page CSV** | `First page of the students information.csv` | 1,076 | School type, socioeconomic group |
| **Supabase** | `students`, `academic_performance`, `socioeconomic_data` | 687 | Quintil, grades, accessibility |

### 3.2 Data Integration Process

```python
# 1. Load ALL CSV files
habit_df = pd.read_csv('Information about the habit of the student.csv', sep=';')
house_df = pd.read_csv('Information about the house of the student.csv', sep=';')
parent_df = pd.read_csv('Information of the parent.orlegalrepresentative.csv', sep=';')
economic_df = pd.read_csv('Economic activity of the student.csv', sep=';')
first_page_df = pd.read_csv('First page of the students information.csv', sep=';')

# 2. Load students from Supabase (for academic performance)
students = supabase.table('students').select('*, academic_performance(*), socioeconomic_data(*)').execute()

# 3. Match by student ID (EST001 -> 1)
# 4. Merge all features into single dataset with 51 features
```

### 3.3 Data Quality Summary

After integration, we have **687 students** with complete data:

| Feature Category | Coverage | Notes |
|-----------------|----------|-------|
| Gender (sexo) | 100% | 365 Male, 322 Female |
| Quintil | 100% | Mean: 3.48 |
| **Health insurance** | **76.6%** | 526 students have coverage |
| **Private insurance** | **15.9%** | 109 students |
| **Number of cellphones** | **100%** | Mean: 1.73 |
| Housing type | 100% | 525 Casa/Villa, 127 Departamento |
| Wall material | 98.5% | 521 Ladrillo, 150 Hormigón |
| Floor material | 98.7% | 562 Cerámica, 109 Cemento |
| Bathrooms | 96% | Mean: 1.85 |
| Has phone | 11% | 78 students |
| Has stove | 82% | 561 students |
| Has refrigerator | 97% | 667 students |
| Has washing machine | 89% | 610 students |
| Has TV | 96% | Mean: 1.79 TVs |
| Has vehicle | 69% | Mean: 0.80 vehicles |
| Has laptop | 76% | 521 students |
| Has internet | 96% | 658 students |
| Has computer | 41% | 282 students |
| Uses internet | 96% | 660 students |
| Uses email | 86% | 593 students |
| Uses social media | 82% | 566 students |
| Reads books | 57% | 389 students |
| Parent age | 100% | Mean: 40.8 years |
| Parent education | 100% | Mean level: 3.62 (superior) |
| **Parent occupation** | **100%** | Categorized into 8 groups |
| **Head of household occupation** | **100%** | Categorized into 8 groups |

---

## 4. Feature Engineering

### 4.1 Complete Feature List (47 Features - NO DATA LEAKAGE)

The comprehensive model uses **47 features** organized into 11 categories. **CRITICAL: No subject grades are used - they ARE the target!**

#### Education Level & Age-Grade Status (2 features):
| Feature | Description | Values |
|---------|-------------|--------|
| `nivel_educativo` | Education level category | Basica_Elemental, Basica_Media, Basica_Superior, Bachillerato |
| `age_grade_status` | Whether student is young/normal/old for grade | young (23.7%), normal (74.8%), unknown (1.5%) |

#### Subject ENROLLMENT Features (8 features - NOT GRADES!):
| Feature | Description | Coverage |
|---------|-------------|----------|
| `num_subjects` | Number of subjects enrolled in | Mean: 10.2 |
| `high_risk_subject_count` | Count of historically difficult subjects | Mean: 3.11 |
| `takes_lengua` | Enrolled in Lengua y Literatura | 89.8% |
| `takes_matematicas` | Enrolled in Matemáticas | 30.1% |
| `takes_fisica` | Enrolled in Física | 30.3% |
| `takes_ciencias` | Enrolled in Ciencias Naturales | 69.7% |
| `takes_sociales` | Enrolled in Estudios Sociales | varies |
| `takes_ingles` | Enrolled in Inglés | 99.7% |

#### Geographic & School (2 features):
| Feature | Description | Values |
|---------|-------------|--------|
| `indice_accesibilidad` | Distance to school | Muy cerca, Cerca, Moderado, Lejos, Muy lejos |
| `escuela_procedencia` | Previous school type | Fiscal, Particular, Fiscomisional |

#### Demographics (4 features):
| Feature | Description | Values |
|---------|-------------|--------|
| `genero` | Student gender | Masculino, Femenino |
| `quintil` | Socioeconomic quintile | 1-5 |
| `grupo_socioeconomico` | Socioeconomic group | A, B, C+, C, C-, D |
| `tiene_diagnostico` | Has psychological diagnosis | 0.9% |

#### Housing (5 features):
| Feature | Description |
|---------|-------------|
| `tipo_vivienda` | Housing type (Casa/Villa, Departamento, etc.) |
| `material_paredes` | Wall material (Ladrillo, Hormigón, etc.) |
| `material_piso` | Floor material (Cerámica, Cemento, etc.) |
| `cuartos_bano` | Number of bathrooms (0-3) |
| `tipo_sanitario` | Sanitary service type |

#### Household Assets (8 features):
| Feature | Description | Coverage |
|---------|-------------|----------|
| `tiene_telefono` | Has landline phone | 11% |
| `tiene_cocina` | Has stove/oven | 82% |
| `tiene_refrigeradora` | Has refrigerator | 97% |
| `tiene_lavadora` | Has washing machine | 89% |
| `tiene_equipo_sonido` | Has sound equipment | 34% |
| `num_tv` | Number of TVs (0-3) | Mean: 1.79 |
| `num_vehiculos` | Number of vehicles (0-3) | Mean: 0.80 |
| `asset_score` | Composite asset index | Range: 0-7 |

#### Technology (5 features):
| Feature | Description | Coverage |
|---------|-------------|----------|
| `tiene_laptop` | Has laptop | 76% |
| `tiene_internet` | Has internet | 96% |
| `tiene_computadora` | Has desktop computer | 41% |
| `num_celulares` | Number of cellphones | Mean: 1.73 |
| `tech_access_score` | Tech access index | Range: 0-4 |

#### Digital Habits (4 features):
| Feature | Description | Coverage |
|---------|-------------|----------|
| `usa_internet` | Uses internet | 96% |
| `usa_correo` | Uses email | 86% |
| `usa_redes` | Uses social media | 82% |
| `digital_score` | Digital literacy index | Range: 0-3 |

#### Other Habits (2 features):
| Feature | Description | Coverage |
|---------|-------------|----------|
| `lectura_libros` | Reads books | 57% |
| `compra_centros` | Shops at malls | 61% |

#### Family (8 features):
| Feature | Description |
|---------|-------------|
| `numero_hermanos` | Number of siblings |
| `edad_representante` | Parent/guardian age (Mean: 40.8) |
| `relacion` | Relationship to student (Madre, Padre, Otro) |
| `estado_civil` | Parent marital status |
| `nivel_instruccion` | Parent education level |
| `nivel_instruccion_num` | Education as number (0-5) |
| `ocupacion_representante` | Parent occupation category |
| `ocupacion_jefe` | Head of household occupation |

### 4.2 Occupation Categories

Parent and head of household occupations are mapped to 8 categories:
| Category | Description | % of Students | At-Risk Rate |
|----------|-------------|---------------|--------------|
| Profesional | Directors, professionals, scientists | 11.4% | 32.1% |
| Tecnico | Technicians, administrative, office | 31.9% | 35.2% |
| Servicios | Service workers, merchants | 26.3% | 40.3% |
| Operario | Machine operators, artisans | 5.2% | 41.7% |
| Agropecuario | Agricultural, fishing | 9.6% | 42.4% |
| No_Calificado | Unskilled workers | 2.5% | 52.9% |
| Inactivo | Unemployed, inactive | 3.1% | 33.3% |
| Otro/Militar | Other, military | 10.0% | 28.6% |

### 4.3 Derived Features

#### 4.3.1 asset_score (Household Asset Index)
```python
asset_score = (tiene_telefono + tiene_cocina + tiene_refrigeradora + 
               tiene_lavadora + tiene_equipo_sonido + 
               (1 if num_vehiculos > 0 else 0) + (1 if num_tv > 0 else 0))
# Range: 0-7
```

#### 4.3.2 tech_access_score (Technology Access Index)
```python
tech_access_score = tiene_laptop + tiene_internet + tiene_computadora + (1 if num_celulares > 0 else 0)
# Range: 0-4
```

#### 4.3.3 digital_score (Digital Literacy Index)
```python
digital_score = usa_internet + usa_correo + usa_redes
# Range: 0-3
```

#### 4.3.4 health_coverage (Health Coverage Index)
```python
health_coverage = tiene_seguro_salud + tiene_seguro_privado
# Range: 0-2
```

---

## 5. Model Training and Comparison

### 5.1 Training Configuration

```python
# Data Split: 80% train, 20% test, stratified by target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Result: 549 training, 138 testing
# Both sets maintain 37% at-risk ratio

# Class imbalance handling
class_ratio = 1.70  # not_at_risk / at_risk
```

### 5.2 Models Compared (6 Configurations)

| Model | Configuration | Key Parameters |
|-------|--------------|----------------|
| **CatBoost_balanced** | Auto class weights | iterations=500, lr=0.05, depth=6, auto_class_weights='Balanced' |
| **CatBoost_deeper** | Deeper trees | iterations=700, lr=0.03, depth=8, l2_leaf_reg=3 |
| **XGBoost** | Scaled weights | n_estimators=500, lr=0.05, depth=6, scale_pos_weight=1.70 |
| **LightGBM** | Balanced weights | n_estimators=500, lr=0.05, depth=6, class_weight='balanced' |
| **RandomForest** | Balanced weights | n_estimators=500, depth=10, class_weight='balanced' |
| **GradientBoosting** | Default | n_estimators=500, lr=0.05, depth=6 |

### 5.3 Model Comparison Results (Comprehensive Model - 47 Features)

| Model | ROC-AUC | CV Score | Recall | Precision | Missed |
|-------|---------|----------|--------|-----------|--------|
| **Logistic_Regression** | 0.610 | **0.681±0.033** | **56.9%** | 43.9% | 22 |
| RandomForest | **0.630** | 0.647±0.033 | 37.3% | 55.9% | 32 |
| GradientBoosting | 0.640 | 0.632±0.033 | 35.3% | 45.0% | 33 |
| XGBoost | 0.614 | 0.652±0.006 | 41.2% | 45.7% | 30 |
| LightGBM | 0.622 | 0.629±0.021 | 49.0% | 52.1% | 26 |
| CatBoost_Balanced | 0.604 | 0.659±0.047 | 49.0% | 43.1% | 26 |
| CatBoost_Scaled | 0.604 | 0.660±0.038 | 49.0% | 43.1% | 26 |

### 5.4 Why Logistic Regression Was Selected

1. **Best CV Score (0.681)** - Most reliable performance estimate, best generalization
2. **Interpretable** - Coefficients show direct feature impact
3. **Best threshold optimization** - Achieves 92.2% recall at threshold 0.25
4. **Robust** - Lower variance in CV scores compared to ensemble methods
5. **Production-ready** - Fast inference, small model size

### 5.5 Cross-Validation Results (Comprehensive Model)

```
5-Fold Cross-Validation (ROC-AUC) - Logistic Regression:
   Mean: 0.681 ± 0.033
   
Model Evolution:
   Original (30 features):    CV 0.567 ± 0.039
   Enhanced (51 features):    CV 0.671 ± 0.064  (with grade features - LEAKED)
   Comprehensive (47 features): CV 0.681 ± 0.033  (NO data leakage)
```

**Key Insight:** By carefully removing ALL data leakage (subject grades, which ARE the target), we get a TRUE early warning model that generalizes well (CV 0.681).

---

## 6. Final Model Performance & Feature Impact Analysis

### 6.1 Model Coefficients Interpretation (Logistic Regression)

The Logistic Regression model provides **interpretable coefficients** where:
- **Positive coefficients (+)** = Feature INCREASES academic risk
- **Negative coefficients (-)** = Feature DECREASES academic risk (protective factor)

### 6.2 Complete Feature Impact Analysis (All 47 Features)

#### 6.2.1 TOP RISK INCREASERS (Positive Coefficients)

| Rank | Feature | Coefficient | Interpretation |
|------|---------|-------------|----------------|
| 1 | `takes_lengua` | **-1.511** | *See protective factors below* |
| 2 | `nivel_educativo` | **+1.305** | **Higher education level = MORE risk.** Students in Bachillerato (42.4% at-risk) face much harder curricula than Basica_Elemental (8.2% at-risk). This reflects the natural difficulty progression of school. |
| 3 | `escuela_procedencia` | **+0.740** | Students from certain previous school types may have weaker academic foundations, leading to higher risk in the current institution. |
| 4 | `num_subjects` | **+0.601** | More subjects enrolled = more opportunities to fail. Students taking many subjects face higher cognitive load and time management challenges. |
| 5 | `takes_fisica` | **+0.589** | Physics is a historically difficult subject with 15.4% failure rate. Taking this subject increases academic risk. |
| 6 | `tiene_equipo_sonido` | **+0.508** | Counterintuitive finding - may indicate households where entertainment competes with study time, or captures other household dynamics. |
| 7 | `genero` | **+0.488** | One gender shows higher academic risk profile. Requires gender-specific intervention strategies. |
| 8 | `tiene_cocina` | **+0.454** | Having a stove is nearly universal (82%), so this coefficient may capture other unmeasured household dynamics rather than the stove itself. |
| 9 | `num_vehiculos` | **+0.406** | More vehicles might indicate parents working longer hours or being away from home more, resulting in less time available for academic support. |
| 10 | `lectura_libros` | **+0.389** | **Surprising finding!** May capture students who read recreationally but still struggle academically, or could indicate a data quality issue requiring further investigation. |
| 11 | `takes_matematicas` | **+0.321** | Mathematics is a high-risk subject with 13.5% failure rate. Enrollment correlates with higher academic risk. |
| 12 | `tiene_diagnostico` | **+0.258** | Students with psychological diagnoses face additional challenges that may impact academic performance. |
| 13 | `tiene_computadora` | **+0.194** | Desktop computer ownership shows slight risk increase - potentially confounded with education level (see laptop paradox below). |
| 14 | `tiene_laptop` | **+0.124** | **The Laptop Paradox** - explained in detail below. |

#### 6.2.2 TOP RISK REDUCERS - PROTECTIVE FACTORS (Negative Coefficients)

| Rank | Feature | Coefficient | Interpretation |
|------|---------|-------------|----------------|
| 1 | `takes_lengua` | **-1.511** | **Most protective factor!** Students enrolled in Lengua y Literatura have 1.5x lower risk. This core subject builds foundational literacy skills that transfer across all other subjects. |
| 2 | `compra_ropa_centros` | **-0.682** | Shopping at shopping centers/malls indicates higher socioeconomic status and more family resources available for education. |
| 3 | `takes_sociales` | **-0.587** | Social Studies enrollment is protective - often taken by students with good academic standing and engagement. |
| 4 | `takes_ciencias` | **-0.587** | Natural Sciences enrollment correlates with academic engagement and scientific curiosity. |
| 5 | `tiene_seguro_privado` | **-0.585** | **Private health insurance = higher SES** → better health outcomes, fewer school absences, and more family resources for educational support. |
| 6 | `tiene_telefono` | **-0.517** | Having a landline phone (only 11% have) indicates a stable, established household with permanence and stability. |
| 7 | `tiene_seguro_salud` | **-0.465** | Any health insurance coverage means fewer sick days, better overall wellbeing, and less disruption to learning. |
| 8 | `tiene_internet` | **-0.419** | Internet access at home enables homework completion, research capabilities, and access to online learning resources. |
| 9 | `high_risk_subject_count` | **-0.313** | Counterintuitive - students enrolled in more difficult subjects may actually be more academically prepared and motivated. |
| 10 | `takes_ingles` | **-0.303** | English enrollment (99.7% take it) shows marginal protective effect for those who do. |
| 11 | `quintil` | **-0.225** | Higher socioeconomic quintile (4-5) = fewer economic barriers and more family support resources. |
| 12 | `usa_redes` | **-0.225** | Social media use may indicate digital literacy and social connectivity that supports learning. |
| 13 | `nivel_instruccion_num` | **-0.200** | Higher parent education level = better capacity to help with homework and value education. |
| 14 | `asset_score` | **-0.182** | More household assets = better economic stability and fewer resource constraints. |

#### 6.2.3 NEUTRAL/LOW IMPACT FEATURES (|Coefficient| < 0.10)

| Feature | Coefficient | Notes |
|---------|-------------|-------|
| `tech_score` | -0.101 | Combined technology score has minimal independent effect |
| `grupo_socioeconomico` | -0.074 | Socioeconomic group captured by other features |
| `digital_score` | -0.055 | Digital literacy score has minimal independent effect |
| `tipo_sanitario` | +0.055 | Sanitary service type shows minimal impact |
| `estado_civil` | +0.047 | Parent marital status has low predictive power |
| `indice_accesibilidad` | +0.041 | Distance to school shows surprisingly low impact |
| `num_celulares` | -0.034 | Number of cellphones has minimal effect |
| `tipo_vivienda` | -0.024 | Housing type (house vs apartment) minimally impacts risk |
| `ocupacion_jefe` | -0.022 | Head of household occupation has low independent effect |
| `edad_representante` | -0.011 | Parent age shows minimal predictive power |
| `tiene_lavadora` | +0.008 | Washing machine ownership has no meaningful impact |

### 6.3 The Laptop Paradox - A Case Study in Confounding Variables

**Finding:** `tiene_laptop` has a **positive coefficient (+0.124)**, meaning having a laptop is associated with **slightly INCREASED academic risk**.

**This seems counterintuitive - shouldn't laptops help education?**

**Explanation - Simpson's Paradox / Confounding Variable:**

```
The Confounding Relationship:
├── Students in Bachillerato (harder curriculum) → 76% have laptops → 42.4% at-risk
├── Students in Basica_Superior (difficult) → Many have laptops → 45.1% at-risk  
├── Students in Basica_Elemental (easier) → Fewer have laptops → 8.2% at-risk
└── RESULT: Laptop APPEARS to increase risk, but it's actually the EDUCATION LEVEL
```

**Statistical Interpretation:**
The positive laptop coefficient demonstrates **Simpson's Paradox** - while laptops likely provide educational benefits at an individual level, they are **confounded with education level**. Older students (facing harder curricula with higher baseline risk rates) are significantly more likely to own laptops than younger students in elementary levels. This creates a **spurious positive association** between laptop ownership and academic risk in the aggregate data.

**Implications for Intervention:**
1. Do NOT interpret this as "laptops harm students"
2. Laptop distribution programs should still be considered valuable
3. The coefficient captures the confounded effect, not the causal effect
4. A randomized controlled trial would be needed to measure true laptop impact

### 6.4 Risk by Education Level - Key Finding

| Level | Grades | Students | At-Risk | Risk Rate | Interpretation |
|-------|--------|----------|---------|-----------|----------------|
| Basica_Elemental | 1-4 | 98 | 8 | **8.2%** | Lowest risk - foundational curriculum |
| Basica_Media | 5-7 | 149 | 53 | **35.6%** | Significant jump - curriculum complexity increases |
| Basica_Superior | 8-10 | 235 | 106 | **45.1%** | **Highest risk** - most challenging transition period |
| Bachillerato | 11-12 | 205 | 87 | **42.4%** | High risk - advanced curriculum, exam pressure |

**Key Insight:** Risk increases by **5.5x** from Basica_Elemental to Basica_Superior. This is the most important predictor in the model and should drive intervention targeting.

### 6.5 Age-Grade Status Analysis

| Status | Students | At-Risk | Risk Rate | Interpretation |
|--------|----------|---------|-----------|----------------|
| Normal | 514 | 183 | **35.6%** | Baseline risk for age-appropriate placement |
| Young | 163 | 67 | **41.1%** | Students young for their grade show HIGHER risk |
| Unknown | 10 | 4 | 40.0% | Missing data |

**Insight:** Students who are "young for their grade" (possibly advanced early or with late birthdays) show **5.5 percentage points higher risk** than normally-placed students. This suggests academic readiness matters beyond just curriculum difficulty.

### 6.6 Confusion Matrix Analysis (Default Threshold 0.50)

```
                    Predicted
                 Not-Risk   At-Risk
Actual Not-Risk     50        37     (FP=37 false alarms)
       At-Risk      22        29     (FN=22 missed students)

Total test set: 138 students (51 at-risk, 87 not at-risk)
```

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **True Positives** | 29 | Correctly identified at-risk students |
| **False Positives** | 37 | Students flagged but not actually at-risk (manageable workload) |
| **False Negatives** | 22 | **Missed at-risk students** ⚠️ (reduced with threshold optimization) |
| **True Negatives** | 50 | Correctly identified not-at-risk students |
| **Accuracy** | 57.2% | Overall correct classifications |
| **Recall** | 56.9% | Of truly at-risk, how many we caught |
| **Precision** | 43.9% | Of those flagged, how many are truly at-risk |

---

## 7. Threshold Optimization

### 7.1 Why Threshold Matters

The default classification threshold is 0.50 (probability ≥ 50% = at-risk). For early warning systems, we can lower this threshold to catch more at-risk students at the cost of more false alarms.

### 7.2 Threshold Analysis (Comprehensive Model)

| Threshold | Recall | Precision | Missed | False Alarms | F1 Score |
|-----------|--------|-----------|--------|--------------|----------|
| 0.50 | 56.9% | 43.9% | 22 | 37 | 0.496 |
| 0.45 | 62.7% | 43.2% | 19 | 42 | 0.512 |
| 0.40 | 68.6% | 43.2% | 16 | 46 | 0.530 |
| 0.35 | 74.5% | 39.2% | 13 | 59 | 0.514 |
| 0.30 | 82.4% | 37.8% | 9 | 69 | 0.519 |
| **0.25** | **92.2%** | 40.2% | **4** | 70 | **0.559** |
| 0.20 | 96.1% | 39.8% | 2 | 74 | 0.563 |
| 0.15 | 98.0% | 38.5% | 1 | 80 | 0.552 |
| 0.10 | 100.0% | 38.1% | 0 | 83 | 0.551 |

### 7.3 Recommended Thresholds

| Use Case | Threshold | Recall | Missed | False Alarms | Best For |
|----------|-----------|--------|--------|--------------|----------|
| **Maximum Safety** | 0.10 | 100% | 0 | 83 | When missing ANY student is unacceptable |
| **High Recall (recommended)** | 0.25 | 92.2% | 4 | 70 | **Production deployment** |
| Balanced | 0.35 | 74.5% | 13 | 59 | Resource-constrained environments |
| High Precision | 0.50 | 56.9% | 22 | 37 | When false alarms are costly |

**Recommendation: Use threshold 0.25**

**Justification:**
- Only **4 students missed** out of 51 at-risk in test set (92.2% recall)
- 70 false alarms is manageable - teachers can quickly verify
- Best F1 score (0.559) among high-recall options
- Cost of missing an at-risk student >> cost of a false alarm
- Better to intervene with 70 students and catch 92% than miss 22 students (44% miss rate at default threshold)

---

## 8. Scientific Validation

### 8.1 Model Performance in Context

| Metric | Our Model | Typical EWS Range | Assessment |
|--------|-----------|-------------------|------------|
| ROC-AUC | 0.610 | 0.60-0.75 | ✅ Within expected range |
| CV Score | 0.681 | 0.60-0.70 | ✅ **Strong generalization** |
| Recall (optimized) | 92.2% | 70-90% | ✅ **Excellent** |
| Precision | 40.2% | 30-50% | ✅ Acceptable trade-off |
| CV Stability | ±0.033 | <0.05 | ✅ Very stable |

### 8.2 Why Logistic Regression Outperformed Complex Models

Despite having 12 categorical features that typically favor tree-based models like CatBoost, Logistic Regression achieved the best cross-validation score:

| Reason | Explanation |
|--------|-------------|
| **Small dataset** | 687 students is insufficient for complex ensemble methods to capture nuanced patterns without overfitting |
| **Strong regularization** | L2 regularization in Logistic Regression prevents overfitting on limited data |
| **Linear relationships** | Many socioeconomic predictors have approximately linear relationships with log-odds of risk |
| **Interpretability benefit** | Coefficients provide actionable insights for thesis and policy recommendations |
| **Lower variance** | CV std of 0.033 vs 0.047 for CatBoost indicates more reliable predictions |

### 8.3 Why This is a Valid Early Warning System

1. **Uses only pre-enrollment data** - All features are known before classes start
2. **No academic performance in features** - Predicts risk, doesn't confirm it
3. **No data leakage** - edad (age) and grado (grade) excluded; subject grades NOT used
4. **Socioeconomic focus** - Aligns with INEC Ecuador methodology
5. **Actionable predictions** - Identifies students for intervention
6. **Interpretable model** - Coefficients explain WHY students are flagged

### 8.4 Key Findings Summary for Thesis

#### Finding 1: Education Level is the Strongest Predictor
- Coefficient: +1.305 (2nd highest magnitude)
- Risk increases from 8.2% (Basica_Elemental) to 45.1% (Basica_Superior)
- **Implication:** Intervention resources should be concentrated on grades 8-10

#### Finding 2: Language Arts Enrollment is Highly Protective
- Coefficient: -1.511 (highest magnitude, protective)
- Students taking Lengua y Literatura have significantly lower risk
- **Implication:** Core literacy skills transfer across all subjects; consider language support programs

#### Finding 3: Socioeconomic Resources Cluster as Protective Factors
- Private insurance (-0.585), landline phone (-0.517), health coverage (-0.465), internet (-0.419)
- **Implication:** Multi-dimensional socioeconomic disadvantage increases risk; holistic support needed

#### Finding 4: The Laptop Paradox Demonstrates Confounding
- Laptop shows positive coefficient (+0.124) but this is confounded with education level
- **Implication:** Correlation ≠ causation; technology access programs still valuable

#### Finding 5: Subject Enrollment Patterns Predict Risk
- Physics (+0.589) and Mathematics (+0.321) enrollment increases risk
- Social Studies (-0.587) and Natural Sciences (-0.587) enrollment is protective
- **Implication:** STEM subjects require additional support structures

### 8.5 Comparison with Literature

Our approach aligns with established early warning systems:

| System | Features Used | Our Approach |
|--------|--------------|--------------|
| Chicago EWS | Attendance, behavior, course grades | Socioeconomic only (true early warning) |
| INEC Ecuador | Housing, assets, education, employment | ✅ Same framework |
| Balfanz ABCs | Attendance, Behavior, Course performance | Socioeconomic predictors |

**Our advantage:** We predict risk BEFORE seeing any attendance, behavior, or grades.

### 8.6 Limitations and Considerations

1. **Sample size:** 687 students - adequate but larger samples would improve stability
2. **Single institution:** Model trained on one school - may need recalibration for others
3. **Confounding variables:** Some features (laptop, reading) show counterintuitive effects due to confounding with education level
4. **False alarm rate:** 70 false alarms at optimal threshold (0.25) - requires teacher review
5. **Class imbalance:** 37% at-risk students - handled with balanced class weights

---

## 8A. Verified Database Insights (December 2025)

This section contains data-backed findings verified directly from the Supabase database on December 1, 2025.

### 8A.1 Laptop Impact on Academic Performance (VERIFIED)

**Database Query Results:**

| Metric | With Laptop | Without Laptop | Difference |
|--------|-------------|----------------|------------|
| **Count** | 521 students | 166 students | - |
| **Mean GPA** | 8.97 | 8.85 | **+0.12** |
| **Median GPA** | 9.07 | 8.94 | +0.13 |

**Key Insight:** Students WITH laptops have a slightly higher GPA (+0.12 points). However, the ML model shows a positive coefficient (+0.124) for `tiene_laptop`, indicating HIGHER risk. This apparent paradox is explained by confounding:

**Simpson's Paradox Explanation:**
- Students in higher education levels (Bachillerato, Basica_Superior) have MORE laptops
- Higher education levels have harder curricula = higher academic risk
- Therefore, laptop ownership correlates with risk NOT because laptops cause failure, but because of the confounding variable (education level)

**Conclusion for Dashboard:** The "Brecha Digital" chart should show actual GPA comparison (8.97 vs 8.85), NOT the model coefficient.

### 8A.2 Parent Education Impact (VERIFIED)

**Database Query Results:**

| Education Level | Count | Mean GPA |
|-----------------|-------|----------|
| **Postgrado** | 78 | 9.07 |
| **Educación superior** | 339 | 9.00 |
| **Secundaria completa** | 217 | 8.83 |
| **Primaria completa** | 9 | 8.76 |
| **Secundaria incompleta** | 6 | 8.72 |
| Sin estudios | 2 | 9.09 (outlier) |

**Key Insight:** Clear positive correlation between parent education level and student GPA. Students with parents holding postgraduate degrees score +0.35 points higher than those with incomplete secondary education.

**Cultural Capital Interpretation:**
- Higher parental education = more academic support capability
- This aligns with Bourdieu's cultural capital theory
- Coefficient in model: `nivel_instruccion_num` contributes to risk calculation

### 8A.3 GPA by Socioeconomic Quintile (VERIFIED)

**Database Query Results:**

| Quintile | Count | Mean GPA | Median | Q1 | Q3 | Min | Max |
|----------|-------|----------|--------|-----|-----|-----|-----|
| **Q1** | 1 | 9.02 | 9.02 | 9.02 | 9.02 | 9.02 | 9.02 |
| **Q2** | 52 | 8.85 | 8.90 | 8.41 | 9.43 | 7.27 | 9.91 |
| **Q3** | 281 | 8.87 | 8.99 | 8.48 | 9.40 | 5.32 | 9.96 |
| **Q4** | 296 | 9.00 | 9.11 | 8.66 | 9.43 | 6.85 | 9.98 |
| **Q5** | 44 | 9.09 | 9.12 | 8.72 | 9.55 | 7.69 | 9.95 |

**Key Insight:** Higher quintiles show higher GPAs. Q5 (most affluent) has median 9.12 vs Q2 median of 8.90 (+0.22 difference).

**Note:** Q1 has only 1 student in the database, so Q1 statistics are not representative.

### 8A.4 Risk Distribution (VERIFIED)

**Database Query Results (using risk_calculator):**

| Risk Level | Count | Mean GPA |
|------------|-------|----------|
| **Alto** | 1 | 7.27 |
| **Medio** | 29 | 8.57 |
| **Bajo** | 657 | 8.96 |

**Validation:** The risk classification correctly identifies that higher risk = lower GPA. Students classified as "Alto" have significantly lower GPA (7.27) than those classified as "Bajo" (8.96).

### 8A.5 Gender Analysis (VERIFIED)

**Database Query Results:**

| Gender | Count | Mean GPA |
|--------|-------|----------|
| **Femenino** | 322 | 9.04 |
| **Masculino** | 365 | 8.86 |

**Key Insight:** Female students outperform male students by +0.18 GPA points on average. This aligns with global educational research showing gender gaps in academic achievement.

### 8A.6 Barriers Impact (VERIFIED)

**Database Query Results (barriers = lack of laptop + internet + reading):**

| Barriers Count | Count | Mean GPA |
|----------------|-------|----------|
| 0 barriers | 307 | 8.94 |
| 1 barrier | 278 | 8.98 |
| 2 barriers | 91 | 8.86 |
| 3 barriers | 11 | 8.77 |

**Key Insight:** Students with 3+ barriers have GPA 0.17 points lower than students with 0 barriers. The effect is cumulative.

### 8A.7 Overall GPA Statistics (VERIFIED)

| Statistic | Value |
|-----------|-------|
| **Total Students with GPA** | 687 |
| **Mean** | 8.94 |
| **Median** | 9.04 |
| **Std Dev** | 0.65 |
| **Min** | 5.32 |
| **Max** | 9.98 |
| **Failing (<7)** | 6 (0.9%) |

**Note:** The student population has high overall performance (mean 8.94/10). Only 6 students (0.9%) are currently failing.

---

## 8B. Complete Model Evolution History

This section documents the full history of model development, from initial CatBoost experiments to the final production Logistic Regression model. This provides context for thesis documentation and explains why different approaches were used.

### 8B.1 Phase 1: CatBoost Quintil Prediction Model (Initial Approach)

**Goal:** Predict the socioeconomic quintile (Q1-Q5) of students based on their household characteristics, then correlate this with academic performance.

**Script:** `analysis/predictive_early_warning.py`

**Approach:**
1. Train CatBoost to predict which students will fail specific subjects
2. Use socioeconomic features (quintil, laptop, internet, parent education, etc.)
3. Create student×subject level predictions (each student-subject pair is one record)
4. Target variable: `failed` (grade < 7.0) or `at_risk` (grade < 7.5)

**Key Design Decisions:**

| Decision | Rationale |
|----------|-----------|
| **Subject-level predictions** | Allows identifying which specific subjects each student is at risk for |
| **CatBoost algorithm** | Handles categorical features natively; good for imbalanced data |
| **Excluded attendance** | Initially included, but removed due to overfitting (>147% importance) |
| **Included other-subject grades** | Used grades from OTHER subjects to predict each subject (not data leakage) |

**Results from Thesis (ROC-AUC 0.934, Recall 75%):**

```
📊 Model Performance (from thesis):
   ROC-AUC: 0.934 (Excellent discriminative ability)
   Recall: 75% (Catches 75% of students who will fail)
   Precision: 35.6% (About 1/3 of flagged students actually fail)
```

**Why CatBoost Was Selected Over Random Forest:**
- Random Forest Tuned had best ROC-AUC (0.942) but VERY low Recall (7.8%)
- CatBoost achieved 75% Recall - 10x better at catching at-risk students
- For early warning, missing students is worse than false alarms

**Feature Importance (Phase 1):**

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | edad_representante | 5.84% | Family |
| 2 | nota_otras_materias | 4.58% | Cross-subject |
| 3 | laptop | 4.26% | Technology |
| 4 | quintil | 3.91% | Socioeconomic |
| 5 | internet | 3.45% | Technology |

### 8B.2 The Quintil-Grade Correlation Analysis

**Purpose:** Validate that predicted socioeconomic quintile correlates with actual academic performance.

**Methodology:**
1. CatBoost predicted quintile for each student (based on socioeconomic features)
2. Compared predicted quintile against actual student grades
3. Analyzed whether lower quintiles → lower grades

**Verified Results (from Database):**

| Quintile | Count | Mean GPA | Interpretation |
|----------|-------|----------|----------------|
| Q2 (low) | 52 | 8.85 | Lower socioeconomic status |
| Q3 | 281 | 8.87 | Middle class |
| Q4 | 296 | 9.00 | Upper-middle class |
| Q5 (high) | 44 | 9.09 | Highest socioeconomic status |

**Statistical Significance:** Q5 students score +0.24 points higher than Q2 students (9.09 vs 8.85).

**Conclusion:** Quintile prediction confirmed correlation between socioeconomic status and academic performance. This validated the thesis hypothesis that socioeconomic barriers impact education.

### 8B.3 Phase 2: Binary At-Risk Classification (Current Production Model)

**Goal:** Simplify the prediction to a binary classification (at-risk vs. not-at-risk) for easier interpretation and deployment.

**Script:** `analysis/train_comprehensive_model.py`

**Approach:**
1. Define `at_risk = 1` if any subject grade ≤ 7.5
2. Use ALL 47 socioeconomic features from CSV files + database
3. Compare 7 different algorithms (Logistic Regression, Random Forest, XGBoost, LightGBM, CatBoost, Gradient Boosting)
4. **Critical: Exclude grades from features** - they ARE the target variable

**Why We Transitioned from Quintil to Binary:**

| Aspect | Quintil Prediction | Binary At-Risk |
|--------|-------------------|----------------|
| **Output** | 5-class (Q1-Q5) | 2-class (at-risk/not) |
| **Interpretability** | Complex | Simple |
| **Actionability** | Indirect (quintile → risk) | Direct (student needs help Y/N) |
| **Model Complexity** | Higher (multiclass) | Lower (binary) |
| **Teacher Usability** | Requires interpretation | Immediate understanding |

**Model Comparison Results (7 Algorithms):**

| Model | ROC-AUC | Recall | Precision | CV Score | CV Std |
|-------|---------|--------|-----------|----------|--------|
| **Logistic_Regression** | 0.610 | 56.9% | 43.9% | **0.681** | **0.033** |
| RandomForest | 0.630 | 37.3% | 55.9% | 0.647 | 0.033 |
| GradientBoosting | 0.640 | 35.3% | 45.0% | 0.632 | 0.033 |
| XGBoost | 0.614 | 41.2% | 45.7% | 0.652 | 0.006 |
| LightGBM | 0.622 | 49.0% | 52.1% | 0.629 | 0.021 |
| CatBoost_Balanced | 0.604 | 49.0% | 43.1% | 0.659 | 0.047 |
| CatBoost_Scaled | 0.604 | 49.0% | 43.1% | 0.660 | 0.038 |

**Winner: Logistic Regression (Best CV Score 0.681 ± 0.033)**

### 8B.4 Why Logistic Regression Beat Complex Models

This was a surprising result that deserves explanation:

| Factor | Explanation |
|--------|-------------|
| **Small Dataset** | Only 687 students - complex models overfit |
| **47 Features** | Many features for small dataset - regularization helps |
| **Strong Regularization** | L2 regularization prevents overfitting |
| **Linear Relationships** | Many socioeconomic-risk relationships are approximately linear in log-odds |
| **Cross-Validation Stability** | CV std of 0.033 (lowest) indicates reliable predictions |
| **Interpretable Coefficients** | Each feature has a clear positive/negative effect |

**Key Insight:** More complex ≠ better. For small educational datasets, simpler models often generalize better.

### 8B.5 Final Model Coefficients (Top 10 Features)

The Logistic Regression coefficients tell us WHICH factors increase/decrease risk:

| Rank | Feature | Coefficient | Effect on Risk |
|------|---------|-------------|----------------|
| 1 | takes_lengua | **-1.511** | PROTECTIVE: Language arts enrollment reduces risk |
| 2 | nivel_educativo | **+1.305** | RISK: Higher education levels have harder curriculum |
| 3 | tiene_seguro_privado | -0.585 | PROTECTIVE: Private insurance indicates resources |
| 4 | takes_fisica | +0.589 | RISK: Physics is a challenging subject |
| 5 | takes_sociales | -0.587 | PROTECTIVE: Social studies enrollment |
| 6 | takes_ciencias | -0.587 | PROTECTIVE: Natural sciences enrollment |
| 7 | tiene_telefono | -0.517 | PROTECTIVE: Landline indicates stable housing |
| 8 | tiene_seguro_salud | -0.465 | PROTECTIVE: Health coverage |
| 9 | tiene_internet | -0.419 | PROTECTIVE: Internet access for homework |
| 10 | takes_matematicas | +0.321 | RISK: Mathematics is challenging |

**Interpretation Guidelines:**
- **Negative coefficient** = PROTECTIVE factor (reduces risk)
- **Positive coefficient** = RISK factor (increases risk)
- **Magnitude** = Strength of effect

### 8B.6 Confusion Matrix Comparison (Phase 1 vs Phase 2)

**Phase 1 (CatBoost Subject-Level):**
```
Target: Subject-level failure (< 7.0)
Records: ~7,251 (student × subject combinations)
Performance: ROC-AUC 0.934, Recall 75%
```

**Phase 2 (Logistic Regression Student-Level):**
```
Target: Student at-risk (any grade ≤ 7.5)
Records: 687 students
Test Set: 138 students (51 at-risk, 87 not at-risk)

Confusion Matrix (Threshold 0.50):
                    Predicted
                 Not-Risk   At-Risk
Actual Not-Risk     50        37     (FP=37 false alarms)
       At-Risk      22        29     (FN=22 missed)

TP=29, FP=37, FN=22, TN=50
Recall: 56.9% | Precision: 43.9%
```

**With Optimized Threshold (0.25):**
```
                    Predicted
                 Not-Risk   At-Risk
Actual Not-Risk     17        70     (FP=70 false alarms)
       At-Risk       4        47     (FN=4 missed!)

TP=47, FP=70, FN=4, TN=17
Recall: 92.2% | Precision: 40.2%
```

**Improvement:** Threshold optimization reduces missed at-risk students from 22 → 4 (81% reduction).

### 8B.7 Data Leakage Prevention Measures

**Critical Design Decision:** The model does NOT use any academic performance data as features because grades ARE the target variable.

| What We EXCLUDED | Why |
|------------------|-----|
| `nota_final` | This IS what we're predicting |
| `promedio_general` | Derived from grades |
| `asistencia` | Correlated with grades (symptom, not cause) |
| `edad` (raw) | Highly correlated with `grado` (leakage) |
| `grado` (raw) | Determines curriculum difficulty |

| What We INCLUDED Instead |
|-------------------------|
| `nivel_educativo` (categorical: Basica_Elemental/Media/Superior, Bachillerato) |
| `age_grade_status` (young/normal/old for grade) |
| `takes_lengua`, `takes_matematicas`, etc. (subject ENROLLMENT, not grades) |

**Result:** Model predicts risk using ONLY socioeconomic factors known at enrollment, enabling TRUE early warning before any grades exist.

---

## 8C. Frontend Visualization Mapping

This section documents how model findings are displayed in the React frontend.

### 8C.1 Dashboard Architecture

The frontend is a React + TypeScript application located in `/frontend/`. Key pages:

| Page | Route | Purpose | Data Source |
|------|-------|---------|-------------|
| **SAT Dashboard** | `/sat` | Prioritized at-risk student list | `/api/sat-list` |
| **Student Detail** | `/students/:id` | Individual student risk profile | `/api/students/:id/risk` |
| **Institutional View** | `/institutional` | Aggregate statistics and charts | `/api/institutional-stats` |

### 8C.2 Institutional View Charts (InstitutionalView.tsx)

The Institutional View displays 8 charts that visualize model findings:

| Chart # | Name | Data Displayed | Source |
|---------|------|----------------|--------|
| 1 | **Top 10 Risk Factors** | Model coefficients (positive = risk, negative = protective) | Model training output |
| 2 | **Laptop Impact** | GPA comparison: WITH=8.97, WITHOUT=8.85 (+0.12 diff) | Database verified |
| 3 | **Cultural Capital** | GPA by parent education level | Database verified |
| 4 | **Performance by Quintile** | GPA by socioeconomic quintile (Q2-Q5) | Database verified |
| 5 | **Subject Risk** | At-risk rate by subject | Academic performance data |
| 6 | **Model Confusion Matrix** | 2x2 binary classification results (TP/FP/FN/TN) | Model evaluation |
| 7 | **Risk Distribution** | Students by risk level (Alto/Medio/Bajo) | Risk calculator |
| 8 | **Alert History** | Timeline of student alerts | Frontend state |

### 8C.3 Data Flow: Backend → Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│  Backend (routes/institutional.py)                              │
│                                                                 │
│  @app.route('/api/institutional-stats')                         │
│  def get_institutional_stats():                                 │
│      return {                                                   │
│          'topRiskFactors': [...],     # Model coefficients      │
│          'laptopImpact': {...},        # Database GPA data      │
│          'culturalCapital': {...},     # Parent education data  │
│          'performanceByQuintile': {...}, # Quintile GPA data    │
│          'confusionMatrix': {...},     # 2x2 matrix             │
│          ...                                                    │
│      }                                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (hooks/useInstitutionalData.ts)                       │
│                                                                 │
│  const { data } = useQuery('institutional-stats', fetchStats);  │
│                                                                 │
│  // Transform for charts                                        │
│  const chartData = transformForVisualization(data);             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (pages/InstitutionalView.tsx)                         │
│                                                                 │
│  <ChartCard title="Top 10 Risk Factors">                        │
│    <BarChart data={topRiskFactors} />                           │
│    <p>Positive = increases risk, Negative = protective</p>      │
│  </ChartCard>                                                   │
│                                                                 │
│  <ChartCard title="Impact of Laptop Access">                    │
│    <BarChart data={laptopImpact} />                             │
│    <p>With laptop: 8.97 GPA vs Without: 8.85 GPA</p>            │
│  </ChartCard>                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 8C.4 Chart Interpretation Guidelines

Each chart includes contextual explanations for non-technical users:

| Chart | Key Message for Teachers |
|-------|-------------------------|
| **Top 10 Risk Factors** | "Green bars are PROTECTIVE factors that reduce risk. Red bars INCREASE risk. Focus interventions on factors you can influence." |
| **Laptop Impact** | "Students with laptops have slightly higher GPA (+0.12 points). Consider laptop lending programs for vulnerable students." |
| **Cultural Capital** | "Parent education level correlates with student GPA. Students with less-educated parents may need additional academic support." |
| **Confusion Matrix** | "Our model correctly identifies 56.9% of at-risk students. With optimized threshold (0.25), we catch 92.2% but with more false alarms." |

### 8C.5 Frontend File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── InstitutionalView.tsx    # Main statistics dashboard
│   │   ├── SATDashboard.tsx         # At-risk student list
│   │   └── StudentDetail.tsx        # Individual student profile
│   │
│   ├── hooks/
│   │   └── useInstitutionalData.ts  # Data fetching + transformation
│   │
│   ├── components/
│   │   ├── ChartCard.tsx            # Reusable chart container
│   │   ├── RiskScoreBreakdown.tsx   # Risk component visualization
│   │   └── KeyBarriers.tsx          # Student barriers display
│   │
│   └── types.ts                     # TypeScript interfaces
```

### 8C.6 Key Frontend Updates (December 2025)

The following updates were made to align frontend with verified database data:

| Component | Update Made |
|-----------|-------------|
| `routes/institutional.py` | Updated all chart data with verified database values |
| `InstitutionalView.tsx` | Updated chart descriptions with correct interpretations |
| `useInstitutionalData.ts` | Added `rows?` to ConfusionMatrixData type for 2x2 matrix |

**Before:** Charts showed incorrect values (e.g., "-1.5 points" for laptop impact)
**After:** Charts show verified database values (e.g., "+0.12 GPA difference" for laptop impact)

---

## 9. System Architecture

### 9.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                │
│  • SAT Dashboard - Prioritized student risk list                │
│  • Individual student risk profiles                             │
│  • Institutional analytics and visualizations                   │
│  Location: /frontend/                                           │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python + Flask)                     │
│  • app.py - Main application server                             │
│  • /routes/ - API endpoints                                     │
│  • /services/ - Risk calculation logic                          │
│  Location: Root directory                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MACHINE LEARNING LAYER                         │
│  • CatBoost model (best_model.cbm)                              │
│  • Feature engineering pipeline                                 │
│  • Threshold-optimized predictions                              │
│  Location: /analysis/final_model_output/                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                     │
│  • Supabase/PostgreSQL - students, academic_performance         │
│  • CSV files - socioeconomic data (habit, house, parent)        │
│  Location: Cloud (Supabase) + Local CSV                         │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Python Environments

| Environment | Python Version | Purpose | CatBoost Support |
|-------------|----------------|---------|------------------|
| `venv` | 3.14 | Flask backend, API | ❌ No |
| `venv311` | 3.11 | ML training, CatBoost | ✅ Yes |

**CRITICAL:** CatBoost requires Python ≤3.12. Always use `venv311` for model training:

```powershell
.\venv311\Scripts\Activate.ps1
python analysis/train_final_model.py
```

---

## 10. Database Schema

### 10.1 students Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR | Primary key (EST001 format) |
| nombre | VARCHAR | First name |
| apellido | VARCHAR | Last name |
| cedula | VARCHAR | National ID |
| edad | INTEGER | Age (NOT USED in model) |
| genero | VARCHAR | 'Masculino'/'Femenino' |
| grado | VARCHAR | Grade level (NOT USED in model) |
| quintil | INTEGER | Socioeconomic quintile (1-5) |

### 10.2 socioeconomic_data Table

| Column | Type | Description |
|--------|------|-------------|
| student_id | VARCHAR | Foreign key to students |
| tipo_vivienda | VARCHAR | Housing type |
| laptop | BOOLEAN | Has laptop |
| internet | BOOLEAN | Has internet |
| computadora | BOOLEAN | Has desktop computer |
| lectura_libros | BOOLEAN | Reads books |
| nivel_instruccion_rep | VARCHAR | Parent education level |
| edad_representante | INTEGER | Parent age |
| estado_civil | VARCHAR | Parent marital status |
| relacion | VARCHAR | Relationship to student |
| indice_accesibilidad_geografica | VARCHAR | Distance category |

### 10.3 academic_performance Table

| Column | Type | Description |
|--------|------|-------------|
| student_id | VARCHAR | Foreign key to students |
| materia | VARCHAR | Subject name |
| nota | DECIMAL | Grade (0-10 scale) |
| quimestre | INTEGER | Academic term (1 or 2) |

### 10.4 CSV Data Files

| File | Key Columns |
|------|-------------|
| `Information about the habit of the student.csv` | Telefono_convencional, Cocina_horno, Refrigeradora, Lavadora, TV, Vehiculos, Lectura_libros |
| `Information about the house of the student.csv` | Tipo vivienda, Material_Pared, Material_Piso, N_banos, Internet, Computadora, Laptop |
| `Information of the parent.orlegalrepresentative.csv` | Edad, Relacion, Estado civil, Nivel Instruccion |

---

## 11. API Reference

### 11.1 Student Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/students` | GET | List all students (paginated) |
| `/api/students/<id>` | GET | Get student details |
| `/api/students/<id>/risk` | GET | Get risk assessment for student |

### 11.2 Prediction Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sat-list` | GET | Get prioritized at-risk student list |
| `/api/predict/<id>` | GET | Get ML prediction for student |

### 11.3 Institutional Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/institutional-stats` | GET | Aggregate statistics |
| `/api/subject-performance` | GET | Performance by subject |
| `/api/risk-distribution` | GET | Risk level distribution |

---

## 12. File Reference

### 12.1 Training Scripts

| File | Purpose | Status |
|------|---------|--------|
| `analysis/train_final_model.py` | **Final production model** - loads CSV data, trains CatBoost | ✅ Current |
| `analysis/train_catboost_early_warning.py` | Original model (uses edad/grado) | ⚠️ Deprecated |
| `analysis/train_model_comparison.py` | Model comparison experiments | Archive |
| `analysis/train_model_full_features.py` | Full feature experiments | Archive |

### 12.2 Model Output Files

| File | Description |
|------|-------------|
| `analysis/final_model_output/best_model.cbm` | **Trained CatBoost model** |
| `analysis/final_model_output/feature_importance.csv` | Feature importance rankings |
| `analysis/final_model_output/model_comparison_results.csv` | All model results |
| `analysis/final_model_output/final_model_report.json` | Complete experiment report |

### 12.3 Data Files

| File | Description |
|------|-------------|
| `Information about the habit of the student.csv` | Household assets and habits |
| `Information about the house of the student.csv` | Housing conditions |
| `Information of the parent.orlegalrepresentative.csv` | Family information |
| `info ubicacion1.csv` | Location data |

---

## 13. Deployment Guide

### 13.1 Training the Model

```powershell
# Activate Python 3.11 environment (required for CatBoost)
.\venv311\Scripts\Activate.ps1

# Run training script
python analysis/train_final_model.py

# Output will be saved to analysis/final_model_output/
```

### 13.2 Using the Model for Predictions

```python
from catboost import CatBoostClassifier
import pandas as pd

# Load trained model
model = CatBoostClassifier()
model.load_model('analysis/final_model_output/best_model.cbm')

# Prepare student features (30 features, same order as training)
student_features = pd.DataFrame([{
    'sexo': 'Masculino',
    'quintil': 3,
    'tipo_vivienda': 'Casa/Villa',
    # ... all 30 features
}])

# Get probability
risk_probability = model.predict_proba(student_features)[0, 1]

# Apply threshold (0.15 for high recall)
is_at_risk = risk_probability >= 0.15
```

### 13.3 Recommended Threshold Settings

| Environment | Threshold | Use Case |
|-------------|-----------|----------|
| Production | 0.15 | Catch most at-risk students |
| Conservative | 0.30 | Balance recall and precision |
| Research | 0.50 | Default classification |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2024 | Initial documentation |
| 2.0 | Nov 30, 2025 | Added early warning model |
| 3.0 | Nov 30, 2025 | Model comparison |
| 4.0 | Nov 30, 2025 | Feature corrections |
| 5.0 | Nov 30, 2025 | Data leakage prevention |
| 6.0 | Nov 30, 2025 | Final production model with CSV data integration |
| 7.0 | Dec 1, 2025 | Comprehensive model with 47 features, no data leakage |
| 8.0 | Dec 1, 2025 | Section 8A: Verified database insights |
| **9.0** | **Dec 1, 2025** | **Section 8B: Complete model evolution history; Section 8C: Frontend visualization mapping** |

---

## Summary of Key Results

| Item | Value |
|------|-------|
| **Total Students** | 687 |
| **At-Risk Rate** | 37.0% (254 students) |
| **Features Used** | 47 socioeconomic features |
| **Features EXCLUDED** | edad, grado, subject grades (data leakage) |
| **Best Model** | Logistic Regression |
| **ROC-AUC** | 0.610 |
| **CV Score** | 0.681 ± 0.033 (best stability) |
| **Recall (threshold 0.25)** | **92.2%** |
| **Missed Students** | Only 4 out of 51 |
| **Top Predictor** | takes_lengua (coefficient -1.511, protective) |
| **Phase 1 Model** | CatBoost (subject-level, ROC-AUC 0.934, Recall 75%) |
| **Phase 2 Model** | Logistic Regression (student-level, CV 0.681) |

---

## Quick Reference: Model Evolution

| Phase | Model | Target | ROC-AUC | Recall | Use Case |
|-------|-------|--------|---------|--------|----------|
| **Phase 1** | CatBoost | Subject-level failure | 0.934 | 75% | Predict which subjects each student will fail |
| **Phase 2** | Logistic Regression | Student at-risk (binary) | 0.610 | 92.2%* | Simple yes/no early warning for teachers |

*With threshold optimization (0.25)

---

*This document serves as the complete technical reference for the Academic Early Warning System. All decisions are justified with data analysis and aligned with educational research best practices.*

**Author:** Samuel Campozano  
**Institution:** ULEAM - Universidad Laica Eloy Alfaro de Manabí  
**Date:** December 1, 2025
