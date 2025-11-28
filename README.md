# 🎓 Sistema de Alerta Temprana Académica (SAT)
## Academic Early Warning System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.0+-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Sistema de predicción de riesgo académico basado en Machine Learning para identificar estudiantes en riesgo de deserción o bajo rendimiento académico.**

[Características](#-características) • [Instalación](#-instalación) • [Documentación](#-documentación) • [Arquitectura](#-arquitectura)

</div>

---

## 📋 Descripción

El **Sistema de Alerta Temprana Académica (SAT)** es una aplicación full-stack desarrollada como proyecto de tesis que utiliza técnicas de Machine Learning para predecir el riesgo académico de estudiantes universitarios. El sistema analiza datos socioeconómicos, historial académico y barreras educativas para generar un score de riesgo personalizado y recomendaciones de intervención.

### 🎯 Objetivo

Proporcionar a las instituciones educativas una herramienta basada en datos para:
- **Identificar tempranamente** estudiantes en riesgo de bajo rendimiento o deserción
- **Priorizar intervenciones** según el nivel de riesgo calculado
- **Analizar factores** socioeconómicos y académicos que impactan el rendimiento
- **Generar insights** institucionales para la toma de decisiones

---

## ✨ Características

### 🤖 Machine Learning
- **Modelo CatBoost** optimizado para predicción de riesgo académico
- Análisis de **+30 variables** socioeconómicas y académicas
- **Feature Importance** para identificar factores de mayor impacto
- Precisión del modelo validada con datos reales

### 📊 Dashboard Institucional
- **Vista general** con KPIs y métricas clave
- **Exploración de datos** con histogramas, box plots y distribuciones
- **Análisis avanzado** de correlaciones y comparativas
- Gráficos interactivos con **Recharts**

### 👤 Perfiles de Estudiantes
- Score de riesgo individualizado (0-100)
- Desglose de factores de riesgo
- Historial de alertas y seguimiento
- Recomendaciones personalizadas de intervención

### 🎨 Interfaz Moderna
- Diseño **responsivo** (mobile-first)
- Modo **claro/oscuro** automático
- Navegación intuitiva con tabs
- Componentes reutilizables

---

## 🏗 Arquitectura

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
│  │  Supabase   │    │   CatBoost  │    │   NumPy   │           │
│  │   Client    │    │    Model    │    │   Pandas  │           │
│  └──────┬──────┘    └─────────────┘    └───────────┘           │
└─────────┼───────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  estudiantes │  │  califica-   │  │ socioecono-  │          │
│  │              │  │   ciones     │  │   mic_data   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Instalación

### Prerrequisitos

- **Python 3.9+**
- **Node.js 18+**
- **npm** o **yarn**
- Cuenta en **Supabase** (PostgreSQL)

### Backend

```bash
# 1. Clonar el repositorio
git clone https://github.com/samuelcampozano/Academic-Early-Warning-System.git
cd Academic-Early-Warning-System

# 2. Crear y activar entorno virtual
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
copy .env.example .env
# Editar .env con tus credenciales de Supabase

# 5. Ejecutar el servidor
python app.py
```

El backend estará disponible en `http://localhost:5000`

### Frontend

```bash
# 1. Navegar al directorio frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm start
```

El frontend estará disponible en `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
Academic-Early-Warning-System/
│
├── 📄 app.py                    # Punto de entrada Flask
├── 📄 config.py                 # Configuración de la aplicación
├── 📄 requirements.txt          # Dependencias Python
│
├── 📁 models/                   # Modelos de datos y ML
│   ├── database.py              # Esquemas de base de datos
│   ├── schema.sql               # DDL de PostgreSQL
│   └── trained/                 # Modelos ML entrenados
│       └── catboost_model.pkl
│
├── 📁 routes/                   # Endpoints de la API
│   ├── students.py              # CRUD de estudiantes
│   ├── predictions.py           # Predicciones ML
│   └── institutional.py         # Estadísticas institucionales
│
├── 📁 services/                 # Lógica de negocio
│   ├── supabase_client.py       # Cliente de Supabase
│   └── risk_calculator.py       # Cálculo de scores de riesgo
│
├── 📁 utils/                    # Utilidades
│   ├── validators.py            # Validadores de datos
│   └── formatters.py            # Formateadores de respuestas
│
├── 📁 analysis/                 # Scripts de análisis
│   ├── predictive_early_warning.py
│   └── model_comparison/        # Comparación de modelos
│
├── 📁 scripts/                  # Scripts de mantenimiento
│   ├── import_fase2_csv.py      # Importación de datos
│   └── clean_tables.py          # Limpieza de datos
│
└── 📁 frontend/                 # Aplicación React
    ├── 📁 src/
    │   ├── 📁 components/       # Componentes React
    │   │   ├── charts/          # Gráficos (Recharts)
    │   │   ├── layout/          # Layout components
    │   │   └── ui/              # UI components
    │   ├── 📁 pages/            # Páginas principales
    │   │   ├── SAT_Dashboard.tsx
    │   │   ├── InstitutionalView.tsx
    │   │   └── StudentProfile.tsx
    │   ├── 📁 hooks/            # Custom React hooks
    │   ├── 📁 services/         # API services
    │   └── 📁 context/          # React Context providers
    └── 📄 package.json
```

---

## 🔌 API Endpoints

### Estudiantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/students` | Lista de todos los estudiantes |
| `GET` | `/api/students/{id}` | Detalle de un estudiante |
| `GET` | `/api/sat-list` | Lista priorizada SAT |

### Estadísticas Institucionales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/institutional-stats` | Estadísticas generales |
| `GET` | `/api/score-distributions` | Distribuciones estadísticas |
| `GET` | `/api/academic-insights` | Insights académicos |

### Predicciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/predict` | Predicción de riesgo |
| `GET` | `/api/feature-importance` | Importancia de variables |

---

## 📊 Modelo de Machine Learning

### Variables Predictoras

El modelo analiza las siguientes categorías de variables:

| Categoría | Variables | Peso Aproximado |
|-----------|-----------|-----------------|
| **Socioeconómico** | Quintil, ingresos, cobertura salud | ~35% |
| **Tecnológico** | Laptop, internet, acceso tecnológico | ~25% |
| **Familiar** | Educación padres, apoyo familiar | ~20% |
| **Académico** | Historial de notas, materias reprobadas | ~15% |
| **Demográfico** | Edad, género, zona geográfica | ~5% |

### Métricas del Modelo

```
┌────────────────────────────────────────┐
│         Métricas de Evaluación         │
├────────────────────────────────────────┤
│  Accuracy:     0.87                    │
│  Precision:    0.83                    │
│  Recall:       0.79                    │
│  F1-Score:     0.81                    │
│  AUC-ROC:      0.91                    │
└────────────────────────────────────────┘
```

---

## 🖼 Capturas de Pantalla

### Dashboard SAT
Vista principal con lista priorizada de estudiantes en riesgo.

### Vista Institucional
Análisis agregado con gráficos de distribución, correlaciones y tendencias.

### Perfil de Estudiante
Detalle individual con score de riesgo, factores y recomendaciones.

---

## 📖 Documentación Adicional

- [📋 Guía de Configuración](SETUP_GUIDE.md)

---

## 🛠 Tecnologías Utilizadas

### Backend
- **Flask** - Framework web de Python
- **Supabase** - Base de datos PostgreSQL como servicio
- **CatBoost** - Gradient boosting para ML
- **NumPy/Pandas** - Procesamiento de datos
- **Scikit-learn** - Utilidades de ML

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utility-first
- **Recharts** - Librería de gráficos
- **React Router** - Navegación SPA

---

## 👨‍💻 Autor

<div align="center">

**Samuel S. Campozano López**

Proyecto de Tesis - Universidad Laica Eloy Alfaro de Manabí (ULEAM)

**Tutor de Tesis:** Jonathan Marcos Vera Parrales

[![Portfolio](https://img.shields.io/badge/Portfolio-Visitar-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://portfolio-seven-jade-tg9cqnc8rj.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-samuelcampozano-181717?style=for-the-badge&logo=github)](https://github.com/samuelcampozano)

</div>

---

## 📄 Licencia

Este proyecto fue desarrollado como parte de un trabajo de tesis académica. Todos los derechos reservados.

© 2025 Samuel S. Campozano López - ULEAM

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub ⭐**

</div>
