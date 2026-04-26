import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidatApi, offreApi } from '../../api/candidatApi';
import ExportButton from '../../Components/Offres/ExportButton';
import DigitalSignatureButton from '../../Components/Offres/SignatureButton';
import TabNavigation from './TabNavigation';
import Pagination from '../../Components/Pagination/Pagination';
import ConsultationSidebar from '../../Components/Candidats/ConsultationSidebar';
import { canAcceptRefuse, canDelete, isLecteur, isDepartmentLocked, getUserDepartment } from '../../utils/roleHelpers';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOffer, setFilterOffer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [meta, setMeta] = useState({ total: 0, current_page: 1 });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [signature, setSignature] = useState(null);

  // Always "candidatures" on this page
  const activeTab = 'candidatures';
  const setActiveTab = () => { };

  useEffect(() => {
    const saved = localStorage.getItem('savedSignature');
    if (saved) setSignature(saved);
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchOffres();
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, filterOffer, filterStatus, filterScore, filterFavorites]);

  const fetchOffres = async () => {
    try {
      const response = await offreApi.getAll();
      setOffres(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const fetchCandidates = async (page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {
        page,
        search: searchTerm,
        offre_id: filterOffer,
        statut: filterStatus,
        min_score: filterScore,
        favorites_only: filterFavorites ? 1 : 0,
        per_page: 12
      };
      const response = await candidatApi.getAll(params);
      let fetchedCandidates = response.data.data || [];
      if (isDepartmentLocked() && getUserDepartment()) {
        const userDept = getUserDepartment();
        fetchedCandidates = fetchedCandidates.filter(c => c.offre?.departement === userDept || c.job?.department === userDept || c.offre?.department === userDept);
      }
      setCandidates(fetchedCandidates);
      setMeta(response.data.meta || { total: 0, current_page: 1 });

      // Update offers list from candidates response (contains ALL active offers for filtering)
      if (response.data.filters && response.data.filters.offres) {
        setOffres(response.data.filters.offres);
      }

      setError(null);
    } catch (error) {
      console.error("Detailed error fetching candidates:", error);
      setError("Impossible de charger les données.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    if (!window.confirm("Confirmer l'acceptation ?")) return;
    const previousCandidates = [...candidates];
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, statut: 'accepte' } : c));
    try {
      const resp = await candidatApi.accepter(id);
      if (resp.data.candidat) {
        setCandidates(prev => prev.map(c => c.id === id ? resp.data.candidat : c));
      }
      showToast('success', 'Candidat accepté.');
    } catch (error) {
      setCandidates(previousCandidates);
      showToast('error', 'Erreur lors de l\'acceptation.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Confirmer le refus ? Un e-mail sera envoyé au candidat.")) return;
    const previousCandidates = [...candidates];
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, statut: 'refuse' } : c));
    try {
      const resp = await candidatApi.refuser(id);
      if (resp.data.candidat) {
        setCandidates(prev => prev.map(c => c.id === id ? resp.data.candidat : c));
      }
      showToast('success', 'Candidat refusé et e-mail envoyé.');
    } catch (error) {
      setCandidates(previousCandidates);
      showToast('error', 'Erreur lors du refus.');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const resp = await candidatApi.toggleFavorite(id);
      if (resp.data.candidat) {
        setCandidates(prev => prev.map(c => c.id === id ? resp.data.candidat : c));
        showToast('success', resp.data.message);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showToast('error', 'Erreur lors de la mise à jour du favori.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce candidat ? Cette action est irréversible.")) return;

    try {
      await candidatApi.delete(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      showToast('success', 'Candidat supprimé avec succès.');
    } catch (error) {
      console.error("Error deleting candidate:", error);
      showToast('error', 'Erreur lors de la suppression.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepte':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'refuse':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'embauche':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case 'entretien':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <div className="min-h-screen px-6 py-2 text-gray-200">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-bold transition-all ${toast.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          <span>{toast.type === 'success' ? '✓' : '✗'}</span>
          {toast.message}
        </div>
      )}

      <div className="max-w-full mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          {!isLecteur() && (
            <Link
              to="/recrutement/postuler"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700
                        text-white text-sm font-bold rounded-lg shadow transition-colors
                        whitespace-nowrap"
            >
              + Postuler
            </Link>
          )}
        </div>

        {/* Filters + Consultation Layout */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Consultation Sidebar */}
          <ConsultationSidebar
            filters={{ titre: '', ville: '', entreprise: '' }}
            onFilterChange={() => {}}
          />

          {/* Main Filters Bar */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 py-1.5 flex-wrap lg:flex-nowrap">
              {/* Offres Dropdown */}
              <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'offre' ? null : 'offre')}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-bold shadow hover:opacity-90 transition-colors min-w-[120px] ${openDropdown === 'offre' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'}`}
                >
                  <span className="flex-1 text-left truncate">
                    {filterOffer ? (offres.find(o => String(o.id) === String(filterOffer))?.titre || 'Offres') : 'Offres'}
                  </span>
                  <span className={`text-[10px] transition-transform ${openDropdown === 'offre' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openDropdown === 'offre' && (
                  <div className="absolute top-[calc(100%+6px)] left-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                    <button onClick={() => { setFilterOffer(''); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 text-sm ${!filterOffer ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      Toutes les offres
                    </button>
                    <div className="max-h-60 overflow-y-auto">
                      {offres.map(offer => (
                        <button key={offer.id} onClick={() => { setFilterOffer(offer.id); setOpenDropdown(null); }}
                          className={`w-full text-left px-4 py-2 text-sm truncate ${String(filterOffer) === String(offer.id) ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          {offer.titre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'statut' ? null : 'statut')}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-bold shadow hover:opacity-90 transition-colors min-w-[120px] ${openDropdown === 'statut' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'}`}>
                  <span className="flex-1 text-left capitalize">
                    {filterStatus === 'accepte' ? 'Accepté' : (filterStatus ? filterStatus.replace('_', ' ') : 'Statuts')}
                  </span>
                  <span className={`text-[10px] transition-transform ${openDropdown === 'statut' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openDropdown === 'statut' && (
                  <div className="absolute top-[calc(100%+6px)] left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2">
                    {[{ id: '', label: 'Tous' }, { id: 'en_attente', label: 'En attente' }, { id: 'accepte', label: 'Accepté' }, { id: 'refuse', label: 'Refusé' }, { id: 'entretien', label: 'Entretien' }].map(item => (
                      <button key={item.id} onClick={() => { setFilterStatus(item.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2 text-sm ${filterStatus === item.id ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input type="number" placeholder="Score min..." value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="w-[130px] px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded shadow-sm text-sm text-gray-700 dark:text-gray-200" />

              <button onClick={() => setFilterFavorites(!filterFavorites)}
                className={`px-3 py-2 rounded text-sm font-bold shadow transition-colors ${filterFavorites
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700'}`}>
                {filterFavorites ? '★ Favoris' : '☆ Favoris'}
              </button>

              <div className="flex items-center gap-1.5 ml-auto">
                <ExportButton currentViewData={candidates} allData={candidates} signature={signature} />
                <DigitalSignatureButton onSaveSignature={setSignature} signature={signature} />
                <input type="text" placeholder="Rechercher..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded border border-gray-200 dark:border-gray-700" />
              </div>
            </div>

        {/* Table Design adapted from Offres */}
        <div className="bg-white dark:!bg-[#1a202c] shadow-md rounded-md my-2 overflow-hidden">
          <div className="overflow-x-auto dark-scrollbar">
            <table className="min-w-full shadow divide-y divide-gray-200 dark:divide-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:!bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                    Date de candidature
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Candidat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Offre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[100px]">
                    Score IA
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Compétences
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:!bg-[#1a202c] divide-y divide-gray-200 dark:divide-gray-700">
                {!loading && candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 light:bg-white dark:bg-[#1a202c] transition-colors">
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(candidate.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          {!isLecteur() && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleToggleFavorite(candidate.id); }}
                              className={`mr-2 transition-colors text-lg ${candidate.is_favorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                              title={candidate.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              {candidate.is_favorite ? '★' : '☆'}
                            </button>
                          )}
                          <span className="font-bold">{candidate.prenom} {candidate.nom}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {candidate.email}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {candidate.offre?.titre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`text-sm font-extrabold ${(candidate.score_ia || 0) >= 80 ? 'text-green-600' :
                            (candidate.score_ia || 0) >= 60 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                          {candidate.score_ia || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap max-w-[200px]">
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {candidate.competences || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${getStatusStyle(candidate.statut)}`}>
                          {candidate.statut === 'accepte' ? 'Accepté' : candidate.statut.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/recrutement/candidat/${candidate.id}`}
                            className="px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                            Voir
                          </Link>
                          {!isLecteur() && canAcceptRefuse() && (
                            <>
                              <button onClick={() => handleAccept(candidate.id)}
                                className="px-2 py-1 text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition">
                                ✓
                              </button>
                              <button onClick={() => handleReject(candidate.id)}
                                className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition">
                                ✗
                              </button>
                            </>
                          )}
                          {!isLecteur() && canDelete() && (
                            <button onClick={() => handleDelete(candidate.id)}
                              className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition">
                              Suppr.
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 text-sm italic">
                      {loading ? 'Chargement des candidatures...' : 'Aucun candidat trouvé pour ces filtres.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={meta.current_page || 1}
            totalPages={meta.last_page || 1}
            onPageChange={(page) => fetchCandidates(page)}
            indexOfFirstItem={((meta.current_page || 1) - 1) * (meta.per_page || 20)}
            indexOfLastItem={(meta.current_page || 1) * (meta.per_page || 20)}
            totalItems={meta.total || 0}
          />
        </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CandidatesList;