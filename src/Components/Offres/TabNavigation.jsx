import React from "react";
import { useLanguage } from "../Navbar/LanguageContext";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const {t}=useLanguage();
  const tabStyle = (tabName) =>
    `relative px-6 py-2  !border dark:!border-0 transition-all duration-300 ease-in-out font-semibold text-sm sm:text-base ${
      activeTab === tabName
        ? "bg-blue-600 text-white shadow-md "
        : " text-gray-600 shadow-md hover:bg-gray-200 !bg-white dark:!bg-[#1a202c] dark:text-gray-200"
    }`;

  return (
    <div className="relative flex flex-col items-start sm:items-start w-full">
      <div className="flex bg-gray-100  shadow-inner my-3">
        <button onClick={() => setActiveTab("offres")} className={tabStyle("offres")}>
          {t("Offres")}
        </button>
       

       
      </div>

    
     
    </div>
  );
};

export default TabNavigation;
