import React, { useState, useEffect } from "react";
import { X, Star, CheckCircle, XCircle, Download } from "lucide-react";
import { FiFileText } from 'react-icons/fi';
import { apiRequest } from "../../api";
import AIChatAssistantEntretien from "./AIChatAssistantEntretien";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ResumeEntretienModal = ({ entretienId, onClose, onRefresh }) => {
  const [entretien, setEntretien] = useState(null);
  const [formData, setFormData] = useState({
    pourcentage: 50,
    note: 3,
    appreciation: "Moyenne",
    commentaires: ""
  });
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntretien = async () => {
      try {
        const data = await apiRequest(`/entretiens/${entretienId}`, 'GET');
        setEntretien(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    if (entretienId) fetchEntretien();
  }, [entretienId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (entretien?.candidat_id) {
        try {
          const data = await apiRequest(`/entretiens?candidat_id=${entretien.candidat_id}`, 'GET');
          const docs = Array.isArray(data) ? data : (data.timeline || data.entretiens || []);
          setHistory(docs);
        } catch (error) {
          console.error("Erreur historique:", error);
        }
      }
    };
    fetchHistory();
  }, [entretien?.candidat_id, entretienId]);

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        type="button"
        key={star}
        onClick={() => {
          let num = star * 20;
          let appreciation = "Moyenne";
          if (num >= 90) appreciation = "Excellent";
          else if (num >= 70) appreciation = "Bien";
          else if (num >= 40) appreciation = "Moyenne";
          else appreciation = "Insuffisant";
          setFormData(prev => ({ ...prev, note: star, pourcentage: num, appreciation }));
        }}
        className="focus:outline-none"
      >
        <Star
          size={32}
          className={`${
            star <= formData.note
              ? "text-blue-500 fill-blue-500"
              : "text-gray-300 dark:text-gray-600"
          } hover:text-blue-400 transition-colors drop-shadow-sm`}
        />
      </button>
    ));
  };

  const handleApplyAIText = (text) => {
    setFormData(prev => ({ ...prev, commentaires: text }));
  };

  const handleDownloadPDF = (customContent = null, customDate = null, customEvaluation = null) => {
    const doc = new jsPDF();
    const candidateName = `${entretien?.candidat?.prenom} ${entretien?.candidat?.nom}`;
    const offerTitle = entretien?.candidat?.offre?.titre || "Poste non spécifié";
    
    // Contenu et date personnalisés (pour l'historique) ou actuels
    const reportContent = customContent !== null ? customContent : formData.commentaires;
    const reportDate = customDate !== null ? customDate : new Date(entretien?.date_entretien).toLocaleDateString();
    const evaluationText = customEvaluation 
      ? `Évaluation : ${customEvaluation}` 
      : `Évaluation globale : ${formData.pourcentage}% (${formData.appreciation})`;

    // Design header
    doc.setFillColor(37, 99, 235); // Blue-600 background
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Bilan d'Entretien individuel", 20, 25);
    
    // Info Table
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Candidat : ${candidateName}`, 20, 55);
    doc.text(`Poste visé : ${offerTitle}`, 20, 65);
    doc.text(`Type : ${entretien?.type}`, 20, 75);
    doc.text(`Date : ${reportDate}`, 20, 85);
    
    // Evaluation block
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 95, 170, 25, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(evaluationText, 25, 110);
    
    // Content
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Compte-rendu détaillé :", 20, 135);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    const splitText = doc.splitTextToSize(reportContent || "Pas de contenu spécifié pour cette note.", 170);
    
    let yPos = 145;
    for (let i = 0; i < splitText.length; i++) {
      // Saut de page si on atteint le bas (280mm)
      if (yPos > 275) {
        doc.addPage();
        yPos = 20; // Réinitialisation du y en haut de la nouvelle page
      }
      doc.text(splitText[i], 20, yPos);
      yPos += 7; // Hauteur de la ligne
    }
    
    // Footer et numérotation de pages
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const date = new Date().toLocaleDateString();
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Document RH Confidentiel - Généré par JobConnect le ${date} - Page ${i} sur ${pageCount}`, 20, 285);
    }
    
    doc.save(`Rapport_Entretien_${candidateName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (isClosingText) => {
    setIsSubmitting(true);
    try {
      // Déterminer l'index pour l'édition (on écrase la dernière note de la session si elle existe)
      const notesArray = Array.isArray(entretien?.resume_manuel) ? entretien.resume_manuel : [];
      const noteIndexToUpdate = notesArray.length > 0 ? notesArray.length - 1 : null;

      const payload = {
        resume_type: "manuel",
        resume_manuel: formData.commentaires,
        score_global: parseInt(formData.pourcentage) || 0,
        recommendation: "",
        evaluation_criteria: {
          note: formData.note,
          pourcentage: formData.pourcentage,
          appreciation: formData.appreciation,
        },
        note_index: noteIndexToUpdate // On passe l'index pour écraser/éditer
      };

      await apiRequest(`/entretiens/${entretienId}/update-resume`, 'PUT', payload);
      
      if (isClosingText) {
        await apiRequest(`/entretiens/${entretienId}`, 'PUT', { statut: "termine" });
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du résumé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (eId, index) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette note ?")) return;
    try {
      await apiRequest(`/entretiens/${eId}/notes/${index}`, 'DELETE');
      // Rafraîchir l'entretien actuel et l'historique
      const data = await apiRequest(`/entretiens/${entretienId}`, 'GET');
      setEntretien(data);
      if (entretien?.candidat_id) {
        const histData = await apiRequest(`/entretiens?candidat_id=${entretien.candidat_id}`, 'GET');
        setHistory(Array.isArray(histData) ? histData : (histData.timeline || histData.entretiens || []));
      }
    } catch (error) {
      console.error("Erreur suppression note:", error);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-[#0f172a]/90 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-5xl bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">

          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg mr-3">
                  <FiFileText className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                Résumé d&apos;Entretien
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {entretien?.candidat?.prenom} {entretien?.candidat?.nom} - {entretien?.type}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body: two columns */}
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">

            {/* Left column: history */}
            <div className="lg:w-1/3 p-6 bg-gray-50/50 dark:bg-gray-800/20 overflow-y-auto max-h-[70vh]">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <FiFileText size={16} /> Historique des Entretiens
              </h3>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map(h => {
                    const isCurrent = h.id === parseInt(entretienId);
                    const notes = Array.isArray(h.resume_manuel) ? h.resume_manuel : [];
                    const legacyNote = typeof h.resume_manuel === 'string' && h.resume_manuel !== '[]' ? h.resume_manuel : null;

                    return (
                      <div key={h.id} className={`p-3 border rounded-lg shadow-sm ${
                        isCurrent 
                          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" 
                          : "bg-white dark:bg-[#0f172a] border-gray-200 dark:border-gray-700"
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                            {new Date(h.date_entretien || h.date).toLocaleDateString()}
                            {isCurrent && <span className="ml-2 text-blue-500 font-bold tracking-tight">(Session actuelle)</span>}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">{h.type}</p>
                        
                        <div className="space-y-2">
                          {/* Affichage des notes structurées */}
                          {notes.map((note, nIdx) => (
                            <div key={nIdx} className="relative group p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 text-[11px]">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">{note.created_at}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleDownloadPDF(note.content, note.created_at, h.evaluation_criteria?.appreciation || "Partagée")}
                                    className="text-blue-500 hover:text-blue-700 p-1"
                                    title="Télécharger le PDF"
                                  >
                                    <Download size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteNote(h.id, nIdx)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Supprimer cette note"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 italic line-clamp-2">
                                {note.content?.substring(0, 60)}{note.content?.length > 60 ? "..." : ""}
                              </p>
                            </div>
                          ))}

                          {/* Affichage legacy si c'était une string simple */}
                          {legacyNote && !notes.length && (
                            <div className="p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded border border-dashed border-gray-300 dark:border-gray-600 flex justify-between items-center group">
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 italic flex-1 line-clamp-1">
                                {legacyNote}
                              </p>
                              <button 
                                onClick={() => handleDownloadPDF(legacyNote, h.date_entretien)}
                                className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity p-1 ml-1"
                                title="Télécharger le PDF"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          )}

                          {!notes.length && !legacyNote && (
                            <p className="text-[10px] text-gray-400 italic text-center py-1">Aucune note.</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">Aucun entretien précédent.</p>
                )}
              </div>
            </div>

            {/* Right column: form */}
            <div className="lg:w-2/3 p-8 space-y-8 overflow-y-auto max-h-[70vh]">

              {/* Global Evaluation */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                    Évaluation globale (Note sur 5)
                  </label>
                  <div className="flex justify-center space-x-3">
                    {renderStars()}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Détail (Pourcentage et Appréciation)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" max="100" name="pourcentage"
                        value={formData.pourcentage}
                        onChange={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val)) val = "";
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          let appreciation = formData.appreciation;
                          if (val >= 90) appreciation = "Excellent";
                          else if (val >= 70) appreciation = "Bien";
                          else if (val >= 40) appreciation = "Moyenne";
                          else if (val !== "") appreciation = "Insuffisant";
                          let note = formData.note;
                          if (val !== "") {
                            note = Math.round(val / 20);
                            if (note < 1 && val > 0) note = 1;
                          }
                          setFormData(prev => ({ ...prev, pourcentage: val, appreciation, note }));
                        }}
                        className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f172a] text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xl font-bold text-gray-500 dark:text-gray-400">%</span>
                    </div>
                    <select
                      name="appreciation" value={formData.appreciation}
                      onChange={(e) => {
                        const val = e.target.value;
                        let num = formData.pourcentage;
                        if (val === "Excellent") num = 95;
                        if (val === "Bien") num = 80;
                        if (val === "Moyenne") num = 50;
                        if (val === "Insuffisant") num = 25;
                        let note = Math.round(num / 20);
                        setFormData(prev => ({ ...prev, appreciation: val, pourcentage: num, note }));
                      }}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Excellent">Excellent (90% +)</option>
                      <option value="Bien">Bien (70% - 89%)</option>
                      <option value="Moyenne">Moyenne (40% - 69%)</option>
                      <option value="Insuffisant">Insuffisant (&lt; 40%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Chat IA Assistant */}
              <div className="mb-6">
                {entretien ? (
                  <AIChatAssistantEntretien 
                    onApplyText={handleApplyAIText} 
                    candidateName={`${entretien?.candidat?.prenom} ${entretien?.candidat?.nom}`}
                    interviewType={entretien?.type}
                    offerTitle={entretien?.candidat?.offre?.titre}
                    offerDescription={entretien?.candidat?.offre?.description}
                    offerCompetences={entretien?.candidat?.offre?.competences}
                    aiScore={entretien?.candidat?.score_ia}
                    currentEvaluation={formData.pourcentage}
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-xs italic">
                    Chargement des données du candidat...
                  </div>
                )}
              </div>

              {/* Commentaires */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex justify-between items-center">
                  <span>Compte-rendu détaillé</span>
                  <button 
                    type="button" 
                    onClick={() => handleDownloadPDF(null)}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase"
                  >
                    <Download size={12} /> Exporter PDF
                  </button>
                </label>
                <textarea
                  name="commentaires" rows={10} value={formData.commentaires} onChange={handleChange}
                  placeholder="Le contenu du compte-rendu s'affichera ici après génération avec l'IA ou saisie manuelle..."
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-xl resize-none shadow-inner min-h-[200px] focus:ring-2 focus:ring-blue-500/50 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2 flex-wrap">
                <button type="button" disabled={isSubmitting} onClick={() => handleSave(false)}
                  className="flex-1 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800 disabled:opacity-50">
                  {isSubmitting ? "Enregistrement..." : "Enregistrer une Note (Brouillon)"}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => handleSave(true)}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> {isSubmitting ? "Enregistrement..." : "Clôturer l'Entretien"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEntretienModal;
