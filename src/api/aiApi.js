/**
 * aiApi.js
 * API Gemini AI — utilise l'instance axios existante du projet (avec Bearer token)
 *
 * Placez ce fichier à côté de candidatApi.js (même dossier api/)
 */

import api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Helper : construit le body selon le type d'entrée
// ─────────────────────────────────────────────────────────────────────────────
const buildPayload = (cvText = null, cvFile = null) => {
    if (cvFile) {
        const form = new FormData();
        form.append('cv_file', cvFile);
        return { data: form, config: { headers: { 'Content-Type': 'multipart/form-data' } } };
    }
    if (cvText) {
        return { data: { cv_text: cvText }, config: {} };
    }
    // Aucun CV fourni : le backend utilisera cv_path ou les champs du candidat
    return { data: {}, config: {} };
};

// ─────────────────────────────────────────────────────────────────────────────
export const aiApi = {

    /**
     * Analyse complète d'un candidat (CV + matching + score + écarts)
     * Met à jour : score_ia, competences, ia_commentaire
     */
    fullAnalysis: (candidatId, cvText = null, cvFile = null) => {
        const { data, config } = buildPayload(cvText, cvFile);
        return api.post(`/candidats/${candidatId}/ai/full-analysis`, data, config);
    },

    /**
     * Extraction des infos du CV (sans comparaison avec l'offre)
     * Met à jour : competences, ia_commentaire
     */
    analyzeCV: (candidatId, cvText = null, cvFile = null) => {
        const { data, config } = buildPayload(cvText, cvFile);
        return api.post(`/candidats/${candidatId}/ai/analyze-cv`, data, config);
    },

    /**
     * Matching CV ↔ offre liée au candidat
     * Retourne : score, points forts/faibles, verdict
     */
    matchWithOffer: (candidatId, cvText = null, cvFile = null) => {
        const { data, config } = buildPayload(cvText, cvFile);
        return api.post(`/candidats/${candidatId}/ai/match`, data, config);
    },

    /**
     * Score IA sur 100 — sauvegardé en base (score_ia + ia_commentaire)
     */
    scoreCandidate: (candidatId, cvText = null, cvFile = null) => {
        const { data, config } = buildPayload(cvText, cvFile);
        return api.post(`/candidats/${candidatId}/ai/score`, data, config);
    },

    /**
     * Compétences manquantes par rapport à l'offre
     */
    missingSkills: (candidatId, cvText = null, cvFile = null) => {
        const { data, config } = buildPayload(cvText, cvFile);
        return api.post(`/candidats/${candidatId}/ai/missing-skills`, data, config);
    },

    /**
     * Classement automatique de plusieurs candidats pour une offre
     * Met à jour score_ia de tous les candidats en base
     * @param {number}   offreId
     * @param {number[]} candidatIds
     */
    rankCandidates: (offreId, candidatIds) =>
        api.post('/ai/rank', { offre_id: offreId, candidat_ids: candidatIds }),
};