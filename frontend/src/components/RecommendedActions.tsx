import React from 'react';
import { Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface RecommendedActionsProps {
  student: Student;
}

const ActionCard = ({ title, reason, actions }) => (
    <div className="bg-hover-bg p-4 rounded-lg border border-subtle-divider mb-3">
        <p className="font-bold">{title}</p>
        <p className="text-sm text-text-secondary my-1">{reason}</p>
        <div className="flex space-x-2 mt-2">
            {actions.map(action => (
                <Button key={action.label} variant={action.variant || 'secondary'} size="sm">
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
        <p className="text-sm text-text-secondary">Basadas en factores de riesgo identificados</p>
      </CardHeader>
      <CardContent>
        <div>
            <p className="text-sm font-bold text-red-500 mb-2">🎯 Prioridad Alta (Próximas 48 horas)</p>
            <ActionCard
                title="Contactar Familia sobre Ausentismo"
                reason={`Razón: ${student.alerts.absences} faltas injustificadas detectadas este trimestre`}
                actions={[
                    { label: 'Enviar Email' },
                    { label: 'Llamar' },
                    { label: 'Agendar Reunión' },
                ]}
            />
            <ActionCard
                title="Gestionar Laptop del Programa"
                reason="Razón: Sin acceso a tecnología (-8.5 pts impacto promedio)"
                actions={[
                    { label: 'Crear Solicitud' },
                    { label: 'Ver Disponibilidad' },
                ]}
            />
        </div>
        <div className="mt-6">
            <p className="text-sm font-bold mb-2">📋 Seguimiento Continuo</p>
            <ActionCard
                title="Inscribir en Tutorías de Matemáticas"
                reason="Razón: 1.3 puntos bajo promedio, tendencia descendente"
                actions={[
                    { label: 'Ver Horarios' },
                    { label: 'Inscribir' },
                ]}
            />
            <ActionCard
                title="Plan de Fortalecimiento Familiar"
                reason="Razón: Índice de apoyo familiar bajo"
                actions={[
                    { label: 'Agendar Taller' },
                    { label: 'Ver Recursos' },
                ]}
            />
        </div>
        <div className="mt-6">
            <Button variant="primary" className="w-full">Registrar Intervención Personalizada</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedActions;
