// src/utils/roleHelpers.js

/**
 * Role-checking utilities for conditional UI rendering.
 * Reads from localStorage — same source as App.js's RoleProtectedRoute.
 */

export const getRole = () => localStorage.getItem('role') || 'employee';

/** Returns the current user object from localStorage */
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

/** Returns the department of the current user */
export const getUserDepartment = () => {
  const user = getCurrentUser();
  return user?.department_id || user?.departement || user?.department || null;
};

/** Is the current user a read-only Lecteur? */
export const isLecteur = () => getRole() === 'lecteur';

/** Can only view, no actions (alias for isLecteur) */
export const canViewOnly = () => isLecteur();

/** Can accept or refuse a candidate (decision actions) */
export const canAcceptRefuse = () => ['admin', 'rh', 'manager'].includes(getRole());

/** Can permanently delete a candidate record */
export const canDelete = () => ['admin', 'rh'].includes(getRole());

/** Can hire a candidate (creates Employee + User records) */
export const canHire = () => ['admin', 'rh'].includes(getRole());

/** Can view and manage interviews */
export const canManageInterviews = () => ['admin', 'rh', 'manager'].includes(getRole());

/** Can delete an existing interview */
export const canDeleteInterview = () => ['admin', 'rh'].includes(getRole());

/** Can access admin settings */
export const isAdmin = () => getRole() === 'admin';

/** Can access recruitment features (including read-only lecteur) */
export const canAccessRecruitment = () => ['admin', 'rh', 'manager', 'lecteur'].includes(getRole());

/** Is the user a manager limited to their department? */
export const isDepartmentLocked = () => getRole() === 'manager';
