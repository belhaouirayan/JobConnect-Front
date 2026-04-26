import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import LoginHeader from "../../Components/LoginComponents/LoginHeader";
import LoginForm from "../../Components/LoginComponents/LoginForm";
import { checkSession } from "../../api"; 
import "./login.css";

const LoginPage = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [isRotating, setIsRotating] = useState(false);
  
  // Check if user has a valid session
  useEffect(() => {
    const hasValidSession = checkSession();
    console.log(' LoginPage - Session valid:', hasValidSession);
    
    if (hasValidSession) {
      console.log('User has valid session, redirecting to dashboard');
      
      // Récupérer le rôle de l'utilisateur
      const userRole = localStorage.getItem('role') || 'employee';
      
      // Rediriger selon le rôle
      if (userRole === 'employee' || userRole === 'manager') {
        window.location.href = '/dashboard/employee';
      } else if (userRole === 'admin') {
        window.location.href = '/recrutement/admin/validation';
      } else if (userRole === 'rh') {
        window.location.href = '/recrutement/dashboard';
      } else {
        // Redirection par défaut
        window.location.href = '/dashboard/employee';
      }
    } else {
      console.log(' No valid session found, staying on login page');
    }
  }, []);

  // Utiliser la même logique que Layout pour le dark mode
  const [darkMode, setDarkMode] = useState(() => {
    // Vérifie si le mode sombre était activé dans le localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Synchroniser avec les préférences système et le localStorage
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Si aucune préférence n'est sauvegardée, utiliser la préférence système
    const savedMode = localStorage.getItem('darkMode');
    if (!savedMode && mediaQuery.matches) {
      setDarkMode(true);
      localStorage.setItem('darkMode', JSON.stringify(true));
    }

    const handleChange = () => {
      // Ne changer automatiquement que si aucune préférence utilisateur n'est définie
      const currentSavedMode = localStorage.getItem('darkMode');
      if (!currentSavedMode) {
        setDarkMode(mediaQuery.matches);
        localStorage.setItem('darkMode', JSON.stringify(mediaQuery.matches));
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Écouter les changements du localStorage (pour la synchronisation entre onglets)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') {
        setDarkMode(e.newValue ? JSON.parse(e.newValue) : false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fonction pour basculer entre les modes (même logique que Layout)
  const handleThemeToggle = () => {
    setIsRotating(true);
    const newMode = !darkMode;
    setDarkMode(newMode);
    // Sauvegarde la préférence dans le localStorage
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    
    // Réinitialiser l'animation après la rotation
    setTimeout(() => {
      setIsRotating(false);
    }, 500);
  };

  // Couleurs pour les différents modes
  const backgroundColor = darkMode 
    ? "linear-gradient(135deg, #111827 0%, #111827 100%)" 
    : "linear-gradient(135deg, #edf0f5 0%, #edf0f5 100%)";
  
  const cardBackground = darkMode ? "#1a202c" : "white";
  const textColor = darkMode ? "white" : "inherit";

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        background: backgroundColor,
        padding: isMobile ? "1rem" : "2rem",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textColor,
        position: "relative",
      }}
    >
      {/* Bouton de basculement du mode sombre */}
      <motion.button
        onClick={handleThemeToggle}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="transition-colors"
        style={{
          position: "absolute",
          top: isMobile ? "1rem" : "2rem",
          right: isMobile ? "1rem" : "2rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 10,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <img
          src={darkMode ? "/darkmode.png" : "/lightmode.png"}
          alt="Theme toggle"
          style={{
            width: isMobile ? "24px" : "28px",
            height: isMobile ? "24px" : "28px",
            transition: "transform 0.5s ease",
            opacity: isRotating ? 0.7 : 1,
          }}
        />
      </motion.button>

      <motion.div
        className="login-card"
        variants={{
          hidden: { scale: 0.95, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 10,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        style={{
          background: cardBackground,
          boxShadow: darkMode 
            ? "0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)" 
            : "0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)",
          borderRadius: "12px",
          overflow: "hidden",
          width: "100%",
          maxWidth: isMobile ? "100%" : "1000px",
          display: isMobile ? "block" : "flex",
          flexDirection: isMobile ? "column" : "row",
          border: darkMode ? "1px solid #2d3748" : "none",
        }}
      >
        <LoginHeader 
          isMobile={isMobile} 
          darkMode={darkMode} 
        />
        <LoginForm 
          isMobile={isMobile} 
          darkMode={darkMode} 
        />
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;