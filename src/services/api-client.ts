import axios, { CanceledError, AxiosError } from 'axios';

export { CanceledError };

const backend_url = import.meta.env.VITE_BACKEND_URL
const apiClient = axios.create({
  baseURL: backend_url,
  withCredentials: true,
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
  (error: AxiosError) => {
    if (error.response) {
      // Add this for more detailed error information about 500 errors
      if (error.response.status === 500) {
        console.error('Detailed 500 Error:', {
          message: 'Internal Server Error',
          serverErrorDetails: error.response.data,
          requestConfig: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data instanceof FormData ? 'FormData (cannot display)' : error.config?.data,
            headers: error.config?.headers,
          },
        });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
