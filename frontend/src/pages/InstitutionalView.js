import React from 'react';
import useInstitutionalData from '../hooks/useInstitutionalData';
import BarChart from '../components/charts/BarChart';

// Componente simple para mostrar carga o error
const LoadingComponent = () => <div className="loading">Cargando estadísticas...</div>;
const ErrorComponent = ({ error }) => <div className="error">Error: {error}</div>;

export default function InstitutionalView() {
  const { stats, loading, error } = useInstitutionalData();

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !stats) {
    return <ErrorComponent error={error || 'No se pudieron cargar las estadísticas'} />;
  }

  // Estilo simple para un layout de cuadrícula
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  };

  const chartBoxStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
  };

  return (
    <div>
      <h2>Visión Institucional - Hallazgos del Modelo</h2>
      <p>
        Estos gráficos resumen los hallazgos clave del modelo predictivo, 
        diseñados para apoyar la toma de decisiones estratégicas en el DCE.
      </p>

      <div style={gridStyle}>
        <div style={chartBoxStyle}>
          <BarChart
            chartData={stats.topBarriers}
            title="Top 10 Barreras Predictivas (Importancia del Modelo %)"
          />
        </div>

        <div style={chartBoxStyle}>
          <BarChart
            chartData={stats.laptopImpact}
            title="Impacto de Laptop en Promedio (Sección 5.2.2)"
          />
        </div>

        <div style={chartBoxStyle}>
          <BarChart
            chartData={stats.parentEducationImpact}
            title="Impacto de Nivel Educativo del Rep. (Sección 5.2.2)"
          />
        </div>
      </div>
    </div>
  );
}
