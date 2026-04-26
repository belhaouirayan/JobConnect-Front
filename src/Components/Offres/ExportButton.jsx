import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from '../Navbar/LanguageContext';

const ExportButton = ({ currentViewData = [], allData = [], signature }) => {
  const { t } = useLanguage();
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // === EXPORT EXCEL ===
  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "");
    XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
  };

  // === EXPORT PDF ===
  const exportToPDF = (data, fileName) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text("Liste des Offres", pageWidth / 2, 20, { align: "center" });
    
    const currentDate = new Date().toLocaleDateString('fr-FR');
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date d'export: ${currentDate} | Nombre d'enregistrements: ${data.length}`, pageWidth / 2, 28, { align: "center" });
    
    // On extrait dynamiquement les en-têtes et les lignes basées sur les 8 colonnes qu'on a préparées
    const headers = data.length > 0 ? [Object.keys(data[0])] : [];
    const tableData = data.map(item => Object.values(item));
    
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 35,
      margin: { bottom: 50 }, 
      styles: { 
        cellPadding: 4, 
        fontSize: 10, // Police à taille normale car on n'a que 8 colonnes
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 11 
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold' } // Le Titre en gras
      },
      didDrawPage: function(data) {
        doc.setFontSize(9); 
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text("© " + new Date().getFullYear() + " - JobConnect", 15, doc.internal.pageSize.getHeight() - 10);
      }
    });

    if (signature) {
      const signatureHeight = 20; 
      const signatureWidth = 65;  
      const signatureX = pageWidth - signatureWidth - 20; 
      const signatureY = doc.internal.pageSize.getHeight() - 35; 
      
      doc.addImage(signature, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
      doc.setDrawColor(150, 150, 150);
      doc.line(signatureX, signatureY + signatureHeight + 2, signatureX + signatureWidth, signatureY + signatureHeight + 2);
      
      doc.setFontSize(10); 
      doc.setTextColor(100, 100, 100);
      doc.text("Signature électronique", signatureX + signatureWidth/2, signatureY + signatureHeight + 7, { align: "center" });
    }
    
    doc.save(`${fileName}.pdf`);
  };

  // === PRÉPARATION DES DONNÉES (Uniquement les 8 colonnes du tableau !) ===
  const prepareData = (dataToExport, isExcel) => {
    return dataToExport.map(item => {
      
      // Gestion des plateformes (Icônes pour Excel, Texte pour PDF)
      let formattedPlateformes = 'N/A';
      if (item.plateformes) {
        try {
          const parsed = typeof item.plateformes === 'string' ? JSON.parse(item.plateformes) : item.plateformes;
          const icons = { linkedin: '💼', indeed: '🎯', facebook: '📘', twitter: '🐦', instagram: '📸', site: '🌐' };
          
          formattedPlateformes = Object.entries(parsed)
            .filter(([, isTrue]) => isTrue)
            .map(([platName]) => {
              const nameLower = platName.toLowerCase();
              const icon = icons[nameLower] || '📌';
              return isExcel ? `${icon} ${platName}` : `[${platName}]`; 
            }).join(', ');
        } catch (e) {
          formattedPlateformes = 'N/A';
        }
      }

      // On retourne STRICTEMENT l'objet avec les colonnes visibles du tableau
      return {
        'Titre': item.titre || 'N/A',
        'Lieu': item.lieu || 'N/A',
        'Contrat': item.type_contrat || (item.contrat ? item.contrat.type : 'N/A'),
        'Salaire': item.salaire || 'N/A',
        'Statut': item.statut || 'N/A',
        'Plateformes': formattedPlateformes || 'N/A',
        'Date Limite': item.date_limite ? new Date(item.date_limite).toLocaleDateString('fr-FR') : 'N/A',
        'Date Création': item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : 'N/A'
      };
    });
  };

  const handleExport = (format, scope) => {
    const rawData = (scope === 'view' ? currentViewData : allData) || [];
    
    if (rawData.length === 0) {
      alert(t("Aucune donnée à exporter")); 
      setShowExportDropdown(false);
      return;
    }

    const fileName = scope === 'view' ? 'offres_page_courante' : 'offres_tout';
    
    const formattedData = prepareData(rawData, format === 'excel');
    
    if (format === 'excel') {
      exportToExcel(formattedData, fileName);
    } else {
      exportToPDF(formattedData, fileName);
    }
    
    setShowExportDropdown(false);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="w-full sm:w-auto min-w-0 flex-shrink-0 !bg-white dark:!bg-[#1a202c] dark:!text-white px-2 sm:px-4 py-2 text-gray-700 rounded hover:bg-gray-50 dark:hover:!bg-gray-800 border border-gray-300 dark:!border-gray-400 flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm"
        title="Export options"
      >
        <FiDownload className="text-gray-700 dark:text-white flex-shrink-0" />
        <span className="truncate">{t("export")}</span>
      </button>
      
      {showExportDropdown && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 !bg-white dark:!bg-[#1a202c] rounded shadow-lg z-10 border border-gray-200 dark:!border-gray-400">
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

export default ExportButton;