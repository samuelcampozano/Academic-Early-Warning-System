import { Student } from '../types';

export const students: Student[] = [
  {
    id: '1',
    name: 'Estudiante, Crítico A',
    grade: '10mo A',
    riskLevel: 'Critical',
    riskScore: 85,
    age: 15,
    socioeconomicStratum: 1,
    mainAlerts: [
      '5 Faltas injustificadas',
      'Sin laptop',
      'Apoyo familiar bajo',
      'Vulnerabilidad Q1',
    ],
    alerts: {
      absences: 5,
      hasLaptop: false,
      familySupport: 'Low',
      quintile: 'Q1',
    },
    performance: {
      Matemáticas: {
        studentGrade: 7.5,
        classAverage: 8.8,
        trend: 'down',
      },
      'Animación a la Lectura': {
        studentGrade: 8.0,
        classAverage: 9.0,
        trend: 'stable',
      },
      'Estudios Sociales': {
        studentGrade: 7.0,
        classAverage: 8.5,
        trend: 'down',
      },
    },
    riskFactors: {
      absences: {
        value: 5,
        contribution: 34,
        weight: 40,
        explanation:
          'El estudiante ha faltado 5 veces, lo cual es un indicador principal de desconexión y posible abandono.',
      },
      vulnerability: {
        value: 'Q1',
        contribution: 21,
        weight: 25,
        explanation:
          'Pertenecer al quintil más bajo (Q1) indica barreras socioeconómicas significativas.',
      },
      laptop: {
        value: false,
        contribution: 17,
        weight: 20,
        explanation:
          'La falta de un computador personal limita el acceso a recursos y la entrega de tareas.',
      },
      familySupport: {
        value: 'Low',
        contribution: 13,
        weight: 15,
        explanation:
          'Un bajo apoyo familiar puede impactar negativamente la motivación y el seguimiento académico.',
      },
    },
  },
  {
    id: '2',
    name: 'Estudiante, Crítico B',
    grade: '9no B',
    riskLevel: 'Critical',
    riskScore: 72,
    age: 14,
    socioeconomicStratum: 2,
    mainAlerts: [
      '4 Faltas injustificadas',
      'Apoyo familiar bajo',
      'Vulnerabilidad Q2',
    ],
    alerts: {
      absences: 4,
      hasLaptop: true,
      familySupport: 'Low',
      quintile: 'Q2',
    },
    performance: {
      Matemáticas: {
        studentGrade: 8.0,
        classAverage: 8.5,
        trend: 'stable',
      },
      'Ciencias Naturales': {
        studentGrade: 7.5,
        classAverage: 8.0,
        trend: 'down',
      },
    },
    riskFactors: {
      absences: { value: 4, contribution: 28, weight: 40 },
      vulnerability: { value: 'Q2', contribution: 18, weight: 25 },
      laptop: { value: true, contribution: 0, weight: 20 },
      familySupport: { value: 'Low', contribution: 26, weight: 15 },
    },
  },
  {
    id: '3',
    name: 'Estudiante, Medio A',
    grade: '10mo A',
    riskLevel: 'Medium',
    riskScore: 55,
    age: 15,
    socioeconomicStratum: 3,
    mainAlerts: ['2 Faltas', 'Sin laptop', 'Apoyo familiar medio'],
    alerts: {
      absences: 2,
      hasLaptop: false,
      familySupport: 'Medium',
      quintile: 'Q3',
    },
    performance: {
      Matemáticas: {
        studentGrade: 8.5,
        classAverage: 8.8,
        trend: 'stable',
      },
    },
    riskFactors: {
      absences: { value: 2, contribution: 15, weight: 40 },
      vulnerability: { value: 'Q3', contribution: 10, weight: 25 },
      laptop: { value: false, contribution: 20, weight: 20 },
      familySupport: { value: 'Medium', contribution: 10, weight: 15 },
    },
  },
  {
    id: '4',
    name: 'Estudiante, Medio B',
    grade: '8vo C',
    riskLevel: 'Medium',
    riskScore: 48,
    age: 13,
    socioeconomicStratum: 4,
    mainAlerts: ['1 Falta', 'Apoyo familiar medio'],
    alerts: {
      absences: 1,
      hasLaptop: true,
      familySupport: 'Medium',
      quintile: 'Q4',
    },
    performance: {
      Matemáticas: {
        studentGrade: 9.0,
        classAverage: 8.8,
        trend: 'up',
      },
    },
    riskFactors: {
      absences: { value: 1, contribution: 8, weight: 40 },
      vulnerability: { value: 'Q4', contribution: 10, weight: 25 },
      laptop: { value: true, contribution: 0, weight: 20 },
      familySupport: { value: 'Medium', contribution: 30, weight: 15 },
    },
  },
  {
    id: '5',
    name: 'Estudiante, Bajo A',
    grade: '9no A',
    riskLevel: 'Low',
    riskScore: 15,
    age: 14,
    socioeconomicStratum: 5,
    mainAlerts: ['Sin alertas'],
    alerts: {
      absences: 0,
      hasLaptop: true,
      familySupport: 'High',
      quintile: 'Q5',
    },
    performance: {
      Matemáticas: {
        studentGrade: 9.5,
        classAverage: 9.0,
        trend: 'up',
      },
    },
    riskFactors: {
      absences: { value: 0, contribution: 0, weight: 40 },
      vulnerability: { value: 'Q5', contribution: 5, weight: 25 },
      laptop: { value: true, contribution: 0, weight: 20 },
      familySupport: { value: 'High', contribution: 10, weight: 15 },
    },
  },
];
