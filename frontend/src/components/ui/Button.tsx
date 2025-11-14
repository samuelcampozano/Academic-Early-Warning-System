import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseClasses =
      'px-6 py-3 rounded-6 font-medium transition-all duration-200 ease-in-out transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary';

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary:
        'bg-white text-primary border border-primary hover:bg-blue-50',
      tertiary: 'bg-transparent text-primary hover:bg-hover-bg',
    };

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
