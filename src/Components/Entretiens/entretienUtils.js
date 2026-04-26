/**
 * Utilitaires partagés pour le module Entretiens
 */
import { jsPDF } from 'jspdf';

/**
 * Retourne les classes CSS pour le statut d'un entretien
 * @param {string} status 
 * @returns {string} Classes Tailwind
 */
export const getEventStatusColors = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    // Accepté/Confirmé/Validé -> Vert
    if (statusLower === 'accepte' || statusLower === 'confirmé' || statusLower === 'valide' || statusLower === 'validé' || statusLower === 'accepted') {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
    }
    
    // En attente -> Jaune
    if (statusLower === 'en_attente' || statusLower === 'attente' || statusLower === 'pending' || statusLower === 'brouillon') {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    }
    
    // Refusé/Annulé -> Rouge
    if (statusLower === 'refuse' || statusLower === 'refusé' || statusLower === 'annulé' || statusLower === 'rejected' || statusLower === 'cancelled') {
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    }
    
    // Terminé -> Gris/Bleu foncé
    if (statusLower === 'termine' || statusLower === 'terminé' || statusLower === 'completed') {
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }

    // Planifié (default) -> Bleu
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
};

/**
 * Formate le nom complet du candidat
 * @param {object|string} candidat 
 * @returns {string}
 */
export const formatCandidatName = (candidat) => {
  if (!candidat) return "N/A";
  if (typeof candidat === 'string') return candidat;
  if (typeof candidat === 'object') {
    return `${candidat.nom || ''} ${candidat.prenom || ''}`.trim() || "N/A";
  }
  return String(candidat);
};

/**
 * Formate la date pour l'affichage (fr)
 */
export const formatDateFR = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Génère et télécharge un PDF professionnel du rapport d'entretien.
 * @param {object} entretien - Les données complètes de l'entretien
 */
export const exportToPDF = (entretien) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ─── EN-TÊTE : Bandeau bleu ───────────────────────────────────────────────
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RAPPORT D\'ENTRETIEN', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}`, margin, 20);
  doc.text('JobConnect – Confidentiel', pageWidth - margin, 20, { align: 'right' });
  y = 36;

  // ─── INFOS CANDIDAT ───────────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

  const candidatName = entretien.candidat
    ? `${entretien.candidat.nom || ''} ${entretien.candidat.prenom || ''}`.trim()
    : 'Non renseigné';
  const offreTitle = entretien.candidat?.offre?.titre || entretien.offre?.titre || 'Non renseigné';
  const candidatEmail = entretien.candidat?.email || '';

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(candidatName, margin + 4, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Poste : ${offreTitle}`, margin + 4, y + 16);
  if (candidatEmail) {
    doc.text(`Email : ${candidatEmail}`, margin + 4, y + 22);
  }

  if (entretien.score_global != null) {
    const score = `${entretien.score_global}/100`;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.setFontSize(18);
    doc.text(score, pageWidth - margin - 4, y + 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Score', pageWidth - margin - 4, y + 22, { align: 'right' });
  }

  y += 36;

  // ─── DÉTAILS ENTRETIEN ────────────────────────────────────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DÉTAILS DU RENDEZ-VOUS', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const dateStr = entretien.date_entretien
    ? new Date(entretien.date_entretien).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const heureDebut = entretien.heure_debut || (entretien.date_entretien ? new Date(entretien.date_entretien).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
  const heureFin = entretien.heure_fin ? ` - ${entretien.heure_fin}` : '';
  const lieu = entretien.lien_visio || entretien.lieu || 'Non précisé';
  const type = entretien.type || 'N/A';

  const details = [
    { label: 'Date', value: dateStr },
    { label: 'Heure', value: `${heureDebut}${heureFin}` },
    { label: 'Type', value: type.charAt(0).toUpperCase() + type.slice(1) },
    { label: 'Lieu / Lien', value: lieu },
  ];

  doc.setFontSize(9);
  details.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.label} :`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(item.value, contentWidth - 30);
    doc.text(lines, margin + 28, y);
    y += lines.length * 5 + 1;
  });

  y += 4;

  // ─── COMPTE-RENDU ─────────────────────────────────────────────────────────
  let reportText = '';
  if (Array.isArray(entretien.resume_manuel)) {
    reportText = entretien.resume_manuel.map(note => `[${note.created_at || ''}]\n${note.content || ''}`).join('\n\n');
  } else {
    reportText = typeof entretien.resume_manuel === 'string' && entretien.resume_manuel
      ? entretien.resume_manuel 
      : (entretien.resume_auto || entretien.resume || '');
  }

  if (reportText && reportText !== '—') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('COMPTE-RENDU DE L\'ENTRETIEN', margin, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const lines = doc.splitTextToSize(reportText, contentWidth);
    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    });
  }

  // ─── PIED DE PAGE ─────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('JobConnect – Document Confidentiel', margin, pageHeight - 7);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  const filename = `rapport_entretien_${candidatName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
