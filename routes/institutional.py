"""
Rutas relacionadas con estadísticas institucionales

Endpoints:
- GET /api/institutional-stats: Estadísticas globales para la vista institucional
"""
from flask import Blueprint, jsonify
from services.supabase_client import supabase_client
import logging

logger = logging.getLogger(__name__)

institutional_bp = Blueprint("institutional", __name__)


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
        # Basado en INFORME_FINAL_MODELO_ML.md - Top 20 Barreras
        top_barriers = {
            "labels": [
                "Edad Representante",
                "Cobertura Salud",
                "Laptop",
                "Edad Estudiante",
                "TV en Hogar",
                "Lectura Libros",
                "Acceso Tecnológico",
                "Nivel Instrucción Rep.",
                "Lectura (Ausencia)",
                "Número Hermanos",
            ],
            "datasets": [
                {
                    "label": "Importancia (%)",
                    "data": [5.84, 4.58, 4.26, 3.53, 3.36, 3.23, 3.12, 3.02, 2.94, 2.68],
                    "backgroundColor": "rgba(255, 99, 132, 0.6)",
                    "borderColor": "rgba(255, 99, 132, 1)",
                    "borderWidth": 1,
                }
            ],
        }

        # 2. Impacto de Laptop en Promedio (Sección 5.2.2 - Fase 2)
        # Con laptop: 8.97, Sin laptop: 8.85 (diferencia +0.12, p=0.043)
        laptop_impact = {
            "labels": ["Con Laptop", "Sin Laptop"],
            "datasets": [
                {
                    "label": "Promedio General",
                    "data": [8.97, 8.85],
                    "backgroundColor": [
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                    ],
                    "borderColor": [
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 159, 64, 1)",
                    ],
                    "borderWidth": 1,
                }
            ],
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
        # Matemáticas (ρ=+0.18), Biología (ρ=+0.15), Física (ρ=+0.14)
        family_support_impact = {
            "labels": ["Matemáticas", "Animación Lectura", "Biología", "Física", "E. Sociales"],
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

        # 7. Estadísticas generales
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
