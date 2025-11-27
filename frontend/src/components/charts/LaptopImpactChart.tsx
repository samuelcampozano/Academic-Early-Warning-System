import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { name: 'Con Laptop', value: 8.7, fill: '#2563EB' },
  { name: 'Sin Laptop', value: 8.5, fill: '#F59E0B' },
];

const LaptopImpactChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#334155';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impacto de Laptop en Rendimiento</CardTitle>
        <CardDescription>
          Diferencia en el promedio general entre estudiantes con y sin laptop.
          (-8.5 puntos de impacto)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20 }}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: textColor }}
            />
            <YAxis domain={[0, 12]} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: textColor,
              }}
            />
            <Legend wrapperStyle={{ color: textColor }} />
            <Bar dataKey="value" barSize={80}>
              <LabelList
                dataKey="value"
                position="top"
                style={{ fill: textColor, fontWeight: 'bold' }}
              />
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LaptopImpactChart;
