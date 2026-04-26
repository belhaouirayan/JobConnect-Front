// src/Hooks/useScene3D.js
import { useEffect, useRef, useCallback } from 'react';
import { useRecruitment } from '../stores/RecruitmentStore';

/**
 * Bridge between React state and imperative 3D scenes.
 *
 * @param {Object} sceneRef - React ref to your Three.js scene or Spline app
 * @param {Object} handlers - Map of update types to handler functions
 *
 * Usage:
 *   useScene3D(sceneRef, {
 *     JOBS_LOADED: (scene, jobs) => { updateJobNodes(scene, jobs); },
 *     JOB_SELECTED: (scene, job) => { focusCameraOnJob(scene, job); },
 *     CANDIDATES_LOADED: (scene, candidates) => { spawnCandidateAvatars(scene, candidates); },
 *   });
 */
export function useScene3D(sceneRef, handlers) {
  const { subscribeToScene, state } = useRecruitment();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const unsubscribe = subscribeToScene((updateType, payload) => {
      const scene = sceneRef.current;
      if (!scene) return;

      const handler = handlersRef.current[updateType];
      if (handler) {
        try {
          handler(scene, payload);
        } catch (err) {
          console.error(`[useScene3D] Error in ${updateType} handler:`, err);
        }
      }
    });

    return unsubscribe;
  }, [sceneRef, subscribeToScene]);

  // Return a manual trigger for when you need to push data imperatively
  const pushToScene = useCallback((updateType, payload) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handler = handlersRef.current[updateType];
    if (handler) handler(scene, payload);
  }, [sceneRef]);

  return { pushToScene, sceneUpdates: state.sceneUpdates };
}
