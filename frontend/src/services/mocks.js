/**
 * Esta es la respuesta simulada para GET /api/sat-list
 * Representa la lista de estudiantes priorizada por su "Score de Riesgo Compuesto"[cite: 509].
 */
export const mockSatListData = [
  {
    id: 'std-001',
    name: 'Estudiante, Crítico A',
    course: '10mo A',
    risk_score: 85,
    risk_level: 'Crítico',
    alerts: '5 Faltas, Sin Laptop, Apoyo Bajo',
  },
  {
    id: 'std-002',
    name: 'Estudiante, Crítico B',
    course: '9no C',
    risk_score: 70,
    risk_level: 'Crítico',
    alerts: 'Quintil Q1, Sin Laptop',
  },
  {
    id: 'std-003',
    name: 'Estudiante, Medio A',
    course: '8vo B',
    risk_score: 55,
    risk_level: 'Medio',
    alerts: '3 Faltas, Apoyo Bajo',
  },
  {
    id: 'std-004',
    name: 'Estudiante, Medio B',
    course: '10mo B',
    risk_score: 40,
    risk_level: 'Medio',
    alerts: 'Quintil Q2',
  },
  {
    id: 'std-005',
    name: 'Estudiante, Bajo A',
    course: '9no A',
    risk_score: 15,
    risk_level: 'Bajo',
    alerts: 'Ninguna',
  },
];