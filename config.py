"""
Configuración de la aplicación Flask
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


class Config:
    """Configuración base de la aplicación"""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"
    ENV = os.getenv("FLASK_ENV", "development")

    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL")

    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Model
    MODEL_PATH = os.getenv("MODEL_PATH", "./models/trained/catboost_model.pkl")
    MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")

    # Application
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    MAX_STUDENTS_RETURN = int(os.getenv("MAX_STUDENTS_RETURN", 100))


class DevelopmentConfig(Config):
    """Configuración para desarrollo"""

    DEBUG = True
    ENV = "development"


class ProductionConfig(Config):
    """Configuración para producción"""

    DEBUG = False
    ENV = "production"


class TestingConfig(Config):
    """Configuración para testing"""

    TESTING = True
    DEBUG = True


# Configuración por defecto
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}


def get_config():
    """Obtiene la configuración según el entorno"""
    env = os.getenv("FLASK_ENV", "development")
    return config.get(env, config["default"])
