import { motion } from 'framer-motion';

const SidebarFooter = ({ isDarkMode }) => {
  return (
    <motion.div 
      className="sidebar-footer"
      whileHover={{ backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7' }}
    >
      <div className="user-profile">
        <div className="user-avatar">JD</div>
        <div className="user-info">
          <div className="user-name">John Doe</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarFooter;