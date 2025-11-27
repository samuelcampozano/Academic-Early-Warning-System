import React from 'react';
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
        {/* Chart 1: Top 10 Barreras (Feature Importance) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Importancia de Variables
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Factores que más influyen en la predicción del modelo.
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
            Distribución de Riesgo
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Proporción de estudiantes por nivel de riesgo detectado.
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
            Impacto de Laptop
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Diferencia en el rendimiento académico por materia.{' '}
            <span className="font-bold text-red-600">
              (-1.5 puntos de impacto)
            </span>
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
            Impacto del Nivel Educativo del Representante
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Rendimiento académico según el nivel educativo del representante.
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
              Rendimiento Académico por Quintil (Distribución)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Distribución de notas (Mínimo, Q1, Mediana, Q3, Máximo) por nivel
              socioeconómico.
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
              Análisis de Barreras (Radar)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Impacto acumulado por categoría de riesgo.
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
            Distribución por Quintil Socioeconómico
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Agrupación de estudiantes según nivel socioeconómico predicho.
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
            Correlación: Apoyo Familiar vs. Rendimiento
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Coeficiente de correlación (ρ) entre apoyo familiar y notas por materia.
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

        {/* Chart 8: Confusion Matrix */}
        {stats.confusionMatrix && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Matriz de Confusión del Modelo
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Precisión del modelo predictivo clasificando estudiantes en
              quintiles. (Filas: Real, Columnas: Predicho)
            </p>
            <div className="flex flex-col items-center justify-center h-auto py-4 overflow-x-auto w-full">
              <div className="grid grid-cols-6 gap-1 min-w-[350px]">
                {/* Header Row */}
                <div className="h-10 w-16 flex items-center justify-center font-bold text-xs text-slate-500">
                  Real \ Pred
                </div>
                {stats.confusionMatrix.labels.map((label, i) => (
                  <div
                    key={`head-${i}`}
                    className="h-10 w-16 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300"
                  >
                    {label}
                  </div>
                ))}

                {/* Data Rows */}
                {stats.confusionMatrix.data.map((row, i) => (
                  <React.Fragment key={`row-${i}`}>
                    {/* Row Label */}
                    <div className="h-16 w-16 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                      {stats.confusionMatrix.labels[i]}
                    </div>
                    {/* Cells */}
                    {row.map((value, j) => {
                      // Calculate intensity based on value (assuming max around 50 for this dataset)
                      const intensity = Math.min(value / 50, 1);
                      const bgColor = `rgba(59, 130, 246, ${intensity})`; // Blue base
                      const cellTextColor = intensity > 0.5 ? '#ffffff' : (isDark ? '#e2e8f0' : '#1e293b');

                      return (
                        <div
                          key={`cell-${i}-${j}`}
                          className="h-16 w-16 flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded"
                          style={{
                            backgroundColor:
                              value > 0 ? bgColor : (isDark ? 'rgba(51, 65, 85, 0.3)' : 'transparent'),
                            color: cellTextColor,
                          }}
                        >
                          {value}
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

      {/* Advanced Statistical Analysis Section */}
      {!distLoading && distributions && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Análisis Estadístico Avanzado
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            
            {/* Histogram: Risk Score Distribution */}
            {distributions.riskScoreHistogram && distributions.riskScoreHistogram.counts && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Distribución de Puntuaciones de Riesgo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Histograma de puntajes de riesgo predichos (0-100).
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={distributions.riskScoreHistogram.counts.map((count: number, index: number) => {
                      const binEnd = distributions.riskScoreHistogram!.binEdges[index + 1];
                      return {
                        bin: distributions.riskScoreHistogram!.labels[index],
                        count: count,
                        binEnd: binEnd,
                      };
                    })}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis
                      dataKey="bin"
                      tick={{ fontSize: 10, fill: textColor }}
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
              </div>
            )}

            {/* Laptop Comparison - Box Plot Style */}
            {distributions.laptopComparison && distributions.laptopComparison.withLaptop && distributions.laptopComparison.withoutLaptop && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Impacto de Laptop en Notas
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Comparación estadística de rendimiento académico.
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={[
                      {
                        name: 'Sin Laptop',
                        ...distributions.laptopComparison.withoutLaptop,
                        boxRange: [distributions.laptopComparison.withoutLaptop.q1, distributions.laptopComparison.withoutLaptop.q3],
                        fill: '#ef4444'
                      },
                      {
                        name: 'Con Laptop',
                        ...distributions.laptopComparison.withLaptop,
                        boxRange: [distributions.laptopComparison.withLaptop.q1, distributions.laptopComparison.withLaptop.q3],
                        fill: '#22c55e'
                      }
                    ]}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
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
                        value: 'GPA',
                        angle: -90,
                        position: 'insideLeft',
                        fill: textColor,
                      }}
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
                              <p>n = {data.count} estudiantes</p>
                              <p>Máximo: {data.max?.toFixed(2)}</p>
                              <p>Q3: {data.q3?.toFixed(2)}</p>
                              <p className="font-bold text-blue-500">Media: {data.mean?.toFixed(2)}</p>
                              <p>Mediana: {data.median?.toFixed(2)}</p>
                              <p>Q1: {data.q1?.toFixed(2)}</p>
                              <p>Mínimo: {data.min?.toFixed(2)}</p>
                              <p className="text-xs mt-1">σ = {data.std?.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="boxRange" barSize={50} radius={[4, 4, 4, 4]} fillOpacity={0.7}>
                      <Cell fill="#ef4444" stroke="#dc2626" />
                      <Cell fill="#22c55e" stroke="#16a34a" />
                    </Bar>
                    <Scatter dataKey="mean" fill="#3b82f6" shape="diamond" />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="text-center mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Diferencia media: <span className="font-bold text-blue-600 dark:text-blue-400">
                    {distributions.laptopComparison.withLaptop && distributions.laptopComparison.withoutLaptop 
                      ? (distributions.laptopComparison.withLaptop.mean - distributions.laptopComparison.withoutLaptop.mean).toFixed(2) 
                      : 'N/A'} puntos
                  </span>
                </div>
              </div>
            )}

            {/* Grades by Subject - Enhanced Bar Chart */}
            {distributions.gradesBySubject && Object.keys(distributions.gradesBySubject).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Rendimiento por Materia (Distribución)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Media, mediana y desviación estándar por asignatura.
                </p>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart
                    data={Object.entries(distributions.gradesBySubject).map(([subject, stats]: [string, any]) => ({
                      name: subject.length > 15 ? subject.substring(0, 15) + '...' : subject,
                      fullName: subject,
                      mean: stats.mean,
                      median: stats.median,
                      std: stats.std,
                      min: stats.min,
                      max: stats.max,
                      boxRange: [stats.q1, stats.q3],
                    }))}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis
                      type="number"
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 11, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
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
                              <p className="font-bold mb-2">{data.fullName}</p>
                              <p>Max: {data.max?.toFixed(2)}</p>
                              <p>Q3: {data.boxRange?.[1]?.toFixed(2)}</p>
                              <p className="font-bold text-emerald-500">Media: {data.mean?.toFixed(2)}</p>
                              <p>Mediana: {data.median?.toFixed(2)}</p>
                              <p>Q1: {data.boxRange?.[0]?.toFixed(2)}</p>
                              <p>Min: {data.min?.toFixed(2)}</p>
                              <p className="text-xs mt-1">σ = {data.std?.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="boxRange" barSize={20} radius={[4, 4, 4, 4]} fillOpacity={0.6}>
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

            {/* Grades by Education Level */}
            {distributions.gradesByEducation && Object.keys(distributions.gradesByEducation).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Notas por Educación del Representante
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Distribución de GPA según nivel educativo parental.
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(distributions.gradesByEducation)
                      .sort((a: any, b: any) => b[1].mean - a[1].mean)
                      .map(([level, stats]: [string, any], index) => ({
                        name: level.length > 12 ? level.substring(0, 12) + '...' : level,
                        fullName: level,
                        mean: stats.mean,
                        count: stats.count,
                        color: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'][Math.min(index, 4)]
                      }))}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12, fill: textColor }}
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
                      formatter={(value: any, name: string, props: any) => [
                        `${value.toFixed(2)} (n=${props.payload.count})`,
                        'Media GPA'
                      ]}
                    />
                    <Bar dataKey="mean" radius={[8, 8, 0, 0]}>
                      {Object.entries(distributions.gradesByEducation)
                        .sort((a: any, b: any) => b[1].mean - a[1].mean)
                        .map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'][Math.min(index, 4)]} 
                          />
                        ))}
                      <LabelList
                        dataKey="mean"
                        position="top"
                        formatter={(value: any) => value?.toFixed(1)}
                        style={{ fontSize: 11, fontWeight: 'bold', fill: textColor }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Academic Insights Section */}
      {!distLoading && insights && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Insights Académicos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            
            {/* Barriers Impact on Grades */}
            {insights.barriersImpact && Object.keys(insights.barriersImpact).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Impacto Acumulado de Barreras
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Relación entre cantidad de barreras y rendimiento académico.
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={Object.entries(insights.barriersImpact).map(([barriers, data]: [string, any]) => ({
                      barriers_count: parseInt(barriers),
                      avg_grade: data.avg_grade,
                      student_count: data.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="barriersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis
                      dataKey="barriers_count"
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: 'Número de Barreras',
                        position: 'bottom',
                        fill: textColor,
                        fontSize: 12,
                        offset: 0,
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: 'GPA Promedio',
                        angle: -90,
                        position: 'insideLeft',
                        fill: textColor,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: 'Estudiantes',
                        angle: 90,
                        position: 'insideRight',
                        fill: textColor,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '0.75rem',
                        color: textColor,
                      }}
                      formatter={(value: any, name: string) => [
                        typeof value === 'number' ? value.toFixed(2) : value,
                        name === 'avg_grade' ? 'GPA Promedio' : 'Estudiantes'
                      ]}
                      labelFormatter={(label) => `${label} barreras`}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value: any) => (
                        <span style={{ color: textColor }}>
                          {value === 'avg_grade' ? 'GPA Promedio' : 'Estudiantes'}
                        </span>
                      )}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="avg_grade"
                      stroke="#ef4444"
                      fill="url(#barriersGradient)"
                      strokeWidth={2}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="student_count"
                      fill="#3b82f6"
                      opacity={0.5}
                      barSize={30}
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Subjects at Risk */}
            {insights.subjectsAtRisk && insights.subjectsAtRisk.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Materias con Mayor Riesgo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Asignaturas con mayor tasa de bajo rendimiento (&lt;7).
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={insights.subjectsAtRisk
                      .filter((item: any) => !['Acompañamiento', 'PPE', 'Animación lectura'].includes(item.subject))
                      .slice(0, 6)
                      .map((item: any) => ({
                        name: item.subject.length > 12 ? item.subject.substring(0, 12) + '...' : item.subject,
                        fullName: item.subject,
                        riskPercentage: item.riskPercentage,
                        totalStudents: item.totalStudents,
                      }))}
                    layout="vertical"
                    margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis
                      type="number"
                      domain={[0, (dataMax: number) => Math.ceil((dataMax * 1.2) / 5) * 5]}
                      tick={{ fontSize: 12, fill: textColor }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 11, fill: textColor }}
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
                      formatter={(value: any, name: string, props: any) => [
                        `${value.toFixed(1)}% (n=${props.payload.totalStudents})`,
                        'Bajo Rendimiento'
                      ]}
                      labelFormatter={(label) => {
                        const filtered = insights.subjectsAtRisk.filter((item: any) => 
                          !['Acompañamiento', 'PPE', 'Animación lectura'].includes(item.subject)
                        );
                        return filtered.find((s: any) => 
                          s.subject.startsWith(label.replace('...', ''))
                        )?.subject || label;
                      }}
                    />
                    <Bar dataKey="riskPercentage" radius={[0, 4, 4, 0]}>
                      {insights.subjectsAtRisk
                        .filter((item: any) => !['Acompañamiento', 'PPE', 'Animación lectura'].includes(item.subject))
                        .slice(0, 6)
                        .map((_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index < 2 ? '#ef4444' : index < 4 ? '#f59e0b' : '#22c55e'}
                          />
                        ))}
                      <LabelList
                        dataKey="riskPercentage"
                        position="right"
                        formatter={(value: any) => `${value?.toFixed(1)}%`}
                        style={{ fontSize: 11, fontWeight: 'bold', fill: textColor }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gender Analysis - Only show if there's data with count > 0 */}
            {insights.gradesByGender && 
             Object.keys(insights.gradesByGender).length > 0 && 
             Object.values(insights.gradesByGender).some((g: any) => g.count > 0) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700 lg:col-span-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Análisis por Género
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Comparación de rendimiento académico por género.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(insights.gradesByGender)
                    .filter(([_, data]: [string, any]) => data.count > 0)
                    .map(([gender, data]: [string, any]) => (
                    <div 
                      key={gender}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}
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
        </div>
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
