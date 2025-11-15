import React from 'react';
import { Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface SubjectPerformanceProps {
  student: Student;
}

interface PerformanceIndicatorProps {
  studentGrade: number;
  classAverage: number;
}

const PerformanceIndicator = ({
  studentGrade,
  classAverage,
}: PerformanceIndicatorProps) => {
  const diff = studentGrade - classAverage;
  let variant: 'low' | 'average' | 'high' = 'average';
  let icon = <Minus className="w-4 h-4 mr-1" />;
  let text = 'Cerca del Promedio';

  if (diff < -0.5) {
    variant = 'low';
    icon = <TrendingDown className="w-4 h-4 mr-1" />;
    text = 'Bajo Promedio';
  } else if (diff > 0.5) {
    variant = 'high';
    icon = <TrendingUp className="w-4 h-4 mr-1" />;
    text = 'Sobre Promedio';
  }

  const variantClasses = {
    low: 'bg-red-100 text-red-800',
    average: 'bg-yellow-100 text-yellow-800',
    high: 'bg-green-100 text-green-800',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full',
        variantClasses[variant],
      )}
    >
      {icon}
      {text}
    </div>
  );
};

const SubjectPerformance = ({ student }: SubjectPerformanceProps) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Rendimiento en Materias Clave</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(student.performance).map(([subject, data]) => (
          <div key={subject} className="mb-4">
            <h4 className="font-bold">{subject}</h4>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>
                Estudiante: <strong>{data.studentGrade}</strong>
              </span>
              <span>
                Promedio Curso: <strong>{data.classAverage}</strong>
              </span>
            </div>
            <div className="my-2">
              <PerformanceIndicator
                studentGrade={data.studentGrade}
                classAverage={data.classAverage}
              />
            </div>
            <ul className="text-sm text-text-secondary list-disc list-inside">
              <li>Ranking: Puesto 8/12 en el curso (Percentil 33)</li>
              <li>
                Tendencia:{' '}
                {data.trend === 'down'
                  ? '↘️ Bajando'
                  : data.trend === 'up'
                    ? '↗️ Subiendo'
                    : '➡️ Estable'}
              </li>
              <li>
                Estado:{' '}
                {data.studentGrade < data.classAverage - 1
                  ? '⚠️ Requiere atención'
                  : '✓ Seguimiento normal'}
              </li>
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SubjectPerformance;
