import { useState, useEffect } from 'react';
import axios from 'axios';
import { Student } from '../types';

const USE_MOCK_DATA = false;

const mapRiskLevel = (
  level: 'Alto' | 'Medio' | 'Bajo',
): 'Critical' | 'Medium' | 'Low' => {
  switch (level) {
    case 'Alto':
      return 'Critical';
    case 'Medio':
      return 'Medium';
    case 'Bajo':
      return 'Low';
    default:
      return 'Low';
  }
};

const mapStudentData = (backendData: any[]): Student[] => {
  return backendData.map((student) => ({
    id: student.id,
    name: student.nombre,
    grade: student.grado,
    riskLevel: mapRiskLevel(student.risk_level),
    riskScore: Math.round(student.risk_score),
    age: student.edad,
    socioeconomicStratum: student.quintil,
    mainAlerts: student.key_barriers,
    alerts: {
      absences: student.total_inasistencias,
      hasLaptop: !student.laptop,
      quintile: `Quintil ${student.quintil}`,
    },
  }));
};

export default function useSatData() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let responseData: any[];

        if (USE_MOCK_DATA) {
          // This part is now for fallback/testing only
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Assuming mockSatListData exists and has a similar structure
          // responseData = mockSatListData;
          responseData = []; // Or your mock data
        } else {
          const apiUrl = process.env.REACT_APP_API_URL;
          if (!apiUrl) {
            throw new Error(
              'REACT_APP_API_URL is not defined in the environment.',
            );
          }
          const response = await axios.get(`${apiUrl}/students`);
          responseData = response.data;
        }

        const formattedData = mapStudentData(responseData);
        setData(formattedData);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'An unknown error occurred.',
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}