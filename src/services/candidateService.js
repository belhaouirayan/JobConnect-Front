// src/services/candidateService.js
import apiClient from '../api/apiClient';
import { normalizeCandidate, normalizeCandidateList } from '../utils/normalizers';

export const candidateService = {
  getAll: async (params = {}) => {
    const { data } = await apiClient.get('/candidats', { params });
    return normalizeCandidateList(data);
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/candidats/${id}`);
    return normalizeCandidate(data.data || data);
  },

  accept: (id) => apiClient.post(`/candidats/${id}/accepter`),
  reject: (id) => apiClient.post(`/candidats/${id}/refuser`),
  pending: (id) => apiClient.post(`/candidats/${id}/en-attente`),
  hire: (id, formData) => apiClient.post(`/candidats/${id}/recruter`, formData),
  delete: (id) => apiClient.delete(`/candidats/${id}`),
  toggleFavorite: (id) => apiClient.patch(`/candidats/${id}/toggle-favorite`),

  /** Submit a new application (FormData with file uploads + digital profile) */
  apply: async (offreId, formData, docs, digitalProfile = null) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val != null) fd.append(key, val);
    });
    fd.append('offre_id', offreId);
    if (docs.cv) fd.append('cv', docs.cv);
    if (docs.permit) fd.append('permis', docs.permit);
    if (docs.diplome) fd.append('diplome', docs.diplome);
    if (docs.habitation) fd.append('habilitation', docs.habitation);
    if (docs.lettre_doc) fd.append('lettre_doc', docs.lettre_doc);
    if (docs.autres) fd.append('autres', docs.autres);

    // Digital Profile (PFE) — serialized as JSON strings
    if (digitalProfile) {
      if (digitalProfile.experiences?.length) {
        fd.append('experiences', JSON.stringify(digitalProfile.experiences));
      }
      if (digitalProfile.formations?.length) {
        fd.append('formations', JSON.stringify(digitalProfile.formations));
      }
      if (digitalProfile.competencesList?.length) {
        fd.append('competences_list', JSON.stringify(digitalProfile.competencesList));
      }
      if (digitalProfile.city) fd.append('ville', digitalProfile.city);
      if (digitalProfile.birthDate) fd.append('date_naissance', digitalProfile.birthDate);
    }

    const { data } = await apiClient.post('/candidats', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeCandidate(data.data || data);
  },

  /** Get preview URL for CV */
  getPreviewUrl: (id) => `${apiClient.defaults.baseURL}/candidats/${id}/preview-cv`,
};
