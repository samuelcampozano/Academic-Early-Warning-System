import { useState, useEffect } from 'react';
import { getInstitutionalStats } from '../services/api';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface SummaryStats {
  total_students: number;
  average_grade: number;
  students_at_risk: number;
  percentage_vulnerable: number;
}

export interface InstitutionalStats {
  summaryStats: SummaryStats;
  topBarriers: ChartData;
  laptopImpact: ChartData;
  parentEducationImpact: ChartData;
  quintilDistribution: ChartData;
  riskDistribution: ChartData;
  familySupportImpact: ChartData;
}

export default function useInstitutionalData() {
  const [stats, setStats] = useState<InstitutionalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

                const response = await getInstitutionalStats();
        
        // Backend already returns data in Chart.js format
        setStats(response.data);
      } catch (err: any) {
        console.error('Error fetching institutional stats:', err);
        setError(err.message || 'Failed to load institutional statistics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}