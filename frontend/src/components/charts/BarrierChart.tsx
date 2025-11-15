import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
  { name: 'Cobertura Salud', value: 6.2 },
  { name: 'Edad Est.', value: 4.5 },
  { name: 'Lectura Libros (Sí)', value: 3.8 },
  { name: 'Nivel Inst. Rep.', value: 3.2 },
  { name: 'Num. Hermanos', value: 2.8 },
];

const colors = ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

const BarrierChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#334155';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Barreras Predictivas</CardTitle>
        <CardDescription>
          Importancia de cada factor en el modelo predictivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fill: textColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: textColor,
              }}
            />
            <Bar dataKey="value" barSize={32} radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarrierChart;
