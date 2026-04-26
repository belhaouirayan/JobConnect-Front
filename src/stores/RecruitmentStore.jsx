// src/stores/RecruitmentStore.jsx
import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { jobService } from '../services/jobService';
import { candidateService } from '../services/candidateService';
import { dashboardService } from '../services/dashboardService';
import { interviewService } from '../services/interviewService';

const RecruitmentContext = createContext(null);

// ── State Shape ──
const initialState = {
  userRole: localStorage.getItem('role') || 'employee',
  jobs: { data: [], loading: false, error: null, lastFetched: null },
  candidates: { data: [], loading: false, error: null, meta: {}, lastFetched: null },
  interviews: { data: [], timeline: [], recruiters: [], loading: false, error: null, lastFetched: null },
  dashboard: { data: null, loading: false, error: null, lastFetched: null },
  moderation: { pendingUsers: [], flaggedOffers: [], loading: false, error: null },
  selectedJob: null,
  selectedCandidate: null,
  // 3D scene notification channel
  sceneUpdates: { type: null, payload: null, timestamp: null },
};

// ── Reducer ──
function recruitmentReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, userRole: action.payload };
    case 'SET_LOADING':
      return {
        ...state,
        [action.domain]: { ...state[action.domain], loading: true, error: null },
      };
    case 'SET_DATA':
      return {
        ...state,
        [action.domain]: {
          ...state[action.domain],
          ...action.payload,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        [action.domain]: { ...state[action.domain], loading: false, error: action.error },
      };
    case 'SELECT_JOB':
      return { ...state, selectedJob: action.payload };
    case 'SELECT_CANDIDATE':
      return { ...state, selectedCandidate: action.payload };
    case 'SCENE_UPDATE':
      return {
        ...state,
        sceneUpdates: {
          type: action.updateType,
          payload: action.payload,
          timestamp: Date.now(),
        },
      };
    default:
      return state;
  }
}

// ── Provider ──
export function RecruitmentProvider({ children }) {
  const [state, dispatch] = useReducer(recruitmentReducer, initialState);

  // Ref-based subscription for 3D scene (avoids re-renders)
  const sceneListeners = useRef(new Set());

  const notifyScene = useCallback((updateType, payload) => {
    dispatch({ type: 'SCENE_UPDATE', updateType, payload });
    // Also notify imperative listeners (for Three.js)
    sceneListeners.current.forEach((listener) => listener(updateType, payload));
  }, []);

  // ── Actions ──
  const actions = {
    setRole: useCallback((role) => {
      localStorage.setItem('role', role);
      dispatch({ type: 'SET_ROLE', payload: role });
    }, []),

    hasPermission: useCallback((allowedRoles) => {
      return allowedRoles.includes(state.userRole);
    }, [state.userRole]),

    fetchJobs: useCallback(async (params = {}) => {
      dispatch({ type: 'SET_LOADING', domain: 'jobs' });
      try {
        const result = await jobService.getAll(params);
        dispatch({ type: 'SET_DATA', domain: 'jobs', payload: { data: result } });
        notifyScene('JOBS_LOADED', result);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', domain: 'jobs', error: error.message });
      }
    }, [notifyScene]),

    fetchCandidates: useCallback(async (params = {}) => {
      dispatch({ type: 'SET_LOADING', domain: 'candidates' });
      try {
        const result = await candidateService.getAll(params);
        dispatch({
          type: 'SET_DATA',
          domain: 'candidates',
          payload: { data: result.data, meta: result.meta },
        });
        notifyScene('CANDIDATES_LOADED', result.data);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', domain: 'candidates', error: error.message });
      }
    }, [notifyScene]),

    fetchDashboard: useCallback(async () => {
      dispatch({ type: 'SET_LOADING', domain: 'dashboard' });
      try {
        const result = await dashboardService.getRecruitmentDashboard();
        dispatch({ type: 'SET_DATA', domain: 'dashboard', payload: { data: result } });
        notifyScene('DASHBOARD_LOADED', result);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', domain: 'dashboard', error: error.message });
      }
    }, [notifyScene]),

    fetchInterviews: useCallback(async (params = {}) => {
      dispatch({ type: 'SET_LOADING', domain: 'interviews' });
      try {
        const result = await interviewService.getAll(params);
        dispatch({
          type: 'SET_DATA',
          domain: 'interviews',
          payload: { data: result.entretiens || [], timeline: result.timeline || [], recruiters: result.recruiters || [] },
        });
        notifyScene('INTERVIEWS_LOADED', result.timeline || []);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', domain: 'interviews', error: error.message });
      }
    }, [notifyScene]),

    selectJob: useCallback((job) => {
      dispatch({ type: 'SELECT_JOB', payload: job });
      notifyScene('JOB_SELECTED', job);
    }, [notifyScene]),

    selectCandidate: useCallback((candidate) => {
      dispatch({ type: 'SELECT_CANDIDATE', payload: candidate });
      notifyScene('CANDIDATE_SELECTED', candidate);
    }, [notifyScene]),

    // ── Moderation Actions (Admin Only) ──
    fetchModerationData: useCallback(async () => {
      if (state.userRole !== 'admin') return;
      dispatch({ type: 'SET_LOADING', domain: 'moderation' });
      try {
        const resPending = await dashboardService.getPendingRegistrations();
        const resFlagged = await dashboardService.getFlaggedOffers();
        
        // Extract nested data from Laravel response { data: [...] }
        const pending = resPending.data.data || resPending.data || [];
        const flagged = resFlagged.data.data || resFlagged.data || [];
        
        dispatch({ 
          type: 'SET_DATA', 
          domain: 'moderation', 
          payload: { pendingUsers: pending, flaggedOffers: flagged } 
        });
        
        notifyScene('PENDING_USERS_LOADED', pending);
        notifyScene('FLAGGED_OFFERS_LOADED', flagged);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', domain: 'moderation', error: error.message });
      }
    }, [state.userRole, notifyScene]),

    approveUser: useCallback(async (userId) => {
      try {
        await dashboardService.approveUser(userId);
        actions.fetchModerationData();
        notifyScene('USER_APPROVED', userId);
      } catch (error) {
        console.error('Approval failed:', error);
      }
    }, [notifyScene]),

    // Subscribe to scene updates (for imperative 3D code)
    subscribeToScene: useCallback((listener) => {
      sceneListeners.current.add(listener);
      return () => sceneListeners.current.delete(listener);
    }, []),
  };

  return (
    <RecruitmentContext.Provider value={{ state, ...actions }}>
      {children}
    </RecruitmentContext.Provider>
  );
}

export const useRecruitment = () => {
  const ctx = useContext(RecruitmentContext);
  if (!ctx) throw new Error('useRecruitment must be used within RecruitmentProvider');
  return ctx;
};
