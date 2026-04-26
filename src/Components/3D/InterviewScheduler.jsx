// src/Components/3D/InterviewScheduler.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiPlus, FiList, FiTrash2, FiMail,
  FiMapPin, FiVideo, FiPhone, FiAlertTriangle, FiClock, FiUser
} from 'react-icons/fi';
import { interviewService } from '../../services/interviewService';
import apiClient from '../../api/apiClient';
import { canDeleteInterview, canManageInterviews } from '../../utils/roleHelpers';
import EntretiensCalendar from '../Entretiens/EntretiensCalendar';
import './InterviewScheduler.css';

const TYPE_ICONS = { visio: FiVideo, 'téléphonique': FiPhone, technique: FiMapPin, présentiel: FiMapPin };
const TYPE_COLORS = {
  visio: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  'téléphonique': 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300',
  technique: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  présentiel: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
};

const InterviewScheduler = () => {
  const [tab, setTab] = useState('calendar');
  const [interviews, setInterviews] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    candidat_id: '', date_entretien: '', heure_fin: '', type: 'technique',
    lieu: '', lien_visio: '', recruiter_id: '', notes: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [interviewData, candidatsRes] = await Promise.all([
        interviewService.getAll(),
        apiClient.get('/candidats', { params: { per_page: 200, all: true } }),
      ]);
      setInterviews(interviewData.entretiens || []);
      setTimeline(interviewData.timeline || []);
      setRecruiters(interviewData.recruiters || []);
      const cands = candidatsRes.data?.data || candidatsRes.data || [];
      setCandidates(Array.isArray(cands) ? cands : []);
    } catch (err) { console.error('Fetch error:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateField = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if ((field === 'date_entretien' || field === 'recruiter_id' || field === 'heure_fin') && updated.date_entretien) {
      checkConflict(updated);
    }
  };

  const checkConflict = async (data) => {
    if (!data.date_entretien) return;
    try {
      const result = await interviewService.checkConflict({
        date_entretien: data.date_entretien,
        heure_fin: data.heure_fin || null,
        recruiter_id: data.recruiter_id || null,
      });
      setConflict(result.conflict ? result.message : null);
    } catch { setConflict(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidat_id || !form.date_entretien || !form.type) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.type !== 'visio') delete payload.lien_visio;
      Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k]; });
      await interviewService.create(payload);
      setForm(emptyForm);
      setConflict(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Erreur lors de la planification');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet entretien ?")) return;
    try { await interviewService.destroy(id); fetchData(); }
    catch (err) { alert(err.message || 'Erreur'); }
  };

  const handleResend = async (id) => {
    try {
      const result = await interviewService.resendEmail(id);
      alert(result.message || 'Email renvoyé');
    } catch (err) { alert(err.message || 'Erreur'); }
  };

  const formatDate = (str) => {
    if (!str) return '—';
    try { return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); }
    catch { return str; }
  };

  const formatTime = (str) => {
    if (!str) return '';
    try {
      const d = new Date(str);
      return isNaN(d.getTime()) ? str : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return str; }
  };

  // Sort upcoming first
  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date_entretien) - new Date(b.date_entretien));
  const upcoming = sortedTimeline.filter(e => new Date(e.date_entretien) >= new Date());
  const past = sortedTimeline.filter(e => new Date(e.date_entretien) < new Date());

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCalendar className="text-indigo-500" /> Planification des Entretiens
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {upcoming.length} entretien{upcoming.length !== 1 ? 's' : ''} à venir
          </p>
        </div>
        {canManageInterviews() && (
          <button onClick={() => setShowForm(!showForm)} className="is-submit-btn">
            <FiPlus size={16} /> {showForm ? 'Fermer' : 'Planifier'}
          </button>
        )}
      </div>

      {/* ── Schedule Form ── */}
      <AnimatePresence>
        {showForm && canManageInterviews() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouvel entretien</h3>
              <div className="is-form-grid">
                <div className="is-form-group">
                  <label className="is-form-label text-gray-700 dark:text-gray-300">Candidat *</label>
                  <select value={form.candidat_id} onChange={e => updateField('candidat_id', e.target.value)}
                    className="is-form-select bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" required>
                    <option value="">Sélectionner...</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {c.offre?.titre || 'Sans offre'}</option>)}
                  </select>
                </div>
                <div className="is-form-group">
                  <label className="is-form-label text-gray-700 dark:text-gray-300">Date & heure *</label>
                  <input type="datetime-local" value={form.date_entretien} onChange={e => updateField('date_entretien', e.target.value)}
                    className="is-form-input bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" required />
                </div>
                <div className="is-form-group">
                  <label className="is-form-label text-gray-700 dark:text-gray-300">Heure de fin</label>
                  <input type="time" value={form.heure_fin} onChange={e => updateField('heure_fin', e.target.value)}
                    className="is-form-input bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div className="is-form-group">
                  <label className="is-form-label text-gray-700 dark:text-gray-300">Type *</label>
                  <select value={form.type} onChange={e => updateField('type', e.target.value)}
                    className="is-form-select bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" required>
                    <option value="technique">Technique</option>
                    <option value="visio">Visio</option>
                    <option value="téléphonique">Téléphonique</option>
                    <option value="présentiel">Présentiel</option>
                  </select>
                </div>
                {form.type === 'visio' ? (
                  <div className="is-form-group">
                    <label className="is-form-label text-gray-700 dark:text-gray-300">Lien visio</label>
                    <input type="url" value={form.lien_visio} onChange={e => updateField('lien_visio', e.target.value)} placeholder="https://meet.google.com/..."
                      className="is-form-input bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                  </div>
                ) : (
                  <div className="is-form-group">
                    <label className="is-form-label text-gray-700 dark:text-gray-300">Lieu</label>
                    <input type="text" value={form.lieu} onChange={e => updateField('lieu', e.target.value)} placeholder="Bureau 301, Siège..."
                      className="is-form-input bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                  </div>
                )}
                <div className="is-form-group">
                  <label className="is-form-label text-gray-700 dark:text-gray-300">Recruteur</label>
                  <select value={form.recruiter_id} onChange={e => updateField('recruiter_id', e.target.value)}
                    className="is-form-select bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option value="">Moi-même</option>
                    {recruiters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="is-form-group mt-4">
                <label className="is-form-label text-gray-700 dark:text-gray-300">Notes</label>
                <textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Notes pour l'entretien..."
                  className="is-form-textarea bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
              </div>

              {conflict && (
                <div className="is-conflict-warning bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                  <FiAlertTriangle size={16} /> {conflict}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button type="submit" className="is-submit-btn" disabled={submitting || !!conflict}>
                  {submitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <FiPlus size={16} />}
                  {submitting ? 'Planification...' : 'Planifier l\'entretien'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setConflict(null); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div className="is-tabs bg-gray-100 dark:bg-gray-800 inline-flex">
        <button className={`is-tab-btn ${tab === 'calendar' ? 'active' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          onClick={() => setTab('calendar')}><FiCalendar className="inline mr-1.5" size={14} /> Calendrier</button>
        <button className={`is-tab-btn ${tab === 'list' ? 'active' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          onClick={() => setTab('list')}><FiList className="inline mr-1.5" size={14} /> Liste</button>
      </div>

      {/* ── Calendar View ── */}
      {tab === 'calendar' && (
        <EntretiensCalendar data={timeline} onEventClick={(evt) => {
          window.location.href = `/recrutement/candidat/${evt.candidat_id}`;
        }} />
      )}

      {/* ── List View ── */}
      {tab === 'list' && (
        <div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="dp-skeleton h-20 w-full rounded-xl" />
            ))}</div>
          ) : upcoming.length === 0 && past.length === 0 ? (
            <div className="text-center py-16">
              <FiCalendar className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun entretien planifié</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    À venir ({upcoming.length})
                  </h3>
                  <div className="is-interview-list">
                    {upcoming.map((e, i) => {
                      const TypeIcon = TYPE_ICONS[e.type?.toLowerCase()] || FiMapPin;
                      const typeColor = TYPE_COLORS[e.type?.toLowerCase()] || TYPE_COLORS.technique;
                      return (
                        <motion.div key={e.id} className="is-interview-card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                          <div className="is-interview-time bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                            <span className="date">{formatDate(e.date_entretien)}</span>
                            <span className="time">{e.time || formatTime(e.date_entretien)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              <FiUser className="inline mr-1" size={13} />{e.candidat || 'Candidat'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{e.offre || '—'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`is-type-badge ${typeColor}`}><TypeIcon size={10} /> {e.type}</span>
                              {e.lieu && e.lieu !== '—' && <span className="text-xs text-gray-400 truncate">{e.lieu}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleResend(e.id)} className="is-resend-btn text-indigo-500" title="Renvoyer l'email">
                              <FiMail size={16} />
                            </button>
                            {canDeleteInterview() && (
                              <button onClick={() => handleDelete(e.id)} className="is-delete-btn text-red-400" title="Supprimer">
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Passés ({past.length})
                  </h3>
                  <div className="is-interview-list opacity-60">
                    {past.slice(0, 10).map((e) => {
                      const TypeIcon = TYPE_ICONS[e.type?.toLowerCase()] || FiMapPin;
                      const typeColor = TYPE_COLORS[e.type?.toLowerCase()] || TYPE_COLORS.technique;
                      return (
                        <div key={e.id} className="is-interview-card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="is-interview-time bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <span className="date">{formatDate(e.date_entretien)}</span>
                            <span className="time">{e.time || formatTime(e.date_entretien)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{e.candidat || 'Candidat'}</p>
                            <span className={`is-type-badge ${typeColor}`}><TypeIcon size={10} /> {e.type}</span>
                          </div>
                          {canDeleteInterview() && (
                            <button onClick={() => handleDelete(e.id)} className="is-delete-btn text-red-400" title="Supprimer">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;
