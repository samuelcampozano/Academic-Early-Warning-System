export interface Student {
  id: number;
  nombre: string;
  curso: string;
  nivel_riesgo: 'Crítico' | 'Medio' | 'Bajo';
  score_riesgo: number;
  alertas_principales: string[];
}
