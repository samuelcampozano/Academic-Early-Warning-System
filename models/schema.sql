-- =====================================================
-- SCHEMA SQL PARA SUPABASE (PostgreSQL)
-- Academic Early Warning System
-- =====================================================

-- 1. Tabla: students (Estudiantes)
-- =====================================================
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  grado TEXT NOT NULL,
  seccion TEXT,
  edad INTEGER,
  genero TEXT CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
  quintil INTEGER CHECK (quintil BETWEEN 1 AND 5),
  quintil_agrupado TEXT CHECK (quintil_agrupado IN ('Bajo', 'Medio', 'Alto', 'Acomodado')),
  promedio_general NUMERIC(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_students_grado ON students(grado);
CREATE INDEX idx_students_quintil ON students(quintil);
CREATE INDEX idx_students_quintil_agrupado ON students(quintil_agrupado);

-- Comentarios
COMMENT ON TABLE students IS 'Información básica de estudiantes';
COMMENT ON COLUMN students.quintil IS 'Quintil socioeconómico (1=más vulnerable, 5=menos vulnerable)';


-- 2. Tabla: socioeconomic_data (Datos Socioeconómicos)
-- =====================================================
CREATE TABLE socioeconomic_data (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  nivel_instruccion_rep TEXT,
  edad_representante INTEGER,
  relacion TEXT,
  estado_civil TEXT,
  laptop BOOLEAN DEFAULT FALSE,
  internet BOOLEAN DEFAULT FALSE,
  computadora BOOLEAN DEFAULT FALSE,
  lectura_libros BOOLEAN DEFAULT FALSE,
  numero_hermanos INTEGER DEFAULT 0,
  tipo_vivienda TEXT,
  indice_cobertura_salud TEXT CHECK (indice_cobertura_salud IN ('Completa', 'Básica', 'Sin')),
  indice_acceso_tecnologico TEXT CHECK (indice_acceso_tecnologico IN ('Alto', 'Medio', 'Bajo', 'Sin')),
  indice_apoyo_familiar TEXT CHECK (indice_apoyo_familiar IN ('Alto', 'Medio', 'Bajo')),
  indice_accesibilidad_geografica TEXT CHECK (indice_accesibilidad_geografica IN ('Muy cerca', 'Cerca', 'Moderado', 'Lejos', 'Muy lejos')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_socioeconomic_student_id ON socioeconomic_data(student_id);
CREATE INDEX idx_socioeconomic_laptop ON socioeconomic_data(laptop);
CREATE INDEX idx_socioeconomic_internet ON socioeconomic_data(internet);

-- Comentarios
COMMENT ON TABLE socioeconomic_data IS 'Datos socioeconómicos y barreras identificadas por estudiante';


-- 3. Tabla: academic_performance (Rendimiento Académico)
-- =====================================================
CREATE TABLE academic_performance (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  materia TEXT NOT NULL,
  nota NUMERIC(4,2) CHECK (nota >= 0 AND nota <= 10),
  promedio_curso NUMERIC(4,2),
  periodo TEXT CHECK (periodo IN ('Q1', 'Q2', 'Q3', 'Final')),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_academic_student_id ON academic_performance(student_id);
CREATE INDEX idx_academic_materia ON academic_performance(materia);
CREATE INDEX idx_academic_nota ON academic_performance(nota);
CREATE INDEX idx_academic_periodo_year ON academic_performance(periodo, year);

-- Comentarios
COMMENT ON TABLE academic_performance IS 'Calificaciones por materia y periodo';
COMMENT ON COLUMN academic_performance.nota IS 'Nota del estudiante (escala 0-10)';


-- 4. Tabla: attendance (Asistencia)
-- =====================================================
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  total_inasistencias INTEGER DEFAULT 0,
  faltas_justificadas INTEGER DEFAULT 0,
  faltas_injustificadas INTEGER DEFAULT 0,
  atrasos INTEGER DEFAULT 0,
  mes TEXT CHECK (mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_mes_year ON attendance(mes, year);

-- Comentarios
COMMENT ON TABLE attendance IS 'Registro mensual de asistencia por estudiante';


-- 5. Tabla: risk_predictions (Predicciones de Riesgo)
-- =====================================================
CREATE TABLE risk_predictions (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT CHECK (risk_level IN ('Alto', 'Medio', 'Bajo')),
  predicted_quintil INTEGER CHECK (predicted_quintil BETWEEN 1 AND 5),
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_version TEXT,
  CONSTRAINT unique_prediction_per_date UNIQUE (student_id, prediction_date)
);

-- Índices
CREATE INDEX idx_predictions_student_id ON risk_predictions(student_id);
CREATE INDEX idx_predictions_risk_level ON risk_predictions(risk_level);
CREATE INDEX idx_predictions_date ON risk_predictions(prediction_date DESC);

-- Comentarios
COMMENT ON TABLE risk_predictions IS 'Predicciones de riesgo académico generadas por el modelo ML';
COMMENT ON COLUMN risk_predictions.risk_score IS 'Score de riesgo (0-100, mayor = más riesgo)';


-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para students
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Estudiantes con su última predicción de riesgo
CREATE OR REPLACE VIEW students_with_latest_risk AS
SELECT 
    s.*,
    rp.risk_score,
    rp.risk_level,
    rp.predicted_quintil,
    rp.prediction_date
FROM students s
LEFT JOIN LATERAL (
    SELECT * FROM risk_predictions
    WHERE student_id = s.id
    ORDER BY prediction_date DESC
    LIMIT 1
) rp ON true;

-- Vista: Estudiantes con materias en riesgo
CREATE OR REPLACE VIEW students_at_academic_risk AS
SELECT 
    s.id,
    s.nombre,
    s.grado,
    s.promedio_general,
    COUNT(CASE WHEN ap.nota < 7.0 THEN 1 END) as materias_en_riesgo,
    STRING_AGG(
        CASE WHEN ap.nota < 7.0 THEN ap.materia END, 
        ', '
    ) as materias_reprobadas
FROM students s
LEFT JOIN academic_performance ap ON s.id = ap.student_id
GROUP BY s.id, s.nombre, s.grado, s.promedio_general
HAVING COUNT(CASE WHEN ap.nota < 7.0 THEN 1 END) > 0;

-- Vista: Resumen de barreras por estudiante
CREATE OR REPLACE VIEW students_barriers_summary AS
SELECT 
    s.id,
    s.nombre,
    s.grado,
    CASE WHEN NOT sd.laptop THEN 1 ELSE 0 END +
    CASE WHEN NOT sd.internet THEN 1 ELSE 0 END +
    CASE WHEN NOT sd.lectura_libros THEN 1 ELSE 0 END +
    CASE WHEN sd.indice_cobertura_salud = 'Sin' THEN 1 ELSE 0 END +
    CASE WHEN sd.indice_acceso_tecnologico IN ('Bajo', 'Sin') THEN 1 ELSE 0 END +
    CASE WHEN sd.indice_apoyo_familiar = 'Bajo' THEN 1 ELSE 0 END as total_barreras
FROM students s
LEFT JOIN socioeconomic_data sd ON s.id = sd.student_id;


-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Seguridad por filas
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE socioeconomic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura a usuarios autenticados
CREATE POLICY "Allow read access to authenticated users"
ON students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access to authenticated users"
ON socioeconomic_data FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access to authenticated users"
ON academic_performance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access to authenticated users"
ON attendance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access to authenticated users"
ON risk_predictions FOR SELECT
TO authenticated
USING (true);

-- Política: Permitir inserción solo al service role (backend)
CREATE POLICY "Allow insert for service role"
ON risk_predictions FOR INSERT
TO service_role
WITH CHECK (true);


-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - Solo para testing)
-- =====================================================

-- Insertar estudiante de ejemplo
INSERT INTO students (id, nombre, grado, edad, genero, quintil, quintil_agrupado, promedio_general)
VALUES ('EST001', 'Juan Pérez', '10mo EGB', 15, 'Masculino', 2, 'Bajo', 8.5);

-- Insertar datos socioeconómicos
INSERT INTO socioeconomic_data (
    student_id, nivel_instruccion_rep, edad_representante, laptop, internet,
    indice_cobertura_salud, indice_acceso_tecnologico, indice_apoyo_familiar
)
VALUES (
    'EST001', 'Básica', 42, FALSE, TRUE,
    'Básica', 'Bajo', 'Medio'
);

-- Insertar rendimiento académico
INSERT INTO academic_performance (student_id, materia, nota, promedio_curso, periodo, year)
VALUES 
    ('EST001', 'Matemáticas', 6.8, 8.5, 'Q1', 2025),
    ('EST001', 'Física', 7.2, 8.3, 'Q1', 2025),
    ('EST001', 'Lengua', 8.9, 8.7, 'Q1', 2025);

-- Insertar asistencia
INSERT INTO attendance (student_id, total_inasistencias, faltas_justificadas, faltas_injustificadas, atrasos, mes, year)
VALUES ('EST001', 5, 2, 3, 1, 'Octubre', 2025);


-- =====================================================
-- QUERIES ÚTILES PARA EL BACKEND
-- =====================================================

-- 1. Obtener estudiantes ordenados por riesgo (para SAT Dashboard)
/*
SELECT 
    s.*,
    rp.risk_score,
    rp.risk_level,
    COUNT(CASE WHEN ap.nota < 7.0 THEN 1 END) as materias_en_riesgo
FROM students s
LEFT JOIN risk_predictions rp ON s.id = rp.student_id
LEFT JOIN academic_performance ap ON s.id = ap.student_id
GROUP BY s.id, rp.risk_score, rp.risk_level
ORDER BY rp.risk_score DESC
LIMIT 100;
*/

-- 2. Obtener perfil completo de un estudiante
/*
SELECT 
    s.*,
    json_agg(DISTINCT sd.*) as socioeconomic_data,
    json_agg(DISTINCT ap.*) as academic_performance,
    json_agg(DISTINCT a.*) as attendance,
    json_agg(DISTINCT rp.*) as risk_predictions
FROM students s
LEFT JOIN socioeconomic_data sd ON s.id = sd.student_id
LEFT JOIN academic_performance ap ON s.id = ap.student_id
LEFT JOIN attendance a ON s.id = a.student_id
LEFT JOIN risk_predictions rp ON s.id = rp.student_id
WHERE s.id = 'EST001'
GROUP BY s.id;
*/

-- 3. Estadísticas institucionales
/*
SELECT 
    COUNT(*) as total_students,
    AVG(promedio_general) as avg_grade,
    COUNT(CASE WHEN quintil_agrupado = 'Bajo' THEN 1 END) as vulnerable_students,
    COUNT(CASE WHEN rp.risk_level = 'Alto' THEN 1 END) as high_risk_students
FROM students s
LEFT JOIN risk_predictions rp ON s.id = rp.student_id;
*/
