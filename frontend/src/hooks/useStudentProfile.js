import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Importamos nuestros datos falsos
import { mockStudentProfileData } from '../services/mocks';
// import apiService from '../services/api';

const USE_MOCK_DATA = true;

export default function useStudentProfile() {
  const { id } = useParams(); // Obtiene el :id de la URL
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return; // No hacer nada si no hay ID

      try {
        setLoading(true);
        let responseData;

        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 300));
          // En un mundo real, la API usaría el 'id' para buscar.
          // Aquí, solo devolvemos el único perfil simulado que tenemos.
          responseData = { ...mockStudentProfileData, id: id }; // Aseguramos que el ID coincida
        } else {
          // const response = await apiService.getStudentById(id);
          // responseData = response.data;
          throw new Error('API real aún no implementada');
        }

        setProfile(responseData);
        setError(null);

      } catch (err) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]); // Se vuelve a ejecutar si el ID cambia

  return { profile, loading, error };
}