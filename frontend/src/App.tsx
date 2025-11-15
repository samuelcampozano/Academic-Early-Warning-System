import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import SAT_Dashboard from './pages/SAT_Dashboard';
import InstitutionalView from './pages/InstitutionalView';
import StudentProfile from './pages/StudentProfile';
import { StudentDataProvider } from './context/StudentDataContext';

function App() {
  return (
    <StudentDataProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<SAT_Dashboard />} />
          <Route path="/institutional" element={<InstitutionalView />} />
          <Route path="/student/:studentId" element={<StudentProfile />} />
        </Routes>
      </MainLayout>
    </StudentDataProvider>
  );
}

export default App;
