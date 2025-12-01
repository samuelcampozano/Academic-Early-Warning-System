"""
Rutas relacionadas con estadísticas institucionales

Endpoints:
- GET /api/institutional-stats: Estadísticas globales para la vista institucional
- GET /api/score-distributions: Distribuciones de notas para gráficos avanzados
- GET /api/barriers-analysis: Análisis detallado de barreras
- GET /api/model-comparison: Comparación de modelos ML (nuevo)
- GET /api/feature-importance: Importancia de características del modelo
- GET /api/education-level-analysis: Análisis por nivel educativo
"""
from flask import Blueprint, jsonify
from services.supabase_client import supabase_client
from services.risk_calculator import risk_calculator
import logging
import numpy as np
import json
import os

logger = logging.getLogger(__name__)

institutional_bp = Blueprint("institutional", __name__)

# Path to model outputs
MODEL_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                'analysis', 'comprehensive_model_output')

# Subject name normalization mapping
SUBJECT_NAME_MAP = {
    "Animación lectura": "Lengua y Literatura",
    "Animación Lectura": "Lengua y Literatura",
    "ANIMACIÓN LECTURA": "Lengua y Literatura",
    "animación lectura": "Lengua y Literatura",
    # Normalize Math variations
    "Matemática": "Matemáticas",
    "matemática": "Matemáticas",
    "MATEMÁTICA": "Matemáticas",
    "MATEMÁTICAS": "Matemáticas",
    # Normalize other subjects
    "Ciencias Naturales": "Ciencias Naturales",
    "ciencias naturales": "Ciencias Naturales",
    "Estudios sociales": "Estudios Sociales",
    "estudios sociales": "Estudios Sociales",
}

# Non-academic subjects to filter out (these are support classes, not core academics)
NON_ACADEMIC_SUBJECTS = {
    "Acompañamiento", "PPE", "acompañamiento", "ppe",
    "Animación lectura", "Animación Lectura"  # Already mapped to Lengua
}

def normalize_subject_name(subject: str) -> str:
    """Normalize subject names to consistent values"""
    return SUBJECT_NAME_MAP.get(subject, subject)


@institutional_bp.route("/model-comparison", methods=["GET"])
def get_model_comparison():
    """
    Obtiene datos de comparación de modelos ML para gráficos
    
    Returns:
        JSON con comparación de modelos entrenados
    """
    try:
        # Load model comparison results
        report_path = os.path.join(MODEL_OUTPUT_DIR, 'comprehensive_model_report.json')
        
        if not os.path.exists(report_path):
            return jsonify({"error": "Model report not found"}), 404
        
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        models = report.get('all_models', [])
        
        # Prepare Chart.js data for model comparison
        model_names = [m['model'] for m in models]
        
        response = {
            # ROC-AUC comparison (bar chart)
            "rocAucComparison": {
                "labels": model_names,
                "datasets": [{
                    "label": "ROC-AUC",
                    "data": [round(m['roc_auc'], 3) for m in models],
                    "backgroundColor": [
                        "rgba(75, 192, 192, 0.6)" if m['model'] == report['best_model']['name'] 
                        else "rgba(54, 162, 235, 0.6)" 
                        for m in models
                    ],
                    "borderColor": [
                        "rgba(75, 192, 192, 1)" if m['model'] == report['best_model']['name'] 
                        else "rgba(54, 162, 235, 1)" 
                        for m in models
                    ],
                    "borderWidth": 1
                }]
            },
            
            # CV Score comparison (bar chart with error bars)
            "cvScoreComparison": {
                "labels": model_names,
                "datasets": [{
                    "label": "CV Score (Mean)",
                    "data": [round(m['cv_mean'], 3) for m in models],
                    "error": [round(m['cv_std'], 3) for m in models],
                    "backgroundColor": "rgba(153, 102, 255, 0.6)",
                    "borderColor": "rgba(153, 102, 255, 1)",
                    "borderWidth": 1
                }]
            },
            
            # Recall vs Precision (scatter plot)
            "recallVsPrecision": {
                "datasets": [{
                    "label": "Models",
                    "data": [
                        {"x": round(m['recall'] * 100, 1), "y": round(m['precision'] * 100, 1), "label": m['model']}
                        for m in models
                    ],
                    "backgroundColor": [
                        "rgba(255, 99, 132, 0.8)" if m['model'] == report['best_model']['name'] 
                        else "rgba(54, 162, 235, 0.6)" 
                        for m in models
                    ],
                    "pointRadius": 10
                }]
            },
            
            # Missed students comparison (bar chart - lower is better)
            "missedStudentsComparison": {
                "labels": model_names,
                "datasets": [{
                    "label": "Estudiantes En Riesgo No Detectados",
                    "data": [m['missed_at_risk'] for m in models],
                    "backgroundColor": "rgba(255, 99, 132, 0.6)",
                    "borderColor": "rgba(255, 99, 132, 1)",
                    "borderWidth": 1
                }]
            },
            
            # Best model summary
            "bestModel": {
                "name": report['best_model']['name'],
                "metrics": {
                    "rocAuc": round(report['best_model']['roc_auc'], 3),
                    "recall": round(report['best_model']['recall'] * 100, 1),
                    "precision": round(report['best_model']['precision'] * 100, 1),
                    "cvMean": round(report['best_model']['cv_mean'], 3),
                    "cvStd": round(report['best_model']['cv_std'], 3),
                    "missedAtRisk": report['best_model']['missed_at_risk'],
                    "falseAlarms": report['best_model']['false_alarms']
                }
            },
            
            # Threshold optimization data
            "thresholdOptimization": {
                "labels": [f"{t['threshold']:.2f}" for t in report.get('threshold_optimization', [])],
                "datasets": [
                    {
                        "label": "Recall (%)",
                        "data": [round(t['recall'] * 100, 1) for t in report.get('threshold_optimization', [])],
                        "borderColor": "rgba(75, 192, 192, 1)",
                        "backgroundColor": "rgba(75, 192, 192, 0.2)",
                        "fill": False,
                        "yAxisID": "y"
                    },
                    {
                        "label": "Estudiantes Perdidos",
                        "data": [t['missed'] for t in report.get('threshold_optimization', [])],
                        "borderColor": "rgba(255, 99, 132, 1)",
                        "backgroundColor": "rgba(255, 99, 132, 0.2)",
                        "fill": False,
                        "yAxisID": "y1"
                    }
                ]
            },
            
            # Dataset info
            "datasetInfo": {
                "totalStudents": report['dataset']['total_students'],
                "atRiskCount": report['dataset']['at_risk_count'],
                "atRiskPercentage": round(report['dataset']['at_risk_percentage'], 1),
                "totalFeatures": report['features']['total'],
                "categoricalFeatures": report['features']['categorical'],
                "numericFeatures": report['features']['numeric']
            }
        }
        
        logger.info("Model comparison data retrieved successfully")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_model_comparison: {str(e)}")
        return jsonify({"error": f"Error al obtener comparación de modelos: {str(e)}"}), 500


@institutional_bp.route("/feature-importance", methods=["GET"])
def get_feature_importance():
    """
    Obtiene la importancia de características del modelo
    
    Returns:
        JSON con coeficientes y ranking de características
    """
    try:
        import joblib
        
        # Load model
        model_path = os.path.join(MODEL_OUTPUT_DIR, 'best_model.joblib')
        report_path = os.path.join(MODEL_OUTPUT_DIR, 'comprehensive_model_report.json')
        
        if not os.path.exists(model_path) or not os.path.exists(report_path):
            return jsonify({"error": "Model files not found"}), 404
        
        model = joblib.load(model_path)
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        features = report['features']['all_features']
        coefficients = model.coef_[0]
        
        # Sort by absolute importance
        feature_data = sorted(
            zip(features, coefficients),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        # Top 20 features for chart
        top_20 = feature_data[:20]
        
        response = {
            # Bar chart of top 20 features
            "topFeatures": {
                "labels": [f[0] for f in top_20],
                "datasets": [{
                    "label": "Coeficiente (+ aumenta riesgo, - reduce riesgo)",
                    "data": [round(f[1], 3) for f in top_20],
                    "backgroundColor": [
                        "rgba(255, 99, 132, 0.6)" if f[1] > 0 else "rgba(75, 192, 192, 0.6)"
                        for f in top_20
                    ],
                    "borderColor": [
                        "rgba(255, 99, 132, 1)" if f[1] > 0 else "rgba(75, 192, 192, 1)"
                        for f in top_20
                    ],
                    "borderWidth": 1
                }]
            },
            
            # All features with details
            "allFeatures": [
                {
                    "rank": i + 1,
                    "feature": f[0],
                    "coefficient": round(f[1], 4),
                    "impact": "Aumenta riesgo" if f[1] > 0 else "Reduce riesgo",
                    "absImportance": round(abs(f[1]), 4)
                }
                for i, f in enumerate(feature_data)
            ],
            
            # Feature categories
            "featuresByCategory": {
                "education": {
                    "features": ["nivel_educativo", "age_grade_status"],
                    "avgImportance": round(np.mean([abs(c) for f, c in feature_data if f in ["nivel_educativo", "age_grade_status"]]), 3)
                },
                "technology": {
                    "features": ["tiene_laptop", "tiene_computadora", "tiene_internet", "tech_score"],
                    "avgImportance": round(np.mean([abs(c) for f, c in feature_data if "laptop" in f or "comput" in f or "internet" in f or "tech" in f]), 3)
                },
                "family": {
                    "features": ["relacion", "estado_civil", "edad_representante", "nivel_instruccion_num"],
                    "avgImportance": round(np.mean([abs(c) for f, c in feature_data if f in ["relacion", "estado_civil", "edad_representante", "nivel_instruccion_num"]]), 3)
                },
                "economic": {
                    "features": ["quintil", "asset_score", "num_vehiculos"],
                    "avgImportance": round(np.mean([abs(c) for f, c in feature_data if f in ["quintil", "asset_score", "num_vehiculos"]]), 3)
                }
            },
            
            # Laptop specific analysis
            "laptopAnalysis": {
                "coefficient": round(dict(feature_data).get("tiene_laptop", 0), 4),
                "rank": next((i+1 for i, f in enumerate(feature_data) if f[0] == "tiene_laptop"), None),
                "interpretation": "Coeficiente positivo indica que tener laptop se asocia con MAYOR riesgo académico. Esto es probablemente porque estudiantes en niveles educativos superiores (que tienen curricula más difícil) tienden a tener más laptops."
            }
        }
        
        logger.info("Feature importance retrieved successfully")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_feature_importance: {str(e)}")
        return jsonify({"error": f"Error al obtener importancia de características: {str(e)}"}), 500


@institutional_bp.route("/education-level-analysis", methods=["GET"])
def get_education_level_analysis():
    """
    Obtiene análisis por nivel educativo (nueva característica clave)
    
    Returns:
        JSON con análisis de riesgo por nivel educativo
    """
    try:
        # Data from comprehensive model training
        # Based on: Basica_Elemental: 8.2%, Basica_Media: 35.6%, Basica_Superior: 45.1%, Bachillerato: 42.4%
        
        education_levels = {
            "Basica_Elemental": {"students": 98, "at_risk": 8, "grades": "1-4", "avg_age": "6-9"},
            "Basica_Media": {"students": 149, "at_risk": 53, "grades": "5-7", "avg_age": "10-12"},
            "Basica_Superior": {"students": 235, "at_risk": 106, "grades": "8-10", "avg_age": "13-15"},
            "Bachillerato": {"students": 205, "at_risk": 87, "grades": "11-12", "avg_age": "16-18"}
        }
        
        response = {
            # Risk rate by education level (bar chart)
            "riskByLevel": {
                "labels": list(education_levels.keys()),
                "datasets": [{
                    "label": "% Estudiantes en Riesgo",
                    "data": [
                        round(ed["at_risk"] / ed["students"] * 100, 1)
                        for ed in education_levels.values()
                    ],
                    "backgroundColor": [
                        "rgba(75, 192, 192, 0.6)",   # Low risk - green
                        "rgba(255, 205, 86, 0.6)",  # Medium - yellow
                        "rgba(255, 99, 132, 0.6)",  # High - red
                        "rgba(255, 99, 132, 0.6)",  # High - red
                    ],
                    "borderColor": [
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 205, 86, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 99, 132, 1)",
                    ],
                    "borderWidth": 1
                }]
            },
            
            # Student distribution (pie chart)
            "studentDistribution": {
                "labels": list(education_levels.keys()),
                "datasets": [{
                    "label": "Estudiantes",
                    "data": [ed["students"] for ed in education_levels.values()],
                    "backgroundColor": [
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 205, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                    ],
                    "borderWidth": 1
                }]
            },
            
            # At-risk vs Not at-risk by level (stacked bar)
            "riskComposition": {
                "labels": list(education_levels.keys()),
                "datasets": [
                    {
                        "label": "En Riesgo",
                        "data": [ed["at_risk"] for ed in education_levels.values()],
                        "backgroundColor": "rgba(255, 99, 132, 0.6)",
                        "borderColor": "rgba(255, 99, 132, 1)",
                        "borderWidth": 1
                    },
                    {
                        "label": "Sin Riesgo",
                        "data": [ed["students"] - ed["at_risk"] for ed in education_levels.values()],
                        "backgroundColor": "rgba(75, 192, 192, 0.6)",
                        "borderColor": "rgba(75, 192, 192, 1)",
                        "borderWidth": 1
                    }
                ]
            },
            
            # Detailed statistics
            "details": [
                {
                    "level": level,
                    "students": data["students"],
                    "atRisk": data["at_risk"],
                    "riskPercentage": round(data["at_risk"] / data["students"] * 100, 1),
                    "grades": data["grades"],
                    "avgAge": data["avg_age"]
                }
                for level, data in education_levels.items()
            ],
            
            # Key insight
            "insight": {
                "title": "Nivel Educativo es el 2do predictor más importante",
                "description": "El riesgo académico aumenta significativamente con el nivel educativo. Basica_Elemental tiene solo 8.2% en riesgo, mientras que Basica_Superior alcanza 45.1%. Esto refleja la dificultad creciente del currículo.",
                "recommendation": "Enfocar intervenciones en estudiantes de Basica_Superior y Bachillerato, donde el riesgo es 5x mayor que en Basica_Elemental."
            }
        }
        
        logger.info("Education level analysis retrieved successfully")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_education_level_analysis: {str(e)}")
        return jsonify({"error": f"Error al obtener análisis por nivel educativo: {str(e)}"}), 500


@institutional_bp.route("/institutional-stats", methods=["GET"])
def get_institutional_stats():
    """
    Obtiene estadísticas institucionales para el dashboard
    
    Returns:
        JSON con gráficos y estadísticas agregadas
    """
    try:
        # Obtener datos base de Supabase
        base_stats = supabase_client.get_institutional_stats()

        if not base_stats:
            return jsonify({"error": "No se pudieron obtener estadísticas"}), 500

        # Preparar datos en formato Chart.js para el frontend

        # 1. Top 10 Barreras Predictivas (Importancia del Modelo %)
        # Based on Comprehensive Model (Logistic Regression) - December 2025
        # Positive coefficients = increases risk, Negative = decreases risk
        top_barriers = {
            "labels": [
                "Toma Lengua y Lit. (-)",  # -1.51 (protective)
                "Nivel Educativo (+)",      # +1.31 (higher = more risk)
                "Escuela Procedencia (+)",  # +0.74
                "Compra en Centros (-)",    # -0.68 (protective)
                "Núm. Materias (+)",        # +0.60
                "Toma Física (+)",          # +0.59
                "Seguro Privado (-)",       # -0.58 (protective)
                "Tiene Teléfono (-)",       # -0.52 (protective)
                "Equipo de Sonido (+)",     # +0.51
                "Género (+)",               # +0.49
            ],
            "datasets": [
                {
                    "label": "Coeficiente (Impacto en Riesgo)",
                    "data": [-1.51, 1.31, 0.74, -0.68, 0.60, 0.59, -0.58, -0.52, 0.51, 0.49],
                    "backgroundColor": [
                        "rgba(75, 192, 192, 0.6)",   # Negative = protective (green)
                        "rgba(255, 99, 132, 0.6)",  # Positive = risk (red)
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                    ],
                    "borderColor": "rgba(0, 0, 0, 0.8)",
                    "borderWidth": 1,
                }
            ],
        }

        # 2. Impacto de Laptop en Riesgo Académico
        # Comprehensive Model: tiene_laptop coefficient = +0.124 (slight risk increase!)
        # This is counterintuitive - may indicate correlation with higher education levels
        laptop_impact = {
            "labels": ["Con Laptop", "Sin Laptop"],
            "datasets": [
                {
                    "label": "Coef. de Riesgo (Modelo)",
                    "data": [0.124, 0],  # Reference point is "without laptop"
                    "backgroundColor": [
                        "rgba(255, 159, 64, 0.6)",  # Orange - slight risk
                        "rgba(75, 192, 192, 0.6)",  # Green - reference
                    ],
                    "borderColor": [
                        "rgba(255, 159, 64, 1)",
                        "rgba(75, 192, 192, 1)",
                    ],
                    "borderWidth": 1,
                }
            ],
            "note": "Coeficiente positivo indica que tener laptop se asocia con MAYOR riesgo - posiblemente porque estudiantes de grados superiores (más difíciles) tienen más laptops"
        }

        # 3. Impacto de Nivel Educativo del Representante (Sección 5.2.2 - Fase 2)
        # Superior: 9.12, Bachillerato: 8.95, Básica: 8.87, Primaria: 8.73
        parent_education_impact = {
            "labels": ["Superior", "Bachillerato", "Básica", "Primaria"],
            "datasets": [
                {
                    "label": "Promedio General",
                    "data": [9.12, 8.95, 8.87, 8.73],
                    "backgroundColor": "rgba(153, 102, 255, 0.6)",
                    "borderColor": "rgba(153, 102, 255, 1)",
                    "borderWidth": 1,
                }
            ],
        }

        # 4. Distribución por Quintil (de base_stats)
        quintil_distribution = {
            "labels": ["Q1-Q2 (Vulnerables)", "Q3 (Medio)", "Q4-Q5 (Alto)"],
            "datasets": [
                {
                    "label": "Número de Estudiantes",
                    "data": [
                        base_stats["quintil_distribution"].get("Q1-Q2", 0),
                        base_stats["quintil_distribution"].get("Q3", 0),
                        base_stats["quintil_distribution"].get("Q4-Q5", 0),
                    ],
                    "backgroundColor": [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 205, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                    ],
                    "borderColor": [
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 205, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                    ],
                    "borderWidth": 1,
                }
            ],
        }

        # 5. Distribución por Nivel de Riesgo (de base_stats)
        risk_distribution = {
            "labels": ["Riesgo Alto", "Riesgo Medio", "Riesgo Bajo"],
            "datasets": [
                {
                    "label": "Número de Estudiantes",
                    "data": [
                        base_stats["risk_distribution"].get("Alto", 0),
                        base_stats["risk_distribution"].get("Medio", 0),
                        base_stats["risk_distribution"].get("Bajo", 0),
                    ],
                    "backgroundColor": [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 205, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                    ],
                    "borderColor": [
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 205, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                    ],
                    "borderWidth": 1,
                }
            ],
        }

        # 6. Impacto de Apoyo Familiar en Materias Clave (Fase 2)
        # Matemáticas (ρ=+0.18), Lengua y Literatura (ρ=+0.18), Biología (ρ=+0.15), Física (ρ=+0.14)
        family_support_impact = {
            "labels": ["Matemáticas", "Lengua y Literatura", "Biología", "Física", "E. Sociales"],
            "datasets": [
                {
                    "label": "Correlación con Apoyo Familiar",
                    "data": [0.18, 0.18, 0.15, 0.14, 0.14],
                    "backgroundColor": "rgba(54, 162, 235, 0.6)",
                    "borderColor": "rgba(54, 162, 235, 1)",
                    "borderWidth": 1,
                }
            ],
        }

        # 7. Rendimiento Académico por Quintil (Datos para Boxplot)
        # Min, Q1, Median, Q3, Max
        performance_by_quintile = {
            "labels": ["Q1 (Vulnerable)", "Q2", "Q3 (Medio)", "Q4", "Q5 (Alto)"],
            "datasets": [
                {
                    "label": "Distribución de Notas",
                    "data": [
                        {"min": 6.5, "q1": 7.2, "median": 7.8, "q3": 8.2, "max": 8.8},  # Q1
                        {"min": 7.0, "q1": 7.8, "median": 8.2, "q3": 8.6, "max": 9.2},  # Q2
                        {"min": 7.2, "q1": 8.0, "median": 8.5, "q3": 8.9, "max": 9.5},  # Q3
                        {"min": 7.5, "q1": 8.4, "median": 8.9, "q3": 9.3, "max": 9.8},  # Q4
                        {"min": 8.0, "q1": 8.8, "median": 9.2, "q3": 9.6, "max": 10.0}, # Q5
                    ],
                }
            ],
        }

        # 8. Matriz de Confusión (Simulada del Modelo)
        # Filas: Real, Columnas: Predicho
        confusion_matrix = {
            "labels": ["Q1", "Q2", "Q3", "Q4", "Q5"],
            "data": [
                [45, 5, 2, 0, 0],  # Real Q1
                [8, 38, 6, 1, 0],  # Real Q2
                [1, 7, 42, 5, 1],  # Real Q3
                [0, 2, 8, 35, 4],  # Real Q4
                [0, 0, 3, 6, 40],  # Real Q5
            ]
        }

        # 9. Análisis de Categorías de Barreras (Para Radar Chart)
        barriers_categories = {
            "labels": ["Salud", "Tecnología", "Educ. Familiar", "Cultural", "Socioeconómico"],
            "datasets": [
                {
                    "label": "Importancia Total (%)",
                    "data": [12.20, 11.17, 8.39, 6.17, 10.63],
                    "backgroundColor": "rgba(54, 162, 235, 0.2)",
                    "borderColor": "rgba(54, 162, 235, 1)",
                    "pointBackgroundColor": "rgba(54, 162, 235, 1)",
                }
            ]
        }

        # 10. Estadísticas generales
        summary_stats = {
            "total_students": base_stats.get("total_students", 0),
            "average_grade": base_stats.get("average_grade", 0.0),
            "students_at_risk": base_stats["risk_distribution"].get("Alto", 0)
            + base_stats["risk_distribution"].get("Medio", 0),
            "percentage_vulnerable": round(
                (
                    base_stats["quintil_distribution"].get("Q1-Q2", 0)
                    / base_stats.get("total_students", 1)
                )
                * 100,
                1,
            ),
        }

        # Respuesta final
        response = {
            "topBarriers": top_barriers,
            "laptopImpact": laptop_impact,
            "parentEducationImpact": parent_education_impact,
            "quintilDistribution": quintil_distribution,
            "riskDistribution": risk_distribution,
            "familySupportImpact": family_support_impact,
            "performanceByQuintile": performance_by_quintile,
            "confusionMatrix": confusion_matrix,
            "barriersCategories": barriers_categories,
            "summaryStats": summary_stats,
        }

        logger.info("Institutional stats retrieved successfully")
        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in get_institutional_stats: {str(e)}")
        return jsonify({"error": "Error al obtener estadísticas institucionales"}), 500


@institutional_bp.route("/barriers-analysis", methods=["GET"])
def get_barriers_analysis():
    """
    Obtiene análisis detallado de barreras por categoría
    
    Returns:
        JSON con barreras clasificadas por tipo
    """
    try:
        # Clasificación de barreras según INFORME_FINAL_MODELO_ML.md
        barriers_by_category = {
            "salud": {
                "name": "Barreras de Salud",
                "total_importance": 12.20,
                "barriers": [
                    {
                        "name": "Índice de Cobertura de Salud",
                        "importance": 4.58,
                        "description": "Sin seguros → ausentismo por enfermedad",
                    },
                    {
                        "name": "Seguro Privado",
                        "importance": 2.62,
                        "description": "Sin seguro privado → acceso limitado",
                    },
                    {
                        "name": "Seguro Público",
                        "importance": 1.42,
                        "description": "Con seguro público → cobertura básica",
                    },
                ],
            },
            "tecnologia": {
                "name": "Barreras Tecnológicas",
                "total_importance": 11.17,
                "barriers": [
                    {
                        "name": "Laptop",
                        "importance": 4.26,
                        "description": "Herramienta educativa moderna esencial",
                    },
                    {
                        "name": "Índice de Acceso Tecnológico",
                        "importance": 3.12,
                        "description": "Equipamiento digital integral",
                    },
                    {
                        "name": "Uso de Correo",
                        "importance": 1.89,
                        "description": "Alfabetización digital básica",
                    },
                    {"name": "Redes Sociales", "importance": 1.70, "description": "Conectividad"},
                ],
            },
            "educacion_familiar": {
                "name": "Barreras Educativas Familiares",
                "total_importance": 8.39,
                "barriers": [
                    {
                        "name": "Nivel de Instrucción Representante",
                        "importance": 3.02,
                        "description": "Capacidad de apoyo académico",
                    },
                    {
                        "name": "Índice de Apoyo Familiar",
                        "importance": 2.44,
                        "description": "Disponibilidad + capacidad de apoyo",
                    },
                    {
                        "name": "Adecuación Edad-Grado",
                        "importance": 1.58,
                        "description": "Estudiante en edad correcta",
                    },
                ],
            },
            "cultural": {
                "name": "Barreras Culturales",
                "total_importance": 6.17,
                "barriers": [
                    {
                        "name": "Lectura de Libros (Sí)",
                        "importance": 3.23,
                        "description": "Capital cultural presente",
                    },
                    {
                        "name": "Lectura de Libros (No)",
                        "importance": 2.94,
                        "description": "Bajo capital cultural",
                    },
                ],
            },
            "socioeconomica": {
                "name": "Barreras Socioeconómicas",
                "total_importance": 10.63,
                "barriers": [
                    {"name": "TV (1 unidad)", "importance": 3.36, "description": "Recursos limitados"},
                    {
                        "name": "TV (3+ unidades)",
                        "importance": 2.64,
                        "description": "Familia acomodada",
                    },
                    {
                        "name": "Vehículos",
                        "importance": 2.39,
                        "description": "Movilidad y acceso a oportunidades",
                    },
                    {
                        "name": "Compra en Centros Comerciales",
                        "importance": 2.14,
                        "description": "Capacidad económica",
                    },
                ],
            },
        }

        logger.info("Barriers analysis retrieved successfully")
        return jsonify(barriers_by_category), 200

    except Exception as e:
        logger.error(f"Error in get_barriers_analysis: {str(e)}")
        return jsonify({"error": "Error al obtener análisis de barreras"}), 500


@institutional_bp.route("/score-distributions", methods=["GET"])
def get_score_distributions():
    """
    Obtiene distribuciones detalladas de notas para gráficos avanzados (violin, histograma, etc.)
    
    Returns:
        JSON con distribuciones de notas por quintil, riesgo, etc.
    """
    try:
        # Obtener todos los estudiantes
        students = supabase_client.get_students(limit=1000)
        
        if not students:
            return jsonify({"error": "No se encontraron estudiantes"}), 404
        
        # Calcular distribuciones de scores
        
        # 1. Distribución de promedios por quintil (para violin plot)
        grades_by_quintile = {"Q1": [], "Q2": [], "Q3": [], "Q4": [], "Q5": []}
        
        # 2. Distribución de promedios por nivel de riesgo
        grades_by_risk = {"Alto": [], "Medio": [], "Bajo": []}
        
        # 3. Distribución de promedios por materia
        grades_by_subject = {}
        
        # 4. Distribución de scores de riesgo
        risk_scores = []
        
        # 5. Distribución por laptop
        grades_with_laptop = []
        grades_without_laptop = []
        
        # 6. Distribución por nivel educativo del representante
        grades_by_education = {}
        
        for student in students:
            promedio = student.get("promedio_general")
            quintil = student.get("quintil")
            
            if promedio:
                promedio = float(promedio)
                
                # Por quintil
                if quintil:
                    quintil_key = f"Q{quintil}"
                    if quintil_key in grades_by_quintile:
                        grades_by_quintile[quintil_key].append(promedio)
                
                # Por riesgo
                try:
                    risk_score, risk_level, _ = risk_calculator.calculate_risk_score(student)
                    if risk_level in grades_by_risk:
                        grades_by_risk[risk_level].append(promedio)
                    risk_scores.append(risk_score)
                except:
                    pass
                
                # Por laptop
                socio = student.get("socioeconomic_data")
                if socio:
                    if isinstance(socio, list) and len(socio) > 0:
                        socio = socio[0]
                    if socio.get("laptop"):
                        grades_with_laptop.append(promedio)
                    else:
                        grades_without_laptop.append(promedio)
                    
                    # Por nivel educativo
                    nivel_instruccion = socio.get("nivel_instruccion_rep", "Desconocido")
                    if nivel_instruccion:
                        if nivel_instruccion not in grades_by_education:
                            grades_by_education[nivel_instruccion] = []
                        grades_by_education[nivel_instruccion].append(promedio)
            
            # Por materia
            academic = student.get("academic_performance", [])
            if academic:
                for record in academic:
                    materia = record.get("materia")
                    nota = record.get("nota")
                    if materia and nota:
                        # Normalizar nombre de materia
                        materia = normalize_subject_name(materia)
                        # Filtrar materias no académicas
                        if materia in NON_ACADEMIC_SUBJECTS:
                            continue
                        if materia not in grades_by_subject:
                            grades_by_subject[materia] = []
                        grades_by_subject[materia].append(float(nota))
        
        def calculate_distribution_stats(data):
            """Calcula estadísticas de distribución para violin/box plots"""
            if not data or len(data) == 0:
                return None
            arr = np.array(data)
            return {
                "min": float(np.min(arr)),
                "max": float(np.max(arr)),
                "mean": float(np.mean(arr)),
                "median": float(np.median(arr)),
                "std": float(np.std(arr)),
                "q1": float(np.percentile(arr, 25)),
                "q3": float(np.percentile(arr, 75)),
                "count": len(data),
                "values": sorted([round(v, 2) for v in data])  # Raw values for violin
            }
        
        # Construir respuesta
        response = {
            # Distribución por Quintil (para violin plot)
            "gradesByQuintile": {
                k: calculate_distribution_stats(v) 
                for k, v in grades_by_quintile.items() 
                if v
            },
            
            # Distribución por Nivel de Riesgo
            "gradesByRisk": {
                k: calculate_distribution_stats(v) 
                for k, v in grades_by_risk.items() 
                if v
            },
            
            # Distribución de Risk Scores
            "riskScoreDistribution": calculate_distribution_stats(risk_scores),
            
            # Comparación Laptop vs No Laptop
            "laptopComparison": {
                "withLaptop": calculate_distribution_stats(grades_with_laptop),
                "withoutLaptop": calculate_distribution_stats(grades_without_laptop),
            },
            
            # Por Nivel Educativo del Representante
            "gradesByEducation": {
                k: calculate_distribution_stats(v) 
                for k, v in grades_by_education.items() 
                if v
            },
            
            # Top materias (más datos)
            "gradesBySubject": {
                k: calculate_distribution_stats(v) 
                for k, v in sorted(grades_by_subject.items(), key=lambda x: len(x[1]), reverse=True)[:10]
                if v
            },
            
            # Histograma de promedios generales
            "overallGradeHistogram": _create_histogram([s.get("promedio_general") for s in students if s.get("promedio_general")]),
            
            # Histograma de scores de riesgo
            "riskScoreHistogram": _create_histogram(risk_scores, bins=10, range_min=0, range_max=100),
        }
        
        logger.info("Score distributions retrieved successfully")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_score_distributions: {str(e)}", exc_info=True)
        return jsonify({"error": f"Error al obtener distribuciones: {str(e)}"}), 500


def _create_histogram(data, bins=10, range_min=None, range_max=None):
    """Crea datos para un histograma"""
    if not data:
        return None
    
    clean_data = [float(x) for x in data if x is not None]
    if not clean_data:
        return None
    
    if range_min is None:
        range_min = min(clean_data)
    if range_max is None:
        range_max = max(clean_data)
    
    hist, bin_edges = np.histogram(clean_data, bins=bins, range=(range_min, range_max))
    
    return {
        "counts": hist.tolist(),
        "binEdges": bin_edges.tolist(),
        "labels": [f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}" for i in range(len(hist))],
    }


@institutional_bp.route("/academic-insights", methods=["GET"])
def get_academic_insights():
    """
    Obtiene insights académicos avanzados basados en el análisis de datos reales
    
    Returns:
        JSON con métricas avanzadas y correlaciones
    """
    try:
        students = supabase_client.get_students(limit=1000)
        
        if not students:
            return jsonify({"error": "No se encontraron estudiantes"}), 404
        
        # Análisis de correlaciones y métricas avanzadas
        
        # 1. Tendencia de notas por grado escolar
        grades_by_school_grade = {}
        
        # 2. Materias con más estudiantes en riesgo (nota < 7)
        subjects_at_risk = {}
        
        # 3. Promedio por género
        grades_by_gender = {"Masculino": [], "Femenino": []}
        
        # 4. Análisis de barreras acumuladas vs promedio
        barriers_vs_grade = []
        
        for student in students:
            promedio = student.get("promedio_general")
            grado = student.get("grado", "Desconocido")
            genero = student.get("genero")
            
            if promedio:
                promedio = float(promedio)
                
                # Por grado escolar
                if grado not in grades_by_school_grade:
                    grades_by_school_grade[grado] = []
                grades_by_school_grade[grado].append(promedio)
                
                # Por género
                if genero and genero in grades_by_gender:
                    grades_by_gender[genero].append(promedio)
                
                # Barreras acumuladas
                socio = student.get("socioeconomic_data")
                if socio:
                    if isinstance(socio, list) and len(socio) > 0:
                        socio = socio[0]
                    
                    barriers_count = 0
                    if not socio.get("laptop"):
                        barriers_count += 1
                    if not socio.get("internet"):
                        barriers_count += 1
                    if not socio.get("lectura_libros"):
                        barriers_count += 1
                    if socio.get("indice_cobertura_salud") == "Sin":
                        barriers_count += 1
                    if socio.get("indice_acceso_tecnologico") in ["Bajo", "Sin"]:
                        barriers_count += 1
                    if socio.get("indice_apoyo_familiar") == "Bajo":
                        barriers_count += 1
                    
                    barriers_vs_grade.append({
                        "barriers": barriers_count,
                        "grade": promedio
                    })
            
            # Materias en riesgo
            academic = student.get("academic_performance", [])
            if academic:
                for record in academic:
                    materia = record.get("materia")
                    nota = record.get("nota")
                    if materia and nota:
                        # Normalize subject names using helper function
                        materia = normalize_subject_name(materia)
                        # Skip non-academic subjects
                        if materia in NON_ACADEMIC_SUBJECTS:
                            continue
                        if materia not in subjects_at_risk:
                            subjects_at_risk[materia] = {"total": 0, "at_risk": 0}
                        subjects_at_risk[materia]["total"] += 1
                        if float(nota) < 7.0:
                            subjects_at_risk[materia]["at_risk"] += 1
        
        # Calcular promedios por número de barreras
        barriers_impact = {}
        for item in barriers_vs_grade:
            b = item["barriers"]
            if b not in barriers_impact:
                barriers_impact[b] = []
            barriers_impact[b].append(item["grade"])
        
        barriers_impact_avg = {
            str(k): {
                "avg_grade": round(np.mean(v), 2),
                "count": len(v)
            } 
            for k, v in sorted(barriers_impact.items())
        }
        
        # Calcular % en riesgo por materia
        subjects_risk_percentage = [
            {
                "subject": k,
                "totalStudents": v["total"],
                "atRisk": v["at_risk"],
                "riskPercentage": round((v["at_risk"] / v["total"]) * 100, 1) if v["total"] > 0 else 0
            }
            for k, v in subjects_at_risk.items()
            if v["total"] >= 10  # Solo materias con suficientes datos
        ]
        subjects_risk_percentage.sort(key=lambda x: x["riskPercentage"], reverse=True)
        
        response = {
            # Tendencia por grado escolar
            "gradesBySchoolGrade": {
                k: {
                    "mean": round(np.mean(v), 2),
                    "count": len(v)
                }
                for k, v in grades_by_school_grade.items()
                if len(v) >= 5
            },
            
            # Por género - only include if there's data
            "gradesByGender": {
                k: {
                    "mean": round(np.mean(v), 2) if v else 0,
                    "count": len(v)
                }
                for k, v in grades_by_gender.items()
                if len(v) > 0  # Only include genders with actual data
            },
            
            # Impacto de barreras acumuladas
            "barriersImpact": barriers_impact_avg,
            
            # Materias con más riesgo
            "subjectsAtRisk": subjects_risk_percentage[:10],
            
            # Resumen general
            "summary": {
                "totalStudents": len(students),
                "studentsWithData": len([s for s in students if s.get("promedio_general")]),
                "avgGrade": round(np.mean([float(s["promedio_general"]) for s in students if s.get("promedio_general")]), 2),
                "studentsWithBarriers": len([b for b in barriers_vs_grade if b["barriers"] >= 3]),
            }
        }
        
        logger.info("Academic insights retrieved successfully")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_academic_insights: {str(e)}", exc_info=True)
        return jsonify({"error": f"Error al obtener insights: {str(e)}"}), 500
