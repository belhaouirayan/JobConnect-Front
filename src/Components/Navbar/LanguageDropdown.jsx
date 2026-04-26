import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useLanguage } from './LanguageContext';

const LanguageDropdown = ({ isDarkMode }) => {
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    //{ code: 'EN', name: 'English', flag: '/english.jpg' },
    //{ code: 'ES', name:'Español',flag:'/spain.png '},
    { code: 'FR', name: 'Français', flag: '/france.jpg' },
    //{ code: 'CN', name: 'chinois ', flag: '/china.png' },
  ];

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colors = isDarkMode
    ? {
        // Mode sombre
        button: 'text-gray-200 hover:text-white',
        dropdown: 'bg-gray-800/90 backdrop-blur-md border-gray-600',
        item: 'text-gray-200 hover:bg-gray-700/50',
        itemActive: 'bg-blue-900/30 text-blue-300 border-l-blue-400',
        subtitle: 'text-gray-400',
        shadow: 'shadow-lg shadow-black/25'
      }
    : {
        // Mode clair
        button: 'text-gray-700 hover:text-gray-900',
        dropdown: 'bg-white/90 backdrop-blur-md border-gray-200',
        item: 'text-gray-700 hover:bg-gray-50/80',
        itemActive: 'bg-blue-50/80 text-blue-600 border-l-blue-500',
        subtitle: 'text-gray-500',
        shadow: 'shadow-lg shadow-gray-200/50'
      };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton principal - Transparent */}
      <button
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
        className={`
          flex items-center gap-3 px-2 py-2 transition-all duration-200
          ${colors.button}
          ${isRTL ? 'flex-row-reverse' : ''}
          bg-transparent border-0 hover:bg-transparent
          min-w-[120px] justify-between
          focus:outline-none focus:ring-0
        `}
        aria-expanded={showLanguageMenu}
        aria-haspopup="listbox"
      >
        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="relative">
            <img
              src={currentLang?.flag}
              alt={currentLang?.name}
              className="w-5 h-4 object-cover rounded-sm ring-1 ring-black/10"
            />
          </div>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-sm font-medium leading-none">
              {currentLang?.name}
            </div>
            <div className={`text-xs ${colors.subtitle} leading-none mt-0.5`}>
              {currentLanguage}
            </div>
          </div>
        </div>
        
        {/* <FiChevronDown
          size={16}
          className={`
            transition-transform duration-200 ${colors.subtitle}
            ${showLanguageMenu ? 'rotate-180' : 'rotate-0'}
          `}
        /> */}
      </button>

      {/* Menu dropdown */}
         {/*  {showLanguageMenu && (
        <>
          <div 
            className="fixed inset-0 z-10 md:hidden" 
            onClick={() => setShowLanguageMenu(false)}
          />
          
          { <div className={`
            absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-48 z-20
            ${colors.dropdown} border rounded-xl ${colors.shadow}
            overflow-hidden
            animate-in fade-in-0 zoom-in-95 duration-200
          `}>
            <div className="py-2">
            
              <div className="py-1">
                {languages.map((lang, index) => {
                  const isActive = currentLanguage === lang.code;
                  
                  return (
                    <button
                      key={lang.code}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 transition-all duration-150
                        ${colors.item} ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}
                        ${isActive ? `${colors.itemActive} border-l-2` : 'border-l-2 border-transparent'}
                        hover:scale-[1.02] active:scale-[0.98]
                        focus:outline-none focus:bg-opacity-50
                      `}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={lang.flag}
                          alt={lang.name}
                          className="w-6 h-4 object-cover rounded-sm ring-1 ring-black/10"
                        />
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <FiCheck size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium leading-tight ${isActive ? 'font-semibold' : ''}`}>
                          {lang.name}
                        </div>
                        <div className={`text-xs ${colors.subtitle} leading-tight mt-0.5`}>
                          {lang.code}
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="flex-shrink-0">
                          <FiCheck 
                            size={16} 
                            className={isDarkMode ? 'text-blue-400' : 'text-blue-500'} 
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div> }
        </>
      )}*/}
    </div>
  );
};

export default LanguageDropdown;