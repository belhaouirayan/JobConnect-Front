import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import StatCard from '../../Components/dashboard_components/StatCard';
import QuickAction from '../../Components/dashboard_components/QuickAction';
import CardHeader from '../../Components/dashboard_components/CardHeader';
import Badge from '../../Components/dashboard_components/Badge';
import CompatibilityChart from '../../Components/dashboard_components/CompatibilityChart';
import { useRecruitment } from '../../stores/RecruitmentStore';

const DashboardRecrt = () => {
  const { notifyScene } = useRecruitment();
  const [data, setData] = useState({
    stats: {},
    dernieresOffres: [],
    derniersCandidats: [],
    prochainsEntretiens: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('standard');
  const [candidatTab, setCandidatTab] = useState('standard');
  const [candidatStatus, setCandidatStatus] = useState('admis');
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest('/api/recrutement/dashboard');
      setData(result);
      if (notifyScene) {
        notifyScene('DASHBOARD_LOADED', result);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] dark:bg-gray-900 transition-colors duration-200">
        <div className="text-xl font-bold text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 font-inter dark:bg-gray-900 transition-colors duration-200 min-h-screen">
      <div className="max-w-full mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Tableau de bord
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Aperçu de vos offres et candidats
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatCard label="Offres actives" count={data.stats?.offres_actives} color="bg-blue-500" />
          <StatCard label="Total candidats" count={data.stats?.total_candidats} color="bg-cyan-500" />
          <StatCard label="En attente" count={data.stats?.candidats_en_attente} color="bg-amber-500" />
          <StatCard label="Entretiens" count={data.stats?.entretiens_planifies} color="bg-indigo-500" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <QuickAction label="Nouvelle offre" path="/recrutement/test" state={{ create: true }} primary={true} />
          <QuickAction label="Toutes les offres" path="/recrutement/test" />
          <QuickAction label="Candidats" path="/recrutement/candidats" />
          <QuickAction label="Entretiens" path="/recrutement/entretien" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Left Column: Offers & Chart */}
          <div className="space-y-4 sm:space-y-6">
            {/* Recent Offers */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
              <CardHeader title="Dernières offres" colorClass="bg-blue-500" />
              
              {/* Filter Buttons */}
              <div className="px-4 sm:px-6 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                {[
                  { id: 'standard', label: 'Standard', color: 'blue' },
                  { id: 'active', label: 'Actives', color: 'teal' },
                  { id: 'candidates', label: 'Top CV', color: 'indigo' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      activeTab === tab.id 
                      ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/30 scale-105` 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {(() => {
                  const now = new Date();
                  const isPublic = (o) => ['publiee', 'publiée', 'publié'].includes(o.statut?.toLowerCase());
                  
                  if (activeTab === 'standard') {
                    return data.dernieresOffres;
                  }
                  if (activeTab === 'active') {
                    return data.dernieresOffres?.filter(o => 
                      isPublic(o) && (!o.date_limite || new Date(o.date_limite) >= now)
                    );
                  }
                  if (activeTab === 'candidates') {
                    return data.dernieresOffres
                      ?.filter(o => isPublic(o))
                      .sort((a, b) => (b.candidats_count || 0) - (a.candidats_count || 0))
                      .slice(0, 6);
                  }
                  return [];
                })()?.map(offre => (
                  <div key={offre.id} className="p-3 sm:p-4 sm:px-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-gray-100 truncate">{offre.titre}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{offre.lieu} / {offre.type_contrat}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge status={offre.statut} />
                      {activeTab !== 'standard' && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md whitespace-nowrap">
                          {offre.candidats_count} Candidats
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(!data.dernieresOffres || data.dernieresOffres.length === 0) && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Aucune offre récente
                  </div>
                )}
              </div>
            </div>

            {/* Compatibility Chart */}
            <CompatibilityChart candidates={data.derniersCandidats} />
          </div>

          {/* Recent Candidates */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <CardHeader title="Derniers candidats" colorClass="bg-teal-500" />
            
            {/* Candidate Filter Buttons */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setCandidatTab('standard')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  candidatTab === 'standard' 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Standard
              </button>
              
              <div className="relative dropdown-container">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-0.5">
                  <button 
                    onClick={() => {
                      setCandidatTab('status');
                      setIsStatusOpen(!isStatusOpen);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
                      candidatTab === 'status' 
                      ? 'bg-amber-500 text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <span>{candidatTab === 'status' ? (candidatStatus === 'admis' ? 'ACCEPTÉ' : candidatStatus.replace('_', ' ').toUpperCase()) : 'Statut'}</span>
                    <span className={`text-[9px] transition-transform duration-300 inline-block font-bold ${isStatusOpen ? 'rotate-180' : ''}`}>V</span>
                  </button>
                </div>

                {isStatusOpen && (
                  <div className="absolute top-full mt-2 left-0 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    {[
                      { id: 'admis', label: 'Accepté', color: 'text-emerald-600 dark:text-emerald-400' },
                      { id: 'en_attente', label: 'En attente', color: 'text-amber-600 dark:text-amber-400' },
                      { id: 'refuse', label: 'Refusé', color: 'text-rose-600 dark:text-rose-400' },
                      { id: 'entretien', label: 'Entretien', color: 'text-indigo-600 dark:text-indigo-400' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setCandidatStatus(opt.id);
                          setCandidatTab('status');
                          setIsStatusOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between ${
                          candidatStatus === opt.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                        }`}
                      >
                        <span className={opt.color}>{opt.label}</span>
                        {candidatStatus === opt.id && <span className="ml-2 text-amber-500 font-black">X</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setCandidatTab('ia')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  candidatTab === 'ia' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700'
                }`}
              >
                IA Top 1
              </button>

              <button 
                onClick={() => setCandidatTab('interviews')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  candidatTab === 'interviews' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Entretiens
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {(() => {
                let displayCandidates = [];
                if (candidatTab === 'standard') {
                  displayCandidates = data.derniersCandidats?.slice(0, 10);
                } else if (candidatTab === 'status') {
                  displayCandidates = data.derniersCandidats
                    ?.filter(c => {
                      const s = c.statut?.toLowerCase().replace('é', 'e');
                      if (candidatStatus === 'admis') {
                        return s === 'admis' || s === 'accepted' || s === 'accepte';
                      }
                      return s === candidatStatus.toLowerCase();
                    })
                    .slice(0, 10);
                } else if (candidatTab === 'ia') {
                  const grouped = {};
                  data.derniersCandidats?.forEach(c => {
                    const offerId = c.offre_id || 'spontanee';
                    if (!grouped[offerId] || (c.score_ia || 0) > (grouped[offerId].score_ia || 0)) {
                      grouped[offerId] = c;
                    }
                  });
                  displayCandidates = Object.values(grouped).slice(0, 6);
                } else if (candidatTab === 'interviews') {
                   displayCandidates = data.prochainsEntretiens || [];
                }

                return displayCandidates;
              })()?.map(candidat => (
                <div key={candidat.id} className="p-3 sm:p-4 sm:px-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600 flex items-center justify-center text-blue-700 dark:text-gray-300 font-bold text-xs flex-shrink-0">
                      {candidat.candidat ? candidat.candidat.prenom?.[0] : candidat.prenom?.[0]}
                      {candidat.candidat ? candidat.candidat.nom?.[0] : candidat.nom?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-gray-100 truncate">
                        {candidat.candidat ? `${candidat.candidat.prenom} ${candidat.candidat.nom}` : `${candidat.prenom} ${candidat.nom}`}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate">
                        {candidatTab === 'interviews' && (candidat.date_entretien || candidat.interview_date)
                          ? `${new Date(candidat.date_entretien || candidat.interview_date).toLocaleDateString()} à ${new Date(candidat.date_entretien || candidat.interview_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
                          : (candidat.offre?.titre || (candidat.candidat?.offre?.titre) || "Candidature spontanée")}
                      </p>
                      {candidatTab === 'ia' && (
                        <div className="flex items-center mt-1">
                           <div className="w-20 bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full" style={{ width: `${candidat.score_ia || 0}%` }}></div>
                           </div>
                           <span className="ml-2 text-[10px] font-bold text-purple-600 dark:text-purple-400">{candidat.score_ia || 0}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {candidatTab === 'interviews' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {candidat.interview_type || 'Technique'}
                      </span>
                    )}
                    {candidat.statut && <Badge status={candidat.statut} />}
                  </div>
                </div>
              ))}
              {(!data.derniersCandidats || data.derniersCandidats.length === 0) && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Aucun candidat récent
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardRecrt;
