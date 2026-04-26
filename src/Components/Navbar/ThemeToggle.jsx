import React, { useState } from 'react';

const ThemeToggle = ({ isDarkMode, toggleDarkMode }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleThemeToggle = () => {
    setIsRotating(true);
    toggleDarkMode();
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <button onClick={handleThemeToggle} className="transition-colors">
      <img
        src={isDarkMode ? "/darkmode.png" : "/lightmode.png"}
        alt="Theme toggle"
        className={`w-7 h-7 transition-transform duration-500 ${isRotating ? 'rotate-360 fadeIn' : ''}`}
      />
    </button>
  );
};

export default ThemeToggle;