import React from 'react';
import useSatData from '../hooks/useSatData';
import StudentTable from '../components/StudentTable';
import SummaryCard from '../components/SummaryCard';
import { Users, AlertTriangle, ShieldAlert, BarChart2 } from 'lucide-react';

const LoadingComponent = () => <div className="loading">Cargando datos...</div>;
const ErrorComponent = ({ error }: { error: string }) => <div className="error">Error: {error}</div>;

export default function SAT_Dashboard() {
  const { data, loading, error } = useSatData();

  const criticalRiskCount = data?.filter(s => s.nivel_riesgo === 'Crítico').length || 0;
  const mediumRiskCount = data?.filter(s => s.nivel_riesgo === 'Medio').length || 0;
  const averageRiskScore = data ? Math.round(data.reduce((acc, s) => acc + s.score_riesgo, 0) / data.length) : 0;

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard de Alertas Tempranas</h1>
        <p className="text-gray-600 mt-1">Vista general del riesgo estudiantil.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          icon={Users}
          value={data?.length.toString() || '0'}
          label="Total de Estudiantes"
        />
        <SummaryCard
          icon={AlertTriangle}
          value={criticalRiskCount.toString()}
          label="Riesgo Crítico"
          trend="+5.2%"
        />
        <SummaryCard
          icon={ShieldAlert}
          value={mediumRiskCount.toString()}
          label="Riesgo Medio"
        />
        <SummaryCard
          icon={BarChart2}
          value={averageRiskScore.toString()}
          label="Score de Riesgo Promedio"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="w-96">
            <input
              type="text"
              placeholder="Buscar estudiante..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Filtrar por Curso</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Filtrar por Riesgo</option>
            </select>
          </div>
        </div>
        {loading && <LoadingComponent />}
        {error && <ErrorComponent error={error} />}
        {data && <StudentTable students={data} />}
      </div>
    </div>
  );
}
