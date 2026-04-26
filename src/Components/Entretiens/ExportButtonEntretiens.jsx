import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from '../Navbar/LanguageContext';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ExportButtonEntretiens = ({ currentViewData = [], allData = [], signature }) => {
  const {t} = useLanguage();
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Helper to extract candidate name from string or object
  const getCandidatName = (candidat) => {
    if (!candidat) return 'N/A';
    if (typeof candidat === 'string') return candidat;
    if (typeof candidat === 'object') {
      return `${candidat.nom || ''} ${candidat.prenom || ''}`.trim() || 'N/A';
    }
    return String(candidat);
  };

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "");
    XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
  };

  const exportToPDF = (data, fileName) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("Liste des Entretiens", pageWidth / 2, 20, { align: "center" });
    
    // Date
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date d'export: ${currentDate}`, pageWidth / 2, 28, { align: "center" });
    
    // Nombre d'enregistrements
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Nombre d'enregistrements: ${data.length}`, pageWidth / 2, 34, { align: "center" });
    
    // Tableau
    const headers = [['Candidat', 'Offre', 'Recruteur', 'Date', 'Type', 'Lieu/Lien', 'Réponse', 'Statut']];
    const tableData = data.map(item => [
      getCandidatName(item.candidat),
      item.candidat?.offre?.titre || item.offre || 'N/A',
      item.recruiter || 'N/A',
      formatDate(item.date || item.date_entretien),
      item.type || 'N/A',
      item.type?.toLowerCase() === 'visio' ? (item.lien_visio || item.lieu || 'N/A') : (item.lieu || 'N/A'),
      item.candidate_response === 'accepted' ? 'Accepté' : item.candidate_response === 'declined' ? 'Décliné' : 'En attente',
      item.statut || 'N/A',
    ]);
    
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 40,
      styles: { 
        cellPadding: 3, 
        fontSize: 10, 
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      didDrawPage: function(data) {
        // Pied de page
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageNumber = `Page ${doc.internal.getNumberOfPages()}`;
        doc.text(pageNumber, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
        
        doc.setFontSize(8);
        doc.text("© " + new Date().getFullYear() + " - Système de gestion", 15, doc.internal.pageSize.getHeight() - 10);
        
        // Ajout de la signature si elle existe
        if (signature) {
          const signatureHeight = 15;
          const signatureWidth = 50;
          const signatureX = pageWidth - signatureWidth - 20;
          const signatureY = doc.internal.pageSize.getHeight() - 30;
          
          doc.addImage(signature, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
          doc.setDrawColor(150, 150, 150);
          doc.line(signatureX, signatureY + signatureHeight + 2, signatureX + signatureWidth, signatureY + signatureHeight + 2);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text("Signature électronique", signatureX + signatureWidth/2, signatureY + signatureHeight + 5, { align: "center" });
        }
      }
    });
    
    doc.save(`${fileName}.pdf`);
  };

  const handleExport = (format, scope) => {
    const dataToExport = (scope === 'view' ? currentViewData : allData) || [];
    if (dataToExport.length === 0) {
      alert(t("Aucune donnée à exporter"));
      setShowExportDropdown(false);
      return;
    }
    const fileName = scope === 'view' ? 'entretiens_page_courante' : 'entretiens_tout';
    
    if (format === 'excel') {
      // Pour Excel, on remappe les clés pour avoir de jolis en-têtes de colonnes
      const filteredData = dataToExport.map(item => ({
        Candidat: getCandidatName(item.candidat),
        Offre: item.candidat?.offre?.titre || item.offre || 'N/A',
        Recruteur: item.recruiter || 'N/A',
        Date: formatDate(item.date || item.date_entretien),
        Type: item.type || 'N/A',
        'Lieu/Lien': item.type?.toLowerCase() === 'visio' ? (item.lien_visio || item.lieu || 'N/A') : (item.lieu || 'N/A'),
        'Réponse': item.candidate_response === 'accepted' ? 'Accepté' : item.candidate_response === 'declined' ? 'Décliné' : 'En attente',
        Statut: item.statut || 'N/A',
      }));
      exportToExcel(filteredData, fileName);
    } else {
      // Pour PDF, on passe les données brutes (clés en minuscules: date, candidat, type...)
      exportToPDF(dataToExport, fileName);
    }
    setShowExportDropdown(false);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="w-full sm:w-auto h-[40px] min-w-0 flex-shrink-0 !bg-white dark:!bg-[#1a202c] dark:!text-white px-3 py-2 text-gray-700 rounded hover:bg-gray-50 dark:hover:!bg-gray-800 border border-gray-300 dark:!border-gray-400 flex items-center justify-center sm:justify-start gap-2 transition-colors text-sm font-semibold shadow-sm"
        title="Export options"
      >
        <FiDownload className="text-gray-700 dark:text-white flex-shrink-0" />
        <span className="truncate">{t("export")}</span>
      </button>
      
      {showExportDropdown && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 !bg-white dark:!bg-[#1a202c] rounded shadow-lg z-50 border border-gray-200 dark:!border-gray-400">
          <div className="py-1">
            <div className="px-3 sm:px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
              {t("export_current_view")}
            </div>
            <button 
              onClick={() => handleExport('excel', 'view')}
              className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:!bg-gray-800"
            >
              {t("excel_current_view")}
            </button>
            <button 
              onClick={() => handleExport('pdf', 'view')}
              className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:!bg-gray-800"
            >
              {t("pdf_current_view")}
            </button>
            
            <div className="px-3 sm:px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-b border-gray-200 dark:border-gray-600">
              {t("export_all_data")}
            </div>
            <button 
              onClick={() => handleExport('excel', 'all')}
              className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:!bg-gray-800"
            >
              {t("excel_all_data")}
            </button>
            <button 
              onClick={() => handleExport('pdf', 'all')}
              className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:!bg-gray-800"
            >
              {t("pdf_all_data")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButtonEntretiens;
