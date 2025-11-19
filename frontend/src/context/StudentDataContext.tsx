import React, { createContext, useContext, ReactNode } from 'react';
import useSatData, { SatStudent } from '../hooks/useSatData';

interface StudentDataContextType {
  students: SatStudent[];
  loading: boolean;
  error: string | null;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(
  undefined,
);

export const StudentDataProvider = ({ children }: { children: ReactNode }) => {
  const { data: students, loading, error } = useSatData();

  return (
    <StudentDataContext.Provider value={{ students, loading, error }}>
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (context === undefined) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};
