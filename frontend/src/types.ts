export interface Student {
  id: string;
  name: string;
  grade: string;
  riskLevel: 'Crítico' | 'Medio' | 'Bajo';
  riskScore: number;
  age: number;
  stratum: number;
  alerts: {
    absences?: number;
    hasLaptop: boolean;
    familySupport: 'Alto' | 'Medio' | 'Bajo';
    quintile: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5';
  };
  performance: {
    [subject: string]: {
      studentGrade: number;
      classAverage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  riskFactors: {
    absences: { value: number; contribution: number; weight: number };
    vulnerability: { value: string; contribution: number; weight: number };
    laptop: { value: boolean; contribution: number; weight: number };
    familySupport: { value: string; contribution: number; weight: number };
  };
}

