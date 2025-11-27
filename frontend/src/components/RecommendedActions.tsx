import React from 'react';
import { StudentProfile } from '../hooks/useStudentProfile';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface RecommendedActionsProps {
  student: StudentProfile;
}

interface Action {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

interface ActionCardProps {
  title: string;
  reason: string;
  actions: Action[];
}

const ActionCard = ({ title, reason, actions }: ActionCardProps) => (
  <div className="bg-hover-bg p-4 rounded-lg border border-subtle-divider mb-3">
    <p className="font-bold">{title}</p>
    <p className="text-sm text-text-secondary my-1">{reason}</p>
    <div className="flex space-x-2 mt-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant || 'secondary'}
          className="text-xs px-2 py-1"
        >
          {action.label}
        </Button>
      ))}
    </div>
  </div>
);

const RecommendedActions = ({ student }: RecommendedActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Recomendadas</CardTitle>
        <p className="text-sm text-text-secondary">
          Basadas en factores de riesgo identificados
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm font-bold text-red-500 mb-2">
            🎯 Prioridad Alta
          </p>

          {student.key_barriers
            .filter((barrier) => barrier.name.includes('Laptop'))
            .map((barrier, index) => (
              <ActionCard
                key={index}
                title="Gestionar Laptop del Programa"
                reason={`Razón: ${barrier.description || 'Sin acceso a tecnología.'}`}
                actions={[
                  { label: 'Crear Solicitud' },
                  { label: 'Ver Disponibilidad' },
                ]}
              />
            ))}
        </div>
        <div className="mt-6">
          <p className="text-sm font-bold mb-2">📋 Seguimiento Continuo</p>
          {student.key_barriers
            .filter((barrier) => barrier.name.includes('Apoyo Familiar'))
            .map((barrier, index) => (
              <ActionCard
                key={index}
                title="Plan de Fortalecimiento Familiar"
                reason={`Razón: ${barrier.description || 'Índice de apoyo familiar bajo.'}`}
                actions={[
                  { label: 'Agendar Taller' },
                  { label: 'Ver Recursos' },
                ]}
              />
            ))}
          {/* Example for academic support, assuming it comes from key_grades or other risk factors */}
          {student.key_grades.some(
            (grade) => grade.grade < (grade.avg || grade.grade) * 0.8,
          ) && ( // Placeholder logic
            <ActionCard
              title="Inscribir en Tutorías de Materias Específicas"
              reason="Razón: Rendimiento bajo en materias clave."
              actions={[{ label: 'Ver Horarios' }, { label: 'Inscribir' }]}
            />
          )}
        </div>
        <div className="mt-6">
          <Button variant="primary" className="w-full">
            Registrar Intervención Personalizada
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedActions;
