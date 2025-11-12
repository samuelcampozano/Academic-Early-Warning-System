import { useState, useEffect } from 'react';
// Importamos nuestros datos falsos
import { mockInstitutionalStats } from '../services/mocks';
// import apiService from '../services/api';

const USE_MOCK_DATA = true;

export default function useInstitutionalData() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        let responseData;

        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 200));
          responseData = mockInstitutionalStats;
        } else {
          // const response = await apiService.getInstitutionalStats();
          // responseData = response.data;
          throw new Error('API real aún no implementada');
        }

        setStats(responseData);
        setError(null);

      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []); // Se ejecuta solo una vez

  return { stats, loading, error };
}