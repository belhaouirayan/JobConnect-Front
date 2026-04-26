// src/Components/3D/DecisionPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/apiClient';
import { canAcceptRefuse, canDelete, canHire, isLecteur, isDepartmentLocked, getUserDepartment } from '../../utils/roleHelpers';
import './DecisionPanel.css';

// ── Status color map ──
const STATUS_CONFIG = {
  en_attente:  { label: 'En attente',  bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  accepte:     { label: 'Accepté',     bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-800 dark:text-green-300' },
  refuse:      { label: 'Refusé',      bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-800 dark:text-red-300' },
  entretien:   { label: 'Entretien',   bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-800 dark:text-blue-300' },
  embauche:    { label: 'Embauché',    bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
  admis:       { label: 'Admis',       bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300' },
  non_admis:   { label: 'Non admis',   bg: 'bg-gray-100 dark:bg-gray-700/30',   text: 'text-gray-800 dark:text-gray-300' },
};

const getScoreClass = (score) => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score > 0) return 'low';
  return 'none';
};

const DecisionPanel = () => {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1, per_page: 20 });
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statut, setStatut] = useState('');
  const [offreId, setOffreId] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  const isReadOnly = isLecteur();

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/recrutement/dashboard');
      setStats(data.stats);
    } catch (err) {
      console.error('Dashboard stats error:', err);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20, sort };
      if (search.trim()) params.search = search.trim();
      if (keyword.trim()) params.keyword = keyword.trim();
      if (statut) params.statut = statut;
      if (offreId) params.offre_id = offreId;

      const { data } = await apiClient.get('/candidats', { params });
      let fetchedCandidates = data.data || [];
      if (isDepartmentLocked() && getUserDepartment()) {
        const userDept = getUserDepartment();
        fetchedCandidates = fetchedCandidates.filter(c => c.offre?.departement === userDept || c.job?.department === userDept || c.offre?.department === userDept);
      }
      setCandidates(fetchedCandidates);
      setMeta(data.meta || { total: 0, current_page: 1, last_page: 1, per_page: 20 });
      if (data.filters?.offres) setOffres(data.filters.offres);
    } catch (err) {
      console.error('Candidates fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, keyword, statut, offreId, sort]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => { setPage(1); }, 400));
  };

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await apiClient.post(`/candidats/${id}/accepter`);
      fetchCandidates(); fetchStats();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'acceptation');
    } finally { setActionLoading(null); }
  };

  const handleRefuse = async (id) => {
    if (!window.confirm('Refuser ce candidat ? Un email de refus sera envoyé automatiquement.')) return;
    setActionLoading(id);
    try {
      await apiClient.post(`/candidats/${id}/refuser`);
      fetchCandidates(); fetchStats();
    } catch (err) {
      alert(err.message || 'Erreur lors du refus');
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement ce candidat et tous ses documents ?')) return;
    setActionLoading(id);
    try {
      await apiClient.delete(`/candidats/${id}`);
      fetchCandidates(); fetchStats();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally { setActionLoading(null); }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await apiClient.patch(`/candidats/${id}/toggle-favorite`);
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, is_favorite: !c.is_favorite } : c));
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const resetFilters = () => {
    setSearch(''); setKeyword(''); setStatut(''); setOffreId(''); setSort('latest'); setPage(1);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: (i) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' },
    }),
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Panneau de Décision
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gérez les candidatures, acceptez ou refusez les profils
          {isReadOnly && <span className="ml-2 text-xs font-bold text-amber-500">(Mode lecture seule)</span>}
        </p>
      </div>

      {/* Stats Strip */}
      <div className="dp-stats-strip">
        {[
          { label: 'Offres actives', key: 'offres_actives', color: 'bg-blue-500' },
          { label: 'Total candidats', key: 'total_candidats', color: 'bg-cyan-500' },
          { label: 'En attente', key: 'candidats_en_attente', color: 'bg-amber-500' },
          { label: 'Entretiens planifiés', key: 'entretiens_planifies', color: 'bg-emerald-500' },
        ].map((s, idx) => (
          <motion.div
            key={s.key}
            className="dp-stat-card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-10 rounded-full ${s.color}`} />
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                  {stats?.[s.key] ?? <span className="dp-skeleton inline-block w-10 h-7" />}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="dp-filters-bar bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text" value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher nom, email, téléphone..."
            className="dp-filter-input bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 w-full"
          />
        </div>
        <div className="relative min-w-[160px]">
          <input
            type="text" value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Compétence clé..."
            className="dp-filter-input bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 w-full"
          />
        </div>
        <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }}
          className="dp-filter-select bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="accepte">Accepté</option>
          <option value="entretien">Entretien</option>
          <option value="refuse">Refusé</option>
          <option value="embauche">Embauché</option>
        </select>
        <select value={offreId} onChange={(e) => { setOffreId(e.target.value); setPage(1); }}
          className="dp-filter-select bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
          <option value="">Toutes les offres</option>
          {offres.map(o => <option key={o.id} value={o.id}>{o.titre}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="dp-filter-select bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
          <option value="latest">Plus récents</option>
          <option value="score_desc">Score IA ↓</option>
          <option value="score_asc">Score IA ↑</option>
        </select>
        <button onClick={resetFilters}
          className="dp-action-btn bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-xs">
          Reset
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {meta.total} candidat{meta.total !== 1 ? 's' : ''} trouvé{meta.total !== 1 ? 's' : ''}
          {meta.last_page > 1 && ` — Page ${meta.current_page}/${meta.last_page}`}
        </p>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="dp-candidate-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dp-candidate-card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="dp-skeleton w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="dp-skeleton h-5 w-3/4" />
                  <div className="dp-skeleton h-4 w-1/2" />
                  <div className="dp-skeleton h-3 w-full mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-4xl font-extrabold mb-2">∅</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-bold">Aucun candidat trouvé</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="dp-candidate-grid">
            {candidates.map((c, i) => {
              const statusCfg = STATUS_CONFIG[c.statut] || STATUS_CONFIG.en_attente;
              const scoreClass = getScoreClass(c.score_ia || 0);
              const isActioning = actionLoading === c.id;

              return (
                <motion.div
                  key={c.id}
                  className="dp-candidate-card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  variants={cardVariants} custom={i}
                  initial="hidden" animate="visible" exit="exit" layout
                >
                  {/* Header: Score + Name + Status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`dp-score-badge ${scoreClass}`}>
                      {c.score_ia || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                          {c.prenom} {c.nom}
                        </h3>
                        {!isReadOnly && (
                          <button
                            className="dp-fav-btn"
                            onClick={() => handleToggleFavorite(c.id)}
                            title={c.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <span className={c.is_favorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                              {c.is_favorite ? '★' : '☆'}
                            </span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.email}</p>
                      {c.telephone && <p className="text-xs text-gray-400 dark:text-gray-500">{c.telephone}</p>}
                    </div>
                    <span className={`dp-status-badge ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Job offer */}
                  {c.offre && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                        {c.offre.titre}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {c.competences && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {c.competences.split(',').slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold">
                          {skill.trim()}
                        </span>
                      ))}
                      {c.competences.split(',').length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold">
                          +{c.competences.split(',').length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Interviews count */}
                  {c.entretiens_count > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-bold">
                      {c.entretiens_count} entretien{c.entretiens_count > 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 flex-wrap">
                    {!isReadOnly && canAcceptRefuse() && c.statut !== 'embauche' && c.statut !== 'refuse' && (
                      <>
                        <button
                          className="dp-action-btn accept"
                          onClick={() => handleAccept(c.id)}
                          disabled={isActioning}
                        >
                          ✓ {c.statut === 'accepte' || c.statut === 'entretien' ? 'Embaucher' : 'Accepter'}
                        </button>
                        <button
                          className="dp-action-btn refuse"
                          onClick={() => handleRefuse(c.id)}
                          disabled={isActioning}
                        >
                          ✗ Refuser
                        </button>
                      </>
                    )}

                    <a href={`/recrutement/candidat/${c.id}`}
                      className="dp-action-btn bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
                      Détail →
                    </a>

                    {!isReadOnly && canDelete() && (
                      <button
                        className="dp-action-btn delete ml-auto"
                        onClick={() => handleDelete(c.id)}
                        disabled={isActioning}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  {/* Loading overlay */}
                  {isActioning && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="dp-pagination border-gray-200 dark:border-gray-700">
          <button
            className="dp-page-btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold"
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
          >
            ←
          </button>
          {Array.from({ length: Math.min(5, meta.last_page) }).map((_, i) => {
            let pageNum;
            if (meta.last_page <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= meta.last_page - 2) pageNum = meta.last_page - 4 + i;
            else pageNum = page - 2 + i;
            return (
              <button key={pageNum}
                className={`dp-page-btn ${page === pageNum ? 'active' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setPage(pageNum)}>
                {pageNum}
              </button>
            );
          })}
          <button
            className="dp-page-btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold"
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionPanel;
