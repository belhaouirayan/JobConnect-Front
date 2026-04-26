import React, { useState, useEffect } from "react";
import { 
  FiX, 
  FiMapPin, 
  FiVideo, 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiFileText, 
  FiFile, 
  FiDownload, 
  FiChevronDown, 
  FiChevronUp, 
  FiEye 
} from 'react-icons/fi';
import { apiRequest, BASE_URL } from "../../api";
import { exportToPDF } from './entretienUtils';

const ViewEntretienModal = ({ entretienId, onClose, onEditResume }) => {
  const [entretien, setEntretien] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReportOverlay, setShowReportOverlay] = useState(false);
  const PREVIEW_LENGTH = 280;

  // Fonction utilitaire pour extraire le nom du candidat
  const getCandidatName = (candidat) => {
    if (!candidat) return "";
    if (typeof candidat === 'string') return candidat;
    if (typeof candidat === 'object') {
      return `${candidat.nom || ''} ${candidat.prenom || ''}`.trim();
    }
    return String(candidat);
  };

  // NEW: Fonction utilitaire pour extraire le texte du compte-rendu de manière sécurisée
  const getReportText = (ent) => {
    if (!ent) return "";
    
    // Priorité au manuel, puis auto, puis résumé général
    const source = ent.resume_manuel || ent.resume_auto || ent.resume;
    
    if (!source) return "";
    
    if (Array.isArray(source)) {
      // Si c'est un tableau d'objets {content, created_at, author}
      return source
        .map(note => {
          const authorStr = note.author ? `[${note.author}] ` : "";
          const dateStr = note.created_at ? `(${note.created_at}) ` : "";
          return `${dateStr}${authorStr}: ${note.content}`;
        })
        .join("\n\n");
    }
    
    if (typeof source === 'object') {
      return source.content || JSON.stringify(source);
    }
    
    return String(source);
  };

  useEffect(() => {
    const fetchEntretien = async () => {
      try {
        const response = await apiRequest(`/entretiens/${entretienId}`, 'GET');
        setEntretien(response);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'entretien:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (entretienId) fetchEntretien();
  }, [entretienId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-[#0f172a]/90 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!entretien) {
    return null;
  }

  const dateObj = new Date(entretien.date_entretien);
  const heure = entretien.heure_debut || entretien.time || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const heureFin = entretien.heure_fin ? ` → ${entretien.heure_fin}` : "";
  const dateStr = entretien.date || dateObj.toLocaleDateString();
  const reportContent = getReportText(entretien);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-[#0f172a]/90 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg mr-3">
                <FiCalendar className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Détails de l'entretien</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                entretien.statut === 'valide' ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/50' :
                entretien.statut === 'refuse' ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/50' :
                entretien.statut === 'termine' ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/50' :
                'bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/50'
              }`}>
                {entretien.statut}
              </span>
              {entretien.candidate_response && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  entretien.candidate_response === 'accepted'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/50'
                    : 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/50'
                }`}>
                  {entretien.candidate_response === 'accepted' ? '✓ Candidat accepté' : '✗ Candidat décliné'}
                </span>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <FiX size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiUser className="text-gray-500 dark:text-gray-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidat</h3>
                    <p className="text-base text-gray-900 dark:text-white font-medium">{getCandidatName(entretien.candidat)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-500">{entretien.candidat?.email}</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Postule pour : {entretien.candidat?.offre?.titre}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiCalendar className="text-gray-500 dark:text-gray-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
                    <p className="text-base text-gray-900 dark:text-white">{dateStr}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FiClock className="text-gray-500 dark:text-gray-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Heure</h3>
                    <p className="text-base text-gray-900 dark:text-white">{heure}{heureFin}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiUser className="text-gray-500 dark:text-gray-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recruteur</h3>
                    <p className="text-base text-gray-900 dark:text-white font-medium">{entretien.recruiter || "Non assigné"}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  {entretien.type?.toLowerCase() === 'visio' ? (
                    <FiVideo className="text-blue-500 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  ) : (
                    <FiMapPin className="text-green-500 dark:text-green-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lieu / Format</h3>
                    <p className="text-base text-gray-900 dark:text-white capitalize mb-1">{entretien.type}</p>
                    {entretien.type?.toLowerCase() === 'visio' && entretien.lien_visio ? (
                      <a href={entretien.lien_visio} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline break-all">
                        {entretien.lien_visio}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{entretien.lieu || "Lieu non précisé"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Resume / Evaluation Section */}
            {(reportContent || entretien.score_global || entretien.recommendation) ? (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <FiFileText className="text-purple-500 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" size={18} />
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Résumé & Évaluation</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {entretien.score_global != null && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium block uppercase tracking-wider mb-1">Score Global</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{entretien.score_global} / 100</span>
                        </div>
                      )}
                    </div>

                    {(reportContent) && (
                      <div className="mt-4">
                        {reportContent === '—' || reportContent === '' ? (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-gray-500 italic text-sm border border-gray-200 dark:border-gray-700">
                            Aucun compte-rendu n'a encore été rédigé.
                          </div>
                        ) : (
                          /* Report File Card UI (Ref image match) */
                          <div className="bg-[#2a2d37] dark:bg-[#1e222d] border border-gray-700 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#363a45] rounded-lg flex items-center justify-center text-gray-400">
                                <FiFile size={24} />
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-sm truncate max-w-[200px]">
                                  Compte_Rendu_{getCandidatName(entretien.candidat).replace(' ', '_')}.pdf
                                </h4>
                                <p className="text-gray-500 text-xs">Document PDF • Généré par IA</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setShowReportOverlay(true)}
                                className="px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-gray-600"
                              >
                                <FiEye size={14} /> Consulter
                              </button>
                              <button 
                                onClick={() => exportToPDF(entretien)}
                                className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all border border-blue-500/30 hover:border-blue-500"
                              >
                                <FiDownload size={14} /> Télécharger
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Report Content Overlay Modal */}
                    {showReportOverlay && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                              <FiFileText className="text-blue-500" />
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Compte-rendu d'entretien</h3>
                            </div>
                            <button onClick={() => setShowReportOverlay(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                              <FiX size={18} className="text-gray-500" />
                            </button>
                          </div>
                          
                          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                              {reportContent}
                            </div>
                          </div>
                          
                          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                            <button 
                              onClick={() => {
                                setShowReportOverlay(false);
                                exportToPDF(entretien);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all"
                            >
                              <FiDownload size={14} /> Exporter PDF
                            </button>
                            <button 
                              onClick={() => setShowReportOverlay(false)}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                              Fermer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
                entretien.statut !== 'termine' && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                        <button 
                            onClick={() => {
                                onClose();
                                if(onEditResume) onEditResume(entretien.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
                        >
                            <FiFileText size={18} /> Rédiger le compte-rendu
                        </button>
                    </div>
                )
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEntretienModal;
