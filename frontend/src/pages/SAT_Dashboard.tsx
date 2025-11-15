import React, { useState } from 'react';
import { Student } from '../types';
import { useNavigate } from 'react-router-dom';
import { useStudentData } from '../context/StudentDataContext';

const SAT_Dashboard = () => {
  const { students } = useStudentData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const navigate = useNavigate();

  const handleStudentClick = (student: Student) => {
    navigate(`/student/${student.id}`);
  };

  const filteredStudents = students
    .filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter(
      (student) => filterCourse === 'all' || student.grade === filterCourse,
    )
    .filter(
      (student) => filterRisk === 'all' || student.riskLevel === filterRisk,
    );

  const totalStudents = students.length;
  const criticalRiskCount = students.filter(
    (s) => s.riskLevel === 'Critical',
  ).length;
  const mediumRiskCount = students.filter(
    (s) => s.riskLevel === 'Medium',
  ).length;
  const averageRiskScore =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, s) => acc + s.riskScore, 0) / totalStudents,
        )
      : 0;

  return (
    <div>
      <div className="mb-12">
        <h1
          className="text-4xl font-extrabold text-slate-900"
          style={{ letterSpacing: '-0.025em' }}
        >
          Dashboard de Alertas Tempranas
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Vista general del riesgo estudiantil en la institución.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card border border-slate-200 flex items-center gap-5">
          <div className="bg-blue-100 text-blue-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            👥
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalStudents}
            </div>
            <div className="text-sm font-medium text-slate-600">
              Total de Estudiantes
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card border border-slate-200 flex items-center gap-5">
          <div className="bg-red-100 text-red-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {criticalRiskCount}
            </div>
            <div className="text-sm font-medium text-slate-600">
              Riesgo Crítico
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card border border-slate-200 flex items-center gap-5">
          <div className="bg-yellow-100 text-yellow-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {mediumRiskCount}
            </div>
            <div className="text-sm font-medium text-slate-600">
              Riesgo Medio
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card border border-slate-200 flex items-center gap-5">
          <div className="bg-purple-100 text-purple-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
            📊
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {averageRiskScore}
            </div>
            <div className="text-sm font-medium text-slate-600">
              Score Promedio
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-critical-background border-l-4 border-critical-accent p-5 rounded-lg mb-8 flex items-start gap-4">
        <div className="text-critical-accent text-2xl mt-1">🚨</div>
        <div>
          <h3 className="text-base font-bold text-critical-text">
            Alertas Recientes
          </h3>
          <ul className="list-disc list-inside mt-2 text-sm text-critical-text space-y-1">
            <li>
              2 estudiantes han superado 5 faltas este mes (↑ vs mes anterior)
            </li>
            <li>
              3 estudiantes críticos sin laptop necesitan intervención urgente
            </li>
            <li>
              Promedio general de riesgo alto: {averageRiskScore}/100 (↑5.2% vs
              último trimestre)
            </li>
          </ul>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-slate-200 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar estudiante por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Cursos</option>
              <option value="10mo A">10mo A</option>
              <option value="9no B">9no B</option>
              <option value="9no A">9no A</option>
              <option value="8vo C">8vo C</option>
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Curso
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Nivel de Riesgo
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Score
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Alertas Principales
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">
                    {student.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">{student.grade}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      student.riskLevel === 'Critical'
                        ? 'bg-critical-background text-critical-text'
                        : student.riskLevel === 'Medium'
                          ? 'bg-medium-background text-medium-text'
                          : 'bg-low-background text-low-text'
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
                    {student.riskScore}
                  </span>
                  <span className="text-sm text-slate-500"> / 100</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {student.alerts.absences && student.alerts.absences > 3 && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-md">
                        📋 {student.alerts.absences} Faltas
                      </span>
                    )}
                    {!student.alerts.hasLaptop && (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-md">
                        💻 Sin Laptop
                      </span>
                    )}
                    {student.alerts.familySupport === 'Low' && (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-md">
                        👥 Apoyo Bajo
                      </span>
                    )}
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
