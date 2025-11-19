import { StudentProfile, KeyGrade } from '../hooks/useStudentProfile';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface SubjectPerformanceProps {
  student: StudentProfile;
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
        {student.key_grades && student.key_grades.length > 0 ? (
          student.key_grades.map((grade: KeyGrade, index: number) => (
            <div key={index} className="mb-4">
              <h4 className="font-bold">{grade.subject}</h4>
              <div className="flex justify-between text-sm text-text-secondary">
                <span>
                  Estudiante: <strong>{grade.grade.toFixed(2)}</strong>
                </span>
                <span>
                  Promedio Curso:{' '}
                  <strong>
                    {grade.avg !== null ? grade.avg.toFixed(2) : 'N/A'}
                  </strong>
                </span>
              </div>
              {grade.avg !== null && (
                <div className="my-2">
                  <PerformanceIndicator
                    studentGrade={grade.grade}
                    classAverage={grade.avg}
                  />
                </div>
              )}
              <ul className="text-sm text-text-secondary list-disc list-inside">
                <li>Ranking: Información no disponible</li>
                <li>Tendencia: Información no disponible</li>
                <li>Estado: Información no disponible</li>
              </ul>
            </div>
          ))
        ) : (
          <p className="text-text-secondary">
            No se encontró información de rendimiento en materias clave.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectPerformance;
