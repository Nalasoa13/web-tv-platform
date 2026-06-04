import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, headers = {}) => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        url: `${API_BASE_URL}${url}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, headers) => request('GET', url, null, headers), [request]);
  const post = useCallback((url, data, headers) => request('POST', url, data, headers), [request]);
  const put = useCallback((url, data, headers) => request('PUT', url, data, headers), [request]);
  const del = useCallback((url, headers) => request('DELETE', url, null, headers), [request]);

  return { get, post, put, del, loading, error };
};

export default useApi;
