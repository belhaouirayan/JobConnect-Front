import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Components/Navbar/LanguageContext";

const TAB_ROUTES = {
  candidatures: "/recrutement/candidats",
  decision: "/recrutement/decision-finale",
  entretien: "/recrutement/entretien",
};

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (TAB_ROUTES[tabName]) {
      navigate(TAB_ROUTES[tabName]);
    }
  };

  const tabStyle = (tabName) =>
    `relative px-6 py-2 !border dark:!border-0 transition-all duration-300 ease-in-out font-semibold text-sm sm:text-base ${
      activeTab === tabName
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-600 shadow-md hover:bg-gray-200 !bg-white dark:!bg-[#1a202c] dark:text-gray-200"
    }`;

  return (
    <div className="relative flex flex-col items-start sm:items-start w-full">
      <div className="flex bg-gray-100 shadow-inner my-3">
        <button onClick={() => handleTabClick("candidatures")} className={tabStyle("candidatures")}>
          {t("Candidatures")}
        </button>
        <button onClick={() => handleTabClick("entretien")} className={tabStyle("entretien")}>
          {t("Entretien")}
        </button>
        <button onClick={() => handleTabClick("decision")} className={tabStyle("decision")}>
          {t("Décision")}
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;