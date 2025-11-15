import React from 'react';
import { Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AlertTriangle, Laptop, Users, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface RiskFactorCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  contribution: number;
  weight: number;
  score: number;
  variant: 'critical' | 'medium' | 'low';
  explanation: string;
}

const RiskFactorCard = ({
  icon,
  title,
  value,
  contribution,
  weight,
  score,
  variant,
  explanation,
}: RiskFactorCardProps) => {
  const variantClasses = {
    critical: {
      container: 'border-risk-critical-border bg-risk-critical-bg',
      bar: 'bg-risk-critical-text',
    },
    medium: {
      container: 'border-risk-medium-border bg-risk-medium-bg',
      bar: 'bg-risk-medium-text',
    },
    low: {
      container: 'border-risk-low-border bg-risk-low-bg',
      bar: 'bg-risk-low-text',
    },
  };
  return (
    <div
      className={cn(
        'p-4 rounded-lg border mb-4',
        variantClasses[variant].container,
      )}
    >
      <div className="flex items-center font-bold text-lg mb-2">
        {icon}
        <span className="ml-2">{title}</span>
      </div>
      <p>
        <strong>Valor Actual:</strong> {value}
      </p>
      <p>
        <strong>Contribución al Score:</strong>{' '}
        <span className="text-primary font-bold">+{contribution} puntos</span> (
        {weight}% peso en modelo)
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
        <div
          className={cn('h-2.5 rounded-full', variantClasses[variant].bar)}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="text-sm text-text-secondary flex items-center">
        <AlertTriangle className="w-4 h-4 mr-1" />
        {explanation}
      </p>
    </div>
  );
};

const RiskScoreBreakdown = ({ student }: { student: Student }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose del Score de Riesgo</CardTitle>
      </CardHeader>
      <CardContent>
        <RiskFactorCard
          icon={<FileText />}
          title="Faltas Injustificadas"
          value={`${student.riskFactors.absences.value} faltas`}
          contribution={student.riskFactors.absences.contribution}
          weight={student.riskFactors.absences.weight}
          score={student.riskScore}
          variant="critical"
          explanation="Más de 3 faltas injustificadas aumenta el riesgo de deserción significativamente."
        />
        <RiskFactorCard
          icon={<Users />}
          title="Índice de Vulnerabilidad"
          value={student.riskFactors.vulnerability.value.toString()}
          contribution={student.riskFactors.vulnerability.contribution}
          weight={student.riskFactors.vulnerability.weight}
          score={student.riskScore}
          variant="critical"
          explanation="Un quintil bajo indica una alta vulnerabilidad socioeconómica."
        />
        <RiskFactorCard
          icon={<Laptop />}
          title="Acceso a Tecnología"
          value={student.riskFactors.laptop.value ? 'Sí' : 'No'}
          contribution={student.riskFactors.laptop.contribution}
          weight={student.riskFactors.laptop.weight}
          score={student.riskScore}
          variant="medium"
          explanation="La falta de laptop tiene un impacto medible de -8.5 puntos en el promedio general."
        />
        <RiskFactorCard
          icon={<Users />}
          title="Apoyo Familiar"
          value={student.riskFactors.familySupport.value.toString()}
          contribution={student.riskFactors.familySupport.contribution}
          weight={student.riskFactors.familySupport.weight}
          score={student.riskScore}
          variant="medium"
          explanation="Bajo apoyo familiar es un predictor clave de riesgo académico."
        />
      </CardContent>
    </Card>
  );
};

export default RiskScoreBreakdown;
