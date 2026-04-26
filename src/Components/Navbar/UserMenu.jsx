import React, { useState, useRef, useEffect } from 'react';
import { apiRequest, BASE_URL } from '../../api';
import {
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiHelpCircle
} from 'react-icons/fi';

const UserMenu = ({ isDarkMode }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', photo: '' });
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  
  const getImageUrl = (photoPath) => {
    if (!photoPath) {
      return '/default-avatar.png';
    }
    
    const url = `${BASE_URL.replace('/api', '')}/storage/${photoPath}`;
    return url;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowLogoutTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await apiRequest('/me', 'GET');

        if (data) {
          setUser({
            name: data.name || 'User',
            email: data.email || 'user@example.com',
            photo: data.photo || data.photo_path || ''
          });
        } else {
          // Fallback to localStorage if API fails
          loadUserFromLocalStorage();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Ne pas charger depuis localStorage en cas d'erreur
        // (l'intercepteur de api.js s'occupera de la redirection vers le login)
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fonction de secours pour charger depuis localStorage
  const loadUserFromLocalStorage = () => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const photoPath = parsedUser.photo || parsedUser.photo_path || parsedUser.image || parsedUser.avatar || '';
        
        setUser({
          name: parsedUser.name || parsedUser.full_name || 'User',
          email: parsedUser.email || 'user@example.com',
          photo: photoPath
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser({ 
          name: 'User', 
          email: 'user@example.com',
          photo: '' 
        });
      }
    }
  };

  const theme = {
    light: {
      text: 'text-gray-700',
      border: 'border-gray-200',
      bg: 'bg-white',
      icon: 'text-gray-600',
      textSecondary: 'text-gray-500',
      hover: 'hover:bg-gray-50',
      tooltipBg: 'bg-gray-900',
      tooltipText: 'text-white'
    },
    dark: {
      text: 'text-gray-200',
      border: 'border-gray-700',
      bg: 'bg-[#1a202c]',
      icon: 'text-gray-300',
      textSecondary: 'text-gray-400',
      hover: 'hover:!bg-gray-800',
      tooltipBg: 'bg-gray-100',
      tooltipText: 'text-gray-900'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    window.location.href = '/';
    
    setShowUserMenu(false);
    setShowConfirmation(false);
  };

  const openConfirmation = () => {
    setShowConfirmation(true);
    setShowLogoutTooltip(false);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const menuItems = [
    { 
      icon: <FiUser />, 
      label: 'Profile', 
      onClick: () => {
        window.location.href = '/profile';
      }
    },
    { 
      icon: <FiLogOut />, 
      label: 'Logout', 
      isRed: true, 
      onClick: openConfirmation,
      showTooltip: true
    }
  ];

  if (loading) {
    return (
      <div className="relative">
        <div className={`flex items-center gap-2 ${colors.text} p-2 rounded-md`}>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse hidden md:block"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={`flex items-center gap-2 ${colors.text} focus:outline-none p-2 rounded-md hover:text-gray-900 dark:hover:!text-gray-300 transition-colors`}
        aria-expanded={showUserMenu}
        aria-label="Menu utilisateur"
      >
        <div className="relative">
          <div className="absolute -top-0 -right-0 w-2 h-2 bg-green-500 rounded-full dark:!border-gray-800 shadow-sm"></div>
          
          {user.photo ? (
            <img
              src={getImageUrl(user.photo)}
              alt="User Avatar"
              className="w-9 h-9 rounded-full border-2 border-gray-50 dark:!border-2 dark:!border-gray-800 object-cover"
              onError={(e) => {
                console.log('Image error, falling back to generated avatar');
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`;
              }}
              onLoad={() => console.log(' User image loaded successfully')}
            />
          ) : (
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`}
              alt="User Avatar"
              className="w-9 h-9 rounded-full border-2 border-gray-50 dark:!border-2 dark:!border-gray-800"
            />
          )}
        </div>

        <span className={`text-sm font-medium hidden md:block`}>{user.name}</span>

        <FiChevronDown 
          size={16} 
          className={`transition-transform ${showUserMenu ? 'rotate-180' : ''} ${colors.icon}`} 
        />
      </button>

      {showUserMenu && (
        <div 
          className={`absolute right-0 mt-2 w-56 ${colors.bg} border dark:!border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden`}
          tabIndex={0}
        >
          <div className={`p-3 border-b ${colors.border} flex items-center gap-3`}>
            {user.photo ? (
              <img
                src={getImageUrl(user.photo)}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  console.log('Image error in menu, falling back to generated avatar');
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`;
                }}
                onLoad={() => console.log(' Menu image loaded successfully')}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className={`font-medium ${colors.text}`}>{user.name}</div>
              <div className={`text-xs ${colors.textSecondary}`}>
                {user.email.length > 20 ? user.email.slice(0, 20) + "..." : user.email}
              </div>
            </div>
          </div>

          <ul className="py-1">
            {menuItems.map((item, index) => (
              <li key={index} className="relative">
                <button
                  onClick={item.onClick}
                  onMouseEnter={() => item.showTooltip && setShowLogoutTooltip(true)}
                  onMouseLeave={() => item.showTooltip && setShowLogoutTooltip(false)}
                  className={`w-full text-left px-2 py-2 flex items-center gap-3 ${colors.hover} transition-colors ${
                    item.isRed ? 'text-red-500 hover:bg-red-50 dark:hover:!bg-red-900/20' : colors.text
                  }`}
                >
                  <span className={item.isRed ? 'text-red-500' : colors.icon}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>

                {item.showTooltip && showLogoutTooltip && (
                  <div className={`absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50`}>
                    <div className={`${colors.tooltipBg} ${colors.tooltipText} text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap flex items-center gap-1`}>
                      <FiHelpCircle size={12} />
                      Click to logout
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:!bg-[#1a202c] rounded-lg shadow-xl p-6 max-w-sm mx-4`}>
            <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
              Confirm Logout
            </h3>
            <p className={`${colors.textSecondary} mb-6`}>
              Are you sure you want to logout? You'll need to login again to access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeConfirmation}
                className={`px-4 py-2 rounded border ${colors.border} ${colors.text} ${colors.hover} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;