import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentData } from '../context/StudentDataContext';
import KeyBarriers from '../components/KeyBarriers';
import SubjectPerformance from '../components/SubjectPerformance';
import RecommendedActions from '../components/RecommendedActions';
import AlertHistory from '../components/AlertHistory';
import Notes from '../components/Notes';

const StudentProfile = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { students } = useStudentData();
  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700">
          Estudiante no encontrado
        </h2>
        <p className="text-slate-500 mt-2">
          Por favor, regresa al dashboard y selecciona un estudiante.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Dashboard
        </Link>
        <span className="text-slate-400">›</span>
        <span className="text-slate-600 font-medium">
          Perfil del Estudiante
        </span>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 md:p-8 mb-6 md:mb-8 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
              {student.name}
            </h1>
            <p className="text-lg text-slate-600 mb-4">{student.grade}</p>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase ${
                student.riskLevel === 'Critical'
                  ? 'bg-red-100 text-red-800 border-2 border-red-300'
                  : student.riskLevel === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                    : 'bg-green-100 text-green-800 border-2 border-green-300'
              }`}
            >
              {student.riskLevel === 'Critical'
                ? '⚠️'
                : student.riskLevel === 'Medium'
                  ? '🔶'
                  : '✅'}
              {student.riskLevel}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="relative w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                border: `8px solid ${
                  student.riskLevel === 'Critical'
                    ? '#DC2626'
                    : student.riskLevel === 'Medium'
                      ? '#F59E0B'
                      : '#10B981'
                }`,
                backgroundColor: '#FFFFFF',
              }}
            >
              <div className="text-center">
                <div className="text-5xl font-extrabold text-slate-900">
                  {student.riskScore}
                </div>
                <div className="text-sm text-slate-500 font-medium">/100</div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-slate-600">
              Score de Riesgo
            </div>
          </div>
        </div>
      </div>

      {/* Student Overview Card */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-8 border-2 border-blue-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> Perfil del Estudiante
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Información Demográfica
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Edad:</span>
              <span className="text-sm font-bold text-slate-900">
                {student.age} años
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Estrato:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {student.socioeconomicStratum} (Vulnerable)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Nivel Representante:
              </span>
              <span className="text-sm font-bold text-slate-900">
                Bachillerato
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Vulnerabilidad:
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700">
                <span>⚠️</span> {student.alerts.quintile} - Más Vulnerable
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Situación Académica
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Promedio General:
              </span>
              <span className="text-sm font-bold text-slate-900">7.8 / 10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Asistencia:
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700">
                <span>⚠️</span> 87% ({student.alerts.absences} faltas)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Ranking en Curso:
              </span>
              <span className="text-sm font-bold text-slate-900">
                Puesto 8/12
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Materias en Riesgo:
              </span>
              <span className="text-sm font-bold text-orange-700">
                2 materias
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Recursos Disponibles
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Laptop:
              </span>
              <span className="text-sm font-bold text-red-700">
                {student.alerts.hasLaptop ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Internet en Casa:
              </span>
              <span className="text-sm font-bold text-green-700">✅ Sí</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Espacio de Estudio:
              </span>
              <span className="text-sm font-bold text-red-700">❌ No</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Apoyo Familiar:
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-700">
                <span>⚠️</span> {student.alerts.familySupport}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Risk Score Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Desglose del Score de Riesgo
            </h2>
            <div className="space-y-6">
              {Object.entries(student.riskFactors).map(([key, factor]) => (
                <div
                  key={key}
                  className={`rounded-xl p-5 border ${
                    factor.contribution > 20
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    {key}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Valor Actual:
                      </span>
                      <span className="font-bold text-slate-900">
                        {typeof factor.value === 'boolean'
                          ? factor.value
                            ? 'Sí'
                            : 'No'
                          : factor.value}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Contribución al Score:
                      </span>
                      <span className="font-bold text-blue-600">
                        +{factor.contribution} puntos ({factor.weight}% peso)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${factor.contribution > 20 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}
                      style={{ width: `${factor.weight}%` }}
                    ></div>
                  </div>
                  <div
                    className={`flex items-start gap-2 text-sm text-slate-700 bg-white rounded-lg p-3 border ${
                      factor.contribution > 20
                        ? 'border-red-200'
                        : 'border-orange-200'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <p className="leading-relaxed">{factor.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <KeyBarriers student={student} />
          <SubjectPerformance student={student} />
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <RecommendedActions student={student} />
          <AlertHistory />
          <Notes />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
