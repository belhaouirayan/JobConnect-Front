import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser, FiMail, FiCalendar, FiBriefcase, FiStar,
  FiSearch, FiChevronDown, FiEye, FiCheck, FiX,
  FiClock, FiLoader, FiAlertCircle, FiCheckCircle, FiBarChart2, FiTrash2
} from 'react-icons/fi';
import { candidatApi, offreApi } from '../../api/candidatApi';
import ExportButton from '../../Components/Offres/ExportButton';
import DigitalSignatureButton from '../../Components/Offres/SignatureButton';
import TabNavigation from './TabNavigation';
import Pagination from '../../Components/Pagination/Pagination';

// ─── Modal d'acceptation ────────────────────────────────────────────────────────
const AcceptModal = ({ candidate, onConfirm, onClose, loading }) => {
  const [formData, setFormData] = useState({
    // Integration basics
    date_integration: '',
    heure_integration: '09:00',
    lieu_integration: '',
    message: '',
    
    // Identity & Bio
    date_naissance: '',
    sexe: 'M',
    cin: '',
    status_fami: 'Célibataire',
    
    // Contact
    adresse: '',
    ville: '',
    n_tele2: '',
    
    // Professional
    matricule: '',
    id_post: 1,
    id_pays: 1,
    id_manager: '',
    id_contrat: 1,
    
    // Finance/Leave
    salaire_horaire: '',
    solde_cong_total: '',
    droit_cong_mensuel: '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || '' : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date_integration || !formData.lieu_integration) return;
    onConfirm(candidate.id, formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">

        {/* Header - Simple & Professional */}
        <div className="bg-slate-800 dark:bg-slate-900 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/10 rounded-lg">
                <FiBriefcase size={24} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Dossier d'Intégration Employé</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Recrutement : <span className="font-semibold text-white">{candidate.prenom} {candidate.nom}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Colonne 1 : Personnel */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                <FiUser className="text-blue-500" size={16} /> Informations Personnelles
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date de naissance</label>
                  <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sexe</label>
                    <select name="sexe" value={formData.sexe} onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">CIN</label>
                    <input type="text" name="cin" value={formData.cin} onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">État Civil</label>
                  <select name="status_fami" value={formData.status_fami} onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none">
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)">Marié(e)</option>
                    <option value="Divorcé(e)">Divorcé(e)</option>
                    <option value="Veuf/Veuve">Veuf/Veuve</option>
                  </select>
                </div>

                <div className="pt-4 space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contact</h4>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Adresse</label>
                    <input type="text" name="adresse" value={formData.adresse} onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ville</label>
                      <input type="text" name="ville" value={formData.ville} onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Téléphone 2</label>
                      <input type="text" name="n_tele2" value={formData.n_tele2} onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 2 : Professionnel */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                <FiBriefcase className="text-emerald-500" size={16} /> Poste & Contrat
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Intitulé du Poste</label>
                  <input type="text" readOnly value={candidate.offre?.titre || 'N/A'} 
                    className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-300 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Matricule</label>
                    <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} placeholder="EMPXXX"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contrat</label>
                    <select name="id_contrat" value={formData.id_contrat} onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none">
                      <option value="1">CDI</option>
                      <option value="2">CDD</option>
                      <option value="3">Stage</option>
                      <option value="4">Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Manager / Responsable</label>
                    <input type="text" name="id_manager" value={formData.id_manager} onChange={handleChange} placeholder="ID numérique (ex: 1)"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none" />
                </div>

                <div className="pt-4 space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Finance & Congés</h4>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Salaire Horaire (DH)</label>
                    <input type="number" name="salaire_horaire" value={formData.salaire_horaire} onChange={handleChange} placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Solde Congé</label>
                      <input type="number" name="solde_cong_total" value={formData.solde_cong_total} onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mensuel</label>
                      <input type="number" name="droit_cong_mensuel" value={formData.droit_cong_mensuel} onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 3 : Intégration */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                <FiCalendar className="text-blue-600" size={16} /> Plan d'Intégration
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl space-y-3 shadow-inner">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Date d'intégration *</label>
                    <input type="date" name="date_integration" required value={formData.date_integration} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg text-[13px] font-bold text-blue-900 dark:text-blue-50 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Heure</label>
                      <div className="relative">
                        <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={14} />
                        <input type="time" name="heure_integration" value={formData.heure_integration} onChange={handleChange}
                          className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-700 rounded-lg text-sm font-bold text-blue-900 dark:text-blue-50 outline-none appearance-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Lieu *</label>
                      <input type="text" name="lieu_integration" required value={formData.lieu_integration} onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-700 rounded-lg text-sm text-blue-900 dark:text-blue-50 font-semibold outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Message de Bienvenue</label>
                  <textarea name="message" rows={6} placeholder="Votre mot d'accueil personnalisé..." value={formData.message} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none outline-none focus:ring-2 focus:ring-blue-500/10" />
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <FiAlertCircle className="text-blue-500 mt-0.5" size={14} />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  La validation créera le profil employé et enverra automatiquement l'email d'intégration au candidat.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer - Simple & Clean */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 px-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4">
          <button type="button" onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            Annuler
          </button>
          
          <button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={loading || !formData.date_integration || !formData.lieu_integration}
            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center gap-2"
          >
            {loading ? <><FiLoader className="animate-spin" /> En cours...</> : <><FiCheck /> Valider le Recrutement</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Composant principal ────────────────────────────────────────────────────────
const FinalDecision = () => {
  const [candidates, setCandidates]         = useState([]);
  const [offres, setOffres]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filterOffer, setFilterOffer]       = useState('');
  const [filterStatus, setFilterStatus]     = useState(''); // Changed to '' (All) by default
  const [searchTerm, setSearchTerm]         = useState('');
  const [openDropdown, setOpenDropdown]     = useState(null);
  const [signature, setSignature]           = useState(null);
  const [toast, setToast]                   = useState(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [acceptModal, setAcceptModal]       = useState(null); 
  const [actionLoading, setActionLoading]   = useState(false);
  const [currentPage, setCurrentPage]       = useState(1);
  const PER_PAGE = 12;

  const activeTab    = 'decision';
  const setActiveTab = () => {};

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('savedSignature');
    if (saved) setSignature(saved);
  }, []);

  useEffect(() => {
    fetchOffres();
    fetchCandidates();
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [filterOffer, filterStatus, searchTerm, filterFavorites]);

  const fetchOffres = async () => {
    try {
      const resp = await offreApi.getAll();
      setOffres(resp.data.data || resp.data);
    } catch (e) { console.error(e); }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {
        offre_id: filterOffer,
        search: searchTerm,
        statut: filterStatus, // Use dynamic status filter
        favorites_only: filterFavorites ? 1 : 0,
      };
      const response = await candidatApi.getClassement(params);
      setCandidates(response.data.candidats || []);
      setCurrentPage(1); // reset to first page on filter change
    } catch (error) {
      console.error('Error fetching ranked candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Accepter → ouvrir le modal ──────────────────────────────────────────
  const handleAcceptClick = (candidate) => {
    setAcceptModal(candidate);
  };

  // ── Confirmer recrutement + envoi email ──────────────────────────────────
  const handleConfirmHire = async (id, formData) => {
    setActionLoading(true);
    
    // Nettoyage des données pour éviter les erreurs de validation backend
    const sanitizedData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Convert empty strings to null for nullable fields
      sanitizedData[key] = value === '' ? null : value;
    });

    // Special handling for numbers
    sanitizedData.id_manager = (formData.id_manager && !isNaN(formData.id_manager)) ? parseInt(formData.id_manager) : null;
    sanitizedData.salaire_horaire = parseFloat(formData.salaire_horaire) || 0;
    sanitizedData.solde_cong_total = parseFloat(formData.solde_cong_total) || 0;
    sanitizedData.droit_cong_mensuel = parseFloat(formData.droit_cong_mensuel) || 0;
    sanitizedData.id_contrat = parseInt(formData.id_contrat) || 1;
    sanitizedData.id_post = parseInt(formData.id_post) || 1;
    sanitizedData.id_pays = parseInt(formData.id_pays) || 1;

    try {
      await candidatApi.recruter(id, sanitizedData);
      showToast('success', '✅ Candidat recruté et email de bienvenue envoyé !');
      setAcceptModal(null);
      fetchCandidates();
    } catch (e) {
      console.error(e);
      let errorMsg = 'Erreur lors du recrutement.';
      
      if (e.response?.data?.errors) {
        // Collect all validation errors
        const errors = e.response.data.errors;
        errorMsg = Object.values(errors).flat().join(' | ');
      } else if (e.response?.data?.message) {
        errorMsg = e.response.data.message;
      }
      
      showToast('error', `❌ ${errorMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Refuser → email automatique ────────────────────────────────────────
  const handleReject = async (id) => {
    if (!window.confirm('Confirmer le refus ? Un email sera envoyé au candidat.')) return;
    try {
      await candidatApi.refuser(id);
      showToast('success', '✅ Candidat refusé et email de refus envoyé.');
      fetchCandidates();
    } catch (e) {
      console.error(e);
      showToast('error', '❌ Erreur lors du refus.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce candidat ? Cette action est irréversible.")) return;

    try {
      await candidatApi.delete(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      showToast('success', '✅ Candidat supprimé avec succès.');
    } catch (e) {
      console.error("Error deleting candidate:", e);
      showToast('error', '❌ Erreur lors de la suppression.');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const resp = await candidatApi.toggleFavorite(id);
      if (resp.data.candidat) {
        setCandidates(prev => prev.map(c => c.id === id ? resp.data.candidat : c));
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen px-6 py-2 text-gray-200 relative">
      <div className="max-w-full mx-auto space-y-4">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Action Bar */}
        <div className="flex items-center gap-1.5 py-1.5 flex-wrap lg:flex-nowrap">
          {/* Offres Dropdown */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'offre' ? null : 'offre')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold
                          shadow hover:opacity-90 transition-colors min-w-[120px] ${
                openDropdown === 'offre' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <FiUser size={14} className="text-emerald-200 flex-shrink-0" />
              <span className="flex-1 text-left truncate">
                {filterOffer
                  ? (offres.find(o => String(o.id) === String(filterOffer))?.titre || 'Offres')
                  : 'Offres'}
              </span>
              <FiChevronDown size={13} className={`text-white/70 flex-shrink-0 ${openDropdown === 'offre' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'offre' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-64 bg-gray-900/95
                              backdrop-blur-md border border-emerald-500/30 rounded-xl
                              shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 py-2 overflow-hidden">
                <button
                  onClick={() => { setFilterOffer(''); setOpenDropdown(null); }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    !filterOffer ? 'text-emerald-400 font-bold bg-emerald-500/10'
                                 : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Toutes les offres
                </button>
                <div className="max-h-60 overflow-y-auto">
                  {offres.map(offer => (
                    <button key={offer.id}
                      onClick={() => { setFilterOffer(offer.id); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 text-sm truncate ${
                        String(filterOffer) === String(offer.id)
                          ? 'text-emerald-400 font-bold bg-emerald-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {offer.titre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statut Dropdown (NEW) */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'statut' ? null : 'statut')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold shadow hover:opacity-90 transition-colors min-w-[120px] ${
                openDropdown === 'statut' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <FiCalendar size={14} className="text-emerald-200 flex-shrink-0" />
              <span className="flex-1 text-left">
                {filterStatus === '' ? 'Tous les statuts' : 
                 filterStatus === 'accepte' ? 'En attente' :
                 filterStatus === 'refuse' ? 'Refusé' :
                 filterStatus === 'embauche' ? 'Embauché' : 'Statuts'}
              </span>
              <FiChevronDown size={13} className={`text-white/70 flex-shrink-0 ${openDropdown === 'statut' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'statut' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-48 bg-gray-900/95 backdrop-blur-md border border-emerald-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 py-2 overflow-hidden">
                {[
                  { id: '', label: 'Tous' },
                  { id: 'accepte', label: 'En attente' },
                  { id: 'refuse', label: 'Refusé' },
                  { id: 'embauche', label: 'Embauché' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setFilterStatus(item.id); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      filterStatus === item.id ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favoris */}
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold
                        shadow hover:opacity-90 transition-colors ${
              filterFavorites
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            <FiStar size={14} fill={filterFavorites ? 'currentColor' : 'none'} />
            Favoris
          </button>

          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 ml-1">
            à décider : <span className="font-bold text-gray-900 dark:text-white">{candidates.length}</span>
          </p>

          <div className="flex items-center gap-1.5 ml-auto">
            <ExportButton currentViewData={candidates} allData={candidates} signature={signature} />
            <DigitalSignatureButton onSaveSignature={setSignature} signature={signature} />
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900
                           dark:text-gray-100 rounded border border-gray-200 dark:border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:!bg-[#1a202c] shadow-md rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:!bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase w-12">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offre</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Score IA</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-28">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date intégration</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:!bg-[#1a202c] divide-y divide-gray-200 dark:divide-gray-700">
                {!loading && candidates.length > 0 ? (
                  candidates
                    .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
                    .map((candidate, index) => (
                    <tr key={candidate.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 text-center text-sm font-bold text-gray-400">{index + 1}</td>

                      {/* Candidat */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFavorite(candidate.id)}
                            className={`transition-colors ${
                              candidate.is_favorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            <FiStar size={15} fill={candidate.is_favorite ? 'currentColor' : 'none'} />
                          </button>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {candidate.prenom} {candidate.nom}
                            </p>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <FiMail size={10} /> {candidate.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Offre */}
                      <td className="px-6 py-3">
                        <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          <FiBriefcase size={13} className="text-blue-400" />
                          {candidate.offre?.titre || 'N/A'}
                        </p>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          (candidate.score_ia || 0) >= 80 ? 'text-green-600' :
                          (candidate.score_ia || 0) >= 60 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {candidate.score_ia || 0}%
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                          candidate.statut === 'embauche'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : candidate.statut === 'refuse'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : candidate.statut === 'entretien'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {candidate.statut === 'accepte' ? 'En attente' : 
                           candidate.statut === 'embauche' ? 'Embauché' : 
                           candidate.statut === 'refuse'   ? 'Refusé'   : 
                           candidate.statut === 'entretien' ? 'Entretien prévu' : 
                           candidate.statut}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-center">
                        {candidate.date_integration ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              {new Date(candidate.date_integration).toLocaleDateString('fr-FR')}
                            </span>
                            {candidate.heure_integration && (
                              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                {candidate.heure_integration.substring(0, 5)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic font-medium">Non définie</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/recrutement/decision-detail/${candidate.id}`}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30
                                       rounded-lg transition" title="Voir l'analyse décisionnelle">
                            <FiEye size={17} />
                          </Link>
                          {(candidate.statut !== 'embauche' && candidate.statut !== 'refuse') && (
                            <>
                              <button
                                onClick={() => handleAcceptClick(candidate)}
                                className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30
                                           rounded-lg transition" title="Recruter">
                                <FiCheck size={17} />
                              </button>
                              <button onClick={() => handleReject(candidate.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="Refuser">
                                <FiX size={18} />
                              </button>
                              <button onClick={() => handleDelete(candidate.id)} className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition" title="Supprimer">
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                          {(candidate.statut === 'embauche' || candidate.statut === 'refuse') && (
                            <span className="text-[10px] text-gray-400 font-medium italic">Décision prise</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400 text-sm italic">
                      {loading ? 'Chargement...' : 'Aucun candidat pour la décision finale.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {candidates.length > PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(candidates.length / PER_PAGE)}
              onPageChange={setCurrentPage}
              indexOfFirstItem={(currentPage - 1) * PER_PAGE}
              indexOfLastItem={currentPage * PER_PAGE}
              totalItems={candidates.length}
            />
          )}
        </div>
      </div>

      {/* Toast - Rendered at the end to stabilize DOM reconciliation */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-4 py-3
                         rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <FiCheckCircle size={16} />
            : <FiAlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Modal acceptation - Rendered at the end */}
      {acceptModal && (
        <AcceptModal
          candidate={acceptModal}
          onConfirm={handleConfirmHire}
          onClose={() => setAcceptModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default FinalDecision;