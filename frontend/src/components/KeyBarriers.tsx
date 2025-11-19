import React from 'react';
import { StudentProfile } from '../hooks/useStudentProfile';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Info } from 'lucide-react';

interface KeyBarriersProps {
  student: StudentProfile;
}

interface BarrierCardProps {
  title: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
  reason: string;
  suggestion: string;
}

const BarrierCard = ({
  title,
  impact,
  reason,
  suggestion,
}: BarrierCardProps) => (
  <div className="mb-4">
    <p>
      <strong>{title}:</strong>{' '}
      <span
        className={`font-bold ${impact === 'Alto' ? 'text-red-500' : 'text-yellow-500'}`}
      >
        [{impact}]
      </span>
    </p>
    <p className="text-sm text-text-secondary my-1">
      <strong>¿Por qué importa?</strong> {reason}
    </p>
    <p className="text-sm text-primary flex items-center">
      <Info className="w-4 h-4 mr-1" />
      <strong>Acción sugerida:</strong> {suggestion}
    </p>
  </div>
);

const KeyBarriers = ({ student }: KeyBarriersProps) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          Barreras Clave (Hallazgos Tesis)
          <Info className="w-4 h-4 ml-2 text-text-tertiary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {student.key_barriers && student.key_barriers.length > 0 ? (
          student.key_barriers.map((barrier, index) => (
            <BarrierCard
              key={index}
              title={barrier.name}
              impact={
                barrier.importance === 1
                  ? 'Alto'
                  : barrier.importance === 2
                    ? 'Medio'
                    : 'Bajo'
              } // Assuming 1=Alto, 2=Medio, 3=Bajo or default to Bajo
              reason={barrier.description || 'No hay descripción disponible.'}
              suggestion="Acción sugerida pendiente." // Placeholder
            />
          ))
        ) : (
          <p className="text-text-secondary">
            No se encontraron barreras clave para este estudiante.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyBarriers;
