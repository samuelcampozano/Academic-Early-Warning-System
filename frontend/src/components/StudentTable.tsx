import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Student } from '../types';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { AlertTriangle, Laptop, Users } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
}

const StudentTable = ({ students }: StudentTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  const riskLevelVariant = (level: 'Crítico' | 'Medio' | 'Bajo') => {
    switch (level) {
      case 'Crítico':
        return 'critical';
      case 'Medio':
        return 'medium';
      case 'Bajo':
        return 'low';
    }
  };

  const renderAlerts = (student: Student) => {
    const alerts = [];
    if (student.alerts.absences && student.alerts.absences > 3) {
      alerts.push(
        <div key="absences" className="inline-flex items-center bg-risk-critical-bg text-risk-critical-text text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {student.alerts.absences} Faltas
        </div>
      );
    }
    if (!student.alerts.hasLaptop) {
      alerts.push(
        <div key="laptop" className="inline-flex items-center bg-risk-medium-bg text-risk-medium-text text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
          <Laptop className="w-3 h-3 mr-1" />
          Sin Laptop
        </div>
      );
    }
    if (student.alerts.familySupport === 'Bajo') {
        alerts.push(
            <div key="support" className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                <Users className="w-3 h-3 mr-1" />
                Apoyo Bajo
            </div>
        );
    }
    return alerts.slice(0, 3);
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle-divider">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Curso</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Nivel de Riesgo</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Alertas Principales</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-subtle-divider">
            {students.map((student) => (
              <tr key={student.id} onClick={() => handleRowClick(student.id)} className="hover:bg-hover-bg cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{student.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Badge variant={riskLevelVariant(student.riskLevel)}>
                    {student.riskLevel === 'Crítico' && <AlertTriangle className="w-4 h-4 mr-1" />}
                    {student.riskLevel}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-text-primary">
                  <span className="text-lg font-bold">{student.riskScore}</span> / 100
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {renderAlerts(student)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StudentTable;
