import { useState, useEffect } from 'react';
import { getScoreDistributions, getAcademicInsights } from '../services/api';

export interface DistributionStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  q1: number;
  q3: number;
  count: number;
  values: number[];
}

export interface HistogramData {
  counts: number[];
  binEdges: number[];
  labels: string[];
}

export interface LaptopComparison {
  withLaptop: DistributionStats | null;
  withoutLaptop: DistributionStats | null;
}

export interface ScoreDistributions {
  gradesByQuintile: Record<string, DistributionStats>;
  gradesByRisk: Record<string, DistributionStats>;
  riskScoreDistribution: DistributionStats | null;
  laptopComparison: LaptopComparison;
  gradesByEducation: Record<string, DistributionStats>;
  gradesBySubject: Record<string, DistributionStats>;
  overallGradeHistogram: HistogramData | null;
  riskScoreHistogram: HistogramData | null;
}

export interface SubjectRisk {
  subject: string;
  totalStudents: number;
  atRisk: number;
  riskPercentage: number;
}

export interface BarriersImpactItem {
  avg_grade: number;
  count: number;
}

export interface GenderAnalysisItem {
  mean: number;
  count: number;
}

export interface AcademicInsights {
  gradesBySchoolGrade: Record<string, { mean: number; count: number }>;
  gradesByGender: Record<string, GenderAnalysisItem>;
  barriersImpact: Record<string, BarriersImpactItem>;
  subjectsAtRisk: SubjectRisk[];
  summary: {
    totalStudents: number;
    studentsWithData: number;
    avgGrade: number;
    studentsWithBarriers: number;
  };
}

export default function useScoreDistributions() {
  const [distributions, setDistributions] = useState<ScoreDistributions | null>(null);
  const [insights, setInsights] = useState<AcademicInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [distResponse, insightResponse] = await Promise.all([
          getScoreDistributions(),
          getAcademicInsights(),
        ]);

        setDistributions(distResponse.data);
        setInsights(insightResponse.data);
      } catch (err: unknown) {
        console.error('Error fetching score distributions:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load score distributions',
        );
        setDistributions(null);
        setInsights(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { distributions, insights, loading, error };
}
