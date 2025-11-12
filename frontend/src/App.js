import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Importar nuestras páginas
import SAT_Dashboard from './pages/SAT_Dashboard';
import StudentProfile from './pages/StudentProfile';
import InstitutionalView from './pages/InstitutionalView';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Navegación simple por ahora */}
        <nav>
          <ul>
            <li><Link to="/">Dashboard SAT</Link></li>
            <li><Link to="/institucional">Visión Institucional</Link></li>
          </ul>
        </nav>

        {/* Definición de Rutas */}
        <Routes>
          <Route path="/" element={<SAT_Dashboard />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/institucional" element={<InstitutionalView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
