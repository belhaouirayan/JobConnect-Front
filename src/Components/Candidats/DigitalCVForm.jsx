// src/Components/Candidats/DigitalCVForm.jsx
import React, { useState } from 'react';
import './DigitalCVForm.css';

const STEPS = [
  { id: 1, label: '1. Infos personnelles' },
  { id: 2, label: '2. Expériences' },
  { id: 3, label: '3. Formation' },
  { id: 4, label: '4. Compétences & Documents' },
];

const emptyExperience = { poste: '', entreprise: '', date_debut: '', date_fin: '', description: '' };
const emptyFormation = { diplome: '', etablissement: '', annee: '', specialite: '' };

const DigitalCVForm = ({ offres = [], onSubmit, loading = false, aiStep = '' }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', ville: '', date_naissance: '',
    offre_id: '', lettre_motivation: '',
  });
  const [experiences, setExperiences] = useState([{ ...emptyExperience }]);
  const [formations, setFormations] = useState([{ ...emptyFormation }]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Validation per step
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.prenom.trim()) e.prenom = 'Requis';
      if (!form.nom.trim()) e.nom = 'Requis';
      if (!form.email.trim()) e.email = 'Requis';
      if (!form.offre_id) e.offre_id = 'Requis';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(4, s + 1));
  };
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  // Dynamic list helpers
  const addExperience = () => setExperiences(p => [...p, { ...emptyExperience }]);
  const removeExperience = (i) => setExperiences(p => p.filter((_, idx) => idx !== i));
  const updateExperience = (i, key, val) => setExperiences(p => p.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

  const addFormation = () => setFormations(p => [...p, { ...emptyFormation }]);
  const removeFormation = (i) => setFormations(p => p.filter((_, idx) => idx !== i));
  const updateFormation = (i, key, val) => setFormations(p => p.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills(p => [...p, s]); setSkillInput(''); }
  };
  const removeSkill = (s) => setSkills(p => p.filter(x => x !== s));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(1)) { setStep(1); return; }
    onSubmit?.({
      formData: form,
      docs: { cv },
      digitalProfile: {
        city: form.ville,
        birthDate: form.date_naissance,
        experiences: experiences.filter(x => x.poste.trim()),
        formations: formations.filter(x => x.diplome.trim()),
        competencesList: skills,
      },
    });
  };

  const renderInput = (label, name, type = 'text', required = false, placeholder = '') => (
    <div className="space-y-1">
      <label className="jc-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} value={form[name] || ''} placeholder={placeholder}
        onChange={e => updateForm(name, e.target.value)}
        className={`jc-input ${errors[name] ? 'border-red-400 dark:border-red-500' : ''}`}
      />
      {errors[name] && <p className="text-xs text-red-500 font-bold">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="dcv-container">
      {/* Step Indicator */}
      <div className="dcv-steps">
        {STEPS.map(s => (
          <div key={s.id} className={`dcv-step ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}>
            {s.label}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="dcv-progress">
        <div className="dcv-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {/* AI Loading */}
      {loading && aiStep && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Traitement en cours</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{aiStep}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── STEP 1: Personal Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Prénom', 'prenom', 'text', true, 'Jean')}
              {renderInput('Nom', 'nom', 'text', true, 'Dupont')}
            </div>
            {renderInput('Email', 'email', 'email', true, 'jean.dupont@example.com')}
            {renderInput('Téléphone', 'telephone', 'tel', false, '+212 6XX XXX XXX')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Ville', 'ville', 'text', false, 'Casablanca')}
              {renderInput('Date de naissance', 'date_naissance', 'date')}
            </div>
            <div className="space-y-1">
              <label className="jc-label">Offre ciblée <span className="text-red-500">*</span></label>
              <select
                value={form.offre_id} onChange={e => updateForm('offre_id', e.target.value)}
                className={`jc-input ${errors.offre_id ? 'border-red-400' : ''}`}
              >
                <option value="">Sélectionnez une offre</option>
                {offres.map(o => <option key={o.id} value={o.id}>{o.titre}</option>)}
              </select>
              {errors.offre_id && <p className="text-xs text-red-500 font-bold">{errors.offre_id}</p>}
            </div>
          </div>
        )}

        {/* ── STEP 2: Experiences ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Expériences professionnelles</h2>
              <button type="button" onClick={addExperience} className="jc-btn-outline text-xs">+ Ajouter</button>
            </div>
            {experiences.map((exp, i) => (
              <div key={i} className="dcv-entry">
                {experiences.length > 1 && (
                  <button type="button" onClick={() => removeExperience(i)} className="dcv-entry-remove">✕</button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="jc-label">Poste</label>
                    <input className="jc-input" value={exp.poste} placeholder="Développeur React"
                      onChange={e => updateExperience(i, 'poste', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="jc-label">Entreprise</label>
                    <input className="jc-input" value={exp.entreprise} placeholder="Nom de l'entreprise"
                      onChange={e => updateExperience(i, 'entreprise', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="jc-label">Date début</label>
                    <input type="date" className="jc-input" value={exp.date_debut}
                      onChange={e => updateExperience(i, 'date_debut', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="jc-label">Date fin</label>
                    <input type="date" className="jc-input" value={exp.date_fin}
                      onChange={e => updateExperience(i, 'date_fin', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1 mt-3">
                  <label className="jc-label">Description</label>
                  <textarea className="jc-input resize-none" rows={2} value={exp.description}
                    placeholder="Décrivez vos missions..."
                    onChange={e => updateExperience(i, 'description', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 3: Education ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Formation</h2>
              <button type="button" onClick={addFormation} className="jc-btn-outline text-xs">+ Ajouter</button>
            </div>
            {formations.map((f, i) => (
              <div key={i} className="dcv-entry">
                {formations.length > 1 && (
                  <button type="button" onClick={() => removeFormation(i)} className="dcv-entry-remove">✕</button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="jc-label">Diplôme</label>
                    <input className="jc-input" value={f.diplome} placeholder="Master en Informatique"
                      onChange={e => updateFormation(i, 'diplome', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="jc-label">Établissement</label>
                    <input className="jc-input" value={f.etablissement} placeholder="Université / École"
                      onChange={e => updateFormation(i, 'etablissement', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="jc-label">Année</label>
                    <input type="number" className="jc-input" value={f.annee} placeholder="2024"
                      onChange={e => updateFormation(i, 'annee', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="jc-label">Spécialité</label>
                    <input className="jc-input" value={f.specialite} placeholder="Génie Logiciel"
                      onChange={e => updateFormation(i, 'specialite', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 4: Skills & Documents ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Compétences & Documents</h2>

            {/* Skills tags input */}
            <div className="space-y-2">
              <label className="jc-label">Compétences</label>
              <div className="flex gap-2">
                <input
                  className="jc-input flex-1" value={skillInput}
                  placeholder="Tapez une compétence et appuyez Entrée"
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                />
                <button type="button" onClick={addSkill} className="jc-btn-outline">+</button>
              </div>
              {skills.length > 0 && (
                <div className="dcv-tags mt-2">
                  {skills.map(s => (
                    <span key={s} className="dcv-tag">
                      {s} <button type="button" onClick={() => removeSkill(s)}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CV Upload */}
            <div className="space-y-1">
              <label className="jc-label">CV (PDF ou Word) — optionnel avec profil digital</label>
              <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50/50 dark:bg-gray-800/30">
                <input
                  type="file" accept=".pdf,.doc,.docx"
                  onChange={e => setCv(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {cv ? (
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{cv.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                      {(cv.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Glissez votre CV ici</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">PDF, DOCX · Max 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cover letter */}
            <div className="space-y-1">
              <label className="jc-label">Lettre de motivation <span className="text-gray-400 font-normal normal-case">(optionnel)</span></label>
              <textarea
                className="jc-input resize-none" rows={4}
                value={form.lettre_motivation}
                onChange={e => updateForm('lettre_motivation', e.target.value)}
                placeholder="Rédigez ou collez votre lettre de motivation ici..."
              />
            </div>

            {/* AI info */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-bold">Analyse automatique : </span>
                Après soumission, l'IA analysera votre profil digital et calculera un score de compatibilité.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 gap-3">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="jc-btn-outline">
              ← Précédent
            </button>
          ) : <div />}

          {step < 4 ? (
            <button type="button" onClick={nextStep} className="jc-btn-primary">
              Suivant →
            </button>
          ) : (
            <button type="submit" disabled={loading} className="jc-btn-primary">
              {loading ? 'Analyse en cours...' : 'Envoyer et Analyser'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DigitalCVForm;
