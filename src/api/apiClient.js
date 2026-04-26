import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor: Attach token + session validation ──
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const loginTime = localStorage.getItem('loginTime');

  // Session expiry check
  if (token && loginTime) {
    const elapsed = Date.now() - parseInt(loginTime);
    if (elapsed > SESSION_TIMEOUT) {
      localStorage.clear();
      window.location.href = '/';
      return Promise.reject(new Error('Session expired'));
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response Interceptor: Handle 401, normalize errors ──
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    }

    // Normalize error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
