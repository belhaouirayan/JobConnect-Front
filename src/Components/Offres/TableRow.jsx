import React from "react";
import { FiCalendar, FiClock, FiFile, FiMapPin, FiUser, FiBriefcase, FiGlobe, FiSearch, FiTarget, FiAward } from "react-icons/fi";
import { FaMoneyBills } from "react-icons/fa6";
import { FaLinkedin, FaXing, FaBuilding, FaUserTie, FaSearchLocation, FaLandmark, FaUserCircle } from "react-icons/fa"; 
import { SiIndeed, SiGlassdoor, SiMonster } from "react-icons/si"; 
import ActionButtons from "./ActionButtons";

const TableRow = ({ offres, onView, onEdit, onDelete }) => {
  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || "";

    switch (statusLower) {
      case "approuvé":
      case "validé":
      case "approved":
      case "accepté":
      case "publié": 
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "en attente":
      case "pending":
      case "attente":
      case "brouillon": 
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejeté":
      case "rejected":
      case "refusé":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const renderPlatformIcon = (platformName, iconSize = 18) => {
    const name = platformName.toLowerCase().trim();

    if (name.includes("linkedin")) return <FaLinkedin size={iconSize} className="text-[#0077B5]" title="LinkedIn" />;
    if (name.includes("indeed")) return <SiIndeed size={iconSize} className="text-[#2164f3]" title="Indeed" />;
    if (name.includes("glassdoor")) return <SiGlassdoor size={iconSize} className="text-[#0CAA41]" title="Glassdoor" />;
    if (name.includes("monster")) return <SiMonster size={iconSize} className="text-[#6b429c]" title="Monster" />;
    if (name.includes("adzuna")) return <FaSearchLocation size={iconSize} className="text-[#27C56A]" title="Adzuna" />;
    if (name.includes("jooble")) return <FiSearch size={iconSize} className="text-[#0052cc]" title="Jooble" />;
    if (name.includes("whatjobs")) return <FiGlobe size={iconSize} className="text-[#002B49]" title="WhatJobs" />;
    if (name.includes("xing")) return <FaXing size={iconSize} className="text-[#026466]" title="XING" />;
    
    if (name.includes("france travail")) return <FaBuilding size={iconSize} className="text-[#000091]" title={platformName} />;
    if (name.includes("apec")) return <FaUserTie size={iconSize} className="text-[#00B2A9]" title={platformName} />;
    if (name.includes("cadremploi")) return <FiAward size={iconSize} className="text-[#002958]" title={platformName} />;
    
    if (name.includes("rekrute")) return <FaUserCircle size={iconSize} className="text-[#f37021]" title={platformName} />;
    if (name.includes("amaljob")) return <FiBriefcase size={iconSize} className="text-[#8CC63F]" title={platformName} />;
    if (name.includes("emploi.ma")) return <FiTarget size={iconSize} className="text-[#E2001A]" title={platformName} />;
    
    if (name.includes("stepstone")) return <FiTarget size={iconSize} className="text-[#92c200]" title={platformName} />;
    if (name.includes("jobbörse") || name.includes("jobborse")) return <FaLandmark size={iconSize} className="text-[#E30613]" title={platformName} />;

    return <FiGlobe size={iconSize} className="text-gray-500" title={platformName} />;
  };

  const renderPlateformes = (plateformesData) => {
    if (!plateformesData) return <span className="text-gray-400 text-xs italic">N/A</span>;

    let parsedPlatforms = [];
    if (Array.isArray(plateformesData)) {
      parsedPlatforms = plateformesData;
    } else if (typeof plateformesData === 'string') {
      try {
        let cleanString = plateformesData;
        if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
             cleanString = cleanString.slice(1, -1);
        }
        parsedPlatforms = JSON.parse(cleanString);
      } catch (error) {
        return <span className="text-xs">{plateformesData}</span>; 
      }
    }

    if (!Array.isArray(parsedPlatforms) || parsedPlatforms.length === 0) {
      return <span className="text-gray-400 text-xs italic">N/A</span>;
    }

    return (
      <div className="flex items-center space-x-2">
        {parsedPlatforms.map((platform, index) => (
          <div key={index} className="hover:scale-110 transition-transform cursor-help">
            {renderPlatformIcon(platform)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800 light:bg-white dark:bg-[#1a202c] transition-colors">
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <FiFile className="mr-1.5 text-blue-500 dark:text-blue-400" size={14} />
            {offres.titre || "N/A"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
            <FiUser size={12} className="opacity-70" />
            <span className="opacity-90">
              {offres.manager ? offres.manager.nom : <span className="italic">Non assigné</span>}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
          <FiMapPin className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
          {offres.lieu || "N/A"}
        </div>
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
          <FiFile className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
          {offres.contrat?.type || "N/A"}
        </div>
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
          <FaMoneyBills className="text-blue-500 dark:text-blue-400" size={14} />
          {offres.salaire ? `${offres.salaire} ${offres.currency ? offres.currency.currency : ''}` : "N/A"}
        </div>
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(offres.statut)}`}>
          <span className="truncate max-w-[60px] lg:max-w-none">
            {offres.statut || "N/A"}
          </span>
        </span>
      </td>
      
      <td className="px-6 py-2 whitespace-nowrap">
        {renderPlateformes(offres.plateformes)}
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
          <FiCalendar className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
          {/* CORRECTION ICI : Retire la portion d'heure de la date limite */}
          {offres.date_limite ? offres.date_limite.split('T')[0] : "N/A"}
        </div>
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
          <FiClock className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
          {offres.created_at ? offres.created_at.split('T')[0] : "N/A"}
        </div>
      </td>

      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
        <ActionButtons offres={offres} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
};

export default TableRow;