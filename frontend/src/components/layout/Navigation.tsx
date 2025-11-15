import React from 'react';
import { cn } from '../../lib/utils';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navigation = ({ currentPage, setCurrentPage }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard SAT', icon: '📊' },
    { id: 'institutional', label: 'Visión Institucional', icon: '🏫' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">🎯</span>
              </div>
              <span className="text-xl font-bold text-slate-800">SAT</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1 h-full">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-base font-medium rounded-lg transition-colors duration-150 h-full border-b-4',
                      currentPage === item.id
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900">
                      Samuel Campozano
                    </div>
                    <div className="text-xs text-slate-500">Docente</div>
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
