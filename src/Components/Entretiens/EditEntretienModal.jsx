import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiPhone, FiMapPin, FiMonitor, FiCalendar, FiMail, FiPaperclip, FiLink, FiInfo } from 'react-icons/fi';
import { apiRequest } from '../../api';

const EditEntretienModal = ({ entretienId, onClose, onRefresh }) => {
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

  const [candidats, setCandidats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Si c'est un nouvel entretien (pas d'ID), on ne charge que les candidats
        if (!entretienId || entretienId === 'new') {
          const candidatsData = await apiRequest('/candidats', 'GET');
          
          let candidatsFiltres = [];
          if (candidatsData?.data && Array.isArray(candidatsData.data)) {
            candidatsFiltres = candidatsData.data.filter(candidat => 
              candidat.statut === 'accepte' || candidat.statut === 'entretien'
            );
          } else if (Array.isArray(candidatsData)) {
            candidatsFiltres = candidatsData.filter(candidat => 
              candidat.statut === 'accepte' || candidat.statut === 'entretien'
            );
          }
          
          setCandidats(candidatsFiltres);
          setIsLoading(false);
          return;
        }

        // MODE ÉDITION : Charger les données de l'entretien existant
        const [entretienData, candidatsData] = await Promise.all([
          apiRequest(`/entretiens/${entretienId}`, 'GET'),
          apiRequest('/candidats', 'GET')
        ]);

        let candidatsDisponibles = [];
        if (candidatsData?.data && Array.isArray(candidatsData.data)) {
          candidatsDisponibles = candidatsData.data.filter(candidat => 
            (candidat.statut === 'accepte' || candidat.statut === 'entretien')
          );
        } else if (Array.isArray(candidatsData)) {
          candidatsDisponibles = candidatsData.filter(candidat => 
            (candidat.statut === 'accepte' || candidat.statut === 'entretien')
          );
        }

        // Trouver le candidat spécifique de l'entretien
        let candidatSpecifique = null;
        if (entretienData.candidat) {
          // Si l'entretien inclut déjà les données du candidat
          candidatSpecifique = entretienData.candidat;
        } else if (entretienData.candidat_id) {
          // Chercher dans la liste des candidats chargés
          candidatSpecifique = candidatsDisponibles.find(c => c.id === entretienData.candidat_id);
          
          // Si pas trouvé, essayer de charger individuellement
          if (!candidatSpecifique) {
            try {
              candidatSpecifique = await apiRequest(`/candidats/${entretienData.candidat_id}`, 'GET');
            } catch (error) {
              console.error("Erreur chargement candidat spécifique:", error);
              // Créer un objet candidat minimal
              candidatSpecifique = {
                id: entretienData.candidat_id,
                nom: "Candidat",
                prenom: `#${entretienData.candidat_id}`,
                statut: "inconnu"
              };
            }
          }
        }

        setCandidats(candidatSpecifique ? [candidatSpecifique] : candidatsDisponibles);

        // Parse existing date and time
        let dateObj;
        try {
          dateObj = new Date(entretienData.date_entretien);
        } catch (e) {
          console.error("Erreur parsing date:", entretienData.date_entretien);
          dateObj = new Date(); // Fallback
        }
        
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        
        const HH = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');

        setFormData({
          candidat_id: entretienData.candidat_id || "",
          type: entretienData.type ? (entretienData.type.toLowerCase() === 'visio' ? 'Visio' : entretienData.type.toLowerCase() === 'téléphonique' || entretienData.type.toLowerCase() === 'telephonique' ? 'Téléphonique' : 'Présentiel') : "Présentiel",
          date: `${yyyy}-${mm}-${dd}`,
          heure_debut: `${HH}:${min}`,
          heure_fin: entretienData.heure_fin || "",
          timezone: entretienData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          lieu: entretienData.type?.toLowerCase() === 'visio' ? '' : (entretienData.lieu || ""),
          lien_visio: entretienData.lien_visio || (entretienData.type?.toLowerCase() === 'visio' ? (entretienData.lieu || "") : ""),
          telephone: entretienData.type?.toLowerCase() === 'téléphonique' || entretienData.type?.toLowerCase() === 'telephonique' ? (entretienData.lieu || "") : "",
          notes: entretienData.notes || "",
          document: null
        });

      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setIsLoading(false);
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

    fetchData();
    fetchSettings();
  }, [entretienId]);

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
          recruiter_id: null,
          ignore_id: entretienId // Très important : ne pas se considérer soi-même comme un conflit
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

    const timer = setTimeout(() => {
      checkConflict();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.date, formData.heure_debut, formData.heure_fin, entretienId]);

  // Templates de messages selon le type
  const getMessageTemplate = (type, candidatName, data) => {
    if (settings && settings.email_invitation_corps) {
      const selectedCandidat = candidats.find(c => String(c.id) === String(data.candidat_id));
      const titreOffre = selectedCandidat?.offre?.titre || selectedCandidat?.name || "Poste";
      
      const filledBody = settings.email_invitation_corps
        .replace(/{prenom}/g, candidatName.split(' ')[0] || '')
        .replace(/{nom}/g, candidatName.split(' ')[1] || '')
        .replace(/{poste}/g, titreOffre)
        .replace(/{date}/g, data.date ? data.date.split('-').reverse().join('-') : '')
        .replace(/{heure}/g, data.heure_debut || '')
        .replace(/{lieu}/g, (type === "Visio" ? data.lien_visio : (type === "Téléphonique" ? data.telephone : data.lieu)) || '');
          
      return filledBody;
    }

    const templates = {
      "Présentiel": `Bonjour ${candidatName},\n\nNous sommes ravis de vous inviter à un entretien présentiel pour échanger sur votre candidature.\n\nMerci d'arriver 10 minutes en avance. N'oubliez pas d'apporter votre CV et une pièce d'identité.\n\nCordialement,`,
      "Visio": `Bonjour ${candidatName},\n\nNous sommes ravis de vous inviter à un entretien en visioconférence.\n\nMerci de tester votre connexion 5 minutes avant. Prévoyez un endroit calme et bien éclairé.\n\nCordialement,`,
      "Téléphonique": `Bonjour ${candidatName},\n\nNous sommes ravis de vous inviter à un entretien téléphonique.\n\nMerci d'être disponible dans un endroit calme. Préparez-vous à parler de votre parcours et vos motivations.\n\nCordialement,`
    };
    
    return templates[type] || templates["Présentiel"];
  };

  // Gérer le changement de type avec réinitialisation des champs
  const handleTypeChange = (e) => {
    const { value } = e.target;
    handleChange({ target: { name: 'type', value } });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, document: e.target.files[0] }));
    }
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

      const templateFields = ['date', 'heure_debut', 'heure_fin', 'lieu', 'telephone', 'lien_visio', 'candidat_id', 'type'];
      if (templateFields.includes(name)) {
        const selectedCandidat = candidats.find(c => String(c.id) === String(newData.candidat_id));
        if (selectedCandidat) {
          const candidatName = `${selectedCandidat.nom || selectedCandidat.name || ''} ${selectedCandidat.prenom || ''}`.trim();
          newData.notes = getMessageTemplate(newData.type, candidatName, newData);
        }
      }
      return newData;
    });
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
      const date_entretien = `${formData.date} ${formData.heure_debut}:00`;

      // FormData required because we might upload a file
      const apiData = new FormData();
      apiData.append("_method", "PUT"); // Laravel trick for PUT with FormData
      
      apiData.append("candidat_id", parseInt(formData.candidat_id));
      apiData.append("type", formData.type.toLowerCase());
      apiData.append("date_entretien", date_entretien);
      apiData.append("timezone", formData.timezone);

      if (formData.heure_fin) apiData.append("heure_fin", formData.heure_fin);
      
      if (formData.lieu && formData.type === "Présentiel") {
        apiData.append("lieu", formData.lieu);
      } else if (formData.lien_visio && formData.type === "Visio") {
        apiData.append("lieu", formData.lien_visio);
        apiData.append("lien_visio", formData.lien_visio);
      } else if (formData.telephone && formData.type === "Téléphonique") {
        apiData.append("lieu", formData.telephone);
      }
      
      if (formData.notes) apiData.append("notes", formData.notes);
      
      if (formData.document) {
        apiData.append("document", formData.document);
      }

      await apiRequest(`/entretiens/${entretienId}`, 'POST', apiData);
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Erreur de modification:", error);
      const msg = error.message || '';
      if (msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('chevauche')) {
        setErrorMessage("Ce créneau est déjà occupé par un autre entretien. Choisissez un autre horaire.");
      } else if (msg.includes('heure de fin')) {
        setErrorMessage("L'heure de fin doit être strictement après l'heure de début.");
      } else if (msg.includes('422') || msg.toLowerCase().includes('validation')) {
        setErrorMessage("Veuillez vérifier les informations saisies.");
      } else {
        setErrorMessage(`Erreur lors de la modification : ${msg || 'erreur inattendue'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] bg-opacity-90 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-[#0f172a]/90 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex flex-col items-center">

        <div className="w-full max-w-4xl bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <FiCalendar size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Modifier l'entretien
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {entretienId ? `Mise à jour de l'entretien #${entretienId}` : "Création d'un nouvel entretien"}
              </p>
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
                  <p className="font-semibold">Erreur lors de la modification</p>
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
            {/* Candidat - Non modifiable en mode édition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Candidat *</label>
              <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg">
                {(() => {
                  if (isLoading) {
                    return "Chargement...";
                  }
                  const candidat = candidats.find(c => c.id === formData.candidat_id);
                  if (!candidat) {
                    return `Candidat #${formData.candidat_id}`;
                  }
                  return `${(candidat.nom || candidat.name) || ""} ${(candidat.prenom || "") || ""}`;
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'entretien *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm hover:shadow-md transition-shadow"
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
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm hover:shadow-md transition-shadow"
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
                    className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:shadow-md transition-shadow"
                  />
                  <style>{`
                    .dark .input-date-icon::-webkit-calendar-picker-indicator { filter: invert(1); }
                    .input-date-icon::-webkit-calendar-picker-indicator { opacity: 0.6; cursor: pointer; }
                  `}</style>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Début *</label>
                  <input
                    type="time"
                    name="heure_debut"
                    list="time-options"
                    value={formData.heure_debut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fin</label>
                  <input
                    type="time"
                    name="heure_fin"
                    list="time-options"
                    value={formData.heure_fin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              </div>

              <datalist id="time-options">
                {[...Array(24)].map((_, i) => (
                  <React.Fragment key={i}>
                    <option value={`${String(i).padStart(2, '0')}:00`} />
                    <option value={`${String(i).padStart(2, '0')}:30`} />
                  </React.Fragment>
                ))}
              </datalist>
            </div>

            {/* Lieu / Téléphone / Lien Visio selon le type */}
            {formData.type === "Visio" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><FiMonitor className="text-blue-500" size={14} /> Lien de la réunion *</label>
                <input
                  type="url"
                  name="lien_visio"
                  placeholder="https://meet.google.com/..."
                  value={formData.lien_visio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:shadow-md transition-shadow"
                />
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex items-start gap-2">
                  <div className="text-blue-500 dark:text-blue-400 mt-0.5" style={{ minWidth: '12px' }}>
                    <FiInfo size={12} />
                  </div>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 italic leading-relaxed">
                    Note: Si vous aviez généré ce lien, il s'agit d'un exemple. Pensez à le remplacer par votre <span className="font-bold">vrai lien</span> de réunion (Meet, Zoom, etc.) si vous utilisez une salle spécifique.
                  </p>
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
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:shadow-md transition-shadow"
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
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            )}



            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mettre à jour le document (optionnel)</label>
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#283548] hover:border-blue-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <FiUpload size={24} className={formData.document ? "text-green-500 mb-2" : "text-gray-500 mb-2"} />
                <p className="text-sm font-medium">
                  {formData.document ? formData.document.name : "Cliquez ou glissez un nouveau fichier ici"}
                </p>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !!conflictError}
                className={`w-full sm:w-1/2 py-3 px-4 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 ${
                  conflictError ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? "Sauvegarde..." : conflictError ? "Sauvegarder malgré tout" : "Enregistrer les modifications"}
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

export default EditEntretienModal;
