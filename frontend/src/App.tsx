import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import SAT_Dashboard from './pages/SAT_Dashboard';
import InstitutionalView from './pages/InstitutionalView';
import StudentProfile from './pages/StudentProfile';
import { students } from './data/mockData';
import { Student } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'institutional', 'profile'
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setCurrentPage('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedStudent(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <SAT_Dashboard
            students={students}
            onStudentClick={handleStudentClick}
          />
        );
      case 'institutional':
        return <InstitutionalView />;
      case 'profile':
        return (
          <StudentProfile
            student={selectedStudent}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return (
          <SAT_Dashboard
            students={students}
            onStudentClick={handleStudentClick}
          />
        );
    }
  };

  return (
    <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}

export default App;
