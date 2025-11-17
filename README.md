# Academic Early Warning System

This repository contains the full-stack application for the Academic Early Warning System, including the Flask backend and the React frontend.

---

## Backend - Academic Early Warning System

API Flask para el Sistema de Alerta Temprana Académica.

### 🚀 Instalación Rápida

#### 1. Crear entorno virtual
```bash
python -m venv venv
```

#### 2. Activar entorno virtual
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

#### 4. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales de Supabase
```

#### 5. Ejecutar el servidor
```bash
python app.py
```

El servidor estará disponible en `http://localhost:5000`

### 📁 Estructura del Proyecto

```
backend/
├── app.py                      # Punto de entrada de la aplicación
├── config.py                   # Configuración de la aplicación
├── requirements.txt            # Dependencias de Python
├── .env                        # Variables de entorno (no incluir en git)
├── .env.example               # Plantilla de variables de entorno
│
├── models/                     # Modelos de base de datos y ML
│   ├── __init__.py
│   ├── database.py            # Modelos SQLAlchemy
│   └── trained/               # Modelos ML entrenados
│       └── catboost_model.pkl
│
├── routes/                     # Endpoints de la API
│   ├── __init__.py
│   ├── students.py            # Rutas de estudiantes
│   ├── predictions.py         # Rutas de predicciones ML
│   └── institutional.py       # Rutas de estadísticas institucionales
│
├── services/                   # Lógica de negocio
│   ├── __init__.py
│   ├── supabase_client.py     # Cliente de Supabase
│   ├── prediction_service.py  # Servicio de predicciones ML
│   ├── risk_calculator.py     # Cálculo de scores de riesgo
│   └── data_processor.py      # Procesamiento de datos
│
├── utils/                      # Utilidades
│   ├── __init__.py
│   ├── validators.py          # Validadores de datos
│   └── formatters.py          # Formateadores de respuestas
│
└── tests/                      # Tests unitarios
    ├── __init__.py
    ├── test_routes.py
    └── test_services.py
```

### 🔌 Endpoints de la API

#### 1. Dashboard SAT (Lista Priorizada)
```
GET /api/sat-list
```

#### 2. Perfil de Estudiante
```
GET /api/student/{id}
```

#### 3. Estadísticas Institucionales
```
GET /api/institutional-stats
```

---

## Frontend (React)

Please see the `frontend/README.md` for detailed instructions on how to run the frontend application.