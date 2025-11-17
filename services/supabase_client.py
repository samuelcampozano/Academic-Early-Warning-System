"""
Cliente de Supabase para interactuar con la base de datos
"""
from supabase import create_client, Client
from config import get_config
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Cliente singleton para Supabase"""

    _instance = None
    _client: Client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Inicializa el cliente de Supabase"""
        config = get_config()
        url = config.SUPABASE_URL
        # Usar SERVICE_KEY para evitar restricciones RLS
        key = config.SUPABASE_SERVICE_KEY or config.SUPABASE_KEY

        if not url or not key:
            logger.error("Supabase credentials not configured")
            raise ValueError(
                "SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configurados en .env"
            )

        self._client = create_client(url, key)
        logger.info(f"Supabase client initialized successfully (using {'SERVICE_KEY' if config.SUPABASE_SERVICE_KEY else 'ANON_KEY'})")

    @property
    def client(self) -> Client:
        """Retorna la instancia del cliente de Supabase"""
        return self._client

    def get_students(self, limit=100):
        """
        Obtiene la lista de estudiantes
        
        Args:
            limit: Número máximo de estudiantes a retornar
            
        Returns:
            Lista de estudiantes
        """
        try:
            response = (
                self._client.table("students")
                .select(
                    """
                    *,
                    socioeconomic_data(*),
                    academic_performance(*),
                    attendance(*)
                """
                )
                .limit(limit)
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting students: {str(e)}", exc_info=True)
            return []

    def get_student_by_id(self, student_id):
        """
        Obtiene un estudiante específico por ID
        
        Args:
            student_id: ID del estudiante
            
        Returns:
            Datos del estudiante o None si no existe
        """
        try:
            response = (
                self._client.table("students")
                .select(
                    """
                    *,
                    socioeconomic_data(*),
                    academic_performance(*),
                    attendance(*)
                """
                )
                .eq("id", student_id)
                .maybe_single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting student {student_id}: {str(e)}", exc_info=True)
            return None

    def get_institutional_stats(self):
        """
        Obtiene estadísticas institucionales agregadas
        
        Returns:
            Diccionario con estadísticas
        """
        try:
            # Obtener todos los estudiantes con sus datos
            students = self.get_students(limit=1000)

            stats = {
                "total_students": len(students),
                "quintil_distribution": self._calculate_quintil_distribution(students),
                "risk_distribution": self._calculate_risk_distribution(students),
                "average_grade": self._calculate_average_grade(students),
            }

            return stats
        except Exception as e:
            logger.error(f"Error getting institutional stats: {str(e)}")
            return None

    def _calculate_quintil_distribution(self, students):
        """Calcula la distribución por quintil"""
        distribution = {"Q1-Q2": 0, "Q3": 0, "Q4-Q5": 0}

        for student in students:
            quintil_group = (student.get("quintil_agrupado") or "").lower()
            if "bajo" in quintil_group:
                distribution["Q1-Q2"] += 1
            elif "medio" in quintil_group:
                distribution["Q3"] += 1
            elif "alto" in quintil_group or "acomodado" in quintil_group:
                distribution["Q4-Q5"] += 1

        return distribution

    def _calculate_risk_distribution(self, students):
        """Calcula la distribución por nivel de riesgo"""
        from services.risk_calculator import risk_calculator
        
        distribution = {"Alto": 0, "Medio": 0, "Bajo": 0}

        for student in students:
            try:
                _, risk_level, _ = risk_calculator.calculate_risk_score(student)
                distribution[risk_level] = distribution.get(risk_level, 0) + 1
            except Exception as e:
                logger.debug(f"Error calculating risk for student {student.get('id')}: {e}")
                distribution["Bajo"] += 1

        return distribution

    def _calculate_average_grade(self, students):
        """Calcula el promedio general de calificaciones"""
        total_grade = 0
        count = 0

        for student in students:
            grade = student.get("promedio_general")
            if grade:
                total_grade += float(grade)
                count += 1

        return round(total_grade / count, 2) if count > 0 else 0.0

    def save_prediction(self, student_id, risk_score, risk_level, predicted_quintil):
        """
        Guarda una predicción de riesgo en la base de datos
        
        Args:
            student_id: ID del estudiante
            risk_score: Score de riesgo calculado
            risk_level: Nivel de riesgo (Alto/Medio/Bajo)
            predicted_quintil: Quintil predicho por el modelo
        """
        try:
            config = get_config()
            data = {
                "student_id": student_id,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "predicted_quintil": predicted_quintil,
                "model_version": config.MODEL_VERSION,
            }

            response = self._client.table("risk_predictions").insert(data).execute()
            logger.info(f"Prediction saved for student {student_id}")
            return response.data
        except Exception as e:
            logger.error(f"Error saving prediction for {student_id}: {str(e)}")
            return None


# Instancia global del cliente
supabase_client = SupabaseClient()
