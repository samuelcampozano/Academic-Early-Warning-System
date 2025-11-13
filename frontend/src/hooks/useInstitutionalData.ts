import { useState, useEffect } from 'react';
import { mockInstitutionalStats } from '../services/mocks';

const USE_MOCK_DATA = true;

export interface TopBarrier {
  name: string;
  value: number;
}

export interface LaptopImpact {
  name: string;
  value: number;
}

export interface ParentEducationImpact {
  name: string;
  value: number;
}

export interface InstitutionalStats {
  topBarriers: TopBarrier[];
  laptopImpact: LaptopImpact[];
  parentEducationImpact: ParentEducationImpact[];
}

export default function useInstitutionalData() {
  const [stats, setStats] = useState<InstitutionalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        let responseData: any;

        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 200));
          responseData = mockInstitutionalStats;
        } else {
          throw new Error('API real aún no implementada');
        }

        const formattedData: InstitutionalStats = {
          topBarriers: responseData.topBarriers.labels.map((label: string, index: number) => ({
            name: label,
            value: responseData.topBarriers.data[index],
          })),
          laptopImpact: responseData.laptopImpact.labels.map((label: string, index: number) => ({
            name: label,
            value: responseData.laptopImpact.data[index],
          })),
          parentEducationImpact: responseData.parentEducationImpact.labels.map((label: string, index: number) => ({
            name: label,
            value: responseData.parentEducationImpact.data[index],
          })),
        };

        setStats(formattedData);
        setError(null);

      } catch (err: any) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}