import { motion } from "framer-motion";

const LoginHeader = ({ isMobile, darkMode }) => (
  <motion.div
    className="login-image"
    initial={{ x: isMobile ? 0 : -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.7, type: "spring" }}
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: isMobile ? "1.5rem 1rem" : "2rem",
      width: isMobile ? "100%" : "40%",
      textAlign: "center",
      background: darkMode 
        ? "linear-gradient(135deg, #1a202c 0%, #1a202c 100%)" 
        : "linear-gradient(135deg, #ffff 0%, #ffff 100%)",
    }}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4 }}
      style={{
        width: isMobile ? "100px" : "140px",
        height: isMobile ? "100px" : "140px",
      }}
    >
      <img
        src={darkMode ? "/darklogo.png" : "/lightlogo.png"}
        alt="Logo JobConnect"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </motion.div>

    <div
      style={{
        position: "relative",
        width: "100%",
        marginTop: isMobile ? "0.5rem" : "1rem",
      }}
    >
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          margin: 0,
          padding: 0,
          fontSize: isMobile ? "1.4rem" : "1.8rem",
          fontWeight: 700,
          fontFamily: "'Play', sans-serif",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: darkMode ? "#83adff" : "#1d4586",
          textShadow: isMobile ? "none" : darkMode 
            ? "1px 1px 3px rgba(255,255,255,0.1)" 
            : "1px 1px 3px rgba(0,0,0,0.1)",
          lineHeight: 1,
        }}
      >
        <span style={{ color: darkMode ? "#ffff" : "#1d4586" }} className="mr-1">
          Job
        </span>
        <span style={{ color: darkMode ? "#ffff" : "#1d4586", fontWeight: 600 }}>
          Connect
        </span>
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          margin: 0,
          padding: 0,
          fontSize: "14px",
          fontWeight: 400,
          fontFamily: "'Play', sans-serif",
          letterSpacing: "1px",
          color: darkMode ? "#83adff" : "#1d4586",
          lineHeight: 1,
          textAlign: "center",
          width: "100%",
          marginTop: "0.3rem",
        }}
      >
        <span style={{ 
          color: darkMode ? "#a0aec0" : "#718096", 
          fontWeight: 400 
        }}>
          Recruitment Platform
        </span>
      </motion.p>
    </div>
  </motion.div>
);

export default LoginHeader;