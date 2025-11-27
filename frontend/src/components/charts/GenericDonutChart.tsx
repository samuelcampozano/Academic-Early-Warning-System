import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { ChartData } from '../../hooks/useInstitutionalData';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GenericDonutChartProps {
  data: ChartData;
  title: string;
}

const GenericDonutChart: React.FC<GenericDonutChartProps> = ({ data, title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
          },
          color: textColor,
        },
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
    cutout: '60%',
  };

  return (
    <div className="h-64 w-full flex justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default GenericDonutChart;
