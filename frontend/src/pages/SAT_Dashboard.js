import React from 'react';
import useSatData from '../hooks/useSatData';
import StudentTable from '../components/StudentTable';

// Componente simple para mostrar carga o error
const LoadingComponent = () => <div className="loading">Cargando datos...</div>;
const ErrorComponent = ({ error }) => <div className="error">Error: {error}</div>;

export default function SAT_Dashboard() {
  // Usamos nuestro hook personalizado
  const { data, loading, error } = useSatData();

  // Renderizado condicional
  let content;
  if (loading) {
    content = <LoadingComponent />;
  } else if (error) {
    content = <ErrorComponent error={error} />;
  } else {
    content = <StudentTable students={data} />;
  }

  return (
    <div>
      <h2>Sistema de Alerta Temprana (SAT)</h2>
      <p>
        Esta es la lista priorizada de estudiantes. Haz clic en un estudiante
        para ver su perfil detallado y los factores de riesgo.
      </p>
      {content}
    </div>
  );
}
