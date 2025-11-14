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
      critical: 'bg-risk-critical-bg text-risk-critical-text border border-risk-critical-border',
      medium: 'bg-risk-medium-bg text-risk-medium-text border border-risk-medium-border',
      low: 'bg-risk-low-bg text-risk-low-text border border-risk-low-border',
      default: 'bg-gray-100 text-gray-800',
    };

    return (
      <div
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
