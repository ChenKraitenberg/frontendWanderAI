import axios, { CanceledError, AxiosError } from 'axios';

export { CanceledError };

const apiClient = axios.create({
  baseURL: 'http://localhost:3060',
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
    // More comprehensive error logging
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
      });

      // Specific handling for 500 Internal Server Error
      if (error.response.status === 500) {
        console.error('Detailed 500 Error:', {
          message: 'Internal Server Error',
          serverErrorDetails: error.response.data,
        });
      }

      // Authentication error handling
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        // Optional: Redirect to login page
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error:', {
        noResponse: true,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Something happened in setting up the request
      console.error('API Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
