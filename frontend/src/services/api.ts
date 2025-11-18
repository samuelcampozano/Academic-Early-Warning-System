import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  }
);

export default api;

// API Methods
export const studentApi = {
  // Get all students for SAT list
  getSatList: (limit?: number, riskLevel?: 'Alto' | 'Medio' | 'Bajo') => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (riskLevel) params.append('risk_level', riskLevel);
    return api.get(`/sat-list?${params.toString()}`);
  },

  // Get individual student profile
  getStudentProfile: (studentId: string) => {
    return api.get(`/student/${studentId}`);
  },

  // Get institutional statistics
  getInstitutionalStats: () => {
    return api.get('/institutional-stats');
  },

  // Get barriers analysis
  getBarriersAnalysis: () => {
    return api.get('/barriers-analysis');
  },

  // Predict risk for a student
  predictRisk: (studentId: string) => {
    return api.post('/predict', { student_id: studentId });
  },
};
