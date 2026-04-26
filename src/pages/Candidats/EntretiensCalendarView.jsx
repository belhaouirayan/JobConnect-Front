import React, { useState, useEffect } from "react";
import { apiRequest } from "../../api";
import { offreApi } from "../../api/candidatApi";
import AddEntretienModal from "../../Components/Entretiens/AddEntretienModal";
import EditEntretienModal from "../../Components/Entretiens/EditEntretienModal";
import ViewEntretienModal from "../../Components/Entretiens/ViewEntretienModal";
import ResumeEntretienModal from "../../Components/Entretiens/ResumeEntretienModal";
import ResumeListModal from "../../Components/Entretiens/ResumeListModal";
import ExportButtonEntretiens from "../../Components/Entretiens/ExportButtonEntretiens";
import SearchBar from "../../Components/Offres/SearchBar";
import SignatureButton from "../../Components/Offres/SignatureButton";
import EntretiensTabs from "../../Components/Entretiens/EntretiensTabs";
import EntretiensTable from "../../Components/Entretiens/EntretiensTable";
import EntretiensCalendar from "../../Components/Entretiens/EntretiensCalendar";
import Pagination from "../../Components/Entretiens/Pagination";
import { FiUser, FiCalendar, FiChevronDown, FiPlus, FiSearch } from "react-icons/fi";

const EntretiensCalendarView = ({ onAddClick }) => {
  const [activeTab, setActiveTab] = useState("table");
  const [entretiens, setEntretiens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [signature, setSignature] = useState(null);
  const [offreFilter, setOffreFilter] = useState("all");     // filter by job offer
  const [reponseFilter, setReponseFilter] = useState("all"); // filter by candidate response
  const [openDropdown, setOpenDropdown] = useState(null);
  const [allOffres, setAllOffres] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Vous pouvez ajuster ce nombre

  // Modal states
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntretienId, setSelectedEntretienId] = useState(null);

  const fetchEntretiens = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/entretiens', 'GET');
      
      // Adapter selon la structure réelle de votre backend
      const data = response.data || response.entretiens || response.timeline || response || [];
      setEntretiens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors de la récupération des entretiens:", error);
      setEntretiens([]); // Toujours définir un tableau vide
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntretiens();
    
    // Set up a custom event listener that Candidats.jsx can trigger
    const handleRefresh = () => fetchEntretiens();
    window.addEventListener('refreshEntretiens', handleRefresh);
    
    // Fetch all job offers for the filter
    const fetchAllOffres = async () => {
      try {
        const response = await offreApi.getAll();
        const data = response.data || response;
        if (Array.isArray(data)) {
          setAllOffres(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
      }
    };
    fetchAllOffres();

    // Load signature if exists
    const savedSignature = localStorage.getItem('savedSignature');
    if (savedSignature) setSignature(savedSignature);

    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('refreshEntretiens', handleRefresh);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleView = (id) => {
    setSelectedEntretienId(id);
    setViewModalOpen(true);
  };
  
  const handleEdit = (id) => {
    setSelectedEntretienId(id);
    setEditModalOpen(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entretien ?")) {
      try {
        await apiRequest(`/entretiens/${id}`, 'DELETE');
        await fetchEntretiens();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        
        // Gestion améliorée des différents types d'erreurs
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
          // L'entretien n'existe plus, on rafraîchit la liste
          await fetchEntretiens();
        } else if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
          alert("Vous n'avez pas les droits pour supprimer cet entretien");
        } else if (error.message.includes('500') || error.message.toLowerCase().includes('server error')) {
          alert("Erreur serveur, veuillez réessayer plus tard");
        } else {
          alert(`Erreur lors de la suppression: ${error.message}`);
        }
      }
    }
  };

  const handleResendEmail = async (id) => {
    if (window.confirm("Voulez-vous renvoyer l'email d'invitation à ce candidat ?")) {
      try {
        const res = await apiRequest(`/entretiens/${id}/resend-email`, 'POST');
        if (res.success) {
          alert("L'invitation a été renvoyée avec succès.");
        } else {
          alert("Erreur: " + res.message);
        }
      } catch (error) {
        console.error("Erreur lors du renvoi:", error);
        alert("Erreur serveur lors du renvoi de l'email.");
      }
    }
  };
  
  const handleResume = (id) => {
    setSelectedEntretienId(id);
    setResumeModalOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, offreFilter, reponseFilter]);

  const filteredEntretiens = entretiens.filter((ent) => {
    // Récupérer le nom complet du candidat
    let candidatName = "";
    let candidatEmail = "";
    if (ent.candidat) {
      if (typeof ent.candidat === 'string') {
        candidatName = ent.candidat;
      } else if (typeof ent.candidat === 'object') {
        candidatName = `${ent.candidat.prenom || ''} ${ent.candidat.nom || ''}`.trim();
        candidatEmail = ent.candidat.email || "";
      }
    } else if (ent.candidate) {
      if (typeof ent.candidate === 'string') {
        candidatName = ent.candidate;
      } else if (typeof ent.candidate === 'object') {
        candidatName = `${ent.candidate.prenom || ''} ${ent.candidate.nom || ''}`.trim();
        candidatEmail = ent.candidate.email || "";
      }
    }

    // Filter by offer
    const offreTitre = ent.candidat?.offre?.titre || ent.offre || "";
    if (offreFilter !== "all" && offreTitre !== offreFilter) return false;

    // Filter by candidate response
    const reponse = ent.candidate_response || "pending";
    if (reponseFilter !== "all" && reponse !== reponseFilter) return false;

    // Filter by search term (nom, email ou type)
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const type = (ent.type || "").toLowerCase();
    
    return (
      candidatName.toLowerCase().includes(term) ||
      candidatEmail.toLowerCase().includes(term) ||
      type.includes(term)
    );
  });

  // Compute unique offer titles for the offer filter
  const offreTitles = allOffres.length > 0 
    ? allOffres.map(o => o.titre).filter(Boolean)
    : [...new Set(
        entretiens.map(ent => {
          const t = ent.offre?.titre || ent.candidat?.offre?.titre || ent.offre;
          return typeof t === 'string' ? t : null;
        }).filter(Boolean)
      )];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntretiens.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntretiens.length / itemsPerPage);

  return (
    <div className="bg-transparent mb-8 w-full">
      {/* Top actions: Flex wrap to avoid clipping absolute dropdowns */}
      <div className="flex items-center gap-2 mb-6 flex-wrap lg:flex-nowrap">
          <button 
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors font-bold flex items-center gap-2 text-sm whitespace-nowrap shrink-0"
          >
            <FiPlus size={15} />
            À Planifier
          </button>

          <div className="shrink-0 h-full flex items-center">
            <EntretiensTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Offres Dropdown */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'offre' ? null : 'offre')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold shadow hover:opacity-90 transition-colors min-w-[120px] ${
                openDropdown === 'offre' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <FiUser size={14} className="text-emerald-200 flex-shrink-0" />
              <span className="flex-1 text-left truncate">
                {offreFilter !== 'all' ? offreFilter : 'Offres'}
              </span>
              <FiChevronDown size={13} className={`text-white/70 flex-shrink-0 transition-transform ${openDropdown === 'offre' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'offre' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-64 bg-gray-900/95 backdrop-blur-md border border-emerald-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 py-2 overflow-hidden">
                <button
                  onClick={() => { setOffreFilter('all'); setOpenDropdown(null); }}
                  className={`w-full text-left px-4 py-2 text-sm ${offreFilter === 'all' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  Toutes les offres
                </button>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {offreTitles.map(titre => (
                    <button
                      key={titre}
                      onClick={() => { setOffreFilter(titre); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 text-sm truncate ${offreFilter === titre ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {titre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Réponses Dropdown */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'statut' ? null : 'statut')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold shadow hover:opacity-90 transition-colors min-w-[120px] ${
                openDropdown === 'statut' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <FiCalendar size={14} className="text-emerald-200 flex-shrink-0" />
              <span className="flex-1 text-left">
                {reponseFilter === 'all' ? 'Réponses' : 
                 reponseFilter === 'accepted' ? 'Accepté' : 
                 reponseFilter === 'declined' ? 'Décliné' : 'En attente'}
              </span>
              <FiChevronDown size={13} className={`text-white/70 flex-shrink-0 transition-transform ${openDropdown === 'statut' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'statut' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-48 bg-gray-900/95 backdrop-blur-md border border-emerald-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 py-2 overflow-hidden">
                <button
                  onClick={() => { setReponseFilter('all'); setOpenDropdown(null); }}
                  className={`w-full text-left px-4 py-2 text-sm ${reponseFilter === 'all' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  Toutes les réponses
                </button>
                {[
                  { id: 'accepted', label: 'Accepté' },
                  { id: 'declined', label: 'Décliné' },
                  { id: 'pending', label: 'En attente' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setReponseFilter(item.id); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-sm ${reponseFilter === item.id ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-1 justify-end min-w-0">
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <ExportButtonEntretiens 
                currentViewData={activeTab === "table" ? currentItems : filteredEntretiens} 
                allData={entretiens} 
                signature={signature} 
              />
            </div>
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <SignatureButton 
                onClick={() => {}} 
                onSaveSignature={(sig) => setSignature(sig)} 
                signature={signature}
              />
            </div>
            <div className="flex-1 min-w-[120px] max-w-[300px]">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
          </div>
      </div>


      {activeTab === "table" ? (
        <div className="flex flex-col space-y-4">
          <EntretiensTable
            entretiens={currentItems}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResume={handleResume}
            onResendEmail={handleResendEmail}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={Math.min(indexOfLastItem, filteredEntretiens.length)}
            totalItems={filteredEntretiens.length}
          />
        </div>
      ) : (
        <EntretiensCalendar 
          data={filteredEntretiens} 
          onEventClick={(evt) => {
            setSelectedEntretienId(evt.id);
            const response = evt.candidate_response?.toLowerCase() || '';
            if (response === 'accepted' || response === 'accepte' || response === 'accepté') {
              // Candidat a accepté → ouvrir le Résumé pour générer le rapport
              setResumeModalOpen(true);
            } else {
              // En attente ou décliné → ouvrir les Détails de l'entretien
              setViewModalOpen(true);
            }
          }}
        />
      )}

      {resumeModalOpen && (
        <ResumeEntretienModal 
          entretienId={selectedEntretienId} 
          onClose={() => setResumeModalOpen(false)} 
          onRefresh={fetchEntretiens} 
        />
      )}

      {viewModalOpen && (
        <ViewEntretienModal 
          entretienId={selectedEntretienId} 
          onClose={() => setViewModalOpen(false)} 
          onEditResume={handleResume}
        />
      )}

      {editModalOpen && (
        <EditEntretienModal 
          entretienId={selectedEntretienId} 
          onClose={() => setEditModalOpen(false)} 
          onRefresh={fetchEntretiens} 
        />
      )}
    </div>
  );
};

export default EntretiensCalendarView;
