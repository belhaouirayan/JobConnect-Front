import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkSession } from "./api";
import Login from "./pages/login/login";
import Layout from "./Components/Layouts/layouts";
import { LanguageProvider } from "./Components/Navbar/LanguageContext";
import { RecruitmentProvider, useRecruitment } from "./stores/RecruitmentStore";

// ── Recruitment Pages ──
import DashboardRecrt  from "./pages/dashboard_recrt/DashboardRecrt";
import Offres          from "./pages/Offres/Offres";
import CandidatesList  from "./pages/Candidats/CandidatesList";
import CandidateDetail from "./pages/Candidats/CandidateDetail";
import FinalDecision   from "./pages/Candidats/FinalDecision";
import FinalDecisionDetail from "./pages/Candidats/FinalDecisionDetail";
import Postuler        from "./pages/Candidats/Postuler"; 
import Candidats from "./pages/Candidats/Candidats";
import Settings from "./pages/Settings/Settings";
import AdminSettings from "./pages/Settings/AdminSettings";

// Public page: interview confirmation
import EntretienConfirm from "./pages/Candidats/EntretienConfirm";
import Register from "./pages/login/Register";

// Admin pages
import ValidationInscriptions from "./pages/Admin/ValidationInscriptions";
import ModerationOffres from "./pages/Admin/ModerationOffres";

const DefaultRedirect = () => {
  const { state } = useRecruitment();
  const userRole = state.userRole;

  if (userRole === 'admin') {
    return <Navigate to="/recrutement/admin/validation" replace />;
  }
  return <Navigate to="/recrutement/dashboard" replace />;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { state } = useRecruitment();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Give a small delay to allow store to initialize role from localStorage
    const timer = setTimeout(() => setIsInitializing(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const hasValidSession = checkSession();
  const userRole = state.userRole;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:!bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          <p className="mt-2 text-gray-500 dark:!text-gray-400">Initialisation...</p>
        </div>
      </div>
    );
  }

  if (!hasValidSession) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.warn(`Access denied for role: ${userRole}. Allowed: ${allowedRoles.join(', ')}`);
    // Custom redirect logic for Admin trying to access recruitment pages
    if (userRole === 'admin') {
      return <Navigate to="/recrutement/admin/validation" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    const publicPaths = ["/", "/interview/respond", "/register"];
    const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));

    if (!checkSession() && !isPublic) {
      window.location.href = "/";
    }

    const interval = setInterval(() => {
      const isPublicNow = publicPaths.some(p => window.location.pathname.startsWith(p));
      if (!checkSession() && !isPublicNow) {
        window.location.href = "/";
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RecruitmentProvider>
      <LanguageProvider>
        <div className="App">
          <Router>
          <Routes>

            {/* ── Public ── */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/interview/respond/:token" element={<EntretienConfirm />} />

            {/* ── Recruitment (Protected) ── */}
            <Route path="/recrutement/dashboard" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><DashboardRecrt /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/test" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><Offres /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/candidats" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><CandidatesList /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/candidat/:id" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><CandidateDetail /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/entretien" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><Candidats /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/decision-finale" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><FinalDecision /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/decision-detail/:id" element={<RoleProtectedRoute allowedRoles={['rh', 'manager', 'lecteur']}><Layout><FinalDecisionDetail /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/postuler" element={<RoleProtectedRoute allowedRoles={['rh', 'manager']}><Layout><Postuler /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/settings" element={<RoleProtectedRoute allowedRoles={['rh', 'manager']}><Layout><Settings /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/admin-settings" element={<RoleProtectedRoute allowedRoles={['rh', 'manager']}><Layout><AdminSettings /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/admin/validation" element={<RoleProtectedRoute allowedRoles={['admin']}><Layout><ValidationInscriptions /></Layout></RoleProtectedRoute>} />
            <Route path="/recrutement/admin/moderation" element={<RoleProtectedRoute allowedRoles={['admin']}><Layout><ModerationOffres /></Layout></RoleProtectedRoute>} />

            {/* ── CATCH ALL → Role-based default ── */}
            <Route path="*" element={<DefaultRedirect />} />

          </Routes>
        </Router>
      </div>
    </LanguageProvider>
    </RecruitmentProvider>
  );
}

export default App;