import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'critical' | 'medium' | 'low' | 'default';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider';

    const variantClasses = {
      critical:
        'bg-risk-critical-bg text-risk-critical-text border border-risk-critical-border dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      medium:
        'bg-risk-medium-bg text-risk-medium-text border border-risk-medium-border dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      low: 'bg-risk-low-bg text-risk-low-text border border-risk-low-border dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      default:
        'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300',
    };

    return (
      <div
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
