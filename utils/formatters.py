"""
Formateadores de respuestas JSON
"""
from datetime import datetime


def format_student_for_list(student, risk_score, risk_level, barriers):
    """
    Formatea un estudiante para la lista SAT
    
    Args:
        student: Datos del estudiante
        risk_score: Score de riesgo calculado
        risk_level: Nivel de riesgo
        barriers: Lista de barreras
    
    Returns:
        dict: Estudiante formateado
    """
    return {
        "id": student.get("id"),
        "name": student.get("nombre"),
        "course": student.get("grado"),
        "risk_level": risk_level,
        "risk_score": round(risk_score, 2),
        "key_barriers": [b["name"] for b in barriers[:3]],
        "promedio_general": round(student.get("promedio_general", 0.0), 2),
    }


def format_student_profile(student, risk_data, barriers, grades, attendance):
    """
    Formatea un perfil completo de estudiante
    
    Args:
        student: Datos básicos del estudiante
        risk_data: Datos de riesgo (score, level, components)
        barriers: Lista de barreras
        grades: Calificaciones por materia
        attendance: Datos de asistencia
    
    Returns:
        dict: Perfil formateado
    """
    risk_score, risk_level, components = risk_data

    return {
        "id": student.get("id"),
        "name": student.get("nombre"),
        "course": student.get("grado"),
        "risk_level": risk_level,
        "risk_score": round(risk_score, 2),
        "risk_factors": format_risk_factors(components),
        "key_barriers": barriers,
        "key_grades": grades,
        "asistencia": format_attendance(attendance),
    }


def format_risk_factors(components):
    """
    Formatea los factores de riesgo para visualización
    
    Args:
        components: Diccionario con componentes del score
    
    Returns:
        list: Factores formateados
    """
    return [
        {
            "name": "Ausentismo",
            "value": f"{components['attendance']['score']:.1f} pts",
            "weight": f"{int(components['attendance']['weight'] * 100)}%",
        },
        {
            "name": "Quintil Socioeconómico",
            "value": f"{components['quintil']['score']:.1f} pts",
            "weight": f"{int(components['quintil']['weight'] * 100)}%",
        },
        {
            "name": "Rendimiento Académico",
            "value": f"{components['grades']['score']:.1f} pts",
            "weight": f"{int(components['grades']['weight'] * 100)}%",
        },
        {
            "name": "Barreras Identificadas",
            "value": f"{components['barriers']['score']:.1f} pts",
            "weight": f"{int(components['barriers']['weight'] * 100)}%",
        },
    ]


def format_attendance(attendance_data):
    """
    Formatea datos de asistencia
    
    Args:
        attendance_data: Lista de registros de asistencia
    
    Returns:
        dict: Asistencia formateada
    """
    if not attendance_data:
        return {
            "total_inasistencias": 0,
            "faltas_justificadas": 0,
            "faltas_injustificadas": 0,
            "porcentaje_asistencia": 100.0,
        }

    latest = attendance_data[-1] if attendance_data else {}

    total = latest.get("total_inasistencias", 0)
    justificadas = latest.get("faltas_justificadas", 0)
    injustificadas = latest.get("faltas_injustificadas", 0)

    # Calcular porcentaje (asumiendo 20 días hábiles/mes)
    dias_habiles = 20
    porcentaje = ((dias_habiles - total) / dias_habiles) * 100

    return {
        "total_inasistencias": total,
        "faltas_justificadas": justificadas,
        "faltas_injustificadas": injustificadas,
        "porcentaje_asistencia": round(max(0, porcentaje), 2),
    }


def format_error_response(error_message, status_code=500):
    """
    Formatea una respuesta de error
    
    Args:
        error_message: Mensaje de error
        status_code: Código HTTP de estado
    
    Returns:
        tuple: (dict, status_code)
    """
    return {
        "error": error_message,
        "timestamp": datetime.utcnow().isoformat(),
    }, status_code


def format_success_response(data, message=None):
    """
    Formatea una respuesta exitosa
    
    Args:
        data: Datos a retornar
        message: Mensaje opcional
    
    Returns:
        dict: Respuesta formateada
    """
    response = {"data": data, "timestamp": datetime.utcnow().isoformat()}

    if message:
        response["message"] = message

    return response
