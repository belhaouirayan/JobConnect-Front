import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageDropdown from './LanguageDropdown';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ isDarkMode, toggleDarkMode, isMobile, toggleMobileSidebar }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notifications, setNotifications] = useState(0);

  const colors = isDarkMode 
    ? {
        bg: 'bg-[#1a202c]',
        text: 'text-gray-200'
      }
    : {
        bg: 'bg-white',
        text: 'text-gray-700'
      };

  return (
    <nav className={`
      ${colors.bg} shadow px-6 py-2 flex justify-between items-center transition-colors duration-300
      ${isMobile ? 'pl-20' : 'pl-6'}
       top-0
    `}>
      {/* Section gauche - Bouton menu mobile + Logo/Titre */}
      <div className="flex items-center space-x-4">
        {/* Bouton hamburger pour mobile - optionnel si vous préférez celui du Layout */}
        {isMobile && (
  <button
    onClick={toggleMobileSidebar}
    className={`
      p-2 rounded-lg transition-colors 
      hover:bg-gray-100 dark:hover:bg-gray-700
      -ml-20  
      ${colors.text}
    `}
    aria-label="Toggle menu"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
)}

        
        {/* Logo/Titre - vous pouvez ajouter votre logo ici */}
        <div className={`text-xl font-bold ${colors.text}`}>
          {/* Votre logo ou titre ici */}
        </div>
      </div>

      {/* Section droite - Actions */}
      <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
        {/* ThemeToggle */}
        <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        {/* Notifications - masqué sur très petit écran */}
        <div className="hidden sm:block">
          <NotificationDropdown isDarkMode={isDarkMode} onUnreadCountChange={setNotifications} />
        </div>

        {/* Language Dropdown - adapté pour mobile */}
        <div className="hidden md:block">
          <LanguageDropdown 
            isDarkMode={isDarkMode} 
            selectedLanguage={selectedLanguage} 
            onLanguageChange={setSelectedLanguage} 
          />
        </div>

        {/* Version mobile du language dropdown - plus compact */}
        <div className="md:hidden">
          <LanguageDropdown 
            isDarkMode={isDarkMode} 
            selectedLanguage={selectedLanguage} 
            onLanguageChange={setSelectedLanguage}
            compact={true} // Prop pour version compacte si supportée
          />
        </div>

        {/* User Menu */}
        <UserMenu isDarkMode={isDarkMode} />
        
        {/* Menu mobile pour notifications si masquées */}
        {isMobile && (
          <div className="sm:hidden">
            <button
              className={`
                relative p-2 rounded-lg transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${colors.text}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a5.5 5.5 0 010-7.8L19 2H9l3.5 3.5a5.5 5.5 0 010 7.8L9 17h5z" />
              </svg>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;