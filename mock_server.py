
import json
from flask import Flask, jsonify, abort
from flask_cors import CORS

# --- Mock Data ---
# This data simulates the expected backend response structure
MOCK_STUDENTS = [
    {
        "id": "EST001",
        "nombre": "Juan Pérez García",
        "grado": "10mo A",
        "edad": 15,
        "quintil": 2,
        "risk_level": "Medio",
        "risk_score": 58.3,
        "key_barriers": ["Sin laptop", "Bajo apoyo familiar"],
        "total_inasistencias": 5,
        "laptop": False,
        "risk_factors": [
            {"name": "Rendimiento Académico", "value": "Bajo", "weight": "40%"},
            {"name": "Factor Socioeconómico", "value": "Medio", "weight": "30%"},
        ],
        "key_grades": [
            {"subject": "Matemáticas", "grade": 7.2, "avg": 8.5},
            {"subject": "Lenguaje", "grade": 8.1, "avg": 8.0},
        ],
    },
    {
        "id": "EST002",
        "nombre": "Maria López Hernandez",
        "grado": "9no B",
        "edad": 14,
        "quintil": 4,
        "risk_level": "Bajo",
        "risk_score": 22.1,
        "key_barriers": [],
        "total_inasistencias": 1,
        "laptop": True,
        "risk_factors": [],
        "key_grades": [],
    },
    {
        "id": "EST003",
        "nombre": "Carlos Andrade Torres",
        "grado": "10mo A",
        "edad": 16,
        "quintil": 1,
        "risk_level": "Alto",
        "risk_score": 89.7,
        "key_barriers": ["Sin laptop", "Problemas de conducta", "Alto ausentismo"],
        "total_inasistencias": 12,
        "laptop": False,
        "risk_factors": [
            {"name": "Rendimiento Académico", "value": "Crítico", "weight": "50%"},
            {"name": "Factor Socioeconómico", "value": "Alto", "weight": "25%"},
            {"name": "Asistencia", "value": "Crítico", "weight": "25%"},
        ],
        "key_grades": [
             {"subject": "Matemáticas", "grade": 5.1, "avg": 8.5},
        ],
    },
]

MOCK_INSTITUTIONAL_STATS = {
    "topBarriers": {
        "labels": ["Sin Laptop", "Apoyo Familiar", "Salud Mental", "Ausentismo"],
        "data": [45, 32, 25, 18],
    },
    "laptopImpact": {
        "labels": ["Con Laptop", "Sin Laptop"],
        "data": [35, 65],
    },
    "parentEducationImpact": {
        "labels": ["Primaria", "Secundaria", "Superior"],
        "data": [55, 30, 15],
    },
}

# --- Flask App ---
app = Flask(__name__)
# Use the same port as the real backend
PORT = 5000

# Allow requests from the frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route("/api/students", methods=["GET"])
def get_all_students():
    """Returns the list of all students."""
    print(f"GET /api/students -> Returning {len(MOCK_STUDENTS)} students.")
    return jsonify(MOCK_STUDENTS)

@app.route("/api/students/<string:student_id>", methods=["GET"])
def get_student_by_id(student_id):
    """Returns a single student's profile by their ID."""
    student = next((s for s in MOCK_STUDENTS if s["id"] == student_id), None)
    if student:
        print(f"GET /api/students/{student_id} -> Found student '{student['nombre']}'.")
        return jsonify(student)
    else:
        print(f"GET /api/students/{student_id} -> Student not found.")
        abort(404, description=f"Student with id {student_id} not found.")

@app.route("/api/institutional-stats", methods=["GET"])
def get_institutional_stats():
    """Returns the mock institutional statistics."""
    print("GET /api/institutional-stats -> Returning stats.")
    return jsonify(MOCK_INSTITUTIONAL_STATS)

if __name__ == "__main__":
    print(f"--- Mock Backend Server ---")
    print(f"Starting server on http://localhost:{PORT}")
    print("Available Endpoints:")
    print("  - GET /api/students")
    print("  - GET /api/students/<id>")
    print("  - GET /api/institutional-stats")
    print("---------------------------")
    app.run(port=PORT, debug=True)
