import { useState, useEffect } from 'react';
import { getBarriersAnalysis } from '../services/api';

export interface BarrierDetail {
  name: string;
  importance: number;
  description: string;
}

export interface BarrierCategory {
  name: string;
  total_importance: number;
  barriers: BarrierDetail[];
}

export interface BarriersAnalysis {
  [key: string]: BarrierCategory;
}

export default function useBarriersAnalysis() {
  const [analysis, setAnalysis] = useState<BarriersAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBarriersAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const response = await getBarriersAnalysis();
        setAnalysis(response.data);
      } catch (err: unknown) {
        console.error('Error fetching barriers analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load barriers analysis');
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBarriersAnalysis();
  }, []);

  return { analysis, loading, error };
}
