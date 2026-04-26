// src/services/dashboardService.js
import apiClient from '../api/apiClient';
import { normalizeDashboard } from '../utils/normalizers';

export const dashboardService = {
  /** Fetch recruitment dashboard data */
  getRecruitmentDashboard: async () => {
    const { data } = await apiClient.get('/recrutement/dashboard');
    return normalizeDashboard(data);
  },

  /** Admin Moderation: Pending Recruiter Accounts */
  getPendingRegistrations: async () => {
    return apiClient.get('/recrutement/admin/pending-users');
  },

  /** Admin Moderation: Flagged Job Offers */
  getFlaggedOffers: async () => {
    return apiClient.get('/recrutement/admin/flagged-offers');
  },

  /** Approve User Account */
  approveUser: async (userId) => {
    return apiClient.post(`/recrutement/admin/users/${userId}/approve`);
  },

  /** Reject User Account */
  rejectUser: async (userId) => {
    return apiClient.post(`/recrutement/admin/users/${userId}/reject`);
  },
};
