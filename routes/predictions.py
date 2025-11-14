"""
Rutas relacionadas con predicciones del modelo ML

Endpoints:
- POST /api/predict: Genera predicción para un estudiante
- GET /api/predictions: Obtiene historial de predicciones
"""
from flask import Blueprint, jsonify, request
from services.supabase_client import supabase_client
from services.risk_calculator import risk_calculator
import logging

logger = logging.getLogger(__name__)

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.route("/predict", methods=["POST"])
def predict_risk():
    """
    Genera una predicción de riesgo para un estudiante
    
    Body (JSON):
        {
            "student_id": "EST001"
        }
    
    Returns:
        JSON con la predicción generada
    """
    try:
        data = request.get_json()

        if not data or "student_id" not in data:
            return jsonify({"error": "student_id es requerido"}), 400

        student_id = data["student_id"]

        # Obtener datos del estudiante
        student = supabase_client.get_student_by_id(student_id)

        if not student:
            return jsonify({"error": "Estudiante no encontrado"}), 404

        # Calcular score de riesgo
        risk_score, risk_level, components = risk_calculator.calculate_risk_score(
            student
        )

        # Predecir quintil (simplificado - en producción usarías el modelo CatBoost)
        predicted_quintil = _predict_quintil_from_barriers(student)

        # Guardar predicción en la base de datos
        prediction = supabase_client.save_prediction(
            student_id=student_id,
            risk_score=risk_score,
            risk_level=risk_level,
            predicted_quintil=predicted_quintil,
        )

        response = {
            "student_id": student_id,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "predicted_quintil": predicted_quintil,
            "components": components,
            "prediction_saved": prediction is not None,
        }

        logger.info(f"Prediction generated for student {student_id}: {risk_level}")
        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in predict_risk: {str(e)}")
        return jsonify({"error": "Error al generar predicción"}), 500


@predictions_bp.route("/predictions", methods=["GET"])
def get_predictions():
    """
    Obtiene el historial de predicciones
    
    Query params:
        - student_id: Filtrar por estudiante específico
        - limit: Número máximo de predicciones (default: 50)
    
    Returns:
        JSON con lista de predicciones
    """
    try:
        student_id = request.args.get("student_id", None)
        limit = request.args.get("limit", 50, type=int)

        # TODO: Implementar consulta a la tabla risk_predictions
        # Por ahora retornamos un ejemplo

        predictions = []

        logger.info(f"Retrieved {len(predictions)} predictions")
        return jsonify(predictions), 200

    except Exception as e:
        logger.error(f"Error in get_predictions: {str(e)}")
        return jsonify({"error": "Error al obtener predicciones"}), 500


@predictions_bp.route("/batch-predict", methods=["POST"])
def batch_predict():
    """
    Genera predicciones para múltiples estudiantes
    
    Body (JSON):
        {
            "student_ids": ["EST001", "EST002", ...]
        }
    
    Returns:
        JSON con lista de predicciones generadas
    """
    try:
        data = request.get_json()

        if not data or "student_ids" not in data:
            return jsonify({"error": "student_ids es requerido"}), 400

        student_ids = data["student_ids"]

        if not isinstance(student_ids, list):
            return jsonify({"error": "student_ids debe ser una lista"}), 400

        predictions = []

        for student_id in student_ids:
            try:
                # Obtener datos del estudiante
                student = supabase_client.get_student_by_id(student_id)

                if not student:
                    logger.warning(f"Student {student_id} not found, skipping")
                    continue

                # Calcular score de riesgo
                risk_score, risk_level, _ = risk_calculator.calculate_risk_score(
                    student
                )

                # Predecir quintil
                predicted_quintil = _predict_quintil_from_barriers(student)

                # Guardar predicción
                supabase_client.save_prediction(
                    student_id=student_id,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    predicted_quintil=predicted_quintil,
                )

                predictions.append(
                    {
                        "student_id": student_id,
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "predicted_quintil": predicted_quintil,
                    }
                )

            except Exception as e:
                logger.error(f"Error predicting for student {student_id}: {str(e)}")
                continue

        logger.info(f"Batch prediction completed: {len(predictions)} students")
        return (
            jsonify(
                {
                    "total_requested": len(student_ids),
                    "total_predicted": len(predictions),
                    "predictions": predictions,
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error in batch_predict: {str(e)}")
        return jsonify({"error": "Error en predicción por lotes"}), 500


# Funciones auxiliares


def _predict_quintil_from_barriers(student_data):
    """
    Predice el quintil basándose en las barreras identificadas
    (Simplificación - en producción se usaría el modelo CatBoost entrenado)
    
    Args:
        student_data: Datos del estudiante
    
    Returns:
        int: Quintil predicho (1-5)
    """
    socioeconomic = student_data.get("socioeconomic_data", [])

    if not socioeconomic:
        return 3  # Default: Q3 (Medio)

    socio_data = socioeconomic[0] if socioeconomic else {}

    # Contador de barreras presentes
    barriers_count = 0

    # Barreras tecnológicas
    if not socio_data.get("laptop", False):
        barriers_count += 1
    if not socio_data.get("internet", False):
        barriers_count += 1
    if not socio_data.get("computadora", False):
        barriers_count += 0.5

    # Barreras educativas
    nivel = socio_data.get("nivel_instruccion_rep", "").lower()
    if "primaria" in nivel:
        barriers_count += 1.5
    elif "básica" in nivel:
        barriers_count += 1

    # Barreras culturales
    if not socio_data.get("lectura_libros", False):
        barriers_count += 0.5

    # Barreras de salud
    indice_salud = socio_data.get("indice_cobertura_salud", "").lower()
    if "sin" in indice_salud:
        barriers_count += 1

    # Barreras de apoyo familiar
    indice_apoyo = socio_data.get("indice_apoyo_familiar", "").lower()
    if "bajo" in indice_apoyo:
        barriers_count += 1

    # Clasificación por número de barreras
    if barriers_count >= 5:
        return 1  # Q1 (Muy vulnerable)
    elif barriers_count >= 3:
        return 2  # Q2 (Vulnerable)
    elif barriers_count >= 1.5:
        return 3  # Q3 (Medio)
    elif barriers_count >= 0.5:
        return 4  # Q4 (Acomodado)
    else:
        return 5  # Q5 (Alto)
