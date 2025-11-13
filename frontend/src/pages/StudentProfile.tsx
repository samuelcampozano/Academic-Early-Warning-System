import React from 'react';
import { Link } from 'react-router-dom';
import useStudentProfile from '../hooks/useStudentProfile';
import { ChevronRight, Info, Mail, Clipboard, History, PlusCircle } from 'lucide-react';

const LoadingComponent = () => <div className="loading">Cargando perfil...</div>;
const ErrorComponent = ({ error }: { error: string | null }) => <div className="error">Error: {error}</div>;

const RiskScoreCircle = ({ score, level }: { score: number, level: string }) => {
  const colorMap: { [key: string]: string } = {
    'Crítico': 'border-red-500',
    'Medio': 'border-yellow-500',
    'Bajo': 'border-green-500',
  };

  return (
    <div className={`relative h-24 w-24 rounded-full flex items-center justify-center bg-gray-50 ${colorMap[level] || 'border-gray-300'} border-4`}>
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-800">{score}</p>
        <p className="text-xs text-gray-500">/ 100</p>
      </div>
    </div>
  );
};

export default function StudentProfile() {
  const { profile, loading, error } = useStudentProfile();

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !profile) {
    return <ErrorComponent error={error || 'No se encontró el perfil'} />;
  }

  const { name, course, risk_level, risk_score, risk_factors, key_barriers, key_grades } = profile;

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Perfil del Estudiante</span>
        </div>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
            <p className="text-gray-600 mt-1">{course}</p>
          </div>
          <div className="flex items-center gap-4">
            <RiskScoreCircle score={risk_score} level={risk_level} />
            <div>
              <p className="text-sm font-medium text-gray-500">Score de Riesgo</p>
              {/* Risk Badge can be its own component */}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Risk Score Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose del Score de Riesgo</h3>
            <div className="space-y-4">
              {risk_factors.map(factor => (
                <div key={factor.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                    <span className="text-sm font-bold text-gray-800">{factor.weight}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: factor.weight }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Barriers */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Barreras Clave (Hallazgos Tesis) <Info className="h-4 w-4 ml-2 text-gray-400" />
            </h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barrera</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impacto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {key_barriers.map(barrier => (
                  <tr key={barrier.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{barrier.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{barrier.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{barrier.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rendimiento en Materias Clave</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio del Curso</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {key_grades.map(grade => (
                  <tr key={grade.subject}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Recomendadas</h3>
            <div className="flex flex-col space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Mail className="h-4 w-4 mr-2" /> Contactar Familia
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Clipboard className="h-4 w-4 mr-2" /> Registrar Intervención
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50">
                <History className="h-4 w-4 mr-2" /> Ver Historial Completo
              </button>
            </div>
          </div>

          {/* Alert History */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Alertas</h3>
            {/* Timeline for alerts */}
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notas</h3>
            <textarea className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" rows={4} placeholder="Añadir una nota..."></textarea>
            <button className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" /> Guardar Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
