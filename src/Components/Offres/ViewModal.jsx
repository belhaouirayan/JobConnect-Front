import React from 'react';
import { FiX, FiMapPin, FiFileText, FiCalendar, FiClock, FiAlignLeft, FiCheckCircle, FiInfo, FiUser, FiBriefcase, FiGlobe } from 'react-icons/fi';
import { FaMoneyBills } from 'react-icons/fa6';
import { FaLinkedin, FaXing, FaBuilding, FaUserTie, FaUserCircle, FaLandmark, FaSearchLocation } from 'react-icons/fa';
import { SiIndeed, SiGlassdoor, SiMonster } from 'react-icons/si';
import { FiSearch, FiTarget, FiAward } from 'react-icons/fi';

const ViewOffreModal = ({ offre, onClose }) => {
  if (!offre) return null;

  const renderPlatformIcon = (platformName) => {
    const name = platformName.toLowerCase().trim();
    if (name.includes("linkedin")) return <FaLinkedin className="text-[#0077B5] mr-2" size={18} />;
    if (name.includes("indeed")) return <SiIndeed className="text-[#2164f3] mr-2" size={18} />;
    if (name.includes("glassdoor")) return <SiGlassdoor className="text-[#0CAA41] mr-2" size={18} />;
    if (name.includes("monster")) return <SiMonster className="text-[#6b429c] mr-2" size={18} />;
    if (name.includes("xing")) return <FaXing className="text-[#026466] mr-2" size={18} />;
    if (name.includes("france travail")) return <FaBuilding className="text-[#000091] mr-2" size={18} />;
    if (name.includes("apec")) return <FaUserTie className="text-[#00B2A9] mr-2" size={18} />;
    if (name.includes("cadremploi")) return <FiAward className="text-[#002958] mr-2" size={18} />;
    if (name.includes("rekrute")) return <FaUserCircle className="text-[#f37021] mr-2" size={18} />;
    if (name.includes("amaljob")) return <FiBriefcase className="text-[#8CC63F] mr-2" size={18} />;
    if (name.includes("emploi.ma")) return <FiTarget className="text-[#E2001A] mr-2" size={18} />;
    if (name.includes("stepstone")) return <FiTarget className="text-[#92c200] mr-2" size={18} />;
    if (name.includes("adzuna")) return <FaSearchLocation className="text-[#27C56A] mr-2" size={18} />;
    if (name.includes("jooble")) return <FiSearch className="text-[#0052cc] mr-2" size={18} />;
    if (name.includes("whatjobs")) return <FiGlobe className="text-[#002B49] mr-2" size={18} />;
    if (name.includes("jobbörse") || name.includes("jobborse")) return <FaLandmark className="text-[#E30613] mr-2" size={18} />;
    return <FiGlobe className="text-gray-500 mr-2" size={18} />;
  };

  let parsedPlatforms = [];
  try {
    if (typeof offre.plateformes === 'string') {
      let cleanString = offre.plateformes;
      if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
        cleanString = cleanString.slice(1, -1);
      }
      parsedPlatforms = JSON.parse(cleanString);
    } else {
      parsedPlatforms = offre.plateformes || [];
    }
  } catch (e) {
    parsedPlatforms = [];
  }

  // Format salary with currency
  const formatSalaire = () => {
    if (!offre.salaire) return 'À définir';
    const currencyLabel = offre.currency?.currency || '';
    return `${offre.salaire} ${currencyLabel}`.trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#1e222d] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1e222d] px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiFileText className="text-blue-500" />
            {offre.titre}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Lieu */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#262a35] rounded-lg">
              <FiMapPin className="text-blue-500 mt-1" size={18} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Lieu</p>
                <p className="text-sm font-medium dark:text-gray-200">{offre.lieu || 'Non spécifié'}</p>
              </div>
            </div>

            {/* Type de contrat */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#262a35] rounded-lg">
              <FiFileText className="text-blue-500 mt-1" size={18} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Type de contrat</p>
                <p className="text-sm font-medium dark:text-gray-200">{offre.contrat?.type || offre.type_contrat || 'Non spécifié'}</p>
              </div>
            </div>

            {/* Salaire + Devise */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#262a35] rounded-lg">
              <FaMoneyBills className="text-green-500 mt-1" size={18} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Salaire</p>
                <p className="text-sm font-medium dark:text-gray-200">{formatSalaire()}</p>
              </div>
            </div>

            {/* Manager */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#262a35] rounded-lg">
              <FiUser className="text-indigo-500 mt-1" size={18} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Manager</p>
                <p className="text-sm font-medium dark:text-gray-200">{offre.manager?.nom || 'Non assigné'}</p>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#262a35] rounded-lg">
              <FiInfo className="text-purple-500 mt-1" size={18} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Statut</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full dark:bg-blue-900 dark:text-blue-300">
                  {offre.statut || 'Brouillon'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                <FiAlignLeft className="text-blue-500" /> Description de l'offre
              </h3>
              <div className="bg-gray-50 dark:bg-[#262a35] p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {offre.description || "Aucune description fournie."}
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                <FiCheckCircle className="text-blue-500" /> Compétences requises
              </h3>
              <div className="bg-gray-50 dark:bg-[#262a35] p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                {offre.competences || "Non spécifiées"}
              </div>
            </div>

            {/* NOUVEAU : Documents obligatoires */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                <FiFileText className="text-blue-500" /> Documents exigés
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">CV (Toujours)</span>
                {offre.require_permit && <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">Permis</span>}
                {offre.require_diplome && <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">Diplôme</span>}
                {offre.require_habilitation && <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">Justif. habitation</span>}
                {offre.require_lettre && <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">Lettre motiv.</span>}
                {offre.require_autres && <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">Autres docs</span>}
              </div>
            </div>

            {/* Plateformes */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                <FiGlobe className="text-blue-500" /> Plateformes de diffusion
              </h3>
              <div className="flex flex-wrap gap-3">
                {parsedPlatforms.length > 0 ? parsedPlatforms.map((plat, idx) => (
                  <span key={idx} className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    {renderPlatformIcon(plat)} {plat}
                  </span>
                )) : <span className="text-sm text-gray-500 italic">Aucune plateforme sélectionnée</span>}
              </div>
            </div>

            {/* Dates */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiClock /> Créée le : {offre.created_at ? offre.created_at.split('T')[0] : 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-500">
                <FiCalendar /> Date limite : {offre.date_limite ? offre.date_limite.split('T')[0] : 'Non définie'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOffreModal;