// api-client.ts
import axios, { CanceledError } from 'axios';

export { CanceledError };

const apiClient = axios.create({
  baseURL: 'http://localhost:3060',
  withCredentials: true, // חשוב!
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // אם יש שגיאת אותנטיקציה
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        // אפשר להוסיף ניתוב לדף התחברות
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
