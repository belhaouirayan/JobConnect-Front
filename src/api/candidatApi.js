import apiClient from './axios';

export const candidatApi = {
  // Fetch all candidates with optional filters
  getAll: (params = {}) => {
    return apiClient.get('/candidats', { params });
  },

  // Get a single candidate by ID
  getById: (id) => {
    return apiClient.get(`/candidats/${id}`);
  },

  // Update candidate status to 'accepte'
  accepter: (id) => {
    return apiClient.post(`/candidats/${id}/accepter`);
  },

  // Update candidate status to 'refuse'
  refuser: (id) => {
    return apiClient.post(`/candidats/${id}/refuser`);
  },

  // Get ranking (classement)
  getClassement: (params = {}) => {
    return apiClient.get('/candidats/classement', { params });
  },

  // Final hire (transfer to employee table)
  recruter: (id, formData = {}) => {
    return apiClient.post(`/candidats/${id}/recruter`, formData);
  },

  // Trigger AI analysis
  analyserIA: (id) => {
    return apiClient.post(`/candidats/${id}/analyser-ia`);
  },

  // Toggle favorite status
  toggleFavorite: (id) => {
    return apiClient.patch(`/candidats/${id}/toggle-favorite`);
  },

  // Get CV preview URL
  // getPreviewUrl: (id) => {
  //   return `${process.env.REACT_APP_API_URL}/candidats/${id}/preview-cv`;
  // },
  
  getPreviewUrl: (id) => `${apiClient.defaults.baseURL}/candidats/${id}/preview-cv`,

  // Fetch binary content for preview (essential for PDF/Word binary rendering)
  getPreviewContent: (id) => {
    return apiClient.get(`/candidats/${id}/preview-cv`, {
      responseType: 'blob'
    });
  },

  getGenericPreview: (id, type, index = null) => {
    let url = `/candidats/${id}/preview/${type}`;
    if (index !== null) url += `/${index}`;
    return apiClient.get(url, { responseType: 'blob' });
  },

  // Delete candidate
  delete: (id) => {
    return apiClient.delete(`/candidats/${id}`);
  },

  // Create new candidate (application)
  create: (formData) => {
    return apiClient.post('/candidats', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const offreApi = {
  // Fetch all job offers for filters
  getAll: () => {
    return apiClient.get('/offres');
  }
};
