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

export interface ConfusionMatrixData {
  labels: string[];
  rows?: string[];
  data: number[][];
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    rocAuc: number;
  };
  thresholdNote?: string;
}

export interface BoxPlotDataPoint {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface BoxPlotDataset {
  label: string;
  data: BoxPlotDataPoint[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface BoxPlotChartData {
  labels: string[];
  datasets: BoxPlotDataset[];
}

export interface InstitutionalStats {
  summaryStats: SummaryStats;
  topBarriers: ChartData;
  laptopImpact: ChartData;
  parentEducationImpact: ChartData;
  quintilDistribution: ChartData;
  riskDistribution: ChartData;
  familySupportImpact: ChartData;
  performanceByQuintile: BoxPlotChartData;
  confusionMatrix: ConfusionMatrixData;
  barriersCategories: ChartData;
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
      } catch (err: unknown) {
        console.error('Error fetching institutional stats:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load institutional statistics',
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
