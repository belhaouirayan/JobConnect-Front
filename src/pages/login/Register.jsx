import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import "./login.css";

const Register = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [isRotating, setIsRotating] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rh");
  const [isLoading, setIsLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedMode = localStorage.getItem('darkMode');
    if (!savedMode && mediaQuery.matches) {
      setDarkMode(true);
      localStorage.setItem('darkMode', JSON.stringify(true));
    }
    const handleChange = () => {
      const currentSavedMode = localStorage.getItem('darkMode');
      if (!currentSavedMode) {
        setDarkMode(mediaQuery.matches);
        localStorage.setItem('darkMode', JSON.stringify(mediaQuery.matches));
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') setDarkMode(e.newValue ? JSON.parse(e.newValue) : false);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleThemeToggle = () => {
    setIsRotating(true);
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    setTimeout(() => setIsRotating(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: password,
          role 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterStatus('success');
        setTimeout(() => {
          window.location.href = "/";
        }, 4000);
      } else {
        setErrorMessage(data.message || "L'inscription a échoué.");
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

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
          visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
        }}
        initial="hidden"
        animate="visible"
        style={{
          display: "flex",
          flexDirection: "column",
          background: cardBackground,
          boxShadow: darkMode 
            ? "0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)" 
            : "0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)",
          borderRadius: "12px",
          overflow: "hidden",
          width: "100%",
          maxWidth: "500px",
          padding: isMobile ? "1.5rem" : "2.5rem",
          border: darkMode ? "1px solid #2d3748" : "none",
        }}
      >
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            color: darkMode ? "#e2e8f0" : "#2d3748",
            fontSize: isMobile ? "1.5rem" : "1.8rem",
            fontWeight: "700",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          Créer un compte
        </motion.h2>
        
        <p style={{
          textAlign: "center",
          color: darkMode ? "#a0aec0" : "#718096",
          fontSize: "0.9rem",
          marginBottom: "2rem"
        }}>
          Rejoignez JobConnect en tant que recruteur ou manager.
        </p>

        <div style={{
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          color: darkMode ? "#fbbf24" : "#d97706",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          lineHeight: "1.4"
        }}>
          <span style={{ fontSize: "1.2rem", marginTop: "-2px", fontWeight: "bold" }}>!</span>
          <div>
            <strong>Important :</strong> Tous les nouveaux comptes recruteurs/managers nécessitent une validation de la part d'un Administrateur avant de pouvoir accéder à la plateforme.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            id="name"
            label="Nom complet"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Entrez votre nom"
            icon={null}
            isMobile={isMobile}
            darkMode={darkMode}
            disabled={isLoading}
            required={true}
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Entrez votre adresse email"
            icon={null}
            isMobile={isMobile}
            darkMode={darkMode}
            disabled={isLoading}
            required={true}
            style={{ marginTop: "1rem" }}
          />
          <InputField
            id="password"
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Créez un mot de passe"
            icon={null}
            isMobile={isMobile}
            darkMode={darkMode}
            disabled={isLoading}
            required={true}
            style={{ marginTop: "1rem" }}
          />
          
          <div style={{ marginTop: "1rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: darkMode ? "#cbd5e0" : "#4a5568",
              fontSize: isMobile ? "0.85rem" : "0.9rem",
              fontWeight: "500",
            }}>
              Rôle souhaité <span style={{ color: "#ef4444", marginLeft: "4px", fontWeight: "600" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: darkMode ? "#718096" : "#a0aec0",
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}>
                R
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px 10px 10px 40px" : "12px 12px 12px 45px",
                  border: `1px solid ${darkMode ? "#4a5568" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  fontSize: isMobile ? "0.85rem" : "0.95rem",
                  backgroundColor: darkMode ? "#1a202c" : "#ffffff",
                  color: darkMode ? "#e2e8f0" : "#1a202c",
                  outline: "none",
                  appearance: "none",
                }}
              >
                <option value="rh">Recruteur / RH</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          <SubmitButton 
            isMobile={isMobile} 
            darkMode={darkMode} 
            isLoading={isLoading}
            registerStatus={registerStatus}
          />
        </form>

        <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
          <Link
            to="/"
            style={{
              color: darkMode ? "rgb(131,173,255)" : "rgb(83,134,218)",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: isMobile ? "0.8rem" : "0.9rem",
            }}
          >
            Déjà un compte ? Connectez-vous
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ id, label, type, value, onChange, placeholder, icon, isMobile, darkMode, disabled, required, style }) => (
  <div style={style}>
    <label htmlFor={id} style={{
      display: "block",
      marginBottom: "0.5rem",
      color: darkMode ? "#cbd5e0" : "#4a5568",
      fontSize: isMobile ? "0.85rem" : "0.9rem",
      fontWeight: "500",
    }}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: "4px", fontWeight: "600" }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: darkMode ? "#718096" : "#a0aec0",
        fontSize: isMobile ? "0.9rem" : "1rem",
      }}>{icon}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{
          width: "100%",
          padding: isMobile 
            ? `10px 10px 10px ${icon ? '40px' : '15px'}` 
            : `12px 12px 12px ${icon ? '45px' : '15px'}`,
          border: `1px solid ${darkMode ? "#4a5568" : "#e2e8f0"}`,
          borderRadius: "8px",
          fontSize: isMobile ? "0.85rem" : "0.95rem",
          backgroundColor: darkMode ? "#1a202c" : "#ffffff",
          color: darkMode ? "#e2e8f0" : "#1a202c",
          outline: "none",
          transition: "all 0.3s",
        }}
      />
    </div>
  </div>
);

const SubmitButton = ({ isMobile, darkMode, isLoading, registerStatus }) => (
 <motion.button
  type="submit"
  disabled={isLoading || registerStatus === 'success'}
  style={{
    width: "100%",
    padding: isMobile ? "12px" : "14px",
    marginTop: "2rem",
    background: registerStatus === "success"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : darkMode
      ? "linear-gradient(135deg, rgb(56,97,163), rgb(131,173,255))"
      : "linear-gradient(135deg, rgb(29,69,134), rgb(83,134,218))",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: isMobile ? "0.9rem" : "1rem",
    fontWeight: "600",
    cursor: (isLoading || registerStatus === 'success') ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: darkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.1)",
  }}
  whileHover={!isLoading && registerStatus !== 'success' ? { scale: 1.02 } : {}}
  whileTap={!isLoading && registerStatus !== 'success' ? { scale: 0.98 } : {}}
>
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} />
          Inscription en cours...
        </motion.div>
      ) : registerStatus === 'success' ? (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          Demande envoyée !
        </motion.div>
      ) : (
        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          S'inscrire
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

export default Register;
