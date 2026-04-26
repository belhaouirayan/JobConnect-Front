// src/services/authService.js
import apiClient from '../api/apiClient';

export const authService = {
  login: async (credentials) => {
    const { data } = await apiClient.post('/login', credentials);
    // Store session data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user?.role || data.role || 'employee');
    }
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post('/logout');
    } finally {
      localStorage.clear();
    }
  },

  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },
};
