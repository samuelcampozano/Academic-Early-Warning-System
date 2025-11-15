import React, { createContext, useContext, ReactNode } from 'react';
import { Student } from '../types';
import { students as mockStudents } from '../data/mockData';

interface StudentDataContextType {
  students: Student[];
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(
  undefined
);

export const StudentDataProvider = ({ children }: { children: ReactNode }) => {
  // In the future, you could fetch data here instead of using mocks
  const students = mockStudents;

  return (
    <StudentDataContext.Provider value={{ students }}>
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
