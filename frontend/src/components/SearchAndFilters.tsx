import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from './ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFiltersProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  courses?: FilterOption[];
  selectedCourse?: string;
  onCourseChange?: (value: string) => void;
  riskLevels?: FilterOption[];
  selectedRisk?: string;
  onRiskChange?: (value: string) => void;
  sortOptions?: FilterOption[];
  selectedSort?: string;
  onSortChange?: (value: string) => void;
}

/**
 * Utility function to format raw grade codes to user-friendly labels
 * @param grade - Raw grade value from database (e.g., '8', '1BGU', '10')
 * @returns Formatted label (e.g., '8° EGB', '1° Bachillerato')
 */
export const formatGradeLabel = (grade: string): string => {
  if (!grade) return 'Sin curso';
  
  // Handle BGU grades (1BGU, 2BGU, 3BGU)
  const bguMatch = grade.match(/^(\d+)BGU$/i);
  if (bguMatch) {
    const num = parseInt(bguMatch[1]);
    return `${num}° Bachillerato (BGU)`;
  }
  
  // Handle EGB grades (1-10)
  const egbMatch = grade.match(/^(\d+)$/);
  if (egbMatch) {
    const num = parseInt(egbMatch[1]);
    if (num >= 1 && num <= 10) {
      return `${num}° EGB`;
    }
  }
  
  return grade;
};

/**
 * Sort grades in educational order (EGB 1-10, then BGU 1-3)
 */
export const sortGrades = (grades: string[]): string[] => {
  return grades.sort((a, b) => {
    const getOrder = (g: string): number => {
      const bguMatch = g.match(/^(\d+)BGU$/i);
      if (bguMatch) return parseInt(bguMatch[1]) + 10;
      
      const numMatch = g.match(/^(\d+)$/);
      if (numMatch) return parseInt(numMatch[1]);
      
      return 999;
    };
    return getOrder(a) - getOrder(b);
  });
};

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm = '',
  onSearchChange,
  courses = [],
  selectedCourse = 'all',
  onCourseChange,
  riskLevels = [
    { value: 'all', label: 'Todos los Riesgos' },
    { value: 'Critical', label: '⚠️ Crítico' },
    { value: 'Medium', label: '🛡️ Medio' },
    { value: 'Low', label: '✅ Bajo' },
  ],
  selectedRisk = 'all',
  onRiskChange,
  sortOptions = [
    { value: 'risk', label: '↓ Mayor Riesgo' },
    { value: 'risk-asc', label: '↑ Menor Riesgo' },
    { value: 'name-asc', label: 'A-Z (Nombre)' },
    { value: 'name-desc', label: 'Z-A (Nombre)' },
    { value: 'course', label: 'Por Curso' },
  ],
  selectedSort = 'risk',
  onSortChange,
}) => {
  return (
    <div className="my-6 rounded-lg bg-white dark:bg-slate-800 p-4 shadow border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Buscar estudiante por nombre..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Course Filter */}
          {courses.length > 0 && (
            <Select value={selectedCourse} onValueChange={onCourseChange}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Filtrar por Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.value} value={course.value}>
                    {course.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Risk Filter */}
          <Select value={selectedRisk} onValueChange={onRiskChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrar por Riesgo" />
            </SelectTrigger>
            <SelectContent>
              {riskLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort Options */}
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
