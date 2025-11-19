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

const BARRIER_DESCRIPTIONS: Record<string, string> = {
  'Edad Representante':
    'La edad avanzada del representante puede correlacionarse con una menor capacidad de apoyo académico y brecha digital.',
  'Cobertura Salud':
    'La falta de seguro de salud privado o público aumenta la vulnerabilidad ante emergencias médicas, afectando la continuidad académica.',
  Laptop:
    'La ausencia de un computador personal limita severamente la capacidad de realizar tareas, investigaciones y participar en actividades virtuales.',
  Internet:
    'La falta de acceso a internet en el hogar impide el acceso a recursos educativos digitales y la comunicación con la institución.',
  'Apoyo Familiar':
    'Un bajo nivel de apoyo familiar afecta la motivación y el rendimiento emocional del estudiante.',
  'Nivel Instrucción Representante':
    'El nivel educativo de los padres influye en las expectativas académicas y el apoyo que pueden brindar en el hogar.',
};

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
    <p className="text-sm text-text-secondary dark:text-slate-300 my-1">
      <strong>¿Por qué importa?</strong>{' '}
      {BARRIER_DESCRIPTIONS[title] ||
        reason ||
        'Factor de riesgo identificado que requiere atención.'}
    </p>
    <p className="text-sm text-primary dark:text-blue-400 flex items-center">
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
