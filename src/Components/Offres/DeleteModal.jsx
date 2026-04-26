import React, { useState } from 'react';
import { FiX, FiTrash2, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../Navbar/LanguageContext';

const DeleteModal = ({ isOpen, onClose, onConfirm, offres }) => {
  const {t}=useLanguage();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    if (!offres?.id) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(offres.id);
      setShowSuccess(true);
      // Fermer le modal après 1.5 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setLoading(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to delete');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 dark:bg-black/40"
            onClick={loading || showSuccess ? null : onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md rounded-lg !bg-white dark:!bg-[#1a202c] shadow-xl"
          >
            {/* Close button - hidden during loading/success */}
            {!loading && !showSuccess && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            )}
            
            {/* Modal content */}
            <div className="p-6">
              {showSuccess ? (
                // Success state
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
  {t('deleted_success')}
</h3>
<p className="text-sm text-gray-600 dark:text-gray-300">
  {t('item_removed')}
</p>

                </div>
              ) : (
                // Confirmation state
                <>
                  <div className="mb-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
  {t('confirm_deletion')}
</h3>
                  </div>
                  
                  <div className="mt-4 space-y-3 text-center">
                   <p className="text-sm text-gray-600 dark:text-gray-300">
  {t('about_to_delete')}
</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                  {offres.titre} 
                    </p>
                   <p className="text-sm text-red-500 dark:text-red-400">
  {t('cannot_undo')}
</p>
                  </div>
                  
                 
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
            
          
            {!showSuccess && (
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-bl-lg transition-colors"
                  disabled={loading}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-br-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('deleting')}...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                     {t('delete_permanently')}

                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;