import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseClasses =
      'px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-900';

    const variantClasses = {
      primary:
        'bg-brand-primary text-white hover:bg-primary-hover active:bg-primary-active dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800',
      secondary:
        'bg-white text-brand-primary border border-brand-primary hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-slate-700',
      tertiary:
        'bg-transparent text-brand-primary hover:bg-hover-background dark:text-blue-400 dark:hover:bg-slate-800',
    };

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
