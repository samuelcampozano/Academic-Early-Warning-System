"""
Validadores de datos
"""
import re


def validate_student_id(student_id):
    """
    Valida que el ID de estudiante tenga formato correcto
    
    Args:
        student_id: ID a validar
    
    Returns:
        bool: True si es válido
    """
    if not student_id or not isinstance(student_id, str):
        return False

    # Formato: EST001, EST002, etc.
    pattern = r"^EST\d{3,}$"
    return bool(re.match(pattern, student_id))


def validate_grade_value(grade):
    """
    Valida que una calificación esté en el rango válido (0-10)
    
    Args:
        grade: Calificación a validar
    
    Returns:
        bool: True si es válida
    """
    try:
        grade_float = float(grade)
        return 0.0 <= grade_float <= 10.0
    except (ValueError, TypeError):
        return False


def validate_quintil(quintil):
    """
    Valida que el quintil esté en el rango válido (1-5)
    
    Args:
        quintil: Quintil a validar
    
    Returns:
        bool: True si es válido
    """
    try:
        quintil_int = int(quintil)
        return 1 <= quintil_int <= 5
    except (ValueError, TypeError):
        return False


def validate_risk_level(risk_level):
    """
    Valida que el nivel de riesgo sea válido
    
    Args:
        risk_level: Nivel de riesgo a validar
    
    Returns:
        bool: True si es válido
    """
    valid_levels = ["Alto", "Medio", "Bajo"]
    return risk_level in valid_levels


def sanitize_string(text):
    """
    Limpia y sanitiza un string
    
    Args:
        text: Texto a sanitizar
    
    Returns:
        str: Texto sanitizado
    """
    if not text:
        return ""

    # Remover caracteres especiales peligrosos
    text = str(text).strip()
    # Limitar longitud
    text = text[:500]

    return text


def validate_attendance_data(attendance):
    """
    Valida datos de asistencia
    
    Args:
        attendance: Diccionario con datos de asistencia
    
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = [
        "total_inasistencias",
        "faltas_justificadas",
        "faltas_injustificadas",
    ]

    for field in required_fields:
        if field not in attendance:
            return False, f"Campo requerido: {field}"

        try:
            value = int(attendance[field])
            if value < 0:
                return False, f"{field} no puede ser negativo"
        except (ValueError, TypeError):
            return False, f"{field} debe ser un número entero"

    # Validar lógica: total = justificadas + injustificadas
    total = attendance["total_inasistencias"]
    justificadas = attendance["faltas_justificadas"]
    injustificadas = attendance["faltas_injustificadas"]

    if total != (justificadas + injustificadas):
        return (
            False,
            "Total de inasistencias debe ser igual a justificadas + injustificadas",
        )

    return True, None
