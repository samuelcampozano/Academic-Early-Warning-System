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

const data = [
  { name: 'Superior/Univ.', value: 8.7, fill: '#8B5CF6' },
  { name: 'Bachillerato', value: 8.5, fill: '#EC4899' },
  { name: 'Básica', value: 8.6, fill: '#10B981' },
];

const EducationLevelChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impacto del Nivel Educativo del Representante</CardTitle>
        <CardDescription>
          Promedio general según el nivel educativo del representante legal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 12]} hide />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" barSize={80}>
              <LabelList
                dataKey="value"
                position="top"
                style={{ fontWeight: 'bold' }}
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
