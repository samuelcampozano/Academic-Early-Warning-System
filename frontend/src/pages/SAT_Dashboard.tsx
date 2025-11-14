import React from 'react';
import { students } from '../data/mockData';
import StudentTable from '../components/StudentTable';
import SummaryCard from '../components/SummaryCard';
import AlertBanner from '../components/AlertBanner';
import SearchAndFilters from '../components/SearchAndFilters';
import { Users, AlertTriangle, ShieldAlert, BarChart2 } from 'lucide-react';

export default function SAT_Dashboard() {
  const criticalRiskCount = students.filter(s => s.riskLevel === 'Crítico').length;
  const mediumRiskCount = students.filter(s => s.riskLevel === 'Medio').length;
  const averageRiskScore = Math.round(students.reduce((acc, s) => acc + s.riskScore, 0) / students.length);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-32 font-bold text-text-primary">Dashboard de Alertas Tempranas</h1>
        <p className="text-text-secondary mt-1">Vista general del riesgo estudiantil.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          icon={<Users />}
          value={students.length}
          label="Total de Estudiantes"
        />
        <SummaryCard
          icon={<AlertTriangle />}
          value={criticalRiskCount}
          label="Riesgo Crítico"
          trend="+5.2%"
          trendColor="text-risk-critical-text"
        />
        <SummaryCard
          icon={<ShieldAlert />}
          value={mediumRiskCount}
          label="Riesgo Medio"
        />
        <SummaryCard
          icon={<BarChart2 />}
          value={averageRiskScore}
          label="Score de Riesgo Promedio"
        />
      </div>

      <AlertBanner />

      <SearchAndFilters />

      <StudentTable students={students} />
    </div>
  );
}

