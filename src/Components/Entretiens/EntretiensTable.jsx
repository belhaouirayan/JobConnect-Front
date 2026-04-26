import React from 'react';
import { FiUser, FiCalendar, FiClock, FiMapPin, FiVideo, FiEye, FiEdit2, FiTrash2, FiFileText, FiBriefcase, FiMail } from "react-icons/fi";
import { getEventStatusColors, formatCandidatName } from './entretienUtils';

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Main Table Component
const EntretiensTable = ({
  entretiens,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onResume,
  onResendEmail,
}) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8 bg-white dark:bg-[#1a202c] shadow-md rounded-md my-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

  return (
    <div className="bg-white dark:!bg-[#1a202c] shadow-md rounded-md my-2 overflow-hidden">
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
                Candidat
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Offre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Recruteur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Lieu / Lien
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Réponse
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:!bg-[#1a202c] divide-y divide-gray-200 dark:divide-gray-700">
            {entretiens && entretiens.length > 0 ? (
              entretiens.map((entretien) => (
                <tr key={entretien.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 light:bg-white dark:bg-[#1a202c] transition-colors">
                    <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                            <FiUser className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
                            {formatCandidatName(entretien.candidat || entretien.candidate)}
                        </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300 italic">
                            {entretien.candidat?.offre?.titre || entretien.offre || "Non spécifiée"}
                        </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                            <FiBriefcase className="mr-1 text-gray-400" size={14} />
                            {entretien.recruiter || "Non assigné"}
                        </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex flex-col justify-center space-y-1">
                            <div className="flex items-center">
                                <FiCalendar className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
                                {formatDate(entretien.date_entretien || entretien.date)}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center capitalize">
                            {entretien.type?.toLowerCase() === 'visio' ? (
                                <FiVideo className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
                            ) : (
                                <FiMapPin className="mr-1 text-blue-500 dark:text-blue-400" size={14} />
                            )}
                            {entretien.type || "N/A"}
                        </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                            {entretien.type?.toLowerCase() === 'visio' ? (
                                <a href={entretien.lien_visio} target="_blank" rel="noopener noreferrer" className="truncate max-w-[150px] text-blue-500 hover:underline">
                                  {entretien.lien_visio ? "Lien Visio" : "Lien non fourni"}
                                </a>
                            ) : (
                                <span className="truncate max-w-[150px]">{entretien.lieu || "Lieu non fourni"}</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        {entretien.candidate_response ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                entretien.candidate_response.toLowerCase() === 'accepted' || entretien.candidate_response.toLowerCase() === 'accepte' || entretien.candidate_response.toLowerCase() === 'accepté'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : entretien.candidate_response.toLowerCase() === 'declined' || entretien.candidate_response.toLowerCase() === 'refused' || entretien.candidate_response.toLowerCase() === 'refuse' || entretien.candidate_response.toLowerCase() === 'refusé'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                                {entretien.candidate_response.toLowerCase() === 'accepted' ? 'Accepté' : 
                                 entretien.candidate_response.toLowerCase() === 'declined' || entretien.candidate_response.toLowerCase() === 'refused' ? 'Refusé' : 
                                 entretien.candidate_response}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs italic">En attente</span>
                        )}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getEventStatusColors(entretien.statut)}`}>
                            <span className="truncate max-w-[60px] lg:max-w-none capitalize">
                                {entretien.statut || "N/A"}
                            </span>
                        </span>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                            {onView && (
                                <button
                                    onClick={() => onView(entretien.id)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Voir les détails"
                                >
                                    <FiEye size={16} />
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(entretien.id)}
                                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                    title="Modifier"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                            )}
                            {onResendEmail && (
                                <button
                                    onClick={() => onResendEmail(entretien.id)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                    title="Renvoyer l'invitation"
                                >
                                    <FiMail size={16} />
                                </button>
                            )}
                            {onResume && (
                                <button
                                    onClick={() => onResume(entretien.id)}
                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                    title="Résumé/Évaluation"
                                >
                                    <FiFileText size={16} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(entretien.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Supprimer"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 dark:bg-[#1a202c] text-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun entretien trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntretiensTable;
