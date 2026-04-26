import React, { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import { useLanguage } from '../Navbar/LanguageContext';


const SignatureButton = ({ onSaveSignature }) => {
  const {t} =useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSignature, setTempSignature] = useState(null);

  useEffect(() => {
    const savedSignature = localStorage.getItem('savedSignature');
    if (savedSignature) {
      setTempSignature(savedSignature);
      onSaveSignature(savedSignature);
    }
  }, [onSaveSignature]);

  const handleImportSignature = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('savedSignature', tempSignature);
    onSaveSignature(tempSignature);
    setIsModalOpen(false);
  };

  const handleClearSignature = () => {
    localStorage.removeItem('savedSignature');
    setTempSignature(null);
    onSaveSignature(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="w-full sm:w-auto h-[40px] min-w-0 flex-shrink-0 !bg-white dark:!bg-[#1a202c] dark:!text-white px-3 py-2 text-gray-700 rounded hover:bg-gray-50 dark:hover:!bg-gray-800 border border-gray-300 dark:!border-gray-400 flex items-center justify-center sm:justify-start gap-2 transition-colors text-sm font-semibold shadow-sm"
        onClick={() => setIsModalOpen(true)}
      >
        <FiEdit className="text-gray-700 dark:text-white flex-shrink-0"/>
        <span className="truncate">{t('e_signature')}</span>
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="!bg-white dark:!bg-[#1a202c] p-4 sm:p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl dark:text-gray-200 font-semibold mb-4">
             {tempSignature ? t('edit_your_signature') : t('import_your_signature')}
            </h2>
            
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium !text-gray-700 dark:!text-gray-300 mb-2">
                 {t('upload_signature_image')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImportSignature}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-md file:border-0
                  file:text-xs sm:file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            {tempSignature && (
              <div className="mt-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('preview')}:</h3>
                <div className="flex justify-center">
                  <img src={tempSignature} alt="Signature" className="max-h-24 sm:max-h-32 max-w-full border border-gray-200" />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
              {tempSignature && (
                <button
                  onClick={handleClearSignature}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm !text-gray-700 dark:!text-gray-200 !bg-white dark:!bg-[#1a202c] rounded border border-gray-300 hover:bg-gray-50"
                >
                 {t('delete')}
                </button>
              )}
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm !text-gray-700 dark:!text-gray-200 !bg-white dark:!bg-[#1a202c] rounded border border-gray-300 dark:!border-gray-400 hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  disabled={!tempSignature}
                >
                 {tempSignature ? t('update') : t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignatureButton;