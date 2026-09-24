import axios from 'axios';

// Resolve API base URL: strictly uses VITE_API_URL if configured,
// defaults to /api in production (same origin / rewrites),
// or local dev server during local npm run dev.
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach Supabase JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses and error extractions
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please check your connection.';

    const status = error.response?.status;
    const errorCode = error.response?.data?.error;

    // Reject with a formatted error object
    return Promise.reject({
      status,
      message,
      code: errorCode,
      data: error.response?.data,
    });
  }
);

export default api;
