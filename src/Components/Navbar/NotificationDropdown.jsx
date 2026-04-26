import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import { RiCalendarEventLine, RiTimeLine, RiBookOpenLine, RiFileTextLine, RiMoneyDollarCircleLine, RiUserLine } from 'react-icons/ri';
import { apiRequest } from '../../api';

const NotificationDropdown = ({ isDarkMode, onUnreadCountChange }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationItems, setNotificationItems] = useState([]);
  const [userRole, setUserRole] = useState('');

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  // Load preferences from localStorage based on user role
  const loadPreferences = () => {
    try {
      const storageKey = userRole.includes('admin') ? 'notificationPreferences' : 'employeeNotificationPreferences';
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  // Save preferences to localStorage based on user role
  const savePreferences = (preferences) => {
    try {
      const storageKey = userRole.includes('admin') ? 'notificationPreferences' : 'employeeNotificationPreferences';
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // Get preferences for a notification 
  const getNotificationPrefs = (id) => {
    const preferences = loadPreferences();
    return preferences[id] || { isFavorite: false, archived: false, read: false };
  };

  // Update preferences for a notification
  const updateNotificationPrefs = (id, updates) => {
    const preferences = loadPreferences();
    preferences[id] = { ...preferences[id], ...updates };
    savePreferences(preferences);
  };

  const fetchNotifications = async () => {
    try {
      const endpoint = userRole.includes('admin') ? '/admin/notifications' : '/employee/notifications';
      const response = await apiRequest(endpoint, 'GET');
      if (response.success && response.data) {
        // Filter out notifications that are marked as read in localStorage
        const filteredNotifications = response.data.notifications.filter(notification => {
          const prefs = getNotificationPrefs(notification.id);
          return !prefs.read;
        });
        setNotificationItems(filteredNotifications);
        const newUnreadCount = filteredNotifications.length;
        setUnreadCount(newUnreadCount);
        if (onUnreadCountChange) onUnreadCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchNotifications();
    }
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userRole]);

  const getIcon = (type, isDark) => {
    const base = "p-2.5 rounded-full flex items-center justify-center";
     if (type === 'holiday') return <div className={`${base} ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}><RiCalendarEventLine size={18} /></div>;
     if (type === 'overtime') return <div className={`${base} ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><RiTimeLine size={18} /></div>;
     if (type === 'training') return <div className={`${base} ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}><RiBookOpenLine size={18} /></div>;
     if (type === 'document') return <div className={`${base} ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600'}`}><RiFileTextLine size={18} /></div>;
     if (type === 'expense') return <div className={`${base} ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}><RiMoneyDollarCircleLine size={18} /></div>;
    return <div className={`${base} ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}><RiUserLine size={18} /></div>;
  };

  const handleNotificationClick = async (notification) => {
    try {
      const endpoint = userRole.includes('admin') ? `/admin/notifications/${notification.id}/read` : `/employee/notifications/${notification.id}/read`;
      await apiRequest(endpoint, 'PUT');
      updateNotificationPrefs(notification.id, { read: true });
      setNotificationItems(prev => prev.filter(item => item.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (onUnreadCountChange) onUnreadCountChange(Math.max(0, unreadCount - 1));

      const eventName = userRole.includes('admin') ? 'notificationRead' : 'employeeNotificationRead';
      window.dispatchEvent(new CustomEvent(eventName, { detail: { id: notification.id } }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    const extractActualId = (notifId) => {
      const parts = notifId.split('_');
      return parts.length > 1 ? parts[1] : notifId;
    };

    let redirectPath = '';
    let highlightId = extractActualId(notification.id);

    if (notification.type === 'holiday' || notification.type === 'approved_leave') {
      redirectPath = `/vacation?highlight=${highlightId}`;
    } else if (notification.type === 'overtime' || notification.type === 'approved_overtime') {
      redirectPath = `/overtime?highlight=${highlightId}`;
    } else if (notification.type === 'training' || notification.type === 'new_training' || notification.type === 'approved_training') {
      redirectPath = `/training?highlight=${highlightId}`;
    } else if (notification.type === 'document' || notification.type === 'approved_document') {
      redirectPath = `/documents?highlight=${highlightId}&tab=EmployeeDocuments`;
    } else if (notification.type === 'expense' || notification.type === 'approved_expense') {
      redirectPath = `/note?highlightId=${highlightId}`;
    }

    if (redirectPath) {
      navigate(redirectPath);
      setShowNotifications(false);
    }
  };

  const theme = {
    panel: isDarkMode ? 'bg-slate-900 border-slate-700 shadow-2xl' : 'bg-white border-gray-100 shadow-xl',
    textMain: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSub: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    hover: isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50',
    divider: isDarkMode ? 'border-slate-700/50' : 'border-gray-50',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 relative">
        <FiBell size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
        {unreadCount > 0 && <span className="absolute top-2 right-2 bg-red-500 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900" />}
      </button>

      {showNotifications && (
        <div className={`absolute right-0 mt-3 w-[480px] rounded-2xl border z-50 overflow-hidden ${theme.panel}`}>
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
            <h3 className={`text-base font-bold ${theme.textMain}`}>Notification</h3>
            <button onClick={() => setShowNotifications(false)} className={theme.textSub}><FiX size={20}/></button>
          </div>

          <div className="px-4 py-2 flex items-center justify-between">
            <span className={`text-sm font-bold ${theme.textMain}`}>Result ({notificationItems.length})</span>
            <div className="flex gap-2">
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto scrollbar-none">
            {notificationItems.slice(0, 10).map((item) => (
              <div key={item.id} onClick={() => handleNotificationClick(item)} className={`px-3 py-1.5 flex items-start gap-3 transition-colors border-b ${theme.divider} ${theme.hover} cursor-pointer`}>
                <div className={`p-2.5 rounded-full ${theme.iconBg} flex items-center justify-center`}>
                  {getIcon(item.type, isDarkMode)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0">
                    <p className={`text-xs font-bold truncate ${theme.textMain}`}>
                      <span className="text-indigo-500 mr-1">Admin</span> {item.title}
                    </p>
                    <span className={`text-[10px] whitespace-nowrap ml-2 ${theme.textSub}`}>{item.time}</span>
                  </div>
                  <p className={`text-[10px] leading-relaxed line-clamp-2 ${theme.textSub}`}>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 mt-2">
            <button
              onClick={() => {
                const route = userRole.includes('admin') ? '/notifications/history' : '/notifications/employee';
                navigate(route);
                setShowNotifications(false);
              }}
              className="w-full py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90"
            >
              Voir l'historique
            </button>
          </div>
        </div>
      )}
      <style>{`.scrollbar-none::-webkit-scrollbar { display: none; } .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default NotificationDropdown;