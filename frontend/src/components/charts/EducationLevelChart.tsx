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
  { name: 'Superior/Univ.', value: 8.7, fill: '#8B5CF6' },
  { name: 'Bachillerato', value: 8.5, fill: '#EC4899' },
  { name: 'Básica', value: 8.6, fill: '#10B981' },
];

const EducationLevelChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#334155';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impacto del Nivel Educativo del Representante</CardTitle>
        <CardDescription>
          Rendimiento académico según el nivel educativo del representante legal.
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
                style={{ fontWeight: 'bold', fill: textColor }}
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

export default EducationLevelChart;
