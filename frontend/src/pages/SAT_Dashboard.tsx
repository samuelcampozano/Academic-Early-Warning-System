import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSatData from '../hooks/useSatData';
import { SatStudent } from '../hooks/useSatData';

const SAT_Dashboard = () => {
  const { data: students, loading, error } = useSatData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const navigate = useNavigate();

  const handleStudentClick = (student: SatStudent) => {
    navigate(`/student/${student.id}`);
  };

  if (loading) {
    return <div>Cargando estudiantes...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  // Filter students based on search and risk level
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRisk =
      selectedRisk === 'all' ||
      student.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  // Calculate summary statistics from real data
  const totalStudents = students.length;
  const criticalRisk = students.filter(
    (s) => s.riskLevel === 'Critical',
  ).length;
  const mediumRisk = students.filter((s) => s.riskLevel === 'Medium').length;

  const averageRiskScore =
    students.reduce((sum, s) => sum + s.riskScore, 0) / (totalStudents || 1);

  return (
    <div>
      <div className="mb-12">
        <h1
          className="text-4xl font-extrabold text-slate-900 dark:text-slate-100"
          style={{ letterSpacing: '-0.025em' }}
        >
          Dashboard de Alertas Tempranas
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Vista general del riesgo estudiantil en la institución.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            👥
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalStudents}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total de Estudiantes
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {criticalRisk}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Riesgo Crítico
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {mediumRisk}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Riesgo Medio
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            📊
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {averageRiskScore.toFixed(1)}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Score Promedio
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 dark:border-red-500 p-5 rounded-lg mb-8 flex items-start gap-4">
        <div className="text-red-600 dark:text-red-400 text-2xl mt-1">🚨</div>
        <div>
          <h3 className="text-base font-bold text-red-800 dark:text-red-400">
            Alertas Recientes
          </h3>
          <ul className="list-disc list-inside mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
            <li>
              2 estudiantes han superado 5 faltas este mes (↑ vs mes anterior)
            </li>
            <li>
              3 estudiantes críticos sin laptop necesitan intervención urgente
            </li>
            <li>
              Promedio general de riesgo alto: {averageRiskScore.toFixed(1)}/100
              (↑5.2% vs último trimestre)
            </li>
          </ul>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card border border-slate-200 dark:border-slate-700 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar estudiante por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Riesgos</option>
              <option value="Critical">Crítico</option>
              <option value="Medium">Medio</option>
              <option value="Low">Bajo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                >
                  Curso
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                >
                  Nivel de Riesgo
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                >
                  Score
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                >
                  Alertas Principales
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {student.course}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        student.riskLevel === 'Critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : student.riskLevel === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {student.riskLevel === 'Critical' && '⚠️'}
                      {student.riskLevel === 'Medium' && '🔶'}
                      {student.riskLevel === 'Low' && '✅'}
                      {student.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-xl font-bold text-slate-800">
                      {student.riskScore.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500"> / 100</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {student.subjectsAtRisk > 0 && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-md">
                          📚 {student.subjectsAtRisk} Materias en riesgo
                        </span>
                      )}
                      {student.keyBarriers.length > 0 && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-md">
                          🚧 {student.keyBarriers[0]}
                        </span>
                      )}
                      {/* Add more alerts based on actual data if available */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SAT_Dashboard;
