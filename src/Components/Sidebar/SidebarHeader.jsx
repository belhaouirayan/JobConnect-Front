import { motion } from 'framer-motion';

const SidebarHeader = ({ isCollapsed, isDarkMode, setIsDarkMode }) => {
  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      {!isCollapsed && (
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">JC</span>
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              JobConnect
            </span>
          </motion.div>
          
         
        </motion.div>
      )}
    </div>
  );
};

export default SidebarHeader;