import React from 'react';

interface SummaryCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  trend?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="bg-blue-100 p-3 rounded-full">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
        <div className="ml-4">
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
        {trend && (
          <div className="ml-auto text-sm font-medium text-green-500">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
