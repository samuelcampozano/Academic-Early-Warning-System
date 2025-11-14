"""
Datos mock para desarrollo y testing
(Usar cuando Supabase no esté configurado)
"""

MOCK_STUDENTS = [
    {
        "id": "EST001",
        "nombre": "Juan Pérez",
        "grado": "10mo EGB",
        "seccion": "A",
        "edad": 15,
        "genero": "Masculino",
        "quintil": 2,
        "quintil_agrupado": "Bajo",
        "promedio_general": 8.5,
        "socioeconomic_data": [
            {
                "nivel_instruccion_rep": "Básica",
                "edad_representante": 42,
                "relacion": "Madre",
                "estado_civil": "Casada",
                "laptop": False,
                "internet": True,
                "computadora": False,
                "lectura_libros": False,
                "numero_hermanos": 2,
                "tipo_vivienda": "Casa propia",
                "indice_cobertura_salud": "Básica",
                "indice_acceso_tecnologico": "Bajo",
                "indice_apoyo_familiar": "Medio",
                "indice_accesibilidad_geografica": "Moderado",
            }
        ],
        "academic_performance": [
            {"materia": "Matemáticas", "nota": 6.8, "promedio_curso": 8.5, "periodo": "Q1", "year": 2025},
            {"materia": "Física", "nota": 7.2, "promedio_curso": 8.3, "periodo": "Q1", "year": 2025},
            {"materia": "Lengua", "nota": 8.9, "promedio_curso": 8.7, "periodo": "Q1", "year": 2025},
            {"materia": "Estudios Sociales", "nota": 8.4, "promedio_curso": 8.6, "periodo": "Q1", "year": 2025},
            {"materia": "Biología", "nota": 7.5, "promedio_curso": 8.4, "periodo": "Q1", "year": 2025},
        ],
        "attendance": [
            {
                "total_inasistencias": 5,
                "faltas_justificadas": 2,
                "faltas_injustificadas": 3,
                "atrasos": 1,
                "mes": "Octubre",
                "year": 2025,
            }
        ],
        "risk_predictions": [
            {
                "risk_score": 72.5,
                "risk_level": "Alto",
                "predicted_quintil": 2,
                "prediction_date": "2025-10-15T10:30:00Z",
                "model_version": "1.0.0",
            }
        ],
    },
    {
        "id": "EST002",
        "nombre": "María González",
        "grado": "9no EGB",
        "seccion": "B",
        "edad": 14,
        "genero": "Femenino",
        "quintil": 4,
        "quintil_agrupado": "Alto",
        "promedio_general": 9.2,
        "socioeconomic_data": [
            {
                "nivel_instruccion_rep": "Superior",
                "edad_representante": 38,
                "relacion": "Padre",
                "estado_civil": "Casado",
                "laptop": True,
                "internet": True,
                "computadora": True,
                "lectura_libros": True,
                "numero_hermanos": 1,
                "tipo_vivienda": "Casa propia",
                "indice_cobertura_salud": "Completa",
                "indice_acceso_tecnologico": "Alto",
                "indice_apoyo_familiar": "Alto",
                "indice_accesibilidad_geografica": "Cerca",
            }
        ],
        "academic_performance": [
            {"materia": "Matemáticas", "nota": 9.5, "promedio_curso": 8.5, "periodo": "Q1", "year": 2025},
            {"materia": "Física", "nota": 9.0, "promedio_curso": 8.3, "periodo": "Q1", "year": 2025},
            {"materia": "Lengua", "nota": 9.3, "promedio_curso": 8.7, "periodo": "Q1", "year": 2025},
            {"materia": "Estudios Sociales", "nota": 9.1, "promedio_curso": 8.6, "periodo": "Q1", "year": 2025},
            {"materia": "Biología", "nota": 8.9, "promedio_curso": 8.4, "periodo": "Q1", "year": 2025},
        ],
        "attendance": [
            {
                "total_inasistencias": 1,
                "faltas_justificadas": 1,
                "faltas_injustificadas": 0,
                "atrasos": 0,
                "mes": "Octubre",
                "year": 2025,
            }
        ],
        "risk_predictions": [
            {
                "risk_score": 15.3,
                "risk_level": "Bajo",
                "predicted_quintil": 4,
                "prediction_date": "2025-10-15T10:31:00Z",
                "model_version": "1.0.0",
            }
        ],
    },
    {
        "id": "EST003",
        "nombre": "Carlos Ramírez",
        "grado": "8vo EGB",
        "seccion": "A",
        "edad": 13,
        "genero": "Masculino",
        "quintil": 3,
        "quintil_agrupado": "Medio",
        "promedio_general": 8.7,
        "socioeconomic_data": [
            {
                "nivel_instruccion_rep": "Bachillerato",
                "edad_representante": 40,
                "relacion": "Madre",
                "estado_civil": "Divorciada",
                "laptop": True,
                "internet": True,
                "computadora": False,
                "lectura_libros": True,
                "numero_hermanos": 0,
                "tipo_vivienda": "Departamento",
                "indice_cobertura_salud": "Básica",
                "indice_acceso_tecnologico": "Medio",
                "indice_apoyo_familiar": "Medio",
                "indice_accesibilidad_geografica": "Cerca",
            }
        ],
        "academic_performance": [
            {"materia": "Matemáticas", "nota": 8.4, "promedio_curso": 8.5, "periodo": "Q1", "year": 2025},
            {"materia": "Física", "nota": 8.6, "promedio_curso": 8.3, "periodo": "Q1", "year": 2025},
            {"materia": "Lengua", "nota": 8.9, "promedio_curso": 8.7, "periodo": "Q1", "year": 2025},
            {"materia": "Estudios Sociales", "nota": 8.5, "promedio_curso": 8.6, "periodo": "Q1", "year": 2025},
            {"materia": "Biología", "nota": 9.0, "promedio_curso": 8.4, "periodo": "Q1", "year": 2025},
        ],
        "attendance": [
            {
                "total_inasistencias": 2,
                "faltas_justificadas": 2,
                "faltas_injustificadas": 0,
                "atrasos": 1,
                "mes": "Octubre",
                "year": 2025,
            }
        ],
        "risk_predictions": [
            {
                "risk_score": 45.2,
                "risk_level": "Medio",
                "predicted_quintil": 3,
                "prediction_date": "2025-10-15T10:32:00Z",
                "model_version": "1.0.0",
            }
        ],
    },
]


def get_mock_students(limit=100):
    """
    Retorna estudiantes mock para testing
    
    Args:
        limit: Número máximo de estudiantes
    
    Returns:
        list: Lista de estudiantes mock
    """
    return MOCK_STUDENTS[:limit]


def get_mock_student_by_id(student_id):
    """
    Retorna un estudiante mock por ID
    
    Args:
        student_id: ID del estudiante
    
    Returns:
        dict o None: Estudiante encontrado
    """
    for student in MOCK_STUDENTS:
        if student["id"] == student_id:
            return student
    return None
