import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { to: '/', label: 'Dashboard SAT', icon: '📊' },
    { to: '/institutional', label: 'Visión Institucional', icon: '🏫' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm h-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-blue-600 dark:bg-blue-500 rounded-lg w-10 h-10 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">🎯</span>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                SAT
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1 h-full">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end // Use 'end' for the root path to prevent it from matching all routes
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-4 py-2 text-base font-medium rounded-lg transition-colors duration-150 h-full border-b-4',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400'
                          : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                      )
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <span className="text-xl">☀️</span>
                ) : (
                  <span className="text-xl">🌙</span>
                )}
              </button>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Samuel Campozano
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Docente
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
