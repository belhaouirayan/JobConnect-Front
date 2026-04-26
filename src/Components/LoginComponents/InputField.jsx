import { motion } from "framer-motion";

const InputField = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  errorMessage,
  isMobile,
  darkMode,
  ...props
}) => (
  <motion.div
    className="form-group input-with-icon"
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 10,
        },
      },
    }}
    {...props}
  >
    <label
      htmlFor={id}
      style={{
        color: darkMode ? "#e2e8f0" : "#4a5568",
        fontWeight: "500",
        fontSize: isMobile ? "0.9rem" : "1rem",
      }}
    >
      {label} <span style={{ color: "#e53935" }}>*</span>
    </label>
    <div
      className="input-container"
      style={{
        position: "relative",
        marginTop: "0.5rem",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          color: darkMode ? "#718096" : "#a0aec0",
          fontSize: isMobile ? "1rem" : "1.2rem",
        }}
      >
        {icon}
      </div>
      <motion.input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          width: "100%",
          padding: isMobile ? "10px 15px 10px 40px" : "12px 15px 12px 45px",
          borderRadius: "8px",
          border: darkMode 
            ? "1px solid #4a5568" 
            : "1px solid #e2e8f0",
          backgroundColor: darkMode ? "#1a202c" : "white",
          color: darkMode ? "#e2e8f0" : "#1a202c",
          fontSize: isMobile ? "0.9rem" : "1rem",
          transition: "all 0.3s ease",
        }}
        whileFocus={{
          boxShadow: darkMode 
            ? "0 0 0 3px rgba(131, 173, 255, 0.3)" 
            : "0 0 0 3px rgba(74, 144, 226, 0.2)",
          borderColor: darkMode ? "#83adff" : "#4a90e2",
        }}
      />
    </div>
    {errorMessage && (
      <p
        style={{
          color: "#e53935",
          fontSize: "0.85rem",
          marginTop: "0.4rem",
          paddingLeft: "0.2rem",
        }}
      >
        {errorMessage}
      </p>
    )}
  </motion.div>
);

export default InputField;