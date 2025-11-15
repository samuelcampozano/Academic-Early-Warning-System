import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockStudentProfileData } from '../services/mocks';

const USE_MOCK_DATA = true;

export interface RiskFactor {
  name: string;
  value: string;
  weight: string;
}

export interface KeyBarrier {
  name: string;
  value: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
}

export interface KeyGrade {
  subject: string;
  grade: number;
  avg: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  course: string;
  risk_score: number;
  risk_level: 'Crítico' | 'Medio' | 'Bajo';
  risk_factors: RiskFactor[];
  key_barriers: KeyBarrier[];
  key_grades: KeyGrade[];
}

export default function useStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;

      try {
        setLoading(true);
        let responseData: any;

        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          responseData = { ...mockStudentProfileData, id: id };
        } else {
          throw new Error('API real aún no implementada');
        }

        setProfile(responseData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  return { profile, loading, error };
}
