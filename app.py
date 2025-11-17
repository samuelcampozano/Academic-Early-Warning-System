"""
Academic Early Warning System - Flask Backend
Aplicación principal del sistema de alerta temprana académica

Autor: Marco (Tesis - Unidad Educativa Juan Montalvo)
Fecha: Noviembre 2025
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import get_config
import logging

# Importar blueprints de rutas
from routes.students import students_bp
from routes.predictions import predictions_bp
from routes.institutional import institutional_bp


def create_app():
    """
    Factory function para crear la aplicación Flask
    """
    app = Flask(__name__)

    # Cargar configuración
    app.config.from_object(get_config())

    # Configurar CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}},
        supports_credentials=True,
    )

    # Configurar logging
    logging.basicConfig(
        level=getattr(logging, app.config["LOG_LEVEL"]),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # Registrar blueprints (rutas)
    app.register_blueprint(students_bp, url_prefix="/api")
    app.register_blueprint(predictions_bp, url_prefix="/api")
    app.register_blueprint(institutional_bp, url_prefix="/api")

    # Ruta de health check
    @app.route("/")
    def index():
        return jsonify(
            {
                "message": "Academic Early Warning System API",
                "version": app.config["MODEL_VERSION"],
                "status": "running",
            }
        )

    @app.route("/health")
    def health():
        """Endpoint para verificar el estado del servidor"""
        return jsonify({"status": "healthy", "service": "flask-backend"}), 200

    # Manejador de errores
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint no encontrado"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=app.config["DEBUG"])
