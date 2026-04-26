import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiPhone, FiMapPin, FiMonitor, FiCalendar, FiMail, FiPaperclip, FiGlobe, FiLink, FiClock } from 'react-icons/fi';
import { apiRequest } from '../../api';

// Custom Time Picker Component pour un rendu uniforme et moderne
const CustomTimePicker = ({ name, value, onChange, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [];
  for (let i = 0; i < 24; i++) {
    const h = String(i).padStart(2, '0');
    options.push(`${h}:00`, `${h}:30`);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-gray-300 rounded-lg outline-none flex justify-between items-center transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder || "--:--"}</span>
        <FiClock size={16} className="text-gray-500 dark:text-gray-400" />
      </button>

      {/* Input caché pour satisfaire le required HTML si nécessaire */}
      {required && (
        <input 
          type="hidden" 
          name={name} 
          value={value || ""} 
          required 
          onChange={() => {}} 
        />
      )}

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
          <style>{`
            .max-h-56::-webkit-scrollbar {
              width: 6px;
            }
            .max-h-56::-webkit-scrollbar-track {
              background: transparent;
            }
            .max-h-56::-webkit-scrollbar-thumb {
              background-color: #cbd5e1;
              border-radius: 20px;
            }
            .dark .max-h-56::-webkit-scrollbar-thumb {
              background-color: #475569;
            }
          `}</style>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange({ target: { name, value: opt } });
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === opt ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f172a]'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Modification du composant Modal en un layout "pleine page" 
// ou modal très large qui ressemble exactement au screenshot de déclaration d'absence.
const AddEntretienModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    candidat_id: "",
    type: "Présentiel",
    date: "",
    heure_debut: "",
    heure_fin: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lieu: "",
    telephone: "",
    lien_visio: "",
    visio_platform: "meet",
    notes: "",
    document: null
  });
  const [conflictError, setConflictError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const [settings, setSettings] = useState(null);

  // Détecter automatiquement le timezone au montage
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setFormData(prev => ({ ...prev, timezone: userTimezone }));
  }, []);

  const [candidats, setCandidats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCandidatsList = async () => {
      try {
        const data = await apiRequest('/candidats?all=true', 'GET');
        
        let candidatsFiltres = [];
        
        if (data && data.data && Array.isArray(data.data)) {
          candidatsFiltres = data.data.filter(candidat => {
            // Inclure les candidats acceptés ou déjà en entretien
            const statutValide = candidat.statut === 'accepte' || candidat.statut === 'entretien';
            // On retire la limite de 3 pour permettre plus de flexibilité si besoin
            return statutValide;
          });
        }
        setCandidats(candidatsFiltres);
        
      } catch (error) {
        console.error("Erreur lors de la récupération des candidats:", error);
        setCandidats([]);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await apiRequest('/api/parametres/admin');
        setSettings(response);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
      }
    };

    fetchCandidatsList();
    fetchSettings();
  }, []);

  // --- Vérification automatique des conflits ---
  useEffect(() => {
    const checkConflict = async () => {
      if (!formData.date || !formData.heure_debut) {
        setConflictError(null);
        return;
      }

      setIsValidating(true);
      try {
        const fullDate = `${formData.date} ${formData.heure_debut}:00`;
        const response = await apiRequest('/entretiens/check-conflict', 'POST', {
          date_entretien: fullDate,
          heure_fin: formData.heure_fin,
          recruiter_id: null // Utilise l'ID du user connecté côté backend par défaut
        });

        if (response.conflict) {
          setConflictError(response.message || "Ce créneau chevauche un autre entretien.");
        } else {
          setConflictError(null);
        }
      } catch (error) {
        console.error("Erreur vérification conflit:", error);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce to avoid too many requests
    const timer = setTimeout(() => {
      checkConflict();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.date, formData.heure_debut, formData.heure_fin]);

  // Templates de messages (fallback hardcodé si non configuré)
  const getMessageTemplate = (type, candidatName, data, templateType = 'invitation') => {
    if (settings) {
      const body = templateType === 'convention' 
        ? settings.email_convention_corps 
        : settings.email_invitation_corps;
      
      const subject = templateType === 'convention'
        ? settings.email_convention_sujet
        : settings.email_invitation_sujet;

      if (body) {
        const selectedCandidat = candidats.find(c => String(c.id) === String(data.candidat_id));
        const titreOffre = selectedCandidat?.offre?.titre || selectedCandidat?.name || "Poste";
        
        const filledBody = body
          .replace(/{prenom}/g, candidatName.split(' ')[0] || '')
          .replace(/{nom}/g, candidatName.split(' ')[1] || '')
          .replace(/{poste}/g, titreOffre)
          .replace(/{date}/g, data.date ? data.date.split('-').reverse().join('-') : '')
          .replace(/{heure}/g, data.heure_debut || '')
          .replace(/{lieu}/g, (data.type === "Visio" ? data.lien_visio : (data.type === "Téléphonique" ? data.telephone : data.lieu)) || '');
          
        return { body: filledBody, subject: subject || "" };
      }
    }

    const templates = {
      "Présentiel": `Bonjour ${candidatName},\n\nNous sommes ravis de vous inviter à un entretien présentiel pour échanger sur votre candidature.\n\nMerci d'arriver 10 minutes en avance. N'oubliez pas d'apporter votre CV et une pièce d'identité.\n\nCordialement,`,
      "Visio": `Bonjour ${candidatName},\n\nNous sommes ravis de vous inviter à un entretien en visioconférence.\n\nMerci de tester votre connexion 5 minutes avant. Prévoyez un endroit calme et bien éclairé.\n\nCordialement,`,
      "Téléphonique": `Bonjour ${candidatName},\n\nNous sommes ravis de vous inviter à un entretien téléphonique.\n\nMerci d'être disponible dans un endroit calme. Préparez-vous à parler de votre parcours et vos motivations.\n\nCordialement,`
    };
    
    return { 
      body: templates[type] || templates["Présentiel"],
      subject: templateType === 'convention' ? "Convention de stage" : "Invitation à un entretien"
    };
  };

  // Générer automatiquement les liens de visioconférence
  const generateVisioLink = (platform, candidatNom, date) => {
    // Caractères minuscules sans voyelles pour Meet (plus réaliste)
    const meetChars = "bcdfghjklmnpqrstvwxyz";
    const getRandom = (len) => Array.from({length: len}, () => meetChars[Math.floor(Math.random() * meetChars.length)]).join('');
    
    switch (platform) {
      case 'meet':
        return `https://meet.google.com/${getRandom(3)}-${getRandom(4)}-${getRandom(3)}`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/${Math.floor(Math.random() * 900000000) + 100000000}`;
      case 'zoom':
        return `https://zoom.us/j/${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      case 'custom':
        return formData.lien_visio;
      default:
        return '';
    }
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    handleChange({ target: { name: 'type', value } });
  };

  const handleVisioPlatformChange = (e) => {
    const { value } = e.target;
    handleChange({ target: { name: 'visio_platform', value } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Logic for type resets
      if (name === 'type') {
        if (value === "Présentiel") {
          newData.lieu = prev.lieu || "";
          newData.telephone = "";
          newData.lien_visio = "";
        } else if (value === "Téléphonique") {
          newData.lieu = "";
          newData.telephone = prev.telephone || "";
          newData.lien_visio = "";
        } else if (value === "Visio") {
          newData.lieu = "";
          newData.telephone = "";
        }
      }

      const templateFields = ['date', 'heure_debut', 'heure_fin', 'lieu', 'telephone', 'lien_visio', 'candidat_id', 'type', 'visio_platform', 'template_type'];
      if (templateFields.includes(name)) {
        const selectedCandidat = candidats.find(c => String(c.id) === String(newData.candidat_id));
        if (selectedCandidat) {
          const candidatName = `${selectedCandidat.nom || selectedCandidat.name || ''} ${selectedCandidat.prenom || ''}`.trim();
          
          // Regen visio link if needed
          if (newData.type === "Visio" && (name === 'candidat_id' || name === 'visio_platform' || name === 'date' || name === 'type')) {
             newData.lien_visio = generateVisioLink(newData.visio_platform, candidatName, newData.date);
          }
        }
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, document: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Reset error message

    // --- Validations de Format spécifiques ---
    if (formData.type === "Présentiel" && !formData.lieu) {
      setErrorMessage("La localisation (Lieu) est obligatoire pour un entretien en présentiel.");
      setIsSubmitting(false);
      return;
    }

    if (formData.type === "Visio" && !formData.lien_visio) {
      setErrorMessage("Le lien de la visioconférence est obligatoire pour un format en visio.");
      setIsSubmitting(false);
      return;
    }

    if (formData.type === "Visio" && formData.lien_visio) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.lien_visio)) {
        setErrorMessage("Veuillez saisir un lien de visioconférence valide (ex: https://zoom.us/...).");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Créer FormData pour gérer le fichier et texte
      const apiData = new FormData();
      apiData.append("candidat_id", parseInt(formData.candidat_id));
      apiData.append("type", formData.type.toLowerCase());
      
      const date_entretien = `${formData.date} ${formData.heure_debut}:00`;
      
      apiData.append("date_entretien", date_entretien);
      apiData.append("timezone", formData.timezone);
      
      // Logique clarifiée pour le lieu
      if (formData.type.toLowerCase() === "visio") {
        apiData.append("lieu", formData.lien_visio);
        apiData.append("lien_visio", formData.lien_visio);
      } else if (formData.type.toLowerCase() === "téléphonique") {
        apiData.append("lieu", formData.telephone);
      } else {
        apiData.append("lieu", formData.lieu);
      }

      if (formData.heure_fin) apiData.append("heure_fin", formData.heure_fin);
      
      if (formData.notes) apiData.append("notes", formData.notes);
      apiData.append("statut", "planifie"); 
      
      if (formData.document) {
        apiData.append("document", formData.document);
      }

      await apiRequest('/entretiens', 'POST', apiData);
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Erreur de planification:", error);
      const msg = error.message || '';
      if (msg.includes('422') || msg.toLowerCase().includes('validation')) {
        setErrorMessage("Veuillez vérifier les informations saisies (champ obligatoire manquant ou invalide).");
      } else if (msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('chevauche')) {
        setErrorMessage("Ce créneau est déjà occupé par un autre entretien. Choisissez un autre horaire.");
      } else if (msg.includes('heure de fin')) {
        setErrorMessage("L'heure de fin doit être après l'heure de début.");
      } else if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setErrorMessage("Candidat non trouvé. Veuillez recharger la page.");
      } else {
        setErrorMessage(`Erreur : ${msg || 'Une erreur inattendue est survenue.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-[#0f172a]/90 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex flex-col items-center">

        {/* Conteneur principal (formulaire) */}
        <div className="w-full max-w-4xl bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">

          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg mr-3">
                <FiCalendar className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Planifier un entretien</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Bannière d'erreur inline */}
            {errorMessage && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg p-4 text-sm">
                <span className="flex-shrink-0 font-bold text-lg leading-none">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold">Une erreur est survenue</p>
                  <p className="mt-0.5 font-normal opacity-90">{errorMessage}</p>
                </div>
                <button type="button" onClick={() => setErrorMessage('')} className="opacity-60 hover:opacity-100 leading-none text-lg">&times;</button>
              </div>
            )}

            {/* Avertissement de conflit en temps réel */}
            {conflictError && (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-lg p-3 text-sm animate-pulse">
                <span className="flex-shrink-0 text-amber-500 font-bold">⚠️</span>
                <p className="font-medium">{conflictError}</p>
              </div>
            )}

            {/* Candidat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Candidat *</label>
              <select
                name="candidat_id"
                value={formData.candidat_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none"
              >
                <option value="">Sélectionnez un candidat</option>
                {candidats.map(c => (
                  <option key={c.id || c.email} value={c.id}>
                    {(c.nom || c.name) || ""} {(c.prenom || "") || ""} 
                    {c.statut && ` (${c.statut})`}
                    {c.nombreEntretiens !== undefined && ` - ${c.nombreEntretiens}/3 entretiens`}
                    {c.placesRestantes !== undefined && ` - ${c.placesRestantes} place(s) restante(s)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Type et Fuseau */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'entretien *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="Présentiel">Présentiel</option>
                  <option value="Visio">En Ligne (Visio)</option>
                  <option value="Téléphonique">Téléphonique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuseau Horaire</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                  <option value="UTC">UTC (Temps Universel Coordonné)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                  <option value="Europe/Rome">Europe/Rome (CET)</option>
                  <option value="Europe/Madrid">Europe/Madrid (CET)</option>
                  <option value="Europe/Amsterdam">Europe/Amsterdam (CET)</option>
                  <option value="Europe/Brussels">Europe/Brussels (CET)</option>
                  <option value="Europe/Zurich">Europe/Zurich (CET)</option>
                  <option value="Europe/Stockholm">Europe/Stockholm (CET)</option>
                  <option value="Europe/Oslo">Europe/Oslo (CET)</option>
                  <option value="Europe/Copenhagen">Europe/Copenhagen (CET)</option>
                  <option value="Europe/Warsaw">Europe/Warsaw (CET)</option>
                  <option value="Europe/Prague">Europe/Prague (CET)</option>
                  <option value="Europe/Vienna">Europe/Vienna (CET)</option>
                  <option value="Europe/Budapest">Europe/Budapest (CET)</option>
                  <option value="Europe/Athens">Europe/Athens (EET)</option>
                  <option value="Europe/Istanbul">Europe/Istanbul (EET)</option>
                  <option value="Europe/Moscow">Europe/Moscow (MSK)</option>
                  <option value="Africa/Casablanca">Africa/Casablanca (WET)</option>
                  <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="America/Chicago">America/Chicago (CST)</option>
                  <option value="America/Denver">America/Denver (MST)</option>
                  <option value="America/Phoenix">America/Phoenix (MST)</option>
                  <option value="America/Toronto">America/Toronto (EST)</option>
                  <option value="America/Vancouver">America/Vancouver (PST)</option>
                  <option value="America/Montreal">America/Montreal (EST)</option>
                  <option value="America/Mexico_City">America/Mexico_City (CST)</option>
                  <option value="America/Sao_Paulo">America/Sao_Paulo (BRT)</option>
                  <option value="America/Buenos_Aires">America/Buenos_Aires (ART)</option>
                  <option value="America/Lima">America/Lima (PET)</option>
                  <option value="America/Bogota">America/Bogota (COT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                  <option value="Asia/Hong_Kong">Asia/Hong_Kong (HKT)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (ICT)</option>
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Manila">Asia/Manila (PST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                  <option value="Asia/Tehran">Asia/Tehran (IRST)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                  <option value="Australia/Melbourne">Australia/Melbourne (AEDT)</option>
                  <option value="Australia/Perth">Australia/Perth (AWST)</option>
                  <option value="Pacific/Auckland">Pacific/Auckland (NZDT)</option>
                </select>
              </div>
            </div>

            {/* Dates et Heures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none input-date-icon"
                  />
                  <style>{`
                    .dark .input-date-icon::-webkit-calendar-picker-indicator {
                      filter: invert(1);
                    }
                    .input-date-icon::-webkit-calendar-picker-indicator {
                      opacity: 0.6;
                      cursor: pointer;
                    }
                  `}</style>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heure de début *</label>
                  <CustomTimePicker
                    name="heure_debut"
                    value={formData.heure_debut}
                    onChange={handleChange}
                    required={true}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heure de fin</label>
                  <CustomTimePicker
                    name="heure_fin"
                    value={formData.heure_fin}
                    onChange={handleChange}
                    required={false}
                  />
                </div>
              </div>
            </div>

            {/* Lieu / Téléphone / Lien Visio selon le type */}
            {formData.type === "Visio" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><FiMonitor className="text-blue-500" size={14} /> Plateforme de visioconférence *</label>
                  <select
                    name="visio_platform"
                    value={formData.visio_platform}
                    onChange={handleVisioPlatformChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="zoom">Zoom</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <FiLink className="text-blue-500" size={14} /> {formData.visio_platform === "custom" ? "Lien de la réunion *" : "Lien généré automatiquement"}
                  </label>
                  {formData.visio_platform === "custom" ? (
                    <input
                      type="url"
                      name="lien_visio"
                      placeholder="https://meet.google.com/..."
                      value={formData.lien_visio}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{formData.lien_visio || "Généré après sélection du candidat"}</span>
                        {formData.lien_visio && (
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(formData.lien_visio)}
                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Copier
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : formData.type === "Téléphonique" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><FiPhone className="text-blue-500" size={14} /> Numéro de téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><FiMapPin className="text-blue-500" size={14} /> Lieu physique *</label>
                <input
                  type="text"
                  name="lieu"
                  placeholder="Ex: Bureau 102, Siège principal"
                  value={formData.lieu}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Documents partagés */}
            <div className="mt-6">
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#283548] hover:border-blue-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <FiUpload size={24} className={formData.document ? "text-green-500 mb-2" : "text-blue-500 mb-2"} />
                <p className="text-sm font-medium">
                  {formData.document ? formData.document.name : "Cliquez ou glissez un fichier ici"}
                </p>
              </label>
            </div>

            {/* Boutons d'action (Prend toute la largeur comme le screenshot) */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !!conflictError}
                className={`w-full sm:w-1/2 py-3 px-4 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 ${
                  conflictError ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? "Planification..." : conflictError ? "Planifier malgré tout" : "À Planifier"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-3 px-4 bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEntretienModal;
