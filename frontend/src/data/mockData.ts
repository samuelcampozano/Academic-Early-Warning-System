import { Student } from '../types';

export const students: Student[] = [
  {
    id: '1',
    name: 'Estudiante, Crítico A',
    grade: '10mo A',
    riskLevel: 'Crítico',
    riskScore: 85,
    age: 15,
    stratum: 1,
    alerts: {
      absences: 5,
      hasLaptop: false,
      familySupport: 'Bajo',
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
      absences: { value: 5, contribution: 34, weight: 40 },
      vulnerability: { value: 'Q1', contribution: 21, weight: 25 },
      laptop: { value: false, contribution: 17, weight: 20 },
      familySupport: { value: 'Bajo', contribution: 13, weight: 15 },
    },
  },
  {
    id: '2',
    name: 'Estudiante, Crítico B',
    grade: '9no B',
    riskLevel: 'Crítico',
    riskScore: 72,
    age: 14,
    stratum: 2,
    alerts: {
      absences: 4,
      hasLaptop: true,
      familySupport: 'Bajo',
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
      familySupport: { value: 'Bajo', contribution: 26, weight: 15 },
    },
  },
  {
    id: '3',
    name: 'Estudiante, Medio A',
    grade: '10mo A',
    riskLevel: 'Medio',
    riskScore: 55,
    age: 15,
    stratum: 3,
    alerts: {
      absences: 2,
      hasLaptop: false,
      familySupport: 'Medio',
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
      familySupport: { value: 'Medio', contribution: 10, weight: 15 },
    },
  },
  {
    id: '4',
    name: 'Estudiante, Medio B',
    grade: '8vo C',
    riskLevel: 'Medio',
    riskScore: 48,
    age: 13,
    stratum: 4,
    alerts: {
      absences: 1,
      hasLaptop: true,
      familySupport: 'Medio',
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
        familySupport: { value: 'Medio', contribution: 30, weight: 15 },
    },
  },
  {
    id: '5',
    name: 'Estudiante, Bajo A',
    grade: '9no A',
    riskLevel: 'Bajo',
    riskScore: 15,
    age: 14,
    stratum: 5,
    alerts: {
      absences: 0,
      hasLaptop: true,
      familySupport: 'Alto',
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
        familySupport: { value: 'Alto', contribution: 10, weight: 15 },
    },
  },
];
