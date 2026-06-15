import axios from 'axios';

// Create a configured axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // We don't have auth yet, but this is where the token would go
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors (e.g., 401 unauthorized, 500 server error)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
