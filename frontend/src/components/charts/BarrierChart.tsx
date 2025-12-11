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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

// Actual coefficients from Logistic Regression model (December 2025)
// Positive = increases risk (red), Negative = protective (green)
const data = [
  { name: 'Toma Lengua y Lit. (-)', value: -1.511 },
  { name: 'Nivel Educativo (+)', value: 1.305 },
  { name: 'Escuela Procedencia (+)', value: 0.740 },
  { name: 'Compra en Centros (-)', value: -0.682 },
  { name: 'Núm. Materias (+)', value: 0.601 },
  { name: 'Toma Física (+)', value: 0.589 },
  { name: 'Toma Sociales (-)', value: -0.587 },
  { name: 'Toma Ciencias (-)', value: -0.587 },
  { name: 'Seguro Privado (-)', value: -0.585 },
  { name: 'Tiene Teléfono (-)', value: -0.517 },
];

const BarrierChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#334155';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Barreras Predictivas</CardTitle>
        <CardDescription>
          Coeficientes del modelo. Verde = protector, Rojo = aumenta riesgo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: textColor }}
              width={140}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: textColor,
              }}
              formatter={(value: number) => [value.toFixed(3), 'Coeficiente']}
            />
            <Bar dataKey="value" barSize={20} radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value < 0 ? '#10B981' : '#EF4444'}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value: number) => value.toFixed(2)}
                style={{ fontSize: 11, fontWeight: 'bold', fill: textColor }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarrierChart;
