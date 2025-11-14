import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import SAT_Dashboard from './pages/SAT_Dashboard';
import StudentProfile from './pages/StudentProfile';
import InstitutionalView from './pages/InstitutionalView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<SAT_Dashboard />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/institucional" element={<InstitutionalView />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;

