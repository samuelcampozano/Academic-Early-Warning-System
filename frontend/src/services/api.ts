import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Force rebuild v2

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.error || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  },
);

// API Methods
export const getSatList = (
  limit?: number,
  riskLevel?: 'Alto' | 'Medio' | 'Bajo',
) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (riskLevel) params.append('risk_level', riskLevel);
  return api.get(`/sat-list?${params.toString()}`);
};

export const getStudentById = (studentId: string) => {
  return api.get(`/student/${studentId}`);
};

export const getStudentProfile = (studentId: string) => {
  return api.get(`/student/${studentId}`);
};

export const getInstitutionalStats = () => {
  return api.get('/institutional-stats');
};

export const getBarriersAnalysis = () => {
  return api.get('/barriers-analysis');
};

export const getScoreDistributions = () => {
  return api.get('/score-distributions');
};

export const getAcademicInsights = () => {
  return api.get('/academic-insights');
};

export const predictRisk = (studentId: string) => {
  return api.post('/predict', { student_id: studentId });
};

export default api;
