// src/services/jobService.js
import apiClient from '../api/apiClient';
import { normalizeJob, normalizeJobList } from '../utils/normalizers';

export const jobService = {
  /** Fetch all job offers (offres) */
  getAll: async (params = {}) => {
    const { data } = await apiClient.get('/offres', { params });
    return normalizeJobList(data);
  },

  /** Fetch a single job offer by ID */
  getById: async (id) => {
    const { data } = await apiClient.get(`/offres/${id}`);
    return normalizeJob(data.data || data);
  },

  /** Create a new job offer */
  create: async (payload) => {
    const { data } = await apiClient.post('/offres', payload);
    return normalizeJob(data.data || data);
  },

  /** Update a job offer */
  update: async (id, payload) => {
    const { data } = await apiClient.put(`/offres/${id}`, payload);
    return normalizeJob(data.data || data);
  },

  /** Delete a job offer */
  delete: (id) => apiClient.delete(`/offres/${id}`),
};
