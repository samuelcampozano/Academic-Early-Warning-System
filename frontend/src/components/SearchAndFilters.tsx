import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/Input'; // Assuming you have an Input component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select'; // Assuming a Select component

const SearchAndFilters = () => {
  return (
    <div className="my-6 rounded-lg bg-card p-4 shadow">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Buscar estudiante..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por Curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10a">10mo A</SelectItem>
              <SelectItem value="9b">9no B</SelectItem>
              <SelectItem value="8c">8vo C</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por Riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="low">Bajo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
