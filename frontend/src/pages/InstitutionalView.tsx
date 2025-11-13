import React from 'react';
import useInstitutionalData from '../hooks/useInstitutionalData';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, Target, TrendingUp } from 'lucide-react';

const LoadingComponent = () => <div className="loading">Cargando estadísticas...</div>;
const ErrorComponent = ({ error }: { error: string | null }) => <div className="error">Error: {error}</div>;

const InsightCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <Icon className="h-8 w-8 text-blue-500" />
      <h4 className="ml-4 text-lg font-semibold text-gray-800">{title}</h4>
    </div>
    <p className="text-gray-600">{children}</p>
  </div>
);

export default function InstitutionalView() {
  const { stats, loading, error } = useInstitutionalData();

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !stats) {
    return <ErrorComponent error={error || 'No se pudieron cargar las estadísticas'} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Visión Institucional</h1>
        <p className="text-gray-600 mt-1">Análisis de barreras y factores de riesgo a nivel institucional.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ChartCard
          title="Top 10 Barreras Predictivas"
          description="Importancia de cada factor en el modelo predictivo."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topBarriers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Impacto de Laptop en Promedio"
          description="Diferencia en el promedio general entre estudiantes con y sin laptop."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.laptopImpact} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#F59E0B" name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Impacto del Nivel Educativo del Representante"
          description="Promedio general según el nivel educativo del representante legal."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.parentEducationImpact} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8B5CF6" name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hallazgos Clave</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard icon={Eye} title="Factores Socioeconómicos">
            La edad del representante y la cobertura de salud son las barreras más predictivas, sugiriendo un fuerte componente socioeconómico en el riesgo estudiantil.
          </InsightCard>
          <InsightCard icon={Target} title="Brecha Digital">
            La posesión de una laptop tiene un impacto medible en el rendimiento, reforzando la necesidad de programas de inclusión digital.
          </InsightCard>
          <InsightCard icon={TrendingUp} title="Capital Cultural">
            El nivel educativo del representante es un factor clave, lo que indica que el capital cultural del hogar influye en el éxito académico.
          </InsightCard>
        </div>
      </div>
    </div>
  );
}
