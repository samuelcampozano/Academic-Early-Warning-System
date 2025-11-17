"""
Servicio para el cálculo de scores de riesgo académico

Basado en los hallazgos de la Fase 1 y Fase 2 del modelo:
- Quintil socioeconómico (25%)
- Asistencia (30%)
- Calificaciones (25%)
- Barreras identificadas (20%)
"""
import logging

logger = logging.getLogger(__name__)


class RiskCalculator:
    """
    Calcula el score de riesgo académico combinando múltiples factores
    """

    # Pesos de cada componente (deben sumar 1.0)
    QUINTIL_WEIGHT = 0.25
    ATTENDANCE_WEIGHT = 0.30
    GRADES_WEIGHT = 0.25
    BARRIERS_WEIGHT = 0.20

    # Top 20 barreras del modelo (Fase 1) con sus importancias
    BARRIER_IMPORTANCE = {
        "edad_representante": 5.84,
        "indice_cobertura_salud": 4.58,
        "laptop": 4.26,
        "edad": 3.53,
        "tv": 3.36,
        "lectura_libros": 3.23,
        "indice_acceso_tecnologico": 3.12,
        "nivel_instruccion": 3.02,
        "numero_hermanos": 2.68,
        "indice_apoyo_familiar": 2.44,
        "vehiculos": 2.39,
        "relacion": 2.21,
    }

    @staticmethod
    def calculate_risk_score(student_data):
        """
        Calcula el score de riesgo total para un estudiante

        Args:
            student_data: Diccionario con datos del estudiante

        Returns:
            tuple: (risk_score, risk_level, components_breakdown)
        """
        try:
            # Calcular cada componente
            quintil_score = RiskCalculator._calculate_quintil_score(student_data)
            attendance_score = RiskCalculator._calculate_attendance_score(student_data)
            grades_score = RiskCalculator._calculate_grades_score(student_data)
            barriers_score = RiskCalculator._calculate_barriers_score(student_data)

            # Score total ponderado
            total_score = (
                RiskCalculator.QUINTIL_WEIGHT * quintil_score
                + RiskCalculator.ATTENDANCE_WEIGHT * attendance_score
                + RiskCalculator.GRADES_WEIGHT * grades_score
                + RiskCalculator.BARRIERS_WEIGHT * barriers_score
            )

            # Clasificar nivel de riesgo
            risk_level = RiskCalculator._classify_risk_level(total_score)

            # Desglose de componentes
            components = {
                "quintil": {"score": quintil_score, "weight": RiskCalculator.QUINTIL_WEIGHT},
                "attendance": {"score": attendance_score, "weight": RiskCalculator.ATTENDANCE_WEIGHT},
                "grades": {"score": grades_score, "weight": RiskCalculator.GRADES_WEIGHT},
                "barriers": {"score": barriers_score, "weight": RiskCalculator.BARRIERS_WEIGHT},
            }

            return round(total_score, 2), risk_level, components

        except Exception as e:
            logger.error(f"Error calculating risk score: {str(e)}", exc_info=True)
            return 0.0, "Bajo", {}

    @staticmethod
    def _calculate_quintil_score(student_data):
        """
        Calcula score basado en quintil socioeconómico
        Q1-Q2 (Vulnerable) = 100
        Q3 (Medio) = 50
        Q4-Q5 (Alto) = 0
        """
        quintil = student_data.get("quintil") or 5
        quintil_group = (student_data.get("quintil_agrupado") or "").lower()

        if "bajo" in quintil_group or (quintil and quintil <= 2):
            return 100.0
        elif "medio" in quintil_group or quintil == 3:
            return 50.0
        else:
            return 0.0

    @staticmethod
    def _calculate_attendance_score(student_data):
        """
        Calcula score basado en asistencia
        Score más alto = peor asistencia
        """
        attendance_data = student_data.get("attendance", [])

        if not attendance_data:
            return 0.0

        # Tomar datos de asistencia más recientes
        latest_attendance = attendance_data[-1] if attendance_data else {}

        total_inasistencias = latest_attendance.get("total_inasistencias", 0)
        faltas_injustificadas = latest_attendance.get("faltas_injustificadas", 0)

        # Ponderación: faltas injustificadas pesan más
        score = (total_inasistencias * 10) + (faltas_injustificadas * 15)

        # Normalizar a escala 0-100
        return min(score, 100.0)

    @staticmethod
    def _calculate_grades_score(student_data):
        """
        Calcula score basado en calificaciones
        Score más alto = peores calificaciones
        """
        promedio_general = student_data.get("promedio_general", 10.0)

        # Obtener materias en riesgo (nota < 7.0)
        academic_performance = student_data.get("academic_performance", [])
        materias_en_riesgo = sum(
            1 for materia in academic_performance if materia.get("nota", 10.0) < 7.0
        )

        # Score basado en promedio (invertido: menor promedio = mayor score)
        promedio_score = max(0, (10.0 - promedio_general) * 10)

        # Penalización adicional por materias en riesgo
        materias_score = materias_en_riesgo * 15

        total_score = promedio_score + materias_score

        return min(total_score, 100.0)

    @staticmethod
    def _calculate_barriers_score(student_data):
        """
        Calcula score basado en barreras identificadas
        Score más alto = más barreras presentes
        """
        socioeconomic = student_data.get("socioeconomic_data", [])

        if not socioeconomic:
            return 0.0

        socio_data = socioeconomic[0] if socioeconomic else {}

        barrier_points = 0.0

        # Laptop (Top 3 barrera - 4.26%)
        if not socio_data.get("laptop", False):
            barrier_points += RiskCalculator.BARRIER_IMPORTANCE["laptop"]

        # Nivel de instrucción representante (Top 8 barrera - 3.02%)
        nivel = (socio_data.get("nivel_instruccion_rep") or "").lower()
        if "primaria" in nivel or "básica" in nivel:
            barrier_points += RiskCalculator.BARRIER_IMPORTANCE["nivel_instruccion"]

        # Lectura de libros (Top 6 barrera - 3.23%)
        if not socio_data.get("lectura_libros", False):
            barrier_points += RiskCalculator.BARRIER_IMPORTANCE["lectura_libros"]

        # Internet
        if not socio_data.get("internet", False):
            barrier_points += 2.0

        # Índices compuestos (pueden ser None/NULL)
        indice_salud = socio_data.get("indice_cobertura_salud") or ""
        if indice_salud and "sin" in indice_salud.lower():
            barrier_points += RiskCalculator.BARRIER_IMPORTANCE["indice_cobertura_salud"]

        indice_tech = socio_data.get("indice_acceso_tecnologico") or ""
        if indice_tech and ("bajo" in indice_tech.lower() or "sin" in indice_tech.lower()):
            barrier_points += RiskCalculator.BARRIER_IMPORTANCE[
                "indice_acceso_tecnologico"
            ]

        indice_apoyo = socio_data.get("indice_apoyo_familiar") or ""
        if indice_apoyo and "bajo" in indice_apoyo.lower():
            barrier_points += RiskCalculator.BARRIER_IMPORTANCE["indice_apoyo_familiar"]

        # Normalizar a escala 0-100 (máximo teórico ~30 puntos)
        normalized_score = (barrier_points / 30.0) * 100

        return min(normalized_score, 100.0)

    @staticmethod
    def _classify_risk_level(score):
        """
        Clasifica el nivel de riesgo según el score

        Args:
            score: Score de riesgo (0-100)

        Returns:
            str: 'Alto', 'Medio' o 'Bajo'
        """
        if score >= 70:
            return "Alto"
        elif score >= 40:
            return "Medio"
        else:
            return "Bajo"

    @staticmethod
    def get_key_barriers_list(student_data):
        """
        Obtiene la lista de barreras clave presentes en un estudiante

        Args:
            student_data: Diccionario con datos del estudiante

        Returns:
            list: Lista de barreras identificadas con sus valores e impacto
        """
        barriers = []
        socioeconomic = student_data.get("socioeconomic_data", [])

        if not socioeconomic:
            return barriers

        socio_data = socioeconomic[0] if socioeconomic else {}

        # Laptop
        if not socio_data.get("laptop", False):
            barriers.append(
                {
                    "name": "Sin laptop",
                    "value": "No",
                    "impact": "4.26% (Top 3 barrera)",
                }
            )

        # Nivel instrucción
        nivel = socio_data.get("nivel_instruccion_rep") or "Desconocido"
        if nivel and ("primaria" in nivel.lower() or "básica" in nivel.lower()):
            barriers.append(
                {
                    "name": "Nivel Instrucción Representante",
                    "value": nivel,
                    "impact": "3.02% (Top 8 barrera)",
                }
            )

        # Lectura libros
        if not socio_data.get("lectura_libros", False):
            barriers.append(
                {
                    "name": "No lee libros en casa",
                    "value": "No",
                    "impact": "3.23% (Top 6 barrera)",
                }
            )

        # Internet
        if not socio_data.get("internet", False):
            barriers.append(
                {"name": "Sin internet", "value": "No", "impact": "Brecha digital"}
            )

        # Cobertura salud
        indice_salud = socio_data.get("indice_cobertura_salud") or ""
        if indice_salud and "sin" in indice_salud.lower():
            barriers.append(
                {
                    "name": "Sin cobertura de salud",
                    "value": indice_salud,
                    "impact": "4.58% (Top 2 barrera)",
                }
            )

        # Apoyo familiar
        indice_apoyo = socio_data.get("indice_apoyo_familiar") or ""
        if indice_apoyo and "bajo" in indice_apoyo.lower():
            barriers.append(
                {
                    "name": "Apoyo familiar bajo",
                    "value": indice_apoyo,
                    "impact": "2.44% (Top 12 barrera)",
                }
            )

        return barriers


# Instancia global
risk_calculator = RiskCalculator()
