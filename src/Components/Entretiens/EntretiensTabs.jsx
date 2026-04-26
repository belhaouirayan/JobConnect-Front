import React from "react";
import { useLanguage } from "../Navbar/LanguageContext"; // They have translations
import { FiList, FiCalendar } from "react-icons/fi"; // Add icons

const EntretiensTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg w-fit h-[40px] items-center">
      <button
        onClick={() => setActiveTab("table")}
        className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          activeTab === "table"
            ? "bg-white dark:bg-[#1a202c] text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <FiList size={14} />
        <span>Tableau</span>
      </button>
      <button
        onClick={() => setActiveTab("calendar")}
        className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          activeTab === "calendar"
            ? "bg-white dark:bg-[#1a202c] text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <FiCalendar size={14} />
        <span>Calendrier</span>
      </button>
    </div>
  );
};

export default EntretiensTabs;
