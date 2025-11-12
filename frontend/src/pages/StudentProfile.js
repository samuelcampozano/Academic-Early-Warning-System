import React from 'react';
import { Link } from 'react-router-dom';
import useStudentProfile from '../hooks/useStudentProfile';
import ProfileHeader from '../components/ProfileHeader';
import RiskCard from '../components/RiskCard';

// Componente simple para mostrar carga o error
const LoadingComponent = () => <div className="loading">Cargando perfil...</div>;
const ErrorComponent = ({ error }) => <div className="error">Error: {error}</div>;

// Definimos las columnas para nuestras tarjetas
const factorColumns = [
  { header: 'Factor de Riesgo', key: 'name' },
  { header: 'Valor', key: 'value' },
  { header: 'Peso en Score', key: 'weight' },
];

const barrierColumns = [
  { header: 'Barrera Identificada', key: 'name' },
  { header: 'Valor', key: 'value' },
  { header: 'Impacto (Modelo)', key: 'impact' },
];

const gradeColumns = [
  { header: 'Materia Clave', key: 'subject' },
  { header: 'Nota Estudiante', key: 'grade' },
  { header: 'Promedio Curso', key: 'avg' },
];

export default function StudentProfile() {
  // Usamos nuestro hook personalizado
  const { profile, loading, error } = useStudentProfile();

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !profile) {
    return <ErrorComponent error={error || 'No se encontró el perfil'} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link to="/">&larr; Volver al Dashboard</Link>

      <ProfileHeader 
        name={profile.name}
        course={profile.course}
        risk_level={profile.risk_level}
        risk_score={profile.risk_score}
      />

      <RiskCard
        title="Desglose del Score de Riesgo"
        data={profile.risk_factors}
        columns={factorColumns}
      />

      <RiskCard
        title="Barreras Clave (Hallazgos Tesis)"
        data={profile.key_barriers}
        columns={barrierColumns}
      />

      <RiskCard
        title="Rendimiento en Materias Clave"
        data={profile.key_grades}
        columns={gradeColumns}
      />
    </div>
  );
}
