/**
 * useAI.js
 * Hook React — encapsule tous les appels aiApi avec loading/error par action
 */

import { useState, useCallback } from 'react';
import { aiApi } from '../api/aiApi';

export const useAI = () => {
    const [loadingAction, setLoadingAction] = useState(null);
    const [error, setError]                = useState(null);

    const run = useCallback(async (actionName, apiFn) => {
        setLoadingAction(actionName);
        setError(null);
        try {
            const response = await apiFn();
            return response.data; // { success, data, candidat? }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Erreur serveur';
            setError(msg);
            return null;
        } finally {
            setLoadingAction(null);
        }
    }, []);

    return {
        loading:      !!loadingAction,
        loadingAction,
        error,
        isLoading:    (action) => loadingAction === action,
        clearError:   () => setError(null),

        fullAnalysis:  (id, text, file)  => run('full',    () => aiApi.fullAnalysis(id, text, file)),
        analyzeCV:     (id, text, file)  => run('analyze', () => aiApi.analyzeCV(id, text, file)),
        matchWithOffer:(id, text, file)  => run('match',   () => aiApi.matchWithOffer(id, text, file)),
        scoreCandidate:(id, text, file)  => run('score',   () => aiApi.scoreCandidate(id, text, file)),
        missingSkills: (id, text, file)  => run('missing', () => aiApi.missingSkills(id, text, file)),
        rankCandidates:(offreId, ids)    => run('rank',    () => aiApi.rankCandidates(offreId, ids)),
    };
};