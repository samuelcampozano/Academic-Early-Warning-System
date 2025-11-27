import React from 'react';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subLabel?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = 'text-blue-600',
  trackColor = 'text-slate-200 dark:text-slate-700',
  label,
  subLabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          className={trackColor}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && (
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {label}
          </span>
        )}
        {subLabel && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
