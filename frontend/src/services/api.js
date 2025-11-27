import axios from 'axios';

// Obtenemos la URL base del API desde las variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

// Creamos una instancia de Axios pre-configurada
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Aquí definimos todas las funciones para llamar al API.
 Esto abstrae la lógica: nuestros componentes de React no
 sabrán de 'axios', solo llamarán a estas funciones.
*/

/**
 * Obtiene la lista priorizada de estudiantes para el dashboard SAT.
 */
export const getSatList = () => {
  return apiClient.get('/sat-list');
};

/**
 * Obtiene el perfil detallado de un estudiante por su ID.
 * @param {string} studentId El ID del estudiante
 */
export const getStudentById = (studentId) => {
  return apiClient.get(`/student/${studentId}`);
};

/**
 * Obtiene las estadísticas globales para la vista institucional.
 */
export const getInstitutionalStats = () => {
  return apiClient.get('/institutional-stats');
};

/**
 * Obtiene distribuciones de notas para gráficos avanzados.
 */
export const getScoreDistributions = () => {
  return apiClient.get('/score-distributions');
};

/**
 * Obtiene insights académicos avanzados.
 */
export const getAcademicInsights = () => {
  return apiClient.get('/academic-insights');
};

// Exportamos un objeto con todos los métodos para un uso fácil
const apiService = {
  getSatList,
  getStudentById,
  getInstitutionalStats,
  getScoreDistributions,
  getAcademicInsights,
};

export default apiService;
