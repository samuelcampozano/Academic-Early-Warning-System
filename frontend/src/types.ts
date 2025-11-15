export type RiskLevel = 'Critical' | 'Medium' | 'Low';

export interface Student {
  id: string;
  name: string;
  grade: string;
  riskLevel: RiskLevel;
  riskScore: number;
  age: number;
  socioeconomicStratum: number;
  mainAlerts: string[];
  alerts: {
    absences?: number;
    hasLaptop: boolean;
    familySupport: 'High' | 'Medium' | 'Low';
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
    [key: string]: {
      value: number | string | boolean;
      contribution: number;
      weight: number;
      explanation?: string;
    };
  };
}
