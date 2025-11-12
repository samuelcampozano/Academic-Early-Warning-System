import { useState, useEffect } from 'react';
// Importamos NUESTROS datos falsos por ahora
import { mockSatListData } from '../services/mocks';
// Eventualmente, importaremos el servicio real
// import apiService from '../services/api';

// (Variable para simular si estamos usando la API real o la falsa)
const USE_MOCK_DATA = true;

export default function useSatData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let responseData;

        if (USE_MOCK_DATA) {
          // Simula un retraso de red
          await new Promise(resolve => setTimeout(resolve, 500));
          responseData = mockSatListData;
        } else {
          // Esta es la línea que usaremos cuando el backend esté listo
          // const response = await apiService.getSatList();
          // responseData = response.data;

          // Placeholder hasta que la API esté lista
          throw new Error('API real aún no implementada');
        }

        setData(responseData);
        setError(null);

      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // El array vacío hace que se ejecute solo una vez (al montar)

  return { data, loading, error };
}