import { motion } from 'framer-motion';

const SidebarToggle = ({ isCollapsed, isDarkMode, toggleSidebar }) => {
  return (
    <motion.button
      className="sidebar-toggle-internal"
      onClick={toggleSidebar}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute',
        right: isCollapsed ? '35%' : '10px', // Centré quand réduit, à droite quand ouvert
        top: isCollapsed ? '10px' : '20px', // Ajustement de la position
        background: 'transparent',
        color:  '#fff' ,
        border: 'none',
        borderRadius: '50%',
        fontWeight: 'bold',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        transform: isCollapsed ? 'translateX(50%)' : 'none' // Compensation pour le centrage
      }}
    >
      {isCollapsed ? (
        <span style={{ fontSize: '1.2rem', color: '#fff' }}>=</span>  
      ) : (
        <span style={{ fontSize: '1.2rem', color: '#fff' }}>×</span>      
      )}
    </motion.button>
  );
};

export default SidebarToggle;