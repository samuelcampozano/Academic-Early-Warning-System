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
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const topBarriersData = [
  { name: 'Cobertura Salud', value: 6.2 },
  { name: 'Edad Est.', value: 4.5 },
  { name: 'Lectura Libros (Sí)', value: 3.8 },
  { name: 'Nivel Inst. Rep.', value: 3.2 },
  { name: 'Num. Hermanos', value: 2.8 },
];

const laptopImpactData = [
  { name: 'Con Laptop', value: 8.7, fill: '#3B82F6' },
  { name: 'Sin Laptop', value: 7.2, fill: '#F59E0B' },
];

const educationImpactData = [
  { name: 'Superior/Univ.', value: 8.7, fill: '#8B5CF6' },
  { name: 'Bachillerato', value: 8.5, fill: '#EC4899' },
  { name: 'Básica', value: 8.6, fill: '#10B981' },
];

const InstitutionalView = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#475569';
  const cursorFill = isDark ? '#334155' : '#f1f5f9';

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
        {/* Chart 1: Top 10 Barreras */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Distribución de Riesgo
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Importancia de cada factor en el modelo predictivo.
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
                width={120}
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
                {topBarriersData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`#3B82F6`}
                    opacity={1 - index * 0.15}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value) => `${value}%`}
                  style={{ fontSize: 14, fontWeight: 'bold', fill: textColor }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Laptop Impact */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Impacto de Laptop en Promedio
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Diferencia en el promedio general.{' '}
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
                {laptopImpactData.map((entry, index) => (
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
            Promedio general según el nivel educativo del representante.
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
                {educationImpactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
