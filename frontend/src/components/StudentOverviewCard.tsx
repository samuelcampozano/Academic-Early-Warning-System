import React from 'react';
import { Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StudentOverviewCardProps {
  student: Student;
}

const StudentOverviewCard = ({ student }: StudentOverviewCardProps) => {
  return (
    <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle>📋 Perfil del Estudiante</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-900 dark:text-slate-100">
          <div>
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Información Demográfica
            </h4>
            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Edad:</strong> {student.age} años
              </p>
              <p>
                <strong>Estrato Socioeconómico:</strong>{' '}
                {student.socioeconomicStratum} (Vulnerable)
              </p>
              <p>
                <strong>Nivel Representante:</strong> Bachillerato
              </p>
              <p className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-risk-critical-text" />
                <strong>Índice Vulnerabilidad:</strong>{' '}
                {student.alerts.quintile} - Más Vulnerable
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Situación Académica</h4>
            <div className="space-y-2">
              <p>
                <strong>Promedio General:</strong>{' '}
                {Object.values(student.performance).reduce(
                  (acc, p) => acc + p.studentGrade,
                  0,
                ) / Object.values(student.performance).length}
                /10
              </p>
              <p className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-risk-critical-text" />
                <strong>Asistencia:</strong> 87% ({student.alerts.absences}{' '}
                faltas injustificadas)
              </p>
              <p>
                <strong>Ranking en Curso:</strong> Puesto 8/12
              </p>
              <p>
                <strong>Materias en Riesgo:</strong> 2 (Matemáticas, Estudios
                Sociales)
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Recursos Disponibles</h4>
            <div className="space-y-2">
              <p className="flex items-center">
                {student.alerts.hasLaptop ? (
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1 text-red-500" />
                )}
                <strong>Laptop:</strong>{' '}
                {student.alerts.hasLaptop ? 'Sí' : 'No'}
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                <strong>Internet en Casa:</strong> Sí
              </p>
              <p className="flex items-center">
                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                <strong>Espacio de Estudio:</strong> No
              </p>
              <p className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-risk-critical-text" />
                <strong>Apoyo Familiar:</strong> {student.alerts.familySupport}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentOverviewCard;
