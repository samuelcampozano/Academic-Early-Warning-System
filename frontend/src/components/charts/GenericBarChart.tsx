import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { ChartData } from '../../hooks/useInstitutionalData';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GenericBarChartProps {
  data: ChartData;
  title: string;
  horizontal?: boolean;
  yMin?: number;
  yMax?: number;
}

const GenericBarChart: React.FC<GenericBarChartProps> = ({ data, title, horizontal = false, yMin, yMax }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? '#334155' : '#f1f5f9';

  const options: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: false, // Hide legend if single dataset usually
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: textColor,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
        },
        min: horizontal ? yMin : undefined,
        max: horizontal ? yMax : undefined,
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
        min: horizontal ? undefined : yMin,
        max: horizontal ? undefined : yMax,
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar options={options} data={data} />
    </div>
  );
};

export default GenericBarChart;
