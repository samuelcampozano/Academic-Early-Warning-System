import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Student } from '../types';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  FileText,
  Laptop,
  Users,
} from 'lucide-react';

interface StudentRowProps {
  student: Student;
  isEven: boolean;
}

const RiskBadge = ({ level }: { level: Student['nivel_riesgo'] }) => {
  const config = {
    Crítico: {
      icon: AlertTriangle,
      color: 'text-red-800 bg-red-100',
      label: 'Crítico',
    },
    Medio: {
      icon: ShieldAlert,
      color: 'text-yellow-800 bg-yellow-100',
      label: 'Medio',
    },
    Bajo: {
      icon: CheckCircle,
      color: 'text-green-800 bg-green-100',
      label: 'Bajo',
    },
  };

  const { icon: Icon, color, label } = config[level];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}
    >
      <Icon className="h-4 w-4 mr-1.5" />
      {label}
    </span>
  );
};

const AlertChip = ({ alertText }: { alertText: string }) => {
  const iconMap: { [key: string]: React.ElementType } = {
    Faltas: FileText,
    Laptop: Laptop,
    Apoyo: Users,
  };

  const Icon =
    iconMap[
      Object.keys(iconMap).find((key) => alertText.includes(key)) || ''
    ] || FileText;

  return (
    <span className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium mr-2">
      <Icon className="h-3 w-3 mr-1" />
      {alertText}
    </span>
  );
};

const StudentRow: React.FC<StudentRowProps> = ({ student, isEven }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/student/${student.id}`);
  };

  const { nombre, curso, nivel_riesgo, score_riesgo, alertas_principales } =
    student;

  return (
    <tr
      className={`cursor-pointer transition-colors ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
      onClick={handleRowClick}
      title="Clic para ver detalles"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{nombre}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{curso}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <RiskBadge level={nivel_riesgo} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {score_riesgo} <span className="text-gray-500">/ 100</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {alertas_principales.slice(0, 3).map((alert, index) => (
          <AlertChip key={index} alertText={alert} />
        ))}
        {alertas_principales.length > 3 && (
          <span className="text-xs font-medium text-gray-500">
            +{alertas_principales.length - 3} más
          </span>
        )}
      </td>
    </tr>
  );
};

export default StudentRow;
