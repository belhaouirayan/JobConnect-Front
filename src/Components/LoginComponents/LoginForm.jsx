import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaArrowRight, FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import ModalPassword from "../modalpassword/modalpass"; 

const LoginForm = ({ isMobile, darkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setLoginStatus(null);

    try {
      console.log("Attempting login...");

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response data:", data);

      if (data.token) {
        console.log("Login successful! Token received");
        setLoginStatus('success');

        const loginTime = new Date().getTime();
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("loginTime", loginTime.toString());

        console.log("Stored token:", localStorage.getItem("token"));
        console.log("Stored role:", localStorage.getItem("role"));

        // Redirection selon le rôle après 1.5 secondes
        setTimeout(() => {
          const userRole = data.user.role || 'employee';
          
          if (userRole === 'employee' || userRole === 'manager') {
            window.location.href = "/dashboard/employee";
          } else if (userRole === 'admin') {
            window.location.href = "/recrutement/admin/validation";
          } else if (userRole === 'rh') {
            window.location.href = "/recrutement/dashboard";
          } else {
            // Redirection par défaut
            window.location.href = "/dashboard/employee";
          }
        }, 1500);
      } else {
        setLoginStatus('error');
        setErrorMessage("Login failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginStatus('error');
      setErrorMessage(error.message || "Network error");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="login-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: isMobile ? "1.5rem" : "2.5rem",
        width: isMobile ? "100%" : "60%",
        position: "relative",
      }}
    >
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          color: darkMode ? "#e2e8f0" : "#2d3748",
          fontSize: isMobile ? "1.5rem" : "1.8rem",
          fontWeight: "700",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        Welcome back!
      </motion.h2>

      <form onSubmit={handleSubmit}>
        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your mail address"
          icon={<FaEnvelope />}
          isMobile={isMobile}
          darkMode={darkMode}
          disabled={isLoading}
          required={true}
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          icon={<FaLock />}
          isMobile={isMobile}
          darkMode={darkMode}
          disabled={isLoading}
          required={true}
          style={{ marginTop: "1.5rem" }}
        />
        
        {/* Message d'erreur */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                borderRadius: "6px",
                backgroundColor: darkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${darkMode ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                color: darkMode ? "#fca5a5" : "#dc2626",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaTimesCircle />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <SubmitButton 
          isMobile={isMobile} 
          darkMode={darkMode} 
          isLoading={isLoading}
          loginStatus={loginStatus}
        />
      </form>

      <ForgotPasswordLink
        onClick={handleForgotPasswordClick}
        isMobile={isMobile}
        darkMode={darkMode}
      />

      <div style={{ 
        width: "100%", 
        marginTop: "1rem", 
        textAlign: "center",
        borderTop: `1px solid ${darkMode ? "#2d3748" : "#e2e8f0"}`,
        paddingTop: "1.5rem"
      }}>
        <p style={{ 
          color: darkMode ? "#a0aec0" : "#718096", 
          fontSize: "0.85rem",
          marginBottom: "0.5rem"
        }}>
          Pas encore de compte ?
        </p>
        <Link
          to="/register"
          style={{
            color: darkMode ? "#10b981" : "#059669",
            textDecoration: "none",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: isMobile ? "0.9rem" : "1rem",
            transition: "all 0.3s"
          }}
        >
          <FaUserPlus />
          Créer un compte Recruteur
        </Link>
      </div>

      <ModalPassword isOpen={isModalOpen} onClose={closeModal} darkMode={darkMode} />
    </motion.div>
  );
};

const InputField = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  isMobile, 
  darkMode, 
  disabled, 
  required, 
  style 
}) => (
  <div style={style}>
    <label
      htmlFor={id}
      style={{
        display: "block",
        marginBottom: "0.5rem",
        color: darkMode ? "#cbd5e0" : "#4a5568",
        fontSize: isMobile ? "0.85rem" : "0.9rem",
        fontWeight: "500",
      }}
    >
      {label}
      {required && (
        <span style={{ 
          color: "#ef4444", 
          marginLeft: "4px", 
          fontWeight: "600" 
        }}>
          *
        </span>
      )}
    </label>
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: darkMode ? "#718096" : "#a0aec0",
          fontSize: isMobile ? "0.9rem" : "1rem",
        }}
      >
        {icon}
      </span>
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
          padding: isMobile ? "10px 10px 10px 40px" : "12px 12px 12px 45px",
          border: `1px solid ${darkMode ? "#4a5568" : "#e2e8f0"}`,
          borderRadius: "8px",
          fontSize: isMobile ? "0.85rem" : "0.95rem",
          backgroundColor: darkMode ? "#1a202c" : "#ffffff",
          color: darkMode ? "#e2e8f0" : "#1a202c",
          outline: "none",
          transition: "all 0.3s",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  </div>
);

const SubmitButton = ({ isMobile, darkMode, isLoading, loginStatus }) => (
 <motion.button
  type="submit"
  disabled={isLoading}
  style={{
    width: "100%",
    padding: isMobile ? "12px" : "14px",
    marginTop: "2rem",
    background:
      loginStatus === "success"
        ? "linear-gradient(135deg, #10b981, #059669)"
        : loginStatus === "error"
        ? "linear-gradient(135deg, #ef4444, #dc2626)"
        : darkMode
        ? "linear-gradient(135deg, rgb(56,97,163), rgb(131,173,255))"
        : "linear-gradient(135deg, rgb(29,69,134), rgb(83,134,218))",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: isMobile ? "0.9rem" : "1rem",
    fontWeight: "600",
    cursor: isLoading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: darkMode
      ? "0 4px 6px rgba(0,0,0,0.3)"
      : "0 4px 6px rgba(0,0,0,0.1)",
    opacity: isLoading ? 0.8 : 1,
    transition: "all 0.3s",
  }}
  whileHover={
    !isLoading
      ? {
          scale: 1.02,
          background:
            loginStatus === "success"
              ? "linear-gradient(135deg, #059669, #10b981)"
              : loginStatus === "error"
              ? "linear-gradient(135deg, #dc2626, #ef4444)"
              : darkMode
              ? "linear-gradient(135deg, rgb(131,173,255), rgb(56,97,163))"
              : "linear-gradient(135deg, rgb(83,134,218), rgb(29,69,134))",
        }
      : {}
  }
  whileTap={!isLoading ? { scale: 0.98 } : {}}
>
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTop: "2px solid white",
              borderRadius: "50%",
            }}
          />
          Connexion en cours...
        </motion.div>
      ) : loginStatus === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <FaCheckCircle />
          Connexion réussie !
        </motion.div>
      ) : loginStatus === 'error' ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <FaTimesCircle />
          Échec de connexion
        </motion.div>
      ) : (
        <motion.div
          key="default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          Log in <FaArrowRight />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

const ForgotPasswordLink = ({ onClick, isMobile, darkMode }) => (
  <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
    <a
      href="#!"
      onClick={onClick}
      style={{
        color: darkMode ? "rgb(131,173,255)" : "rgb(83,134,218)",
        textDecoration: "none",
        fontWeight: "500",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: isMobile ? "0.8rem" : "0.9rem",
      }}
    >
      <FaQuestionCircle style={{ fontSize: isMobile ? "0.9rem" : "1rem" }} />
      Forgot your password?
    </a>
  </div>
);

export default LoginForm;