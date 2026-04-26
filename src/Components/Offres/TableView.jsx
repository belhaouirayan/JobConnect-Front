import React, { useState, useEffect } from "react";
import TableRow from "./TableRow";
import Pagination from "./Pagination"; // N'oublie pas d'importer ton composant Pagination
import { useLanguage } from "../Navbar/LanguageContext";

const TableView = ({
  offres,
  onView,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const { t } = useLanguage();

  // --- LOGIQUE DES FILTRES ---
  const [filterStatut, setFilterStatut] = useState("");
  const [filterManager, setFilterManager] = useState("");
  const [filterContrat, setFilterContrat] = useState("");

  // Réinitialiser la page à 1 quand on change un filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatut, filterManager, filterContrat]);

  // Extraction des options uniques pour les menus déroulants
  const uniqueStatuts = [...new Set(offres?.map(o => o.statut).filter(Boolean))];
  const uniqueManagers = [...new Set(offres?.map(o => o.manager?.nom).filter(Boolean))];
  const uniqueContrats = [...new Set(offres?.map(o => o.contrat?.type || o.type_contrat).filter(Boolean))];

  // Application des filtres sur la liste complète
  const filteredOffres = offres?.filter(offre => {
    const matchStatut = filterStatut ? offre.statut === filterStatut : true;
    const matchManager = filterManager ? offre.manager?.nom === filterManager : true;
    const matchContrat = filterContrat ? (offre.contrat?.type === filterContrat || offre.type_contrat === filterContrat) : true;
    
    return matchStatut && matchManager && matchContrat;
  }) || [];

  // --- LOGIQUE DE PAGINATION (Sur la liste filtrée !) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const totalItems = filteredOffres.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentOffres = filteredOffres.slice(indexOfFirstItem, indexOfLastItem);
  // ------------------------------

  return (
    <div className="bg-white dark:!bg-[#1a202c] shadow-md rounded-md my-2 overflow-hidden">
      
      {/* BARRE DE FILTRES */}
      <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filtrer par Statut</label>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-full bg-white dark:bg-[#1a202c] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            {uniqueStatuts.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filtrer par Manager</label>
          <select
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
            className="w-full bg-white dark:bg-[#1a202c] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les managers</option>
            {uniqueManagers.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filtrer par Contrat</label>
          <select
            value={filterContrat}
            onChange={(e) => setFilterContrat(e.target.value)}
            className="w-full bg-white dark:bg-[#1a202c] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les contrats</option>
            {uniqueContrats.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto dark-scrollbar">
        <style jsx>{`
          .dark-scrollbar::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          
          .dark-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .dark-scrollbar::-webkit-scrollbar-thumb {
            background: #c3c5c9ff;
            border-radius: 4px;
          }
          
          .dark-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #f1f1f1ff;
          }
          
          .dark .dark-scrollbar::-webkit-scrollbar-thumb {
            background: #1f2937;
          }
          
          .dark .dark-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #374151;
          }
          
          .dark-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #f6f6f6ff transparent;
          }
          
          .dark .dark-scrollbar {
            scrollbar-color: #1f2937 transparent;
          }
        `}</style>
        <table className="min-w-full shadow divide-y divide-gray-200 dark:divide-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:!bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("title")} & Manager
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("lieu")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("contract")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("Salaire")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("Statut")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("Plateformes")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("Date Limite")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("date creation")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:!bg-[#1a202c] divide-y divide-gray-200 dark:divide-gray-700">
            {currentOffres && currentOffres.length > 0 ? (
              currentOffres.map((offre) => (
                <TableRow
                  key={offre.id}
                  offres={offre}
                  onView={() => onView(offre)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOpenAddModal={onOpenAddModal}
                />
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-8 dark:bg-[#1a202c] text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("noVacationFound")} (Aucune offre ne correspond à vos filtres)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          totalItems={totalItems}
        />
      )}

    </div>
  );
};

export default TableView;