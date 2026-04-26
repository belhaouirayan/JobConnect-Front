import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiBriefcase, FiStar, FiCheck, FiX,
  FiCalendar, FiMessageSquare, FiTrendingUp, FiAlertCircle,
  FiEye, FiDownload, FiLoader, FiCheckCircle, FiFileText, FiClock,
  FiMail, FiPhone, FiMapPin, FiTrophy
} from 'react-icons/fi';
import {
  ArrowLeft, Eye, Download, Check, X, FileText,
  BrainCircuit, UserCheck, AlertTriangle, Star,
  TrendingUp, Loader2, RefreshCw, CheckCircle,
  Mail, Phone, MapPin, GraduationCap, Building2
} from 'lucide-react';
import { renderAsync } from 'docx-preview';
import { candidatApi } from '../../api/candidatApi';
import DocumentVault from '../../Components/Candidats/DocumentVault';

// ─── Score Ring Component ──────────────────────────────────────────────────
const ScoreRing = ({ score = 0 }) => {
  const size   = 120;
  const r      = size / 2 - 8;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  const color  = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="z-10 text-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-[10px] uppercase font-bold text-white/50 block">Compatibilité</span>
      </div>
    </div>
  );
};

// ─── Integration Modal (Dossier Employé) ───────────────────────────────────
const AcceptModal = ({ candidate, onConfirm, onClose, loading }) => {
  const [formData, setFormData] = useState({
    date_integration: '', heure_integration: '09:00', lieu_integration: '', message: '',
    date_naissance: '', sexe: 'M', cin: '', status_fami: 'Célibataire',
    adresse: '', ville: '', n_tele2: '', matricule: '', id_post: 1, id_pays: 1,
    id_manager: '', id_contrat: 1, salaire_horaire: '', solde_cong_total: '', droit_cong_mensuel: '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || '' : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date_integration || !formData.lieu_integration) return;
    onConfirm(candidate.id, formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
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

        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 px-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseAIData = (c) => {
  if (!c) return null;
  let ai = null;
  try { if (c.ia_commentaire?.trim().startsWith('{')) ai = JSON.parse(c.ia_commentaire); } catch (e) {}
  
  // Extract info from JSON or fallback
  const lastExp = ai?.experiences?.[0];
  const lastJob = lastExp ? `${lastExp.poste || lastExp.titre} @ ${lastExp.entreprise}` : 'Parcours non spécifié';
  const highDeg = ai?.formations?.[0]?.diplome || 'Non spécifié';

  return {
    ...c,
    ai,
    aiScore: c.score_ia || ai?.matching?.score || ai?.scoring?.score_global || 0,
    aiSummary: ai?.resume_professionnel || ai?.scoring?.synthese || "Analyse non disponible.",
    ptsForts: ai?.matching?.points_forts || [],
    ptsFaibles: ai?.matching?.points_faibles || [],
    verdict: ai?.matching?.verdict || '',
    level: ai?.matching?.niveau_compatibilite || '',
    skills: ai?.competences_techniques?.slice(0, 8) || [],
    lastJob,
    highDeg,
    city: ai?.ville || ai?.cv_data?.localisation || 'N/A',
  };
};

const FinalDecisionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [managerComment, setManagerComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptModal, setAcceptModal] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Preview universelle
  const [showPreview, setShowPreview] = useState(false);
  const [pLoading, setPLoading] = useState(false);
  const [pUrl, setPUrl] = useState(null);
  const [pType, setPType] = useState('pdf'); // 'pdf' | 'docx' | 'image' | 'text' | 'legacy'
  const [pTitle, setPTitle] = useState('Aperçu du Document');
  const docxRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await candidatApi.getById(id);
      const parsed = parseAIData(resp.data);
      setC(parsed);
      setManagerComment(parsed.notes || "");
    } catch (e) { showToast('error', 'Candidat introuvable.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);


  const handleHire = async (cid, data) => {
    setActionLoading(true);
    try {
      await candidatApi.recruter(cid, { ...data, manager_notes: managerComment });
      showToast('success', 'Recrutement validé !');
      setAcceptModal(null);
      loadData();
    } catch (e) { showToast('error', 'Erreur recrutement.'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!window.confirm("Refuser définitivement ce candidat ?")) return;
    setActionLoading(true);
    try {
      await candidatApi.refuser(id);
      showToast('success', 'Candidat refusé.');
      loadData();
    } catch (e) { showToast('error', 'Erreur refus.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Analyse en cours...</div>;
  if (!c) return <div className="p-12 text-center text-red-500 font-bold">Erreur de chargement.</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <Link to="/recrutement/decision-finale" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition text-sm font-bold">
            <ArrowLeft size={18} /> Retour à la liste
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">
            {c.nom.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{c.prenom} {c.nom}</h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">{c.offre?.titre || 'Poste non spécifié'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest">{c.statut}</span>
               <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest">{c.city}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN CONTENT (L - 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Executive Summary */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600"><BrainCircuit size={22}/></div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Synthèse IA Exécutive</h2>
               </div>
               
               <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-4 border-indigo-200 dark:border-indigo-800 pl-4 mb-8">
                 {c.aiSummary}
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle size={14}/> Points Forts</h3>
                     <ul className="space-y-2.5">
                        {c.ptsForts.map((t,i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {t}
                          </li>
                        ))}
                     </ul>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={14}/> Points d'Attention</h3>
                     <ul className="space-y-2.5">
                        {c.ptsFaibles.map((t,i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /> {t}
                          </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </section>

            {/* Interviews Timeline */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/40 rounded-lg text-purple-600"><FiMessageSquare size={22}/></div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Feedback des Entretiens</h2>
               </div>

               <div className="space-y-8 relative ml-3">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700" />
                  {c.entretiens?.length > 0 ? c.entretiens.map((e,idx) => (
                    <div key={idx} className="relative pl-10">
                       <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-purple-500 bg-white dark:bg-gray-800 z-10" />
                       <div className="p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-4">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Etape #{idx+1} · {e.type_entretien || 'Entretien'}</span>
                                {e.score_global && (
                                   <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-black rounded-lg">
                                      {e.score_global}%
                                   </span>
                                )}
                             </div>
                             <span className="text-[10px] font-bold text-gray-400 tracking-wider"><FiCalendar className="inline mr-1"/> {new Date(e.date_entretien).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2 leading-relaxed">
                             "{e.resume_manuel?.[0]?.content || e.resume || "Aucun commentaire détaillé n'a été saisi pour cette étape."}"
                          </p>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                       <FiClock className="mx-auto text-gray-300 mb-2" size={32} />
                       <p className="text-sm text-gray-400 italic font-medium">Aucun historique d'entretien trouvé.</p>
                    </div>
                  )}
               </div>
            </section>

            {/* Final Action Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600"><UserCheck size={28}/></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Validation Finale</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Confirmez le recrutement ou rejetez le candidat.</p>
                  </div>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <button onClick={() => setAcceptModal(c)} 
                    disabled={actionLoading || c.statut === 'embauche'}
                    className="flex-1 md:flex-none px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 tracking-wider">
                    RECRUTER
                  </button>
                  <button onClick={handleReject}
                    disabled={actionLoading || c.statut === 'embauche'}
                    className="flex-1 md:flex-none px-10 py-3 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-black rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all tracking-wider">
                    REFUSER
                  </button>
               </div>
            </div>
          </div>

          {/* SIDEBAR (R - 1/3) */}
          <div className="space-y-6">
            
            {/* Score Dashboard */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl p-8 text-white text-center space-y-6">
               <h2 className="text-sm font-black uppercase tracking-widest opacity-80">Compatibilité IA</h2>
               <ScoreRing score={c.aiScore} />
               <div className="space-y-2">
                  <p className="text-lg font-black tracking-tight">{c.verdict || "Verdict non défini"}</p>
                  <p className="text-xs font-medium opacity-70 uppercase tracking-widest">{c.level}</p>
               </div>
               
               <div className="pt-6 border-t border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Compétences Détectées</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {c.skills.map((s,i) => (
                      <span key={i} className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-bold border border-white/5 whitespace-nowrap">{s}</span>
                    ))}
                  </div>
               </div>
            </div>

            {/* Dossier Documentaire (Sidebar Mode) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <DocumentVault 
                candidate={c} 
                isSidebar={true}
                onPreview={async (data) => {
                  setPTitle(data.title || 'Aperçu');

                  // Lettre de motivation texte brut
                  if (data.type === 'text') {
                    setPType('text');
                    setPUrl(data.content);
                    setShowPreview(true);
                    return;
                  }

                  setPLoading(true);
                  setShowPreview(true);
                  setPType(data.type);

                  try {
                    const resp = await candidatApi.getGenericPreview(c.id, data.key, data.index);

                    if (data.type === 'docx') {
                      // Haute-fidélité pour Word
                      const ab = await resp.data.arrayBuffer();
                      setPUrl(ab);
                      setTimeout(async () => {
                        if (docxRef.current) {
                          docxRef.current.innerHTML = '';
                          await renderAsync(ab, docxRef.current, null, {
                            className: 'docx-isolated',
                            inWrapper: true,
                            ignoreLastRenderedPageBreak: false,
                            useBase64URL: true,
                            breakPages: true,
                            experimental: false,
                          });
                        }
                      }, 50);
                    } else if (data.type === 'image') {
                      const ext = (data.path?.split('.').pop() || 'jpeg').toLowerCase();
                      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                      setPUrl(URL.createObjectURL(new Blob([resp.data], { type: mimeType })));
                    } else {
                      setPUrl(URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' })));
                    }
                  } catch (e) {
                    console.error('Preview error:', e);
                    setPType('legacy');
                  } finally {
                    setPLoading(false);
                  }
                }}
              />
            </div>

            {/* Key Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-6">
               <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Informations Clés</h2>
               
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <div className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-400"><Building2 size={16}/></div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Dernière Expérience</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">{c.lastJob}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-400"><GraduationCap size={16}/></div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Plus Haut Diplôme</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">{c.highDeg}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-400"><Mail size={16}/></div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact Email</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 break-all">{c.email}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-400"><Phone size={16}/></div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Ligne Téléphone</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{c.telephone}</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

      </div>

      {/* Preview Modal Universelle */}
      {showPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-full h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 text-sm">
                <FileText className="text-indigo-500" size={18} />
                {pTitle}
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (typeof pUrl === 'string' && pUrl.startsWith('blob:')) URL.revokeObjectURL(pUrl);
                  setPUrl(null);
                }}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:rotate-90 transition-transform duration-300"
              >
                <FiX size={20}/>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-900">
              {pLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-900/90">
                  <Loader2 className="animate-spin text-indigo-600" size={40}/>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Chargement...</p>
                </div>
              )}

              {pType === 'text' && (
                <div className="w-full h-full p-10 overflow-auto bg-white dark:bg-gray-800">
                  <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900/40 p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm leading-loose text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap text-sm">
                    {pUrl}
                  </div>
                </div>
              )}

              {pType === 'image' && (
                <div className="w-full h-full flex items-center justify-center p-10 overflow-auto bg-gray-200 dark:bg-black/20">
                  <img
                    src={pUrl}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-xl border-4 border-white dark:border-gray-700"
                    alt={pTitle}
                  />
                </div>
              )}

              {pType === 'docx' && (
                <div className="w-full h-full overflow-auto bg-[#e2e8f0] flex justify-center">
                  <div
                    ref={docxRef}
                    className="mx-auto bg-white shadow-2xl"
                    style={{ minWidth: '800px', minHeight: '100%' }}
                  />
                  <style dangerouslySetInnerHTML={{ __html: `
                    .docx-isolated { margin: 0 auto !important; max-width: none !important; }
                    .docx-isolated img { display: inline-block !important; }
                  `}} />
                </div>
              )}

              {pType === 'pdf' && (
                <iframe src={pUrl} className="w-full h-full border-none" title={pTitle} />
              )}

              {pType === 'legacy' && (
                <div className="w-full h-full flex items-center justify-center p-10">
                  <div className="text-center flex flex-col items-center gap-4 p-10 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-900 shadow-sm max-w-sm">
                    <FiAlertCircle size={48} className="text-amber-500" />
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Aperçu non supporté</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[150] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-l-8 animate-in slide-in-from-right-8 font-black text-xs uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'
        }`}>
          {toast.type === 'success' ? <Check size={18}/> : <FiAlertCircle size={18}/>} {toast.message}
        </div>
      )}

      {/* Integration Modal */}
      {acceptModal && <AcceptModal candidate={acceptModal} onConfirm={handleHire} onClose={() => setAcceptModal(null)} loading={actionLoading} />}
    </div>
  );
};

export default FinalDecisionDetail;
