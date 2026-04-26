import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { renderAsync } from 'docx-preview';
import { candidatApi } from '../../api/candidatApi';
import DocumentVault from '../../Components/Candidats/DocumentVault';
import { canAcceptRefuse, isLecteur, isDepartmentLocked, getUserDepartment } from '../../utils/roleHelpers';

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score = 0 }) => {
  const size   = 120;
  const r      = size / 2 - 8;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  const color  = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center mx-auto"
      style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="z-10 text-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-sm text-white/70 block">/100</span>
      </div>
    </div>
  );
};

// ─── Parse ia_commentaire ─────────────────────────────────────────────────────
const parseAIData = (candidatRaw) => {
  let aiData = null;

  try {
    if (candidatRaw.ia_commentaire?.trim().startsWith('{')) {
      aiData = JSON.parse(candidatRaw.ia_commentaire);
    }
  } catch (e) {
    console.error('Failed to parse ia_commentaire JSON', e);
  }

  return {
    ...candidatRaw,
    aiData,
    // Score
    aiScore: candidatRaw.score_ia || aiData?.matching?.score || aiData?.scoring?.score_global || 0,
    // Résumé — jamais afficher le JSON brut
    aiSummary: aiData?.resume_professionnel || aiData?.scoring?.synthese || "Résumé non disponible pour ce candidat.",
    // Compétences
    skills: aiData?.competences_techniques?.length > 0
      ? aiData.competences_techniques
      : (candidatRaw.competences ? candidatRaw.competences.split(',').map(s => s.trim()).filter(Boolean) : []),
    softSkills:    aiData?.soft_skills || [],
    langues:       aiData?.langues || [],
    // Matching
    pointsForts:   aiData?.matching?.points_forts || [],
    pointsFaibles: aiData?.matching?.points_faibles || [],
    missingSkills: aiData?.matching?.competences_manquantes || [],
    recommandation:aiData?.matching?.recommandation || '',
    verdict:       aiData?.matching?.verdict || '',
    niveauCompatibilite: aiData?.matching?.niveau_compatibilite || '',
    // Scoring détaillé
    scoringDetails: aiData?.scoring?.details || null,
    scoringSynthese: aiData?.scoring?.synthese || '',
    // Infos extraites
    annees_experience: aiData?.annees_experience ?? null,
    niveau:            aiData?.niveau || '',
    formations:        aiData?.formations || [],
    experiences:       aiData?.experiences || [],
    // Missing skills détaillés
    missingSkillsDetail: aiData?.missing_skills?.competences_manquantes || [],
    conseilRecruteur:    aiData?.missing_skills?.conseil_recruteur || '',
  };
};

// ─── Composant principal ──────────────────────────────────────────────────────
const CandidateDetail = () => {
  const { id }                          = useParams();
  const [candidate, setCandidate]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('Aperçu du Document');
  const [toast, setToast]               = useState(null);
  const [previewType, setPreviewType]   = useState('pdf'); // 'pdf' | 'docx' | 'image' | 'text' | 'legacy'
  const docxContainerRef = React.useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCandidate = async () => {
    setLoading(true);
    try {
      const response = await candidatApi.getById(id);
      setCandidate(parseAIData(response.data));
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCandidate(); }, [id]);


  // Relancer l'analyse IA manuellement
  const handleIAAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const resp = await candidatApi.analyserIA(id);
      setCandidate(parseAIData(resp.data.candidat));
    } catch (e) {
      console.error(e);
      alert("L'analyse IA a échoué.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAccept = async () => {
    if (!window.confirm("Confirmer l'acceptation ?")) return;
    try {
      await candidatApi.accepter(id);
      setCandidate(prev => ({ ...prev, statut: 'accepte' }));
      showToast('success', 'Candidat validé.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Erreur lors de la validation.');
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Confirmer le refus ? Un e-mail sera envoyé au candidat.")) return;
    try {
      await candidatApi.refuser(id);
      setCandidate(prev => ({ ...prev, statut: 'refuse' }));
      showToast('success', 'Candidat refusé et e-mail envoyé.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Erreur lors du refus.');
    }
  };

  const handlePending = async () => {
    if (!window.confirm("Mettre ce candidat en attente ?")) return;
    try {
      await candidatApi.update(id, { statut: 'en_attente' });
      setCandidate(prev => ({ ...prev, statut: 'en_attente' }));
      showToast('success', 'Candidat mis en attente.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Erreur lors de la mise en attente.');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const resp = await candidatApi.toggleFavorite(id);
      if (resp.data.candidat) {
        setCandidate(prev => ({ ...prev, is_favorite: resp.data.candidat.is_favorite }));
        showToast('success', resp.data.message);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showToast('error', 'Erreur lors de la mise à jour du favori.');
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center gap-3 text-gray-500">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" /> Chargement...
    </div>
  );
  if (!candidate) return (
    <div className="p-8 text-center text-red-500 font-bold">Candidat non trouvé.</div>
  );

  // Department Lock Guard
  if (isDepartmentLocked() && candidate.job && candidate.job.departement) {
    const userDept = getUserDepartment();
    if (userDept && candidate.job.departement !== userDept) {
      return (
        <div className="p-8 text-center text-red-500 font-bold">
          Accès refusé : Ce candidat appartient à un autre département ({candidate.job.departement}).
        </div>
      );
    }
  }

  const hasAI = !!candidate.aiData;

  return (
    <div className="p-6 min-h-screen relative">
      <div className="max-w-full mx-auto space-y-6">

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <div className="flex justify-between items-center">
          <Link to="/recrutement/candidats"
            className="text-gray-500 hover:text-gray-700
                       dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-bold">
            ← Retour
          </Link>
        </div>

        {/* ── Bandeau IA manquant ───────────────────────────────────────── */}
        {!hasAI && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30
                          border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
            <span className="font-bold text-lg flex-shrink-0">⚠</span>
            <p className="text-sm">
              L'analyse IA n'a pas encore été effectuée.
              <button onClick={handleIAAnalysis} disabled={isAnalyzing}
                className="ml-2 underline font-bold hover:no-underline">
                Lancer l'analyse maintenant
              </button>
            </p>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {!isLecteur() && canAcceptRefuse() && (
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <button onClick={handleReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600
                         dark:bg-red-900/20 dark:text-red-400 border border-red-200
                         dark:border-red-800 rounded-lg text-sm font-bold
                         hover:bg-red-100 dark:hover:bg-red-900/40 transition">
              ✗ Refuser
            </button>
            <button onClick={handlePending}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600
                         dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200
                         dark:border-amber-800 rounded-lg text-sm font-bold
                         hover:bg-amber-100 dark:hover:bg-amber-900/40 transition">
              ⏳ En attente
            </button>
            <button onClick={handleAccept}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600
                         dark:bg-green-900/20 dark:text-green-400 border border-green-200
                         dark:border-green-800 rounded-lg text-sm font-bold
                         hover:bg-green-100 dark:hover:bg-green-900/40 transition">
              ✓ Accepter pour Entretien
            </button>
          </div>
        )}

        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                        border-gray-100 dark:border-gray-700 p-6
                        flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50
                          text-blue-600 dark:text-blue-400 flex items-center justify-center
                          font-bold text-3xl shrink-0 uppercase">
            {candidate.nom.charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                    {candidate.prenom} {candidate.nom.toUpperCase()}
                  </h1>
                  <button 
                    onClick={handleToggleFavorite}
                    className={`transition-all transform hover:scale-110 text-xl ${candidate.is_favorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                    title={candidate.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    {candidate.is_favorite ? '★' : '☆'}
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {candidate.offre?.titre || 'Poste non spécifié'}
                  {candidate.niveau && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                                     bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {candidate.niveau}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm text-gray-500">
                  Postulé le {new Date(candidate.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                  candidate.statut === 'accepte'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {candidate.statut}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 pt-1">
              <span>{candidate.email}</span>
              {candidate.telephone && <span>{candidate.telephone}</span>}
              {candidate.annees_experience !== null && (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {candidate.annees_experience} an(s) d'expérience
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne principale ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Résumé IA */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                            border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 font-bold text-lg">⟠</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Résumé IA
                </h2>
                {hasAI && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold
                                   bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    ✓ Analysé
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                {candidate.aiSummary}
              </p>

              {/* Conseil recruteur */}
              {candidate.conseilRecruteur && (
                <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30
                                border border-blue-100 dark:border-blue-900">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-bold">Conseil recruteur : </span>
                    {candidate.conseilRecruteur}
                  </p>
                </div>
              )}
            </div>

            {/* Résumés des Entretiens (Manuels) */}
            {candidate.entretiens && candidate.entretiens.some(e => e.resume_manuel || e.resume) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                              border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-purple-500 font-bold text-lg">📋</span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Résumés des Entretiens
                  </h2>
                </div>
                <div className="space-y-4">
                  {candidate.entretiens
                    .filter(e => e.resume_manuel || e.resume)
                    .map((e, index) => (
                      <div key={e.id || index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Entretien du {new Date(e.date_entretien || e.date).toLocaleDateString()}
                          </span>
                          {e.score_global && (
                            <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                              Score: {e.score_global}/100
                            </span>
                          )}
                        </div>
                        {/* Affichage des notes */}
                        <div className="space-y-2 mt-1">
                          {Array.isArray(e.resume_manuel) ? (
                            e.resume_manuel.map((note, nIdx) => (
                              <div key={nIdx} className="p-2 bg-white/50 dark:bg-gray-800/30 rounded border border-gray-100 dark:border-gray-700">
                                <span className="text-[10px] font-bold text-blue-500 block mb-1">{note.created_at}</span>
                                <p className="text-gray-700 dark:text-gray-300 text-sm italic">{note.content}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap italic">
                              {e.resume_manuel || e.resume}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Compétences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                            border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                Analyse des Compétences
              </h2>
              <div className="space-y-5">

                {/* Compétences techniques */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                                 mb-2.5 flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> Compétences détectées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.length > 0
                      ? candidate.skills.map(skill => (
                        <span key={skill}
                          className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700
                                     dark:text-green-400 border border-green-200 dark:border-green-800
                                     rounded-lg text-sm">
                          {skill}
                        </span>
                      ))
                      : <span className="text-gray-400 italic text-sm">Aucune compétence détectée</span>
                    }
                  </div>
                </div>

                {/* Compétences manquantes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                                 mb-2.5 flex items-center gap-2">
                    <span className="text-red-500 font-bold">✗</span> Compétences manquantes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missingSkillsDetail.length > 0
                      ? candidate.missingSkillsDetail.map((item, i) => (
                        <span key={i}
                          className={`px-3 py-1 rounded-lg text-sm border font-medium ${
                            item.priorite === 'Critique'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                              : item.priorite === 'Importante'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                          }`}>
                          {item.competence}
                          <span className="ml-1 text-[10px] opacity-70">({item.priorite})</span>
                        </span>
                      ))
                      : candidate.missingSkills.map((skill, i) => (
                        <span key={i}
                          className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700
                                     dark:text-red-400 border border-red-200 dark:border-red-800
                                     rounded-lg text-sm">
                          {skill}
                        </span>
                      ))
                    }
                    {candidate.missingSkillsDetail.length === 0 && candidate.missingSkills.length === 0 && (
                      <span className="text-gray-400 italic text-sm">Aucune compétence manquante critique</span>
                    )}
                  </div>
                </div>

                {/* Soft skills */}
                {candidate.softSkills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                                   mb-2.5 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">●</span> Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.softSkills.map(skill => (
                        <span key={skill}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700
                                     dark:text-blue-400 border border-blue-200 dark:border-blue-800
                                     rounded-lg text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {candidate.langues.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                                   mb-2.5">🌐 Langues</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.langues.map((l, idx) => {
                        const label = typeof l === 'object' 
                          ? `${l.langue}${l.niveau ? ` (${l.niveau})` : ''}`
                          : l;
                        return (
                          <span key={idx}
                            className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700
                                       dark:text-purple-400 border border-purple-200 dark:border-purple-800
                                       rounded-lg text-sm">
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Points forts & faibles */}
            {(candidate.pointsForts.length > 0 || candidate.pointsFaibles.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                              border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Forces & Faiblesses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidate.pointsForts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400
                                     mb-3 flex items-center gap-2">
                        <span className="font-bold">✓</span> Points Forts
                      </h3>
                      <ul className="space-y-2">
                        {candidate.pointsForts.map((p, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300
                                                  flex items-start gap-2">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {candidate.pointsFaibles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400
                                     mb-3 flex items-center gap-2">
                        <span className="font-bold">⚠</span> Points à Améliorer
                      </h3>
                      <ul className="space-y-2">
                        {candidate.pointsFaibles.map((p, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300
                                                  flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expériences extraites */}
            {candidate.experiences.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                              border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Expériences Extraites
                </h2>
                <div className="space-y-3">
                  {candidate.experiences.map((exp, i) => (
                    <div key={i}
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-700
                                 bg-gray-50 dark:bg-gray-700/40">
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {exp.poste}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{exp.duree}</span>
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {exp.entreprise}
                      </span>
                      {exp.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Colonne droite ──────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Score card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl
                            shadow-sm p-6 text-white text-center space-y-4">
              <h2 className="text-base font-semibold opacity-90">Score de Compatibilité</h2>
              <ScoreRing score={candidate.aiScore} />

              {candidate.niveauCompatibilite && (
                <p className="text-sm font-bold opacity-90">{candidate.niveauCompatibilite}</p>
              )}

              {candidate.verdict && (
                <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black border ${
                  candidate.verdict === 'À recruter'
                    ? 'bg-green-500/20 border-green-400/40 text-white'
                    : candidate.verdict === 'À considérer'
                    ? 'bg-amber-500/20 border-amber-400/40 text-white'
                    : 'bg-red-500/20 border-red-400/40 text-white'
                }`}>
                  {candidate.verdict}
                </div>
              )}

              {candidate.recommandation && (
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs opacity-75 uppercase tracking-wider mb-1">
                    Recommandation IA
                  </p>
                  <p className="text-sm font-bold bg-white/10 py-2 px-3 rounded-xl">
                    {candidate.recommandation}
                  </p>
                </div>
              )}
            </div>

            {/* Scoring détaillé */}
            {candidate.scoringDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                              border-gray-100 dark:border-gray-700 p-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3
                               flex items-center gap-2">
                  <span className="text-blue-500 font-bold">↗</span> Détail du Score
                </h2>
                <div className="space-y-2.5">
                  {Object.entries(candidate.scoringDetails).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                          {val.score}/{val.max}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500
                                     transition-all duration-700"
                          style={{ width: `${(val.score / val.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {candidate.scoringSynthese && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic
                                border-t border-gray-100 dark:border-gray-700 pt-3">
                    {candidate.scoringSynthese}
                  </p>
                )}
              </div>
            )}

            {/* Dossier Documentaire Unifié */}
            <DocumentVault 
              candidate={candidate} 
              onPreview={async (data) => {
                setPreviewTitle(data.title || "Aperçu");
                
                // Lettre de motivation (texte brut)
                if (data.type === 'text') {
                  setPreviewType('text');
                  setPreviewContent(data.content);
                  setShowPreview(true);
                  return;
                }

                setPreviewLoading(true);
                setShowPreview(true);
                setPreviewType(data.type);

                try {
                  const resp = await candidatApi.getGenericPreview(candidate.id, data.key, data.index);
                  
                  if (data.type === 'docx') {
                    // Restauration de la logique haute-fidélité pour les fichiers Word
                    const ab = await resp.data.arrayBuffer();
                    setPreviewContent(ab);
                    setTimeout(async () => {
                      if (docxContainerRef.current) {
                        docxContainerRef.current.innerHTML = '';
                        await renderAsync(ab, docxContainerRef.current, null, {
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
                    const ext = data.key === 'cv' ? 'jpeg' : (data.path?.split('.').pop() || 'jpeg');
                    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                    const url = URL.createObjectURL(new Blob([resp.data], { type: mimeType }));
                    setPreviewContent(url);
                  } else {
                    // PDF
                    const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
                    setPreviewContent(url);
                  }
                } catch (e) {
                  console.error("Preview error:", e);
                  setPreviewType('legacy');
                } finally {
                  setPreviewLoading(false);
                }
              }} 
            />



            {/* Infos extraites */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border
                            border-gray-100 dark:border-gray-700 p-5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                Informations Extraites
              </h2>
              <div className="space-y-3">
                {candidate.annees_experience !== null && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Expérience</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {candidate.annees_experience} an(s)
                      {candidate.niveau && ` · Niveau ${candidate.niveau}`}
                    </p>
                  </div>
                )}
                {candidate.formations.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Formation</p>
                    {candidate.formations.slice(0, 2).map((f, i) => (
                      <p key={i} className="text-sm text-gray-800 dark:text-gray-200">
                        {f.diplome} {f.etablissement && `· ${f.etablissement}`}
                        {f.annee && ` (${f.annee})`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

    </div>

    {/* Toast Notification - Relocated to end for stability */}
    {toast && (
      <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
        toast.type === 'success'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <span className="font-bold">{toast.type === 'success' ? '✓' : '✗'}</span>
        {toast.message}
      </div>
    )}

    {/* ── Modal Preview Universelle ───────────────────────────────── */}
    {showPreview && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-full h-[92vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight text-sm">
              <span className="text-blue-500 font-bold">📄</span>
              {previewTitle}
            </h3>
            <button
              onClick={() => {
                setShowPreview(false);
                if (typeof previewContent === 'string' && previewContent.startsWith('blob:')) {
                  URL.revokeObjectURL(previewContent);
                }
                setPreviewContent('');
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition hover:rotate-90 duration-300"
            >
              <span className="font-bold text-lg">✕</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-900">
            {previewLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-900/90">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Chargement...</p>
              </div>
            )}

            {previewType === 'text' && (
              <div className="w-full h-full p-10 overflow-auto bg-white dark:bg-gray-800">
                <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900/40 p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm leading-loose text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap text-sm">
                  {previewContent}
                </div>
              </div>
            )}

            {previewType === 'image' && (
              <div className="w-full h-full flex items-center justify-center p-10 overflow-auto bg-gray-200 dark:bg-black/20">
                <img
                  src={previewContent}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xl border-4 border-white dark:border-gray-700"
                  alt={previewTitle}
                />
              </div>
            )}

            {previewType === 'docx' && (
              <div className="w-full h-full overflow-auto bg-[#e2e8f0] flex justify-center custom-scrollbar">
                <div
                  ref={docxContainerRef}
                  className="docx-render-host shadow-2xl bg-white"
                  style={{ display: 'block', backgroundColor: 'white', width: 'fit-content', minHeight: '100%', position: 'relative' }}
                />
                <style dangerouslySetInnerHTML={{ __html: `
                  .docx-isolated { margin: 0 auto !important; max-width: none !important; }
                  .docx-isolated img { display: inline-block !important; }
                  .docx-render-host { color: black !important; font-family: initial !important; background-color: white !important; }
                `}} />
              </div>
            )}

            {previewType === 'pdf' && (
              <iframe src={previewContent} className="w-full h-full border-none bg-white" title={previewTitle} />
            )}

            {previewType === 'legacy' && (
              <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 p-10">
                <div className="text-center flex flex-col items-center gap-4 p-10 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-sm bg-gray-50 dark:bg-gray-900/50 max-w-sm">
                  <span className="text-amber-500 font-bold text-4xl">⚠</span>
                  <p className="text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest text-xs">Aperçu non supporté</p>
                  <a href={`http://localhost:8000/api/candidats/${id}/cv/download`} className="mt-2 px-8 py-3 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-blue-700 transition uppercase tracking-widest" download>
                    Télécharger
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default CandidateDetail;