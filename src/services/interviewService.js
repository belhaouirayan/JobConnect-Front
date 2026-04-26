// src/services/interviewService.js
import apiClient from '../api/apiClient';

export const interviewService = {
  /**
   * Fetch all interviews with timeline data and recruiter list.
   * Returns { entretiens, timeline, recruiters }
   */
  getAll: async (params = {}) => {
    const { data } = await apiClient.get('/entretiens', { params });
    return data;
  },

  /**
   * Fetch calendar-formatted events (FullCalendar-compatible).
   * Each event has: id, title, start, backgroundColor, borderColor, extendedProps
   */
  getCalendarEvents: async () => {
    const { data } = await apiClient.get('/entretiens/events');
    return data;
  },

  /** Fetch a single interview by ID */
  getById: async (id) => {
    const { data } = await apiClient.get(`/entretiens/${id}`);
    return data;
  },

  /**
   * Schedule a new interview.
   * Triggers EntretienMail via Mail::queue() on the backend.
   * Required: candidat_id, date_entretien, type
   * Optional: lieu, lien_visio, heure_fin, recruiter_id, notes, timezone
   */
  create: async (payload) => {
    const { data } = await apiClient.post('/entretiens', payload);
    return data;
  },

  /**
   * Update an existing interview.
   * Triggers update email to the candidate.
   */
  update: async (id, payload) => {
    const { data } = await apiClient.put(`/entretiens/${id}`, payload);
    return data;
  },

  /** Delete an interview. Resets candidate status if no other interviews remain. */
  destroy: (id) => apiClient.delete(`/entretiens/${id}`),

  /**
   * Check for scheduling conflicts in real-time.
   * Returns { conflict: boolean, message: string }
   */
  checkConflict: async (payload) => {
    const { data } = await apiClient.post('/entretiens/check-conflict', payload);
    return data;
  },

  /** Resend invitation email to the candidate */
  resendEmail: async (id) => {
    const { data } = await apiClient.post(`/entretiens/${id}/resend-email`);
    return data;
  },

  /**
   * Save interview resume/notes.
   * Supports structured notes with auto/manual/mix resume types.
   */
  updateResume: async (id, payload) => {
    const { data } = await apiClient.put(`/entretiens/${id}/update-resume`, payload);
    return data;
  },

  /** Initialize summary generation for an interview */
  generateSummary: async (id) => {
    const { data } = await apiClient.post(`/entretiens/${id}/generate-summary`);
    return data;
  },

  /** Delete a specific note by index */
  deleteNote: async (id, index) => {
    const { data } = await apiClient.delete(`/entretiens/${id}/notes/${index}`);
    return data;
  },
};
