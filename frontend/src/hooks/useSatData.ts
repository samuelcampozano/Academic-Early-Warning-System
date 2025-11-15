import { useState, useEffect } from 'react';
import { Student } from '../types';
import { mockSatListData } from '../services/mocks';

const USE_MOCK_DATA = true;

export default function useSatData() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let responseData: Student[];

        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          responseData = mockSatListData;
        } else {
          throw new Error('API real aún no implementada');
        }

        setData(responseData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
