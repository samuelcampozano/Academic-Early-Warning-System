import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, BarChart2, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const Navigation = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center px-4 py-5 text-sm font-medium text-text-secondary transition-all duration-200 ease-in-out',
      {
        'font-semibold text-primary border-b-4 border-primary bg-blue-50': isActive,
        'hover:bg-hover-bg': !isActive,
      }
    );

  return (
    <header className="sticky top-0 z-50 h-16 bg-card border-b-2 border-subtle-divider">
      <div className="container mx-auto flex h-full items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-text-primary">SAT</span>
          </div>
          <nav className="flex h-full items-center space-x-2">
            <NavLink to="/" className={navLinkClasses}>
              <BarChart2 className="mr-2 h-5 w-5" />
              Dashboard SAT
            </NavLink>
            <NavLink to="/institutional" className={navLinkClasses}>
              <BarChart2 className="mr-2 h-5 w-5" />
              Visión Institucional
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <User className="h-6 w-6 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Usuario</span>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
