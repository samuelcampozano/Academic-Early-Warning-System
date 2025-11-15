import React from 'react';
import { Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Info } from 'lucide-react';

interface KeyBarriersProps {
  student: Student;
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

const KeyBarriers = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          Barreras Clave (Hallazgos Tesis)
          <Info className="w-4 h-4 ml-2 text-text-tertiary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BarrierCard
          title="Índice de Apoyo Familiar: Bajo"
          impact="Alto"
          reason="El acompañamiento familiar en tareas y seguimiento de asistencia es crítico para el éxito académico. Bajo apoyo aumenta probabilidad de abandono en 45%."
          suggestion="Reunión con familia para establecer plan de acompañamiento y seguimiento semanal."
        />
        <BarrierCard
          title="Tiene Laptop: No"
          impact="Medio"
          reason="El acceso a tecnología correlaciona con -8.5 puntos en promedio general. Estudiantes sin laptop tienen mayor dificultad para completar tareas autónomas y acceder a recursos digitales."
          suggestion="Solicitar laptop del programa institucional de inclusión digital."
        />
      </CardContent>
    </Card>
  );
};

export default KeyBarriers;
