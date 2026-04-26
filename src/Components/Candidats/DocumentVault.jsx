import React, { useState } from 'react';
import { 
  FileText, Eye, Download, FilePlus, ShieldCheck, 
  Award, CreditCard, ChevronRight, FileType, File
} from 'lucide-react';

const DocumentCard = ({ title, type, ext, onPreview, onDownload, colorClass, icon: Icon, isHero, isSidebar }) => {
  const [showOptions, setShowOptions] = useState(false);

  const canExportPdf = ['JPG', 'JPEG', 'PNG'].includes(ext);

  return (
    <div className={`group relative bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 
                    rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 
                    dark:hover:shadow-none hover:-translate-y-1 
                    ${isSidebar ? 'p-3 flex items-center justify-between gap-3' : isHero ? 'p-6 sm:p-8' : 'p-4'}`}>
      
      <div className={`flex ${isSidebar ? 'items-center gap-3 flex-1' : 'items-start justify-between mb-4'}`}>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 shrink-0 flex items-center justify-center`}>
          <Icon className={colorClass.replace('bg-', 'text-')} size={isSidebar ? 20 : isHero ? 32 : 24} />
        </div>
        
        {/* En mode grille normal, les actions sont en haut à droite avec l'icône */}
        {!isSidebar && (
          <div className="flex items-center gap-2 relative">
            {onPreview && (
              <button 
                onClick={onPreview}
                className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition border border-transparent hover:border-blue-100"
                title="Aperçu"
              >
                <Eye size={isHero ? 20 : 16} />
              </button>
            )}
            
            <div className="relative">
              {!canExportPdf ? (
                <button 
                  onClick={() => onDownload('original')}
                  className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition border border-transparent hover:border-blue-100 shadow-sm"
                  title="Télécharger le document"
                >
                  <Download size={isHero ? 20 : 16} />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    onBlur={() => setTimeout(() => setShowOptions(false), 200)}
                    className={`p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-transparent hover:border-gray-200 shadow-sm ${showOptions ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    title="Options de téléchargement"
                  >
                    <Download size={isHero ? 20 : 16} />
                  </button>

                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-[50] py-2 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => onDownload('original')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <File size={14} className="text-gray-400" /> Format Original ({ext})
                      </button>
                      <button 
                        onClick={() => onDownload('pdf')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 flex items-center gap-2"
                      >
                        <FileType size={14} /> Exporter en PDF
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {isSidebar && (
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight text-xs truncate w-full" title={title}>
              {title}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-black uppercase text-gray-500">
                {ext || 'DOC'}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
              <span className="text-[9px] font-bold text-gray-400 uppercase truncate">
                {type}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {!isSidebar && (
        <div className="mt-2">
          <h4 className={`font-black text-gray-900 dark:text-white leading-tight ${isHero ? 'text-lg' : 'text-sm'}`}>
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800">
              {ext || 'DOC'}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
              {type}
            </span>
          </div>
        </div>
      )}

      {/* Boutons d'action pour la sidebar */}
      {isSidebar && (
        <div className="flex items-center shrink-0">
          {onPreview && (
            <button 
              onClick={onPreview}
              className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded shrink-0"
              title="Aperçu"
            >
              <Eye size={14} />
            </button>
          )}
          
          <div className="relative shrink-0 flex">
            {!canExportPdf ? (
              <button 
                onClick={() => onDownload('original')}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                title="Télécharger le document"
              >
                <Download size={14} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  onBlur={() => setTimeout(() => setShowOptions(false), 200)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  title="Options de téléchargement"
                >
                  <Download size={14} />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-8 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-[50] py-1">
                    <button onClick={() => onDownload('original')} className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <File size={12} className="text-gray-400" /> {ext}
                    </button>
                    <button onClick={() => onDownload('pdf')} className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 flex items-center gap-2">
                      <FileType size={12} /> PDF
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      

      
      {!isHero && (
        <div className="absolute bottom-4 right-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={18} />
        </div>
      )}
    </div>
  );
};

const DocumentVault = ({ candidate, onPreview, isSidebar = false }) => {
  if (!candidate || !candidate.document) return null;

  const docs = candidate.document;
  const baseUrl = "http://localhost:8000";

  const handleDownloadAction = async (docType, index, format) => {
    let url = "";
    if (format === 'pdf') {
      url = `${baseUrl}/api/candidats/${candidate.id}/export-pdf/${docType}`;
      if (index !== null && index !== undefined) url += `/${index}`;
    } else {
      url = `${baseUrl}/api/candidats/${candidate.id}/documents/${docType}`;
      if (index !== null && index !== undefined) url += `/${index}`;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/octet-stream',
        },
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Extraction améliorée du nom de fichier
      let filename = "";
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Fallback si pas de nom trouvé ou si l'extraction a échoué
      if (!filename) {
        const extension = format === 'pdf' ? 'pdf' : (docs[docType]?.split('.').pop() || 'bin');
        filename = `${docType}.${extension}`;
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (e) {
      console.error('Erreur de téléchargement:', e);
      alert('Impossible de télécharger le document. Veuillez réessayer.');
    }
  };

  const getExt = (path) => path ? path.split('.').pop().toUpperCase() : 'PDF';

  const documentList = [
    { key: 'cv', title: 'Curriculum Vitae', type: 'Principal', path: docs.cv, icon: FileText, colorClass: 'bg-blue-500', canPreview: true },
    { 
      key: 'lettre_motivation', 
      title: 'Lettre de Motivation', 
      type: 'Candidature', 
      path: docs.lettre_motivation, 
      icon: FilePlus, 
      colorClass: 'bg-purple-500',
      isText: docs.lettre_motivation && !docs.lettre_motivation.includes('.')
    },
    { key: 'diplome', title: 'Dernier Diplôme', type: 'Justificatif', path: docs.diplome, icon: Award, colorClass: 'bg-emerald-500' },
    { key: 'permis', title: 'Permis de Conduire', type: 'Document', path: docs.permis, icon: CreditCard, colorClass: 'bg-orange-500' },
    { key: 'habilitation', title: 'Certifications', type: 'Expertise', path: docs.habilitation, icon: ShieldCheck, colorClass: 'bg-indigo-500' }
  ].filter(d => d.path);

  const autresDocs = docs.autres || [];
  const totalCount = documentList.length + autresDocs.length;
  const isOnlyOne = totalCount === 1;

  const getDocType = (path, ext) => {
    if (['DOC', 'DOCX'].includes(ext)) return 'docx';
    if (['JPG', 'JPEG', 'PNG'].includes(ext)) return 'image';
    return 'pdf';
  };

  const handlePreviewLocal = (doc) => {
    if (doc.isText) {
      onPreview({ type: 'text', content: doc.path, title: doc.title });
    } else {
      const ext = getExt(doc.path);
      onPreview({ 
        type: getDocType(doc.path, ext),
        path: doc.path,
        title: doc.title,
        key: doc.key
      });
    }
  };

  const handlePreviewAutre = (doc, idx) => {
    const ext = getExt(doc.path);
    onPreview({
      type: getDocType(doc.path, ext),
      path: doc.path,
      title: doc.name || `Document ${idx+1}`,
      key: 'autres',
      index: idx
    });
  };

  return (
    <section className={`transition-all ${isSidebar ? 'p-0' : 'mt-8'}`}>
      <div className="flex items-center justify-between mb-5 gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-600 rounded-full shrink-0 animate-pulse" />
          Dossier Documents
        </h2>
        <span className="shrink-0 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[9px] font-black text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
          {totalCount} FICHIER{totalCount > 1 ? 'S' : ''}
        </span>
      </div>

      <div className={`grid gap-4 ${
        isOnlyOne && !isSidebar ? 'grid-cols-1' : 
        isSidebar ? 'grid-cols-1' : 
        totalCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {/* Documents Standard */}
        {documentList.map((doc) => (
          <DocumentCard 
            key={doc.key}
            title={doc.title}
            type={doc.type}
            ext={doc.isText ? 'TXT' : getExt(doc.path)}
            icon={doc.icon}
            colorClass={doc.colorClass}
            isHero={isOnlyOne && !isSidebar}
            onPreview={() => handlePreviewLocal(doc)}
            onDownload={(format) => handleDownloadAction(doc.key, null, format)}
            isSidebar={isSidebar}
          />
        ))}

        {/* Documents Supplémentaires */}
        {autresDocs.map((doc, idx) => (
          <DocumentCard 
            key={`autre-${idx}`}
            title={doc.name || `Fichier_${idx + 1}`}
            type="Joint"
            ext={getExt(doc.path)}
            icon={FileText}
            colorClass="bg-slate-500"
            isHero={false}
            onPreview={() => handlePreviewAutre(doc, idx)}
            onDownload={(format) => handleDownloadAction('autres', idx, format)}
            isSidebar={isSidebar}
          />
        ))}
      </div>
    </section>
  );
};

export default DocumentVault;
