import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useLanguage } from "../Navbar/LanguageContext";

const Layout = ({ children }) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
      localStorage.setItem('darkMode', JSON.stringify(mediaQuery.matches));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);


  return (
    <div className={`relative min-h-screen w-full ${isDarkMode ? "dark" : "light"}`}>
      <div className={`relative w-full bg-[#edf0f5] dark:bg-gray-900`}>

        {/* Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main content area with navbar and children */}
        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${
            !isMobile 
              ? (isCollapsed ? "ml-[70px]" : "ml-[250px]")
              : "ml-0"
          }`}
        >
          {/* Navbar en haut */}
          <Navbar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            isMobile={isMobile}
            toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          />
        
          {/* Content area */}
          <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-0'}`}>
            {children}
            
            {/* Footer */}
            <footer className="w-full py-4 mt-auto">
              <div className="container mx-auto px-4">
                <p className={`text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  &copy; {new Date().getFullYear()} JobConnect — {t("rights_reserved")}
                </p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;