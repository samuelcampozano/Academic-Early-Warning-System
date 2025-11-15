import React from 'react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
}

const SummaryCard = ({
  icon,
  label,
  value,
  trend,
  trendColor,
}: SummaryCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {label}
            </div>
          </div>
          {trend && (
            <div className={cn('ml-auto text-sm font-semibold', trendColor)}>
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
