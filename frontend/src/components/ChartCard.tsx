import React from 'react';

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
