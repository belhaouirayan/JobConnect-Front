// src/utils/normalizers.js

/**
 * Safe property accessor — never throws, returns fallback on any issue.
 */
const safe = (obj, path, fallback = null) => {
  try {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB / OFFRE NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Normalizes a raw "offre" from the backend into a predictable shape
 * for the 3D UI. Handles:
 *  - French field names → English aliases
 *  - Missing/null fields → safe defaults
 *  - Status normalization (publiée, publiee, publié → "published")
 *  - Date parsing
 */
export function normalizeJob(raw) {
  if (!raw || typeof raw !== 'object') {
    return createEmptyJob();
  }

  const statusMap = {
    publiee: 'published',
    'publiée': 'published',
    'publié': 'published',
    brouillon: 'draft',
    fermee: 'closed',
    'fermée': 'closed',
    archivee: 'archived',
    'archivée': 'archived',
  };

  return {
    // Core identity
    id: raw.id ?? null,

    // Title & description
    title: raw.titre || raw.title || 'Untitled Position',
    description: raw.description || '',
    requirements: raw.requirements || raw.exigences || '',

    // Location & contract
    location: raw.lieu || raw.location || 'Not specified',
    contractType: raw.type_contrat || raw.contract_type || 'CDI',
    department: raw.departement || raw.department || '',

    // Salary (handle both string and numeric)
    salary: parseSalary(raw.salaire || raw.salary),

    // Status normalization
    status: statusMap[(raw.statut || raw.status || '').toLowerCase()] || 'draft',
    rawStatus: raw.statut || raw.status || '',

    // Dates
    createdAt: parseDate(raw.created_at),
    deadline: parseDate(raw.date_limite || raw.deadline),
    updatedAt: parseDate(raw.updated_at),

    // Metrics (may or may not exist)
    candidatesCount: parseInt(raw.candidats_count || raw.candidates_count || 0, 10),

    // Preserve any unknown fields in a _meta bucket (legacy safety)
    _meta: extractUnknownFields(raw, [
      'id', 'titre', 'title', 'description', 'requirements', 'exigences',
      'lieu', 'location', 'type_contrat', 'contract_type', 'departement',
      'department', 'salaire', 'salary', 'statut', 'status', 'created_at',
      'date_limite', 'deadline', 'updated_at', 'candidats_count', 'candidates_count',
    ]),
  };
}

export function normalizeJobList(raw) {
  // Handle both { data: [...] } and direct array responses
  const items = Array.isArray(raw) ? raw : (raw?.data || []);
  return items.map(normalizeJob).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeCandidate(raw) {
  if (!raw || typeof raw !== 'object') {
    return createEmptyCandidate();
  }

  const statusMap = {
    en_attente: 'pending',
    accepte: 'accepted',
    'accepté': 'accepted',
    admis: 'accepted',
    refuse: 'rejected',
    'refusé': 'rejected',
    entretien: 'interview',
    embauche: 'hired',
    'embauchée': 'hired',
  };

  return {
    id: raw.id ?? null,

    // Personal info
    firstName: raw.prenom || raw.first_name || '',
    lastName: raw.nom || raw.last_name || '',
    email: raw.email || '',
    phone: raw.telephone || raw.phone || '',
    fullName: `${raw.prenom || raw.first_name || ''} ${raw.nom || raw.last_name || ''}`.trim() || 'Unknown',

    // Application details
    status: statusMap[(raw.statut || raw.status || '').toLowerCase()] || 'pending',
    rawStatus: raw.statut || raw.status || '',
    isFavorite: Boolean(raw.is_favorite),

    // AI scoring
    aiScore: clampNumber(raw.score_ia || raw.ai_score, 0, 100),
    skills: parseSkills(raw.competences || raw.skills),
    aiComment: raw.ia_commentaire || raw.ai_comment || '',

    // Linked job offer
    jobId: raw.offre_id || raw.job_id || null,
    jobTitle: safe(raw, 'offre.titre') || safe(raw, 'job.title') || '',

    // Documents
    hasCV: Boolean(raw.cv_path || raw.cv),
    documents: {
      cv: raw.cv_path || null,
      permit: raw.permis_path || null,
      diploma: raw.diplome_path || null,
      qualification: raw.habilitation_path || null,
      coverLetter: raw.lettre_path || null,
      other: raw.autres_path || null,
    },

    // Interview data (may be nested or flat)
    interview: normalizeInterview(raw),

    // Digital Profile (PFE) — graceful: empty if legacy PDF-only
    hasDigitalProfile: Boolean(
      raw.experiences || raw.formations || raw.competences_list ||
      raw.ville || raw.date_naissance
    ),
    digitalProfile: {
      city: raw.ville || raw.city || '',
      birthDate: parseDate(raw.date_naissance || raw.birth_date),
      experiences: parseJsonArray(raw.experiences),
      formations: parseJsonArray(raw.formations),
      competencesList: parseJsonArray(raw.competences_list),
    },

    // Timestamps
    createdAt: parseDate(raw.created_at),
    updatedAt: parseDate(raw.updated_at),

    _meta: extractUnknownFields(raw, [
      'id', 'prenom', 'first_name', 'nom', 'last_name', 'email', 'telephone',
      'phone', 'statut', 'status', 'is_favorite', 'score_ia', 'ai_score',
      'competences', 'skills', 'ia_commentaire', 'ai_comment', 'offre_id',
      'job_id', 'offre', 'job', 'cv_path', 'cv', 'permis_path', 'diplome_path',
      'habilitation_path', 'lettre_path', 'autres_path', 'created_at', 'updated_at',
      'experiences', 'formations', 'competences_list', 'ville', 'city',
      'date_naissance', 'birth_date',
    ]),
  };
}

export function normalizeCandidateList(raw) {
  // Handle paginated Laravel response: { data: [...], meta: { total, current_page, ... } }
  if (raw?.data && Array.isArray(raw.data)) {
    return {
      data: raw.data.map(normalizeCandidate),
      meta: {
        total: raw.meta?.total || raw.total || 0,
        currentPage: raw.meta?.current_page || raw.current_page || 1,
        lastPage: raw.meta?.last_page || raw.last_page || 1,
        perPage: raw.meta?.per_page || raw.per_page || 20,
      },
    };
  }

  // Fallback: plain array
  return {
    data: (Array.isArray(raw) ? raw : []).map(normalizeCandidate),
    meta: { total: 0, currentPage: 1, lastPage: 1, perPage: 20 },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeDashboard(raw) {
  if (!raw || typeof raw !== 'object') {
    return createEmptyDashboard();
  }

  return {
    stats: {
      activeJobs: parseInt(safe(raw, 'stats.offres_actives', 0), 10),
      totalCandidates: parseInt(safe(raw, 'stats.total_candidats', 0), 10),
      pendingCandidates: parseInt(safe(raw, 'stats.candidats_en_attente', 0), 10),
      scheduledInterviews: parseInt(safe(raw, 'stats.entretiens_planifies', 0), 10),
    },
    recentJobs: normalizeJobList(raw.dernieresOffres || []),
    recentCandidates: (raw.derniersCandidats || []).map(normalizeCandidate),
    upcomingInterviews: (raw.prochainsEntretiens || []).map(normalizeCandidate),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW NORMALIZER (nested within candidate or standalone)
// ─────────────────────────────────────────────────────────────────────────────
function normalizeInterview(raw) {
  // Interview data may be nested under `candidat.entretien`, flat on the candidate,
  // or come from the `prochainsEntretiens` array with different field names
  const interview = raw.entretien || raw.interview || {};
  const date = raw.date_entretien || raw.interview_date || interview.date || null;

  if (!date && !interview.id) return null;

  return {
    id: interview.id || null,
    date: parseDate(date),
    type: raw.interview_type || interview.type || 'Technique',
    location: interview.lieu || interview.location || '',
    notes: interview.notes || '',
    status: interview.statut || interview.status || 'pending',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function parseDate(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

function parseSalary(val) {
  if (val == null) return null;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function parseSkills(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  // If it's a JSON string
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* not JSON */ }
  // Comma-separated string
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

function parseJsonArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* not JSON */ }
  return [];
}

function clampNumber(val, min, max) {
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  return Math.min(max, Math.max(min, num));
}

function extractUnknownFields(raw, knownKeys) {
  const unknown = {};
  Object.keys(raw).forEach(key => {
    if (!knownKeys.includes(key)) {
      unknown[key] = raw[key];
    }
  });
  return Object.keys(unknown).length > 0 ? unknown : undefined;
}

// ── Empty constructors (safe defaults) ──
function createEmptyJob() {
  return {
    id: null, title: 'Unknown', description: '', requirements: '',
    location: '', contractType: '', department: '', salary: null,
    status: 'draft', rawStatus: '', createdAt: null, deadline: null,
    updatedAt: null, candidatesCount: 0, _meta: undefined,
  };
}

function createEmptyCandidate() {
  return {
    id: null, firstName: '', lastName: '', email: '', phone: '',
    fullName: 'Unknown', status: 'pending', rawStatus: '', isFavorite: false,
    aiScore: 0, skills: [], aiComment: '', jobId: null, jobTitle: '',
    hasCV: false, documents: {}, interview: null,
    hasDigitalProfile: false,
    digitalProfile: { city: '', birthDate: null, experiences: [], formations: [], competencesList: [] },
    createdAt: null, updatedAt: null, _meta: undefined,
  };
}

function createEmptyDashboard() {
  return {
    stats: { activeJobs: 0, totalCandidates: 0, pendingCandidates: 0, scheduledInterviews: 0 },
    recentJobs: [], recentCandidates: [], upcomingInterviews: [],
  };
}
