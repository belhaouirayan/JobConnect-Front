import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarToggle from './SidebarToggle';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';


import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermer la sidebar mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileOpen && !event.target.closest('.sidebar') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isMobileOpen, setIsMobileOpen]);

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const menuItems = []; 

  // Animation variants pour mobile
  const mobileVariants = {
    hidden: { 
      x: '-100%',
      transition: { type: 'tween', duration: 0.3 }
    },
    visible: { 
      x: 0,
      transition: { type: 'tween', duration: 0.3 }
    }
  };

  // Animation variants pour desktop
  const desktopVariants = {
    collapsed: { width: 70 },
    expanded: { width: 250 }
  };

  return (
    <>
      {/* Overlay sombre pour mobile */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobile ? isMobileOpen : true) && (
          <motion.div
            className={`sidebar ${isDarkMode ? 'dark' : 'dark'} ${
              isMobile 
                ? 'fixed top-0 left-0 h-full z-50 shadow-2xl' 
                : 'h-full fixed'
            }`}
            style={{
              width: isMobile ? '280px' : (isCollapsed ? '70px' : '250px')
            }}
            variants={isMobile ? mobileVariants : desktopVariants}
            initial={isMobile ? 'hidden' : (isCollapsed ? 'collapsed' : 'expanded')}
            animate={isMobile ? 'visible' : (isCollapsed ? 'collapsed' : 'expanded')}
            exit={isMobile ? 'hidden' : undefined}
            transition={{ 
              type: isMobile ? 'tween' : 'spring', 
              stiffness: isMobile ? undefined : 100,
              duration: isMobile ? 0.3 : undefined
            }}
          >
            <div className="flex flex-col h-full overflow-y-auto scrollbar-hidden">
              {/* CONTENEUR COMPACT POUR MOBILE */}
              {isMobile && (
                <div className="relative border-b border-gray-200 dark:border-gray-700">
                  {/* Bouton de fermeture compact */}
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-0 right-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full transition-colors text-lg z-10"
                  >
                    ×
                  </button>
                  
                  {/* Header intégré directement */}
                  <div className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <img 
                        src="/darklogo.png" 
                        alt="JobConnect Logo" 
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        JobConnect
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* VERSION DESKTOP */}
              {!isMobile && (
                <>
                  <SidebarToggle
                    isCollapsed={isCollapsed}
                    isDarkMode={isDarkMode}
                    toggleSidebar={toggleSidebar}
                  />

                  <SidebarHeader
                    isCollapsed={isCollapsed}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                  />
                </>
              )}

              <SidebarMenu
                menuItems={menuItems}
                isCollapsed={isMobile ? false : isCollapsed}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Sidebar;

