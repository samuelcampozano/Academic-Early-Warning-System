"""
Modelos de base de datos usando SQLAlchemy
(Opcional - para usar con PostgreSQL directo sin Supabase)
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Student(Base):
    """Modelo de Estudiante"""

    __tablename__ = "students"

    id = Column(String, primary_key=True)
    nombre = Column(String, nullable=False)
    grado = Column(String, nullable=False)
    seccion = Column(String)
    edad = Column(Integer)
    genero = Column(String)
    quintil = Column(Integer)
    quintil_agrupado = Column(String)  # 'Bajo', 'Medio', 'Alto'
    promedio_general = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    socioeconomic_data = relationship("SocioeconomicData", back_populates="student")
    academic_performance = relationship("AcademicPerformance", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")
    risk_predictions = relationship("RiskPrediction", back_populates="student")


class SocioeconomicData(Base):
    """Modelo de Datos Socioeconómicos"""

    __tablename__ = "socioeconomic_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"))
    nivel_instruccion_rep = Column(String)
    edad_representante = Column(Integer)
    relacion = Column(String)
    estado_civil = Column(String)
    laptop = Column(Boolean)
    internet = Column(Boolean)
    computadora = Column(Boolean)
    lectura_libros = Column(Boolean)
    numero_hermanos = Column(Integer)
    tipo_vivienda = Column(String)
    indice_cobertura_salud = Column(String)
    indice_acceso_tecnologico = Column(String)
    indice_apoyo_familiar = Column(String)
    indice_accesibilidad_geografica = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relación
    student = relationship("Student", back_populates="socioeconomic_data")


class AcademicPerformance(Base):
    """Modelo de Rendimiento Académico"""

    __tablename__ = "academic_performance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"))
    materia = Column(String, nullable=False)
    nota = Column(Float)
    promedio_curso = Column(Float)
    periodo = Column(String)  # 'Q1', 'Q2', 'Final'
    year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relación
    student = relationship("Student", back_populates="academic_performance")


class Attendance(Base):
    """Modelo de Asistencia"""

    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"))
    total_inasistencias = Column(Integer)
    faltas_justificadas = Column(Integer)
    faltas_injustificadas = Column(Integer)
    atrasos = Column(Integer)
    mes = Column(String)
    year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relación
    student = relationship("Student", back_populates="attendance")


class RiskPrediction(Base):
    """Modelo de Predicciones de Riesgo"""

    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"))
    risk_score = Column(Float)
    risk_level = Column(String)  # 'Alto', 'Medio', 'Bajo'
    predicted_quintil = Column(Integer)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    model_version = Column(String)

    # Relación
    student = relationship("Student", back_populates="risk_predictions")
