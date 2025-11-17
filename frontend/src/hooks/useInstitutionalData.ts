import { useState, useEffect } from 'react';
import axios from 'axios';

const USE_MOCK_DATA = false;

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

const mapChartData = (
  labels: string[],
  data: number[],
): { name: string; value: number }[] => {
  return labels.map((label, index) => ({
    name: label,
    value: data[index] || 0,
  }));
};

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
          await new Promise((resolve) => setTimeout(resolve, 200));
          // Fallback to mock data if needed for testing
          responseData = {
            topBarriers: { labels: [], data: [] },
            laptopImpact: { labels: [], data: [] },
            parentEducationImpact: { labels: [], data: [] },
          };
        } else {
          const apiUrl = process.env.REACT_APP_API_URL;
          if (!apiUrl) {
            throw new Error(
              'REACT_APP_API_URL is not defined in the environment.',
            );
          }
          const response = await axios.get(`${apiUrl}/institutional-stats`);
          responseData = response.data;
        }

        const formattedData: InstitutionalStats = {
          topBarriers: mapChartData(
            responseData.topBarriers.labels,
            responseData.topBarriers.data,
          ),
          laptopImpact: mapChartData(
            responseData.laptopImpact.labels,
            responseData.laptopImpact.data,
          ),
          parentEducationImpact: mapChartData(
            responseData.parentEducationImpact.labels,
            responseData.parentEducationImpact.data,
          ),
        };

        setStats(formattedData);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'An unknown error occurred.',
        );
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}