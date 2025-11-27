import { useState, useEffect } from 'react';
import { getSatList } from '../services/api';

// Backend returns Spanish field names, we map to English for frontend
interface BackendStudent {
  id: string;
  name: string;
  course: string;
  risk_level: 'Alto' | 'Medio' | 'Bajo';
  risk_score: number;
  key_barriers: string[];
  promedio_general: number;
  materias_en_riesgo: number;
  quintil: string;
}

export interface SatStudent {
  id: string;
  name: string;
  course: string;
  riskLevel: 'Critical' | 'Medium' | 'Low';
  riskScore: number;
  keyBarriers: string[];
  averageGrade: number;
  subjectsAtRisk: number;
  quintile: string;
}

const mapRiskLevel = (
  level: 'Alto' | 'Medio' | 'Bajo',
): 'Critical' | 'Medium' | 'Low' => {
  const mapping: {
    [key in 'Alto' | 'Medio' | 'Bajo']: 'Critical' | 'Medium' | 'Low';
  } = {
    Alto: 'Critical',
    Medio: 'Medium',
    Bajo: 'Low',
  };
  return mapping[level] as 'Critical' | 'Medium' | 'Low';
};

const mapStudentData = (backendData: BackendStudent[]): SatStudent[] => {
  return backendData.map((student) => ({
    id: student.id,
    name: student.name,
    course: student.course,
    riskLevel: mapRiskLevel(student.risk_level),
    riskScore: Math.round(student.risk_score * 10) / 10, // Round to 1 decimal
    keyBarriers: student.key_barriers || [],
    averageGrade: student.promedio_general,
    subjectsAtRisk: student.materias_en_riesgo,
    quintile: student.quintil || 'Desconocido',
  }));
};

export default function useSatData(riskFilter?: 'Alto' | 'Medio' | 'Bajo') {
  const [data, setData] = useState<SatStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await getSatList(1000, riskFilter);
        const formattedData = mapStudentData(response.data);

        setData(formattedData);
      } catch (err: unknown) {
        console.error('Error fetching SAT list:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load student data',
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [riskFilter]);

  return { data, loading, error };
}
