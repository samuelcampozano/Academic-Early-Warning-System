"""
Rutas relacionadas con estudiantes

Endpoints:
- GET /api/sat-list: Lista priorizada de estudiantes para el dashboard SAT
- GET /api/student/{id}: Perfil detallado de un estudiante
"""
from flask import Blueprint, jsonify, request
from services.supabase_client import supabase_client
from services.risk_calculator import risk_calculator
import logging

logger = logging.getLogger(__name__)

students_bp = Blueprint("students", __name__)


@students_bp.route("/sat-list", methods=["GET"])
def get_sat_list():
    """
    Obtiene la lista priorizada de estudiantes para el dashboard SAT
    
    Query params:
        - limit: Número máximo de estudiantes (default: 100)
        - risk_level: Filtrar por nivel de riesgo ('Alto', 'Medio', 'Bajo')
    
    Returns:
        JSON con lista de estudiantes ordenados por score de riesgo (descendente)
    """
    try:
        # Obtener parámetros
        limit = request.args.get("limit", 1000, type=int)
        risk_level_filter = request.args.get("risk_level", None)

        # Obtener estudiantes de la base de datos
        students = supabase_client.get_students(limit=limit)
        
        if not students:
            return jsonify([]), 200

        # Calcular score de riesgo para cada estudiante
        students_with_risk = []
        for student in students:
            risk_score, risk_level, _ = risk_calculator.calculate_risk_score(student)

            # Aplicar filtro de nivel de riesgo si se especificó
            if risk_level_filter and risk_level != risk_level_filter:
                continue

            # Obtener barreras clave
            key_barriers = risk_calculator.get_key_barriers_list(student)
            barrier_names = [b["name"] for b in key_barriers[:3]]  # Top 3

            # Contar materias en riesgo
            academic_performance = student.get("academic_performance", [])
            materias_en_riesgo = sum(
                1 for m in academic_performance if m.get("nota", 10.0) < 7.0
            )

            students_with_risk.append(
                {
                    "id": student.get("id"),
                    "name": student.get("nombre"),
                    "course": student.get("grado"),
                    "risk_level": risk_level,
                    "risk_score": risk_score,
                    "key_barriers": barrier_names,
                    "materias_en_riesgo": materias_en_riesgo,
                    "quintil": student.get("quintil_agrupado", "Desconocido"),
                }
            )

        # Ordenar por score de riesgo (descendente)
        students_with_risk.sort(key=lambda x: x["risk_score"], reverse=True)

        logger.info(f"Retrieved {len(students_with_risk)} students for SAT list")
        return jsonify(students_with_risk), 200

    except Exception as e:
        logger.error(f"Error in get_sat_list: {str(e)}", exc_info=True)
        return jsonify({"error": "Error al obtener la lista SAT"}), 500


@students_bp.route("/student/<student_id>", methods=["GET"])
def get_student_profile(student_id):
    """
    Obtiene el perfil detallado de un estudiante
    
    Args:
        student_id: ID del estudiante
    
    Returns:
        JSON con perfil completo del estudiante
    """
    try:
        # Obtener datos del estudiante
        student = supabase_client.get_student_by_id(student_id)

        if not student:
            return jsonify({"error": "Estudiante no encontrado"}), 404

        # Calcular score de riesgo
        risk_score, risk_level, components = risk_calculator.calculate_risk_score(
            student
        )

        # Obtener barreras clave
        key_barriers = risk_calculator.get_key_barriers_list(student)

        # Preparar factores de riesgo (solo quintil y barreras - modelo ML no usa attendance ni promedio)
        risk_factors = [
            {
                "name": "Quintil Socioeconómico",
                "value": _format_quintil(student.get("quintil_agrupado", "")),
                "weight": f"{int(components['quintil']['weight'] * 100)}%",
            },
            {
                "name": "Barreras Identificadas",
                "value": f"{len(key_barriers)} barreras",
                "weight": f"{int(components['barriers']['weight'] * 100)}%",
            },
        ]

        # Preparar calificaciones en materias clave
        key_grades = _get_key_grades(student.get("academic_performance", []))

        # Construir respuesta (sin asistencia ni promedio_general)
        profile = {
            "id": student.get("id"),
            "name": student.get("nombre"),
            "course": student.get("grado"),
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "key_barriers": key_barriers,
            "key_grades": key_grades,
        }

        logger.info(f"Retrieved profile for student {student_id}")
        return jsonify(profile), 200

    except Exception as e:
        logger.error(f"Error in get_student_profile: {str(e)}")
        return jsonify({"error": "Error al obtener el perfil del estudiante"}), 500


# Funciones auxiliares


def _format_quintil(quintil_agrupado):
    """Formatea el quintil agrupado"""
    if not quintil_agrupado:
        return "Desconocido"

    quintil_map = {
        "bajo": "Q1-Q2 (Vulnerable)",
        "medio": "Q3 (Medio)",
        "alto": "Q4-Q5 (Alto)",
        "acomodado": "Q4 (Acomodado)",
    }

    for key, value in quintil_map.items():
        if key in quintil_agrupado.lower():
            return value

    return quintil_agrupado


def _get_key_grades(academic_performance):
    """
    Obtiene las calificaciones en materias clave (las más afectadas por apoyo familiar)
    
    Materias clave según Fase 2:
    - Matemáticas (ρ=+0.18)
    - Biología (ρ=+0.15)
    - Física (ρ=+0.14)
    - Estudios Sociales (ρ=+0.14)
    """
    key_subjects = ["matemáticas", "biología", "física", "estudios sociales", "lengua"]

    key_grades = []
    for materia_data in academic_performance:
        materia_name = materia_data.get("materia", "").lower()

        # Verificar si es una materia clave
        is_key = any(key in materia_name for key in key_subjects)

        if is_key:
            key_grades.append(
                {
                    "subject": materia_data.get("materia"),
                    "grade": materia_data.get("nota", 0.0),
                    "avg": materia_data.get("promedio_curso", 0.0),
                }
            )

    # Ordenar por nota (ascendente) para mostrar primero las materias con menor rendimiento
    key_grades.sort(key=lambda x: x["grade"])

    return key_grades[:5]  # Top 5 materias
