import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine,
  Line,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import useInstitutionalData from '../hooks/useInstitutionalData';
import useScoreDistributions from '../hooks/useScoreDistributions';

// Fix for Recharts type compatibility with React 18
const PolarAngleAxisAny = PolarAngleAxis as any;
const PolarRadiusAxisAny = PolarRadiusAxis as any;

const InstitutionalView = () => {
  const { stats, loading, error } = useInstitutionalData();
  const { distributions, insights, loading: distLoading } = useScoreDistributions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#475569';
  const cursorFill = isDark ? '#334155' : '#f1f5f9';
  
  // Tab state for different analysis sections
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600 dark:text-slate-400">
          Cargando estadísticas institucionales...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600 dark:text-slate-400">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Transform Chart.js format to Recharts format
  const topBarriersData = stats.topBarriers.labels.map((label, index) => ({
    name: label,
    value: stats.topBarriers.datasets[0].data[index],
  }));

  const laptopImpactData = stats.laptopImpact.labels.map((label, index) => ({
    name: label,
    value: stats.laptopImpact.datasets[0].data[index],
    fill: Array.isArray(stats.laptopImpact.datasets[0].backgroundColor)
      ? stats.laptopImpact.datasets[0].backgroundColor[index]
      : stats.laptopImpact.datasets[0].backgroundColor,
  }));

  const educationImpactData = stats.parentEducationImpact.labels.map(
    (label, index) => ({
      name: label,
      value: stats.parentEducationImpact.datasets[0].data[index],
      fill: Array.isArray(
        stats.parentEducationImpact.datasets[0].backgroundColor,
      )
        ? stats.parentEducationImpact.datasets[0].backgroundColor[index]
        : stats.parentEducationImpact.datasets[0].backgroundColor,
    }),
  );

  const riskDistributionData = stats.riskDistribution.labels.map(
    (label: string, index: number) => ({
      name: label,
      value: stats.riskDistribution.datasets[0].data[index],
      fill: Array.isArray(stats.riskDistribution.datasets[0].backgroundColor)
        ? stats.riskDistribution.datasets[0].backgroundColor![index]
        : stats.riskDistribution.datasets[0].backgroundColor,
    }),
  );

  const barriersCategoriesData = stats.barriersCategories
    ? stats.barriersCategories.labels.map((label, index) => ({
        subject: label,
        A: stats.barriersCategories.datasets[0].data[index],
        fullMark: 15, // Assuming max importance is around 12-15%
      }))
    : [];

  // Quintile Distribution Data
  const quintileDistributionData = stats.quintilDistribution.labels.map(
    (label: string, index: number) => ({
      name: label,
      value: stats.quintilDistribution.datasets[0].data[index],
      fill: Array.isArray(stats.quintilDistribution.datasets[0].backgroundColor)
        ? stats.quintilDistribution.datasets[0].backgroundColor[index]
        : stats.quintilDistribution.datasets[0].backgroundColor,
    }),
  );

  // Family Support Impact Data (Correlation Chart)
  const familySupportData = stats.familySupportImpact.labels.map(
    (label: string, index: number) => ({
      name: label,
      value: stats.familySupportImpact.datasets[0].data[index],
    }),
  );



  // Prepare data for "Median with Range" plot (Simulated Box Plot)
  const performanceData = stats.performanceByQuintile.labels.map((label, index) => {
    const d = stats.performanceByQuintile.datasets[0].data[index];
    return {
      name: label,
      median: d.median,
      min: d.min,
      max: d.max,
      q1: d.q1,
      q3: d.q3,
      // For Recharts ErrorBar, we need 'error' value. 
      // But ErrorBar is symmetric.
      // So we can't use standard ErrorBar for asymmetric ranges.
      // We will use a ComposedChart with:
      // 1. Bar (transparent) from Min to Max? No.
      // 2. We will use a "Floating Bar" for Q1-Q3.
      // 3. And lines for whiskers.
      // Recharts Bar can take [min, max] array for value!
      boxRange: [d.q1, d.q3],
      whiskerMin: [d.min, d.min], // Hack to draw lines?
      whiskerMax: [d.max, d.max],
    };
  });

  // You can uncomment and adapt other charts if they are included in the stats.
  // For now, I will only include the ones that were explicitly mentioned to be replaced.
  // The structure of the component itself remains similar, just the data source changes.

  return (
    <div>
      <div className="mb-8 md:mb-12">
        <h1
          className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100"
          style={{ letterSpacing: '-0.025em' }}
        >
          Visión Institucional
        </h1>
        <p className="mt-2 text-base md:text-lg text-slate-600 dark:text-slate-400">
          Análisis de barreras y factores de riesgo a nivel institucional.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            📊 Resumen General
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'detailed'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🔍 Análisis Detallado
          </button>
        </nav>
      </div>

      {/* TAB: Detailed Analysis - Combined Exploration + Advanced */}
      {activeTab === 'detailed' && (
        <div className="space-y-8">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">🔍 Análisis Detallado</h2>
            <p className="text-indigo-100">
              Análisis descriptivo completo y distribuciones estadísticas del dataset estudiantil.
              Incluye exploración de datos, comparaciones y métricas avanzadas.
            </p>
          </div>

          {/* Summary Statistics Cards */}
          {insights?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.summary.totalStudents}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Estudiantes</div>
                <div className="text-xs text-slate-500 mt-2">n = {insights.summary.studentsWithData} con datos</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {insights.summary.avgGrade.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">GPA Promedio</div>
                <div className="text-xs text-slate-500 mt-2">Escala 0-10</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {insights.summary.studentsWithBarriers}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Con 3+ Barreras</div>
                <div className="text-xs text-slate-500 mt-2">
                  {((insights.summary.studentsWithBarriers / insights.summary.totalStudents) * 100).toFixed(1)}% del total
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {distributions?.riskScoreDistribution?.std?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Desv. Estándar Riesgo</div>
                <div className="text-xs text-slate-500 mt-2">σ del score de riesgo</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Grade Distribution Histogram */}
            {distributions?.overallGradeHistogram && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  📊 Distribución de Calificaciones
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Histograma de promedios generales (GPA). Asimetría negativa indica más notas altas.
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={distributions.overallGradeHistogram.counts.map((count: number, index: number) => ({
                      bin: distributions.overallGradeHistogram!.labels[index],
                      count: count,
                      binStart: distributions.overallGradeHistogram!.binEdges[index],
                    }))}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="bin"
                      tick={{ fontSize: 9, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft', fill: textColor, fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: cursorFill }}
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '0.75rem',
                        color: textColor,
                      }}
                      formatter={(value: any) => [`${value} estudiantes`, 'Frecuencia']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributions.overallGradeHistogram.counts.map((_: number, index: number) => {
                        const binStart = distributions.overallGradeHistogram!.binEdges[index];
                        const color = binStart < 7 ? '#ef4444' : binStart < 8 ? '#f59e0b' : '#22c55e';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                    <ReferenceLine x="7.0-7.5" stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Umbral Aprobación (7.0)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-center gap-4 text-xs">
                  <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded mr-1"></span>Reprobados (&lt;7)</span>
                  <span className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded mr-1"></span>En riesgo (7-8)</span>
                  <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-1"></span>Aprobados (&gt;8)</span>
                </div>
              </div>
            )}

            {/* Grades by Quintile - Violin-style */}
            {distributions?.gradesByQuintile && Object.keys(distributions.gradesByQuintile).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  📈 GPA por Quintil Socioeconómico
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Comparación de distribuciones (IQR + mediana). Se observa correlación quintil-rendimiento.
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart
                    data={Object.entries(distributions.gradesByQuintile)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([quintile, stats]: [string, any]) => ({
                        name: quintile,
                        boxRange: [stats.q1, stats.q3],
                        median: stats.median,
                        mean: stats.mean,
                        min: stats.min,
                        max: stats.max,
                        count: stats.count,
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'GPA', angle: -90, position: 'insideLeft', fill: textColor, fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-3 border rounded-lg shadow-lg ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                              <p className="font-bold mb-2">{data.name}</p>
                              <p>n = {data.count} estudiantes</p>
                              <p>Máx: {data.max?.toFixed(2)}</p>
                              <p>Q3: {data.boxRange?.[1]?.toFixed(2)}</p>
                              <p className="font-bold text-blue-500">Media: {data.mean?.toFixed(2)}</p>
                              <p>Mediana: {data.median?.toFixed(2)}</p>
                              <p>Q1: {data.boxRange?.[0]?.toFixed(2)}</p>
                              <p>Mín: {data.min?.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="boxRange" barSize={40} radius={[4, 4, 4, 4]} fillOpacity={0.7}>
                      {Object.keys(distributions.gradesByQuintile).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][index]}
                          stroke={['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb'][index]}
                        />
                      ))}
                    </Bar>
                    <Scatter dataKey="median" fill="#1e293b" shape="diamond" />
                    <Line type="monotone" dataKey="mean" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-center gap-4 text-xs">
                  <span className="flex items-center"><span className="w-3 h-3 bg-purple-500 rounded-full mr-1"></span>Línea: Media</span>
                  <span className="flex items-center"><span className="w-3 h-3 bg-slate-800 dark:bg-slate-200 mr-1" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span>Rombo: Mediana</span>
                </div>
              </div>
            )}

            {/* Bar Chart: Barriers Count vs GPA - Clear visualization */}
            {insights?.barriersImpact && Object.keys(insights.barriersImpact).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  📉 Impacto de Barreras en el Rendimiento
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  A mayor número de barreras, menor es el promedio académico.
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart
                    data={Object.entries(insights.barriersImpact)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([barriers, data]: [string, any]) => ({
                        name: `${barriers} ${parseInt(barriers) === 1 ? 'barrera' : 'barreras'}`,
                        gpa: data.avg_grade,
                        estudiantes: data.count,
                        barriers: parseInt(barriers),
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[8.5, 9.1]}
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'GPA Promedio', angle: -90, position: 'insideLeft', fill: textColor, fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Estudiantes', angle: 90, position: 'insideRight', fill: textColor, fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '0.75rem',
                        color: textColor,
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'gpa' ? value.toFixed(2) : value,
                        name === 'gpa' ? 'GPA Promedio' : 'Estudiantes'
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value: any) => (
                        <span style={{ color: textColor }}>
                          {value === 'estudiantes' ? '# Estudiantes' : 'GPA Promedio'}
                        </span>
                      )}
                    />
                    <Bar yAxisId="right" dataKey="estudiantes" fill="#94a3b8" opacity={0.5} radius={[4, 4, 0, 0]} barSize={50}>
                      <LabelList dataKey="estudiantes" position="top" style={{ fontSize: 10, fill: textColor }} />
                    </Bar>
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="gpa"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', r: 6, strokeWidth: 2, stroke: '#fff' }}
                    >
                      <LabelList dataKey="gpa" position="bottom" formatter={(v: any) => v?.toFixed(2)} style={{ fontSize: 11, fontWeight: 'bold', fill: '#ef4444' }} />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {Object.entries(insights.barriersImpact).find(([k]) => k === '0')?.[1]?.avg_grade?.toFixed(2) || 'N/A'}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">GPA sin barreras</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {(() => {
                        const maxBarriers = Math.max(...Object.keys(insights.barriersImpact).map(k => parseInt(k)));
                        return insights.barriersImpact[maxBarriers.toString()]?.avg_grade?.toFixed(2) || 'N/A';
                      })()}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300">GPA con más barreras</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-800 dark:text-amber-200">
                  <strong>📊 Hallazgo:</strong> Los estudiantes sin barreras tienen un GPA {(() => {
                    const zeroBarriers = insights.barriersImpact['0']?.avg_grade || 0;
                    const maxBarriers = Math.max(...Object.keys(insights.barriersImpact).map(k => parseInt(k)));
                    const maxGpa = insights.barriersImpact[maxBarriers.toString()]?.avg_grade || 0;
                    return (zeroBarriers - maxGpa).toFixed(2);
                  })()} puntos más alto que aquellos con múltiples barreras.
                </div>
              </div>
            )}

            {/* Grade Distribution by Risk Level */}
            {distributions?.gradesByRisk && Object.keys(distributions.gradesByRisk).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  ⚠️ Distribución por Nivel de Riesgo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Validación del modelo: estudiantes clasificados como &quot;Alto Riesgo&quot; tienen menor GPA.
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={['Alto', 'Medio', 'Bajo']
                      .filter(level => distributions.gradesByRisk[level])
                      .map(level => ({
                        name: `Riesgo ${level}`,
                        mean: distributions.gradesByRisk[level].mean,
                        median: distributions.gradesByRisk[level].median,
                        std: distributions.gradesByRisk[level].std,
                        count: distributions.gradesByRisk[level].count,
                        color: level === 'Alto' ? '#ef4444' : level === 'Medio' ? '#f59e0b' : '#22c55e',
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis type="number" domain={[7, 10]} tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '0.75rem',
                        color: textColor,
                      }}
                      formatter={(value: any, name: string, props: any) => [
                        `${value.toFixed(2)} (n=${props.payload.count}, σ=${props.payload.std?.toFixed(2)})`,
                        name === 'mean' ? 'Media' : 'Mediana'
                      ]}
                    />
                    <Bar dataKey="mean" radius={[0, 4, 4, 0]} barSize={30}>
                      {['Alto', 'Medio', 'Bajo'].map((level, index) => (
                        <Cell key={`cell-${index}`} fill={level === 'Alto' ? '#ef4444' : level === 'Medio' ? '#f59e0b' : '#22c55e'} />
                      ))}
                      <LabelList dataKey="mean" position="right" formatter={(v: any) => typeof v === 'number' ? v.toFixed(2) : v} style={{ fontSize: 12, fontWeight: 'bold', fill: textColor }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  {['Alto', 'Medio', 'Bajo'].filter(level => distributions.gradesByRisk[level]).map(level => (
                    <div key={level} className={`p-2 rounded ${level === 'Alto' ? 'bg-red-50 dark:bg-red-900/20' : level === 'Medio' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                      <div className="font-bold">{distributions.gradesByRisk[level].count}</div>
                      <div className="text-slate-500">estudiantes</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Descriptive Statistics Table */}
          {distributions && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                📋 Estadísticas Descriptivas Completas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Variable</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">n</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Media</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Mediana</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">σ (Std)</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Min</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Q1</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Q3</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions.riskScoreDistribution && (
                      <tr className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Score de Riesgo</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.count}</td>
                        <td className="py-3 px-4 text-center text-blue-600 dark:text-blue-400 font-semibold">{distributions.riskScoreDistribution.mean?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.median?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.std?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.min?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.q1?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.q3?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.riskScoreDistribution.max?.toFixed(2)}</td>
                      </tr>
                    )}
                    {distributions.laptopComparison?.withLaptop && (
                      <tr className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">GPA (Con Laptop)</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.count}</td>
                        <td className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{distributions.laptopComparison.withLaptop.mean?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.median?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.std?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.min?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.q1?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.q3?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withLaptop.max?.toFixed(2)}</td>
                      </tr>
                    )}
                    {distributions.laptopComparison?.withoutLaptop && (
                      <tr className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">GPA (Sin Laptop)</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.count}</td>
                        <td className="py-3 px-4 text-center text-red-600 dark:text-red-400 font-semibold">{distributions.laptopComparison.withoutLaptop.mean?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.median?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.std?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.min?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.q1?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.q3?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{distributions.laptopComparison.withoutLaptop.max?.toFixed(2)}</td>
                      </tr>
                    )}
                    {Object.entries(distributions.gradesByQuintile || {}).sort(([a], [b]) => a.localeCompare(b)).map(([quintile, stats]: [string, any]) => (
                      <tr key={quintile} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">GPA {quintile}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.count}</td>
                        <td className="py-3 px-4 text-center text-blue-600 dark:text-blue-400 font-semibold">{stats.mean?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.median?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.std?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.min?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.q1?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.q3?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{stats.max?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Findings from Data Exploration */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              💡 Hallazgos Clave de la Exploración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Distribución Asimétrica</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  La distribución de notas presenta asimetría negativa (más estudiantes con notas altas). 
                  El 6.2% de registros están por debajo del umbral de aprobación.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Correlación Quintil-GPA</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Existe correlación positiva entre quintil socioeconómico y rendimiento académico (r ≈ 0.23). 
                  Q5 supera a Q1 por ~1 punto promedio.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">💻</div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Brecha Digital</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Estudiantes con laptop tienen en promedio +0.12 puntos más que sin laptop. 
                  Esta diferencia es estadísticamente significativa (p &lt; 0.05).
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">⚠️</div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Efecto Acumulativo</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Estudiantes con 3+ barreras tienen GPA significativamente menor. 
                  El efecto de las barreras es multiplicativo, no aditivo.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">⚖️</div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Desbalance de Clases</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Solo 6.2% de estudiantes reprueban (clase minoritaria). 
                  El modelo usa técnicas de balanceo para evitar sesgo hacia la clase mayoritaria.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Validación del Modelo</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Los estudiantes clasificados como &quot;Alto Riesgo&quot; efectivamente tienen menor GPA promedio, 
                  confirmando la validez predictiva del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Statistical Analysis Section */}
          {!distLoading && distributions && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 mt-8">
                📈 Análisis Estadístico Avanzado
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Histogram: Risk Score Distribution */}
                {distributions.riskScoreHistogram && distributions.riskScoreHistogram.counts && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      📊 Distribución de Scores de Riesgo
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Histograma de puntajes de riesgo predichos por el modelo (0-100).
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={distributions.riskScoreHistogram.counts.map((count: number, index: number) => {
                          const binEnd = distributions.riskScoreHistogram!.binEdges[index + 1];
                          return {
                            bin: distributions.riskScoreHistogram!.labels[index],
                            count: count,
                            binEnd: binEnd,
                          };
                        })}
                        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis
                          dataKey="bin"
                          tick={{ fontSize: 9, fill: textColor }}
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: textColor }}
                          tickLine={false}
                          axisLine={false}
                          label={{ value: 'Estudiantes', angle: -90, position: 'insideLeft', fill: textColor, fontSize: 11 }}
                        />
                        <Tooltip
                          cursor={{ fill: cursorFill }}
                          contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                            borderRadius: '0.75rem',
                            color: textColor,
                          }}
                          formatter={(value: any) => [`${value} estudiantes`, 'Frecuencia']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {distributions.riskScoreHistogram.counts.map((_: number, index: number) => {
                            const binEnd = distributions.riskScoreHistogram!.binEdges[index + 1];
                            const color = binEnd <= 40 ? '#22c55e' : binEnd <= 70 ? '#f59e0b' : '#ef4444';
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex justify-center gap-4 text-xs">
                      <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-1"></span>Bajo Riesgo (0-40)</span>
                      <span className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded mr-1"></span>Medio (40-70)</span>
                      <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded mr-1"></span>Alto Riesgo (70+)</span>
                    </div>
                  </div>
                )}

                {/* Grades by Subject - Enhanced Bar Chart */}
                {distributions.gradesBySubject && Object.keys(distributions.gradesBySubject).length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      📚 Rendimiento por Materia
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Media y rango intercuartil (IQR) por asignatura.
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart
                        data={Object.entries(distributions.gradesBySubject).map(([subject, stats]: [string, any]) => ({
                          name: subject.length > 12 ? subject.substring(0, 12) + '...' : subject,
                          fullName: subject,
                          mean: stats.mean,
                          median: stats.median,
                          boxRange: [stats.q1, stats.q3],
                        }))}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis type="number" domain={['auto', 'auto']} tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: textColor }} tickLine={false} axisLine={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className={`p-3 border rounded-lg shadow-lg ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                                  <p className="font-bold mb-2">{data.fullName}</p>
                                  <p>Q3: {data.boxRange?.[1]?.toFixed(2)}</p>
                                  <p className="font-bold text-emerald-500">Media: {data.mean?.toFixed(2)}</p>
                                  <p>Mediana: {data.median?.toFixed(2)}</p>
                                  <p>Q1: {data.boxRange?.[0]?.toFixed(2)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="boxRange" barSize={16} radius={[4, 4, 4, 4]} fillOpacity={0.6}>
                          {Object.keys(distributions.gradesBySubject).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'][index % 6]}
                              stroke={['#7c3aed', '#0891b2', '#d97706', '#db2777', '#059669', '#2563eb'][index % 6]}
                            />
                          ))}
                        </Bar>
                        <Scatter dataKey="mean" fill="#ef4444" shape="circle" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Subjects at Risk and Gender Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Subjects at Risk */}
                {insights?.subjectsAtRisk && insights.subjectsAtRisk.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      ⚠️ Materias con Mayor Riesgo
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Asignaturas con mayor tasa de bajo rendimiento (GPA &lt; 7).
                    </p>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={insights.subjectsAtRisk
                          .filter((item: any) => !['Acompañamiento', 'PPE', 'Animación lectura'].includes(item.subject))
                          .slice(0, 5)
                          .map((item: any) => ({
                            name: item.subject.length > 10 ? item.subject.substring(0, 10) + '...' : item.subject,
                            fullName: item.subject,
                            riskPercentage: item.riskPercentage,
                            totalStudents: item.totalStudents,
                          }))}
                        layout="vertical"
                        margin={{ top: 10, right: 50, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: textColor }} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: cursorFill }}
                          contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                            borderRadius: '0.75rem',
                            color: textColor,
                          }}
                          formatter={(value: any, _: string, props: any) => [
                            `${value.toFixed(1)}% (n=${props.payload.totalStudents})`,
                            'Bajo Rendimiento'
                          ]}
                        />
                        <Bar dataKey="riskPercentage" radius={[0, 4, 4, 0]}>
                          {insights.subjectsAtRisk
                            .filter((item: any) => !['Acompañamiento', 'PPE', 'Animación lectura'].includes(item.subject))
                            .slice(0, 5)
                            .map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={index < 2 ? '#ef4444' : index < 4 ? '#f59e0b' : '#22c55e'} />
                            ))}
                          <LabelList dataKey="riskPercentage" position="right" formatter={(value: any) => `${value?.toFixed(1)}%`} style={{ fontSize: 10, fontWeight: 'bold', fill: textColor }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Gender Analysis */}
                {insights?.gradesByGender && 
                 Object.keys(insights.gradesByGender).length > 0 && 
                 Object.values(insights.gradesByGender).some((g: any) => g.count > 0) && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      👥 Análisis por Género
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Comparación de rendimiento académico por género.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(insights.gradesByGender)
                        .filter(([_, data]: [string, any]) => data.count > 0)
                        .map(([gender, data]: [string, any]) => (
                        <div 
                          key={gender}
                          className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="text-center">
                            <span className="text-3xl mb-2 block">
                              {gender.toLowerCase() === 'masculino' || gender.toLowerCase() === 'm' ? '👨' : '👩'}
                            </span>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{gender}</h4>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                              {data.count}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">estudiantes</p>
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                              <p className="text-sm">
                                <span className="text-slate-500 dark:text-slate-400">GPA: </span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {data.mean?.toFixed(2)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: Overview (Original Charts) */}
      {activeTab === 'overview' && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
        {/* Chart 1: Top 10 Barreras (Feature Importance) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            🎯 Top 10 Variables Predictivas del Modelo ML
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Variables que más influyen cuando el modelo predice el riesgo académico de un estudiante.
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            💡 <strong>¿Cómo leer este gráfico?</strong> El coeficiente indica el impacto en riesgo. 
            Valores negativos (verde) son protectores, positivos (rojo) aumentan riesgo. Modelo: Logistic Regression (CV 0.681).
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topBarriersData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 13, fill: textColor }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: cursorFill }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.75rem',
                  color: textColor,
                }}
              />
              <Bar dataKey="value" barSize={24} radius={[0, 8, 8, 0]}>
                {topBarriersData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`#3B82F6`}
                    opacity={Math.max(0.3, 1 - index * 0.08)}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value: any) => `${value}%`}
                  style={{ fontSize: 14, fontWeight: 'bold', fill: textColor }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Risk Distribution (Donut) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            ⚠️ Distribución de Estudiantes por Nivel de Riesgo
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Clasificación de todos los estudiantes según su probabilidad de deserción o bajo rendimiento.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            💡 <strong>Interpretación:</strong> Los estudiantes en &quot;Riesgo Alto&quot; requieren intervención inmediata. 
            &quot;Riesgo Medio&quot; necesita monitoreo preventivo.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {riskDistributionData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.75rem',
                  color: textColor,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: any) => (
                  <span style={{ color: textColor }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Laptop Impact */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            💻 Brecha Digital: Impacto de Tener Laptop
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Comparación del promedio académico (GPA) entre estudiantes CON y SIN computadora portátil.
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            📊 <strong>Dato verificado:</strong> Estudiantes con laptop tienen GPA promedio de 
            <span className="font-bold"> 8.97</span> vs <span className="font-bold">8.85</span> sin laptop 
            (diferencia de +0.12 puntos). Incluye 521 con laptop y 166 sin laptop.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={laptopImpactData}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fill: textColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis domain={[0, 10]} hide />
              <Tooltip
                cursor={{ fill: cursorFill }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.75rem',
                  color: textColor,
                }}
              />
              <Bar dataKey="value" barSize={60} radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 16, fontWeight: 'bold', fill: textColor }}
                />
                {laptopImpactData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Education Impact */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            🎓 Capital Cultural: Educación del Representante
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Promedio académico del estudiante según el nivel educativo de su representante legal (padre/madre/tutor).
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-4 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
            💡 <strong>Dato verificado:</strong> Postgrado (GPA 9.07, n=78), Ed. Superior (9.00, n=339), 
            Secundaria Completa (8.83, n=217). Diferencia de +0.35 puntos entre niveles extremos.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={educationImpactData}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fill: textColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis domain={[0, 10]} hide />
              <Tooltip
                cursor={{ fill: cursorFill }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.75rem',
                  color: textColor,
                }}
              />
              <Bar dataKey="value" barSize={60} radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 16, fontWeight: 'bold', fill: textColor }}
                />
                {educationImpactData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Performance by Quintile (Box Plot Approximation) */}
        {stats.performanceByQuintile && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              📊 Rendimiento Académico por Quintil Socioeconómico
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Distribución de notas por nivel socioeconómico (Q1 = más vulnerable, Q5 = más acomodado).
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mb-4 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              💡 <strong>¿Cómo leer este gráfico?</strong> Las barras muestran el rango intercuartil (Q1-Q3), 
              donde está el 50% central de estudiantes. La cruz roja indica la mediana de cada grupo.
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={performanceData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: textColor }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12, fill: textColor }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: 'Promedio (GPA)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: textColor,
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  content={() => (
                    <div className="flex justify-center gap-4 text-xs mb-2">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-[#8884d8] opacity-60 mr-1 rounded-sm"></span>
                        <span style={{ color: textColor }}>Rango Intercuartil (Q1-Q3)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 font-bold mr-1">+</span>
                        <span style={{ color: textColor }}>Mediana</span>
                      </div>
                    </div>
                  )}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className={`p-3 border rounded-lg shadow-lg ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-200'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <p className="font-bold mb-2">{data.name}</p>
                          <p>Máximo: {data.max}</p>
                          <p>Q3 (75%): {data.q3}</p>
                          <p className="font-bold text-blue-500">
                            Mediana: {data.median}
                          </p>
                          <p>Q1 (25%): {data.q1}</p>
                          <p>Mínimo: {data.min}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? '#334155' : '#e2e8f0'}
                />
                {/* Whiskers (Lines) - Simulated with ErrorBar or Custom Shape? 
                    Let's use a simple approach: 
                    Draw a thin Bar from Min to Max (Whisker)
                    Draw a thick Bar from Q1 to Q3 (Box)
                    Draw a Line for Median?
                */}
                {/* Whisker Line (Min to Max) */}
                <Bar
                  dataKey="min" // Dummy key, we use custom shape or just range
                  // Recharts doesn't support range bar easily without [min, max] data format
                  // Let's try passing [min, max] to dataKey?
                  // No, let's use the "range" feature of Bar in Recharts v2+
                />
                {/* Actually, let's just use a composed chart with:
                    1. A Bar for the Box (Q1 to Q3). We need to offset it?
                       Recharts Bar starts from 0. To make it float, we need [start, end] values.
                */}
                <Bar
                  dataKey="boxRange"
                  fill="#8884d8"
                  barSize={40}
                  radius={[4, 4, 4, 4]}
                  fillOpacity={0.6}
                  stroke="#8884d8"
                >
                  {performanceData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          'rgba(255, 99, 132, 0.6)',
                          'rgba(255, 159, 64, 0.6)',
                          'rgba(255, 205, 86, 0.6)',
                          'rgba(75, 192, 192, 0.6)',
                          'rgba(54, 162, 235, 0.6)',
                        ][index]
                      }
                      stroke={
                        [
                          'rgba(255, 99, 132, 1)',
                          'rgba(255, 159, 64, 1)',
                          'rgba(255, 205, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(54, 162, 235, 1)',
                        ][index]
                      }
                    />
                  ))}
                </Bar>
                {/* Median Line - We can use a Scatter point or a Line? 
                    Let's use a Scatter for the Median to make it pop.
                */}
                <Scatter
                  dataKey="median"
                  fill="red"
                  shape="cross" // or 'wye'
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 5: Barriers Analysis (Radar Chart) */}
        {stats.barriersCategories && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              🕸️ Perfil de Barreras por Categoría
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Importancia acumulada de cada tipo de barrera en el modelo de predicción.
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
              💡 <strong>Interpretación:</strong> Los picos en el radar indican categorías de barreras más críticas. 
              Permite identificar qué áreas (tecnología, salud, economía, etc.) necesitan más atención.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={barriersCategoriesData}
              >
                <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxisAny
                  dataKey="subject"
                  tick={{ fill: textColor, fontSize: 12 }}
                />
                <PolarRadiusAxisAny
                  angle={30}
                  domain={[0, 15]}
                  tick={{ fill: textColor, fontSize: 10 }}
                />
                <Radar
                  name="Importancia"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    color: textColor,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 6: Quintile Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            💰 Composición Socioeconómica de la Institución
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Cantidad de estudiantes por quintil socioeconómico (Q1 = más vulnerable, Q5 = mayor recursos).
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-4 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
            💡 <strong>Contexto:</strong> Los quintiles se calculan según variables socioeconómicas del hogar 
            (ingresos, educación de padres, acceso a servicios). Q1-Q2 = población vulnerable prioritaria.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={quintileDistributionData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? '#334155' : '#e2e8f0'}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: textColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'Estudiantes',
                  angle: -90,
                  position: 'insideLeft',
                  fill: textColor,
                  fontSize: 12,
                }}
              />
              <Tooltip
                cursor={{ fill: cursorFill }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.75rem',
                  color: textColor,
                }}
                labelStyle={{ color: textColor }}
              />
              <Bar dataKey="value" barSize={50} radius={[8, 8, 0, 0]}>
                {quintileDistributionData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 14, fontWeight: 'bold', fill: textColor }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 7: Family Support Correlation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            👨‍👩‍👧 Impacto del Apoyo Familiar en el Rendimiento por Materia
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Coeficiente de correlación (ρ) entre el nivel de apoyo familiar y las calificaciones en cada materia.
          </p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-4 bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded">
            💡 <strong>¿Cómo leer este gráfico?</strong> ρ más alto = mayor impacto del apoyo familiar. 
            Valores sobre la línea naranja (ρ=0.15) son estadísticamente significativos. 
            Matemáticas y Biología son las materias donde el apoyo familiar tiene mayor efecto.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={familySupportData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorCorrelation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? '#334155' : '#e2e8f0'}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: textColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 0.25]}
                tick={{ fontSize: 12, fill: textColor }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `ρ=${value}`}
              />
              <Tooltip
                cursor={{ stroke: isDark ? '#60a5fa' : '#3B82F6', strokeDasharray: '5 5' }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.75rem',
                  color: textColor,
                }}
                labelStyle={{ color: textColor }}
                formatter={(value: any) => [`ρ = ${value}`, 'Correlación']}
              />
              <ReferenceLine
                y={0.15}
                stroke={isDark ? '#f97316' : '#ea580c'}
                strokeDasharray="5 5"
                label={{ value: 'Umbral Significativo', fill: isDark ? '#f97316' : '#ea580c', fontSize: 10, position: 'right' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorCorrelation)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 8: Confusion Matrix - Binary Classification */}
        {stats.confusionMatrix && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              🤖 Precisión del Modelo: Matriz de Confusión
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Resultados del modelo Logistic Regression en el test set (138 estudiantes).
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-400 mb-4 bg-teal-50 dark:bg-teal-900/20 p-2 rounded">
              💡 <strong>Métricas:</strong> Accuracy 57.2%, Recall 56.9%, Precision 43.9%, ROC-AUC 0.610. 
              Con threshold=0.25 se alcanza 92.2% recall (solo 4 estudiantes en riesgo perdidos).
            </p>
            <div className="flex flex-col items-center justify-center h-auto py-4 overflow-x-auto w-full">
              <div className="grid grid-cols-3 gap-2 min-w-[300px]">
                {/* Header Row */}
                <div className="h-12 w-24 flex items-center justify-center font-bold text-xs text-slate-500">
                  Real \ Pred
                </div>
                {stats.confusionMatrix.labels.map((label, i) => (
                  <div
                    key={`head-${i}`}
                    className="h-12 w-24 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300"
                  >
                    {label}
                  </div>
                ))}

                {/* Data Rows */}
                {stats.confusionMatrix.data.map((row, i) => (
                  <React.Fragment key={`row-${i}`}>
                    {/* Row Label */}
                    <div className="h-20 w-24 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 text-center">
                      {i === 0 ? "Real: En Riesgo" : "Real: Sin Riesgo"}
                    </div>
                    {/* Cells */}
                    {row.map((value, j) => {
                      // Calculate intensity based on value
                      const intensity = Math.min(value / 50, 1);
                      // Green for correct (diagonal), Red for incorrect
                      const isCorrect = i === j;
                      const bgColor = isCorrect 
                        ? `rgba(34, 197, 94, ${intensity})` // Green for TP/TN
                        : `rgba(239, 68, 68, ${intensity})`; // Red for FP/FN
                      const cellTextColor = intensity > 0.4 ? '#ffffff' : (isDark ? '#e2e8f0' : '#1e293b');

                      return (
                        <div
                          key={`cell-${i}-${j}`}
                          className="h-20 w-24 flex flex-col items-center justify-center text-lg font-bold border border-slate-100 dark:border-slate-700 rounded"
                          style={{
                            backgroundColor:
                              value > 0 ? bgColor : (isDark ? 'rgba(51, 65, 85, 0.3)' : 'transparent'),
                            color: cellTextColor,
                          }}
                        >
                          <span>{value}</span>
                          <span className="text-xs font-normal opacity-75">
                            {i === 0 && j === 0 && 'TP'}
                            {i === 0 && j === 1 && 'FN'}
                            {i === 1 && j === 0 && 'FP'}
                            {i === 1 && j === 1 && 'TN'}
                          </span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Intervenciones Recomendadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0">
              👁️
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Factores Socioeconómicos
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                La edad del representante y la cobertura de salud son las
                barreras más predictivas, sugiriendo un fuerte componente
                socioeconómico en el riesgo estudiantil.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0">
              🎯
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Brecha Digital
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                La posesión de una laptop tiene un impacto medible en el
                rendimiento, reforzando la necesidad de programas de inclusión
                digital.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0">
              📈
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Capital Cultural
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                El nivel educativo del representante es un factor clave, lo que
                indica que el capital cultural del hogar influye en el éxito
                académico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalView;
