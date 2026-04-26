import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiChevronDown,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../Navbar/LanguageContext';
import { useRecruitment } from '../../stores/RecruitmentStore';

const SidebarMenu = ({ isCollapsed, activeDropdown, toggleDropdown }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const { state } = useRecruitment();
  const userRole = state.userRole;

  // ── Recruitment-only menu for all roles with access ──
  const recruitmentMenu = [
    {
      title: t("dashboard") || "Tableau de bord",
      path: "/recrutement/dashboard",
      roles: ['rh', 'manager'],
    },
    {
      title: t("Gestion des offres") || "Gestion des offres",
      path: "/recrutement/test",
      roles: ['rh', 'manager'],
    },
    {
      title: t("Candidats") || "Candidats",
      path: "/recrutement/candidats",
      roles: ['rh', 'manager'],
    },
    {
      title: t("Entretiens") || "Entretiens",
      path: "/recrutement/entretien",
      roles: ['rh', 'manager'],
    },
    {
      title: t("Décisions") || "Décisions",
      path: "/recrutement/decision-finale",
      roles: ['rh', 'manager'],
    },
    {
      title: t("settings") || "Paramètres",
      path: "/recrutement/settings",
      roles: ['rh', 'manager'],
    },
    {
      title: "Paramètres Plateforme",
      path: "/recrutement/admin-settings",
      roles: ['rh', 'manager'],
    },
    {
      title: "Validation Inscriptions",
      path: "/recrutement/admin/validation",
      roles: ['admin'],
    },
    {
      title: "Modération Offres",
      path: "/recrutement/admin/moderation",
      roles: ['admin'],
    },
  ];

  // Filter by role
  const filteredMenuItems = recruitmentMenu.filter(item => item.roles.includes(userRole));

  const MenuItem = ({ item, isCollapsed, activeDropdown, toggleDropdown, location }) => {
    const hasSubmenu = item.submenu && !isCollapsed;

    const handleClick = (e) => {
      if (hasSubmenu) {
        e.preventDefault();
        toggleDropdown(item.title);
      }
    };

    return (
      <motion.div
        className={`menu-item ${!item.path && !hasSubmenu ? '' : location.pathname === item.path ? 'active' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {item.path && !hasSubmenu ? (
          <Link
            to={item.path}
            className="menu-link"
            title={isCollapsed ? item.title : ''}
          >
            {!isCollapsed && (
              <span className="menu-title" style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '160px',
                display: 'inline-block'
              }}>
                {item.title}
              </span>
            )}
          </Link>
        ) : (
          <div
            className="menu-link cursor-pointer"
            title={isCollapsed ? item.title : ''}
            onClick={handleClick}
          >
            {!isCollapsed && (
              <>
                <span className="menu-title" style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '160px',
                  display: 'inline-block'
                }}>
                  {item.title}
                </span>
                {hasSubmenu && (
                  <span
                    className="text-white w-4 h-4 flex items-center justify-center ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleDropdown(item.title);
                    }}
                    style={{
                      transform: activeDropdown === item.title ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <FiChevronDown size={16} />
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  const SubMenu = ({ submenu, isActive, location }) => {
    return (
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="submenu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {submenu.map((subItem, subIndex) => (
              <motion.div
                key={subIndex}
                className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                whileHover={{ x: 5 }}
              >
                <Link to={subItem.path}>{subItem.title}</Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="sidebar-menu">
      {filteredMenuItems.map((item, index) => (
        <div className="menu-item-container" key={index}>
          <MenuItem
            item={item}
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
            location={location}
          />

          {!isCollapsed && item.submenu && (
            <SubMenu
              submenu={item.submenu}
              isActive={activeDropdown === item.title}
              location={location}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SidebarMenu;