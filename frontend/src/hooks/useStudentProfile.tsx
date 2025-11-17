import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const USE_MOCK_DATA = false;

// Existing interfaces - preserved
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

// --- Data Mapping Functions ---
const mapRiskLevel = (
  level: 'Alto' | 'Medio' | 'Bajo',
): 'Crítico' | 'Medio' | 'Bajo' => {
  switch (level) {
    case 'Alto':
      return 'Crítico';
    case 'Medio':
      return 'Medio';
    case 'Bajo':
      return 'Bajo';
    default:
      return 'Bajo';
  }
};

const mapProfileData = (backendData: any): StudentProfile => {
  return {
    id: backendData.id,
    name: backendData.nombre,
    course: backendData.grado,
    risk_score: Math.round(backendData.risk_score),
    risk_level: mapRiskLevel(backendData.risk_level),
    // The following fields are based on the guide's expected frontend structure.
    // If the backend provides different structures for these, the mapping will need adjustment.
    risk_factors: backendData.risk_factors || [],
    key_barriers: backendData.key_barriers || [],
    key_grades: backendData.key_grades || [],
  };
};

export default function useStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let responseData: any;

        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          // Mock data structure assumed for fallback
          responseData = { id: id, nombre: 'Estudiante Mock' /* ...other fields */ };
        } else {
          const apiUrl = process.env.REACT_APP_API_URL;
          if (!apiUrl) {
            throw new Error(
              'REACT_APP_API_URL is not defined in the environment.',
            );
          }
          const response = await axios.get(`${apiUrl}/students/${id}`);
          responseData = response.data;
        }

        const formattedProfile = mapProfileData(responseData);
        setProfile(formattedProfile);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'An unknown error occurred.',
        );
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  return { profile, loading, error };
}