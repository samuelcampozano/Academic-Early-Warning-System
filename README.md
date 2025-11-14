# Backend - Academic Early Warning System

API Flask para el Sistema de Alerta Temprana Académica.

## 🚀 Instalación Rápida

### 1. Crear entorno virtual
```bash
python -m venv venv
```

### 2. Activar entorno virtual
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales de Supabase
```

### 5. Ejecutar el servidor
```bash
python app.py
```

El servidor estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

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

## 🔌 Endpoints de la API

### 1. Dashboard SAT (Lista Priorizada)
```
GET /api/sat-list
```
**Respuesta:**
```json
[
  {
    "id": "EST001",
    "name": "Juan Pérez",
    "course": "10mo EGB",
    "risk_level": "Alto",
    "risk_score": 85.3,
    "key_barriers": ["Sin laptop", "Representante con educación básica"],
    "promedio_general": 8.5,
    "materias_en_riesgo": 2
  }
]
```

### 2. Perfil de Estudiante
```
GET /api/student/{id}
```
**Respuesta:**
```json
{
  "id": "EST001",
  "name": "Juan Pérez",
  "course": "10mo EGB",
  "risk_level": "Alto",
  "risk_score": 85.3,
  "risk_factors": [
    {
      "name": "Ausentismo",
      "value": "5 faltas",
      "weight": "30%"
    },
    {
      "name": "Quintil Socioeconómico",
      "value": "Q2 (Vulnerable)",
      "weight": "25%"
    }
  ],
  "key_barriers": [
    {
      "name": "Sin laptop",
      "value": "No",
      "impact": "4.26% (Top 3 barrera)"
    },
    {
      "name": "Nivel Instrucción Representante",
      "value": "Básica",
      "impact": "3.02% (Top 8 barrera)"
    }
  ],
  "key_grades": [
    {
      "subject": "Matemáticas",
      "grade": 6.8,
      "avg": 8.5
    },
    {
      "subject": "Física",
      "grade": 7.2,
      "avg": 8.3
    }
  ],
  "asistencia": {
    "total_inasistencias": 5,
    "faltas_justificadas": 2,
    "faltas_injustificadas": 3,
    "porcentaje_asistencia": 92.5
  }
}
```

### 3. Estadísticas Institucionales
```
GET /api/institutional-stats
```
**Respuesta:**
```json
{
  "topBarriers": {
    "labels": ["Edad Representante", "Cobertura Salud", "Laptop", "..."],
    "datasets": [{
      "label": "Importancia (%)",
      "data": [5.84, 4.58, 4.26, ...]
    }]
  },
  "laptopImpact": {
    "labels": ["Con Laptop", "Sin Laptop"],
    "datasets": [{
      "label": "Promedio",
      "data": [8.97, 8.85]
    }]
  },
  "parentEducationImpact": {
    "labels": ["Superior", "Bachillerato", "Básica", "Primaria"],
    "datasets": [{
      "label": "Promedio",
      "data": [9.12, 8.95, 8.87, 8.73]
    }]
  },
  "quintilDistribution": {
    "Q1-Q2": 76,
    "Q3": 281,
    "Q4-Q5": 340
  },
  "riskDistribution": {
    "Alto": 45,
    "Medio": 110,
    "Bajo": 542
  }
}
```

## 🗄️ Estructura de Base de Datos (Supabase)

### Tabla: `students`
```sql
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  grado TEXT NOT NULL,
  seccion TEXT,
  edad INTEGER,
  genero TEXT,
  quintil INTEGER,
  quintil_agrupado TEXT, -- 'Bajo', 'Medio', 'Alto'
  promedio_general DECIMAL(4,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `socioeconomic_data`
```sql
CREATE TABLE socioeconomic_data (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  nivel_instruccion_rep TEXT,
  edad_representante INTEGER,
  relacion TEXT,
  estado_civil TEXT,
  laptop BOOLEAN,
  internet BOOLEAN,
  computadora BOOLEAN,
  lectura_libros BOOLEAN,
  numero_hermanos INTEGER,
  tipo_vivienda TEXT,
  indice_cobertura_salud TEXT,
  indice_acceso_tecnologico TEXT,
  indice_apoyo_familiar TEXT,
  indice_accesibilidad_geografica TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `academic_performance`
```sql
CREATE TABLE academic_performance (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  materia TEXT NOT NULL,
  nota DECIMAL(4,2),
  promedio_curso DECIMAL(4,2),
  periodo TEXT, -- 'Q1', 'Q2', 'Final'
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `attendance`
```sql
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  total_inasistencias INTEGER,
  faltas_justificadas INTEGER,
  faltas_injustificadas INTEGER,
  atrasos INTEGER,
  mes TEXT,
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `risk_predictions`
```sql
CREATE TABLE risk_predictions (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  risk_score DECIMAL(5,2),
  risk_level TEXT, -- 'Alto', 'Medio', 'Bajo'
  predicted_quintil INTEGER,
  prediction_date TIMESTAMP DEFAULT NOW(),
  model_version TEXT
);
```

## 🤖 Modelo de Machine Learning

El backend utiliza el modelo CatBoost entrenado en la Fase 1:

- **Accuracy:** 75.12%
- **Features:** 107 variables
- **Target:** Quintil socioeconómico (proxy de vulnerabilidad)
- **Archivo:** `models/trained/catboost_model.pkl`

### Cálculo del Risk Score

El `risk_score` combina múltiples factores:

```python
risk_score = (
    quintil_weight * quintil_score +          # 25%
    attendance_weight * attendance_score +     # 30%
    grades_weight * grades_score +             # 25%
    barriers_weight * barriers_score           # 20%
)
```

**Clasificación de Riesgo:**
- **Alto:** score ≥ 70
- **Medio:** 40 ≤ score < 70
- **Bajo:** score < 40

## 🧪 Testing

```bash
# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=.

# Test específico
pytest tests/test_routes.py -v
```

## 📝 Logs

Los logs se guardan en:
- Consola: Durante desarrollo
- Archivo: `logs/app.log` (en producción)

## 🚀 Deployment

### Preparación para Producción

1. **Cambiar modo DEBUG:**
```python
# .env
FLASK_DEBUG=False
FLASK_ENV=production
```

2. **Actualizar SECRET_KEY:**
```python
import secrets
print(secrets.token_hex(32))
```

3. **Configurar CORS:**
```python
# Solo permitir frontend en producción
FRONTEND_URL=https://your-frontend-url.com
```

## 🔧 Troubleshooting

### Error: "No module named 'catboost'"
```bash
pip install catboost
```

### Error de conexión a Supabase
- Verificar que `SUPABASE_URL` y `SUPABASE_KEY` sean correctos en `.env`
- Verificar que las tablas existan en Supabase

### Error de CORS
- Verificar que `FRONTEND_URL` esté configurado correctamente
- Verificar que Flask-CORS esté instalado

## 📚 Referencias

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
- [CatBoost Documentation](https://catboost.ai/docs/)
- [INFORME_FINAL_MODELO_ML.md](../documentacion/INFORME_FINAL_MODELO_ML.md)
- [INFORME_FINAL_FASE2_VALIDACION.md](../documentacion/INFORME_FINAL_FASE2_VALIDACION.md)
