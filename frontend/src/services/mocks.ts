/**
 * Esta es la respuesta simulada para GET /api/sat-list
 * Representa la lista de estudiantes priorizada por su "Score de Riesgo Compuesto"[cite: 509].
 */
export const mockSatListData: any[] = [
  {
    id: 1,
    nombre: 'Estudiante, Crítico A',
    curso: '10mo A',
    score_riesgo: 85,
    nivel_riesgo: 'Crítico',
    alertas_principales: ['5 Faltas', 'Sin Laptop', 'Apoyo Bajo'],
  },
  {
    id: 2,
    nombre: 'Estudiante, Crítico B',
    curso: '9no C',
    score_riesgo: 70,
    nivel_riesgo: 'Crítico',
    alertas_principales: ['Quintil Q1', 'Sin Laptop'],
  },
  {
    id: 3,
    nombre: 'Estudiante, Medio A',
    curso: '8vo B',
    score_riesgo: 55,
    nivel_riesgo: 'Medio',
    alertas_principales: ['3 Faltas', 'Apoyo Bajo'],
  },
  {
    id: 4,
    nombre: 'Estudiante, Medio B',
    curso: '10mo B',
    score_riesgo: 40,
    nivel_riesgo: 'Medio',
    alertas_principales: ['Quintil Q2'],
  },
  {
    id: 5,
    nombre: 'Estudiante, Bajo A',
    curso: '9no A',
    score_riesgo: 15,
    nivel_riesgo: 'Bajo',
    alertas_principales: [],
  },
];

/**
 * Esta es la respuesta simulada para GET /api/student/:id
 * Representa el perfil detallado de un estudiante.
 * Basado en los hallazgos de la tesis.
 */
export const mockStudentProfileData = {
  id: 'std-001',
  name: 'Estudiante, Crítico A',
  course: '10mo A',
  risk_score: 85,
  risk_level: 'Crítico',
  // Los 4 factores del Score de Riesgo Compuesto (Recomendación 7.2.1)
  risk_factors: [
    { name: 'Faltas Injustificadas', value: '5', weight: '40%' },
    { name: 'Quintil (Vulnerabilidad)', value: 'Q1', weight: '25%' },
    { name: 'Sin Laptop', value: 'Sí', weight: '20%' },
    { name: 'Apoyo Familiar', value: 'Bajo', weight: '15%' },
  ],
  // Las barreras clave identificadas en el modelo (Tabla 5.2 / Sección 5.2.2)
  key_barriers: [
    {
      name: 'Nivel Educativo del Representante',
      value: 'Bachillerato',
      impact: 'Alto',
    },
    { name: 'Índice de Apoyo Familiar', value: 'Bajo', impact: 'Alto' },
    { name: 'Tiene Laptop', value: 'No', impact: 'Medio' },
    { name: 'Índice de Cobertura de Salud', value: 'Bajo', impact: 'Medio' },
    { name: 'Lectura de Libros (Hogar)', value: 'No', impact: 'Bajo' },
  ],
  // Notas en materias clave (Tabla 5.4)
  key_grades: [
    { subject: 'Matemáticas', grade: 7.5, avg: 8.8 },
    { subject: 'Animación a la Lectura', grade: 8.0, avg: 9.0 },
    { subject: 'Estudios Sociales', grade: 8.2, avg: 8.9 },
  ],
};

/**
 * Esta es la respuesta simulada para GET /api/institutional-stats
 * Representa los hallazgos macro de la tesis.
 */
export const mockInstitutionalStats = {
  // De la Tabla 5.2 de la tesis
  topBarriers: {
    labels: [
      'Edad Rep.',
      'Cobertura Salud',
      'Laptop (Sí)',
      'Edad Est.',
      'TV (Solo 1)',
      'Lectura Libros (Sí)',
      'Acceso Tec.',
      'Nivel Inst. Rep.',
      'Lectura Libros (No)',
      'Num. Hermanos',
    ],
    data: [5.84, 4.58, 4.26, 3.53, 3.36, 3.23, 3.12, 3.02, 2.94, 2.68],
  },
  // De la Sección 5.2.2 de la tesis
  laptopImpact: {
    labels: ['Con Laptop', 'Sin Laptop'],
    data: [8.97, 8.85],
  },
  // De la Sección 5.2.2 de la tesis
  parentEducationImpact: {
    labels: ['Superior/Univ.', 'Bachillerato', 'Básica'],
    data: [9.02, 8.83, 8.75], // Se asume 8.75 para Básica
  },
};
