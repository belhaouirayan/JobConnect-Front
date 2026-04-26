import React, { useState, useEffect } from "react";
import { FiClipboard, FiX } from 'react-icons/fi';
import { Plus } from "lucide-react";
import { apiRequest } from "../../api";

// Modal component that lists the history of interviews and their summaries for a given candidate
const ResumeListModal = ({ candidat, onClose }) => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!candidat?.id) {
        setResumes([]);
        setIsLoading(false);
        return;
      }

      try {
        // Appel ciblé : on ne charge QUE l'historique de ce candidat pour éviter la surcharge système
        const data = await apiRequest(`/entretiens?candidat_id=${candidat.id}`, 'GET');
        const candidatEntretiens = Array.isArray(data) ? data : (data.timeline || data.entretiens || []);
        
        setResumes(candidatEntretiens);
      } catch (error) {
        console.error("Erreur lors de la récupération des résumés:", error);
        setResumes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, [candidat?.id]);

  return (
    <div className="fixed inset-0 bg-[#0f172a]/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-700 flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#1a2332]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiClipboard className="text-blue-400 mr-3" size={20} />
              Historique des Entretiens
            </h2>
            <p className="text-gray-400 text-sm mt-1">Candidat : <span className="text-gray-200 font-semibold">{candidat?.nom || "Candidat"}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-2 rounded-lg">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Chargement de l'historique...
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Aucun historique d'entretien trouvé pour ce candidat.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Résumé initial du CV (IA) */}
              {candidat.resume && (
                <div className="bg-blue-900/10 border border-blue-800/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      AI
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold text-sm uppercase tracking-wider">Analyse initiale du CV</p>
                      <p className="text-gray-500 text-[10px]">Généré lors de la réception de la candidature</p>
                    </div>
                  </div>
                  <div className="bg-[#1a2332]/50 p-4 rounded-md border border-blue-900/20 text-gray-300 text-sm italic whitespace-pre-wrap">
                    {candidat.resume}
                  </div>
                </div>
              )}

              {/* Liste des comptes-rendus d'entretiens */}
              {resumes.map((resume, index) => (
                <div key={resume.id} className="bg-[#0f172a] border border-gray-700 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-700/50">
                        {resume.recruteur ? resume.recruteur.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-gray-200 font-medium">{resume.recruteur}</p>
                        <p className="text-gray-500 text-xs">Recruteur • {resume.date} • {resume.type}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex text-yellow-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round((resume.score_global || 0) / 20) ? "text-yellow-400" : "text-gray-600"}>★</span>
                        ))}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded border ${
                        resume.statut === 'termine' ? 'bg-green-900/20 text-green-400 border-green-700/50' : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}>
                        {resume.statut}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] p-4 rounded-md border border-gray-700/50 text-gray-300 text-sm italic">
                    {Array.isArray(resume.resume_manuel) ? (
                      <div className="space-y-3">
                        {resume.resume_manuel.map((note, nIdx) => (
                          <div key={nIdx} className="pb-2 border-b border-gray-700/30 last:border-0 last:pb-0">
                            <span className="text-[10px] font-bold text-blue-400 block mb-1">{note.created_at} - {note.author}</span>
                            <p className="whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (resume.resume_manuel || (resume.resume && resume.resume !== '—')) ? (
                      <div className="whitespace-pre-wrap">{resume.resume_manuel || resume.resume}</div>
                    ) : (
                      <span className="text-gray-500">Aucun compte-rendu rédigé pour cet entretien.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeListModal;
