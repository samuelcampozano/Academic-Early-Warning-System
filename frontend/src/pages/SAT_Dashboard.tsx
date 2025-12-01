import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSatData, { SatStudent } from '../hooks/useSatData';
import useInstitutionalData from '../hooks/useInstitutionalData';
import GenericBarChart from '../components/charts/GenericBarChart';
import GenericDonutChart from '../components/charts/GenericDonutChart';
import { Search, Filter, Users, AlertTriangle, Shield, BarChart2, HelpCircle } from 'lucide-react';

const SAT_Dashboard = () => {
  const { data: students, loading: studentsLoading, error: studentsError } = useSatData();
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedQuintile, setSelectedQuintile] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk'); // New: sort state
  
  const navigate = useNavigate();

  const handleStudentClick = (student: SatStudent) => {
    navigate(`/student/${student.id}`);
  };

  // Derive unique courses and quintiles for filters
  const courses = useMemo(() => {
    const uniqueCourses = Array.from(new Set(students.map(s => s.course)));
    
    // Custom sort for courses (8vo, 9no, 10mo, 1ro, 2do, 3ro)
    return uniqueCourses.sort((a, b) => {
      const getNum = (s: string) => {
        const match = s.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      
      const numA = getNum(a);
      const numB = getNum(b);
      
      // Treat 1, 2, 3 (BGU) as higher than 8, 9, 10 (EGB)
      const adjustNum = (n: number) => (n < 7 ? n + 12 : n);
      
      const valA = adjustNum(numA);
      const valB = adjustNum(numB);
      
      if (valA !== valB) return valA - valB;
      return a.localeCompare(b);
    });
  }, [students]);

  const formatCourseLabel = (course: string) => {
    // Handle raw database values (e.g., '8', '9', '10', '1BGU', '2BGU', '3BGU')
    // and also formatted values (e.g., '10mo A', '1ro BGU A')
    
    if (!course) return 'Sin curso';
    
    // Check if it's a raw grade value from database
    const rawGradeMatch = course.match(/^(\d+)(BGU)?$/i);
    if (rawGradeMatch) {
      const num = parseInt(rawGradeMatch[1]);
      const isBGU = rawGradeMatch[2]?.toUpperCase() === 'BGU';
      
      if (isBGU || (num >= 1 && num <= 3 && !rawGradeMatch[2])) {
        // Check context - if number is 1-3 and matches BGU pattern
        if (isBGU) {
          return `${num}° Bachillerato (BGU)`;
        }
      }
      
      // EGB grades (1-10)
      if (num >= 1 && num <= 10) {
        return `${num}° EGB (Educación General Básica)`;
      }
    }
    
    // Try to parse formatted course strings like "10mo A"
    const formattedMatch = course.match(/(\d+)(?:mo|vo|no|ro|do)?\s*(?:EGB|BGU)?\s*([A-Z])?/i);
    if (formattedMatch) {
      const num = parseInt(formattedMatch[1]);
      const letter = formattedMatch[2] || '';
      
      if (num >= 8 && num <= 10) {
        return `${num}° EGB${letter ? ` "${letter}"` : ''}`;
      } else if (num >= 1 && num <= 3) {
        return `${num}° Bachillerato${letter ? ` "${letter}"` : ''}`;
      }
    }
    
    return course;
  };

  const quintiles = useMemo(() => {
    const uniqueQuintiles = Array.from(new Set(students.map(s => s.quintile))).sort();
    return uniqueQuintiles;
  }, [students]);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRisk === 'all' || student.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
    const matchesQuintile = selectedQuintile === 'all' || student.quintile === selectedQuintile;
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    
    return matchesSearch && matchesRisk && matchesQuintile && matchesCourse;
  });

  // Sort students based on selected criteria
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents];
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'es'));
      case 'risk':
        return sorted.sort((a, b) => b.riskScore - a.riskScore);
      case 'risk-asc':
        return sorted.sort((a, b) => a.riskScore - b.riskScore);
      case 'course':
        return sorted.sort((a, b) => {
          // Custom sort: EGB 1-10, then BGU 1-3
          const getOrder = (c: string) => {
            const num = parseInt(c.match(/\d+/)?.[0] || '0');
            const isBGU = c.toLowerCase().includes('bgu');
            return isBGU ? num + 10 : num;
          };
          return getOrder(a.course) - getOrder(b.course);
        });
      default:
        return sorted.sort((a, b) => b.riskScore - a.riskScore);
    }
  }, [filteredStudents, sortBy]);

  if (studentsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (studentsError) {
    return <div className="text-red-600 p-4">Error cargando estudiantes: {studentsError}</div>;
  }

  const totalStudents = students.length;
  const criticalRisk = students.filter(s => s.riskLevel === 'Critical').length;
  const mediumRisk = students.filter(s => s.riskLevel === 'Medium').length;
  const averageRiskScore = students.reduce((sum, s) => sum + s.riskScore, 0) / (totalStudents || 1);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard de Alertas Tempranas
          </h1>
          <div className="group relative">
            <HelpCircle className="w-5 h-5 text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl hidden group-hover:block z-50">
              <p className="font-semibold mb-1">¿Cómo funciona?</p>
              El sistema calcula un <strong>Score de Riesgo (0-100)</strong> utilizando un modelo de Machine Learning que analiza factores socioeconómicos (Quintil) y barreras de aprendizaje.
            </div>
          </div>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Monitoreo en tiempo real del riesgo académico y socioeconómico.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          icon={<Users className="w-6 h-6 text-blue-600" />}
          value={totalStudents}
          label="Total Estudiantes"
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <SummaryCard 
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          value={criticalRisk}
          label="Riesgo Crítico"
          color="bg-red-50 dark:bg-red-900/20"
        />
        <SummaryCard 
          icon={<Shield className="w-6 h-6 text-yellow-600" />}
          value={mediumRisk}
          label="Riesgo Medio"
          color="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <SummaryCard 
          icon={<BarChart2 className="w-6 h-6 text-purple-600" />}
          value={averageRiskScore.toFixed(1)}
          label="Score Promedio"
          subLabel="/ 100"
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Charts Section */}
      {institutionalStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <GenericBarChart 
              data={institutionalStats.topBarriers} 
              title="Top 10 Barreras Predictivas" 
              horizontal={true}
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <GenericDonutChart 
              data={institutionalStats.riskDistribution} 
              title="Distribución de Riesgo" 
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <GenericDonutChart 
              data={institutionalStats.quintilDistribution} 
              title="Distribución por Quintil" 
            />
          </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <GenericBarChart 
              data={institutionalStats.laptopImpact} 
              title="Impacto de Laptop en Promedio" 
              yMin={8.0}
              yMax={9.2}
            />
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <FilterSelect 
              value={selectedRisk} 
              onChange={setSelectedRisk} 
              options={[
                { value: 'all', label: 'Todos los Riesgos' },
                { value: 'Critical', label: 'Crítico' },
                { value: 'Medium', label: 'Medio' },
                { value: 'Low', label: 'Bajo' },
              ]} 
            />
            
            <FilterSelect 
              value={selectedQuintile} 
              onChange={setSelectedQuintile} 
              options={[
                { value: 'all', label: 'Todos los Quintiles' },
                ...quintiles.map(q => ({ value: q, label: q }))
              ]} 
            />

            <FilterSelect 
              value={selectedCourse} 
              onChange={setSelectedCourse} 
              options={[
                { value: 'all', label: 'Todos los Cursos' },
                ...courses.map(c => ({ value: c, label: formatCourseLabel(c) }))
              ]} 
            />

            <FilterSelect 
              value={sortBy} 
              onChange={setSortBy} 
              options={[
                { value: 'risk', label: '↓ Mayor Riesgo' },
                { value: 'risk-asc', label: '↑ Menor Riesgo' },
                { value: 'name-asc', label: 'A-Z (Nombre)' },
                { value: 'name-desc', label: 'Z-A (Nombre)' },
                { value: 'course', label: 'Por Curso' },
              ]} 
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quintil</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Riesgo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alertas</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {sortedStudents.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => handleStudentClick(student)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {formatCourseLabel(student.course)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {student.quintile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <RiskBadge level={student.riskLevel} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {student.riskScore.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {student.keyBarriers.slice(0, 2).map((barrier, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          {barrier}
                        </span>
                      ))}
                      {student.subjectsAtRisk > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {student.subjectsAtRisk} Materias
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedStudents.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No se encontraron estudiantes con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subLabel?: string;
  color: string;
}

const SummaryCard = ({ icon, value, label, subLabel, color }: SummaryCardProps) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-baseline gap-1">
        {value}
        {subLabel && <span className="text-sm font-normal text-slate-500">{subLabel}</span>}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  </div>
);

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const FilterSelect = ({ value, onChange, options }: FilterSelectProps) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
);

const RiskBadge = ({ level }: { level: string }) => {
  const styles = {
    Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level as keyof typeof styles]}`}>
      {level === 'Critical' && '⚠️ '}
      {level === 'Medium' && '🛡️ '}
      {level === 'Low' && '✅ '}
      {level}
    </span>
  );
};

export default SAT_Dashboard;
