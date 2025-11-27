import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStudentById } from '../services/api';

export interface RiskFactor {
  name: string;
  value: string;
  weight: string;
}

export interface KeyBarrier {
  name: string;
  importance?: number;
  description?: string;
}

export interface KeyGrade {
  subject: string;
  grade: number;
  avg: number | null;
}

interface BackendKeyBarrier {
  name: string;
  importance?: number;
  description?: string;
}

interface BackendStudentProfile {
  id: string;
  name: string;
  course: string;
  risk_score: number;
  risk_level: 'Alto' | 'Medio' | 'Bajo';
  risk_factors: RiskFactor[];
  key_barriers: (string | BackendKeyBarrier)[];
  key_grades: KeyGrade[];
}

export interface StudentProfile {
  id: string;
  name: string;
  course: string;
  risk_score: number;
  risk_level: 'Critical' | 'Medium' | 'Low';
  risk_factors: RiskFactor[];
  key_barriers: KeyBarrier[];
  key_grades: KeyGrade[];
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

const mapProfileData = (backendData: BackendStudentProfile): StudentProfile => {
  return {
    id: backendData.id,
    name: backendData.name,
    course: backendData.course,
    risk_score: Math.round(backendData.risk_score * 10) / 10,
    risk_level: mapRiskLevel(backendData.risk_level),
    risk_factors: backendData.risk_factors || [],
    key_barriers: Array.isArray(backendData.key_barriers)
      ? backendData.key_barriers.map((b: string | BackendKeyBarrier) =>
          typeof b === 'string' ? { name: b } : b,
        )
      : [],
    key_grades: backendData.key_grades || [],
  };
};

export default function useStudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);


        const response = await getStudentById(studentId);
        const formattedProfile = mapProfileData(response.data);

        setProfile(formattedProfile);
      } catch (err: unknown) {
        console.error('Error fetching student profile:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load student profile',
        );
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [studentId]);

  return { profile, loading, error };
}
