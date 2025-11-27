import React from 'react';
import { useParams } from 'react-router-dom';
import { students } from '../data/mockData';
import Breadcrumbs from './layout/Breadcrumbs';
import { Badge } from './ui/Badge';
import CircularProgress from './ui/CircularProgress';
import { AlertTriangle } from 'lucide-react';

const StudentProfileHero = () => {
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return <div>Estudiante no encontrado</div>;
  }

  const riskColor =
    student.riskLevel === 'Critical'
      ? 'text-red-600'
      : student.riskLevel === 'Medium'
        ? 'text-yellow-500'
        : 'text-green-500';

  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Dashboard' },
          { label: 'Perfil del Estudiante' },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <h1 className="text-32 font-bold text-slate-900 dark:text-slate-100">
            {student.name}
          </h1>
          <p className="text-16 text-slate-600 dark:text-slate-400 mt-1">
            {student.grade}
          </p>
          <Badge
            variant={
              student.riskLevel === 'Critical'
                ? 'critical'
                : student.riskLevel === 'Medium'
                  ? 'medium'
                  : 'low'
            }
            className="mt-3"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            {student.riskLevel}
          </Badge>
        </div>
        <div className="flex items-center justify-end">
          <CircularProgress
            value={student.riskScore}
            max={100}
            size={140}
            strokeWidth={12}
            color={riskColor}
            label={student.riskScore.toString()}
            subLabel="/ 100"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfileHero;
