import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('glow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear expired or invalid token on 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('glow_token');
      if (hadToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('glow_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
