import React from 'react';
import { useParams } from 'react-router-dom';
import { students } from '../data/mockData';
import Breadcrumbs from './layout/Breadcrumbs';
import { Badge } from './ui/Badge';
import { AlertTriangle } from 'lucide-react';

const StudentProfileHero = () => {
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return <div>Estudiante no encontrado</div>;
  }

  const riskColor =
    student.riskLevel === 'Crítico'
      ? 'border-risk-critical-border'
      : student.riskLevel === 'Medio'
      ? 'border-risk-medium-border'
      : 'border-risk-low-border';

  return (
    <div className="bg-hover-bg p-8 rounded-lg">
      <Breadcrumbs items={[{ href: '/', label: 'Dashboard' }, { label: 'Perfil del Estudiante' }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <h1 className="text-32 font-bold text-text-primary">{student.name}</h1>
          <p className="text-16 text-text-secondary mt-1">{student.grade}</p>
          <Badge variant={student.riskLevel.toLowerCase() as any} className="mt-3">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {student.riskLevel}
          </Badge>
        </div>
        <div className="flex items-center justify-end">
          <div
            className={`h-32 w-32 flex items-center justify-center rounded-full border-8 bg-card ${riskColor}`}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-text-primary">{student.riskScore}</div>
              <div className="text-sm text-text-secondary">/100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileHero;
