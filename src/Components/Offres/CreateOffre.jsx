import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { FiUploadCloud, FiBriefcase, FiGlobe, FiUser, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { FaLinkedin, FaXing } from "react-icons/fa";
import { SiIndeed, SiGlassdoor } from "react-icons/si";
import AIChatAssistant from './AIChatAssistant';

const CreateOffre = ({ onCancel, onSuccess }) => {
  const [contratsList, setContratsList] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState(null);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    titre: '', lieu: '', contrat_id: '', manager_id: '', salaire: '',
    id_currency: '', competences: '', date_limite: '', description: '',
    require_permit: false,
    require_diplome: false,
    require_habilitation: false,
    require_lettre: false,
  });

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  useEffect(() => {
    const normalizeList = (response) => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    };

    const fetchContrats = async () => {
      try {
        const response = await apiRequest('/contract-types', 'GET');
        const list = normalizeList(response);
        setContratsList(list);

        if (list.length === 0) {
          console.debug('[CreateOffre] /api/contract-types returned an empty array.', response);
        }
      } catch (error) {
        console.error('[CreateOffre] Failed to fetch contract types:', error);
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await apiRequest('/managers', 'GET');
        const list = normalizeList(response);
        setManagersList(list);

        if (list.length === 0) {
          console.debug('[CreateOffre] /api/managers returned an empty array.', response);
        }
      } catch (error) {
        console.error('[CreateOffre] Failed to fetch managers:', error);
      }
    };

    const fetchCurrencies = async () => {
      try {
        const response = await apiRequest('/currencies', 'GET');
        const list = normalizeList(response);
        setCurrenciesList(list);

        if (list.length === 0) {
          console.debug('[CreateOffre] /api/currencies returned an empty array.', response);
        }
      } catch (error) {
        console.error('[CreateOffre] Failed to fetch currencies:', error);
      }
    };

    const fetchPlatforms = async () => {
      try {
        const res = await apiRequest('/plateformes', 'GET');
        if (res) setAvailablePlatforms(res.filter(p => p.est_actif));
      } catch (error) { console.error("Erreur plateformes", error); }
    };

    fetchContrats();
    fetchManagers();
    fetchCurrencies();
    fetchPlatforms();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const applyAIText = (donneesExtraites) => {
    setFormData(prev => {
      const newData = { ...prev };

      // Textes basiques
      if (donneesExtraites.titre) newData.titre = donneesExtraites.titre;
      if (donneesExtraites.description) newData.description = donneesExtraites.description;
      if (donneesExtraites.competences) newData.competences = donneesExtraites.competences;
      if (donneesExtraites.lieu) newData.lieu = donneesExtraites.lieu; // <-- NOUVEAU : Prise en charge du Lieu

      // Salaire & Date limite
      if (donneesExtraites.salaire) newData.salaire = donneesExtraites.salaire;
      if (donneesExtraites.date_limite) newData.date_limite = donneesExtraites.date_limite;

      // Recherche du type de contrat
      if (donneesExtraites.type_contrat && contratsList.length > 0) {
        const contratTrouve = contratsList.find(c =>
          c.type.toLowerCase().includes(donneesExtraites.type_contrat.toLowerCase())
        );
        if (contratTrouve) newData.contrat_id = contratTrouve.id_contrat;
      }

      // Recherche de la devise
      if (donneesExtraites.devise && currenciesList.length > 0) {
        const deviseTrouvee = currenciesList.find(c =>
          c.currency.toLowerCase() === donneesExtraites.devise.toLowerCase() ||
          donneesExtraites.devise.toLowerCase().includes(c.currency.toLowerCase())
        );
        if (deviseTrouvee) newData.id_currency = deviseTrouvee.id_currency;
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const data = {
      titre: formData.titre,
      lieu: formData.lieu,
      contrat_id: parseInt(formData.contrat_id, 10),
      manager_id: formData.manager_id ? parseInt(formData.manager_id, 10) : null,
      salaire: formData.salaire || null,
      id_currency: formData.id_currency ? parseInt(formData.id_currency, 10) : null,
      competences: formData.competences || null,
      date_limite: formData.date_limite || null,
      description: formData.description,
      plateformes: JSON.stringify(selectedPlatforms),
      require_permit: formData.require_permit,
      require_diplome: formData.require_diplome,
      require_habilitation: formData.require_habilitation,
      require_lettre: formData.require_lettre,
    };

    try {
      const response = await apiRequest('/offres', 'POST', data);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
            onSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrorMsg(error.message || "Erreur de validation. Vérifiez si vous avez rempli tous les champs (titre, manager, contrat...).");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPlatformIcon = (platformName, iconSize = 24) => {
    const name = platformName.toLowerCase().trim();
    if (name.includes("linkedin")) return <FaLinkedin size={iconSize} className="text-[#0077B5]" />;
    if (name.includes("indeed")) return <SiIndeed size={iconSize} className="text-[#2164f3]" />;
    if (name.includes("glassdoor")) return <SiGlassdoor size={iconSize} className="text-[#0CAA41]" />;
    if (name.includes("xing")) return <FaXing size={iconSize} className="text-[#006567]" />;
    if (name.includes("france travail") || name.includes("pole emploi")) return <FiBriefcase size={iconSize} className="text-[#000091]" />;
    if (name.includes("apec") || name.includes("hellowork") || name.includes("monster") || name.includes("cadremploi") || name.includes("jungle")) return <FiBriefcase size={iconSize} className="text-[#555]" />; 
    return <FiGlobe size={iconSize} className="text-gray-500" />;
  };

  if (success) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center p-8 text-center bg-white dark:bg-[#1e222d] rounded-lg border border-green-200 dark:border-green-800 shadow-md transform transition-all duration-500">
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 mb-6 animate-pulse">
                <FiCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Offre Créée !</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {selectedPlatforms.length > 0 
                  ? `Elle a bien été enregistrée et diffusée sur : ${selectedPlatforms.join(', ')}.` 
                  : "Elle a bien été enregistrée en tant que brouillon."}
            </p>
            <p className="text-sm text-gray-400 mt-4">Fermeture automatique dans quelques secondes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full max-w-full mx-auto text-gray-800 dark:text-gray-200 transition-colors duration-200">

      <div className="flex-1 bg-white dark:bg-[#1e222d] rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-6">Créer une nouvelle offre</h2>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-6 text-red-800 dark:text-red-300 shadow-sm animate-fade-in">
            <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Titre de l'offre *</label>
              <input type="text" name="titre" value={formData.titre} onChange={handleInputChange} required
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Lieu *</label>
              <input type="text" name="lieu" value={formData.lieu} onChange={handleInputChange} required
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Type de contrat *</label>
              <select name="contrat_id" value={formData.contrat_id} onChange={handleInputChange} required
                className="w-full bg-white dark:bg-[#1e222d] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200">
                <option value="">Sélectionnez un type</option>
                {contratsList.map((contrat) => (
                  <option key={contrat.id_contrat} value={contrat.id_contrat}>{contrat.type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium flex items-center gap-1">
                <FiUser /> Manager Responsable *
              </label>
              <select name="manager_id" value={formData.manager_id} onChange={handleInputChange} required
                className="w-full bg-white dark:bg-[#1e222d] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200">
                <option value="">Assigner à un manager</option>
                {managersList.map((manager) => (
                  <option key={manager.id_employe} value={manager.id_employe}>{manager.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Salaire et Devise</label>
              <div className="flex gap-2">
                <input type="text" name="salaire" value={formData.salaire} onChange={handleInputChange}
                  placeholder="Ex: 5000"
                  className="w-2/3 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400" />
                <select name="id_currency" value={formData.id_currency} onChange={handleInputChange}
                  className="w-1/3 bg-white dark:bg-[#1e222d] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200">
                  <option value="">Devise</option>
                  {currenciesList.map((c) => (
                    <option key={c.id_currency} value={c.id_currency}>{c.currency}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium flex items-center gap-1">
                <FiCalendar /> Date limite de candidature
              </label>
              <input type="date" name="date_limite" value={formData.date_limite} onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 text-gray-700 dark:text-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Compétences requises</label>
            <input type="text" name="competences" value={formData.competences} onChange={handleInputChange}
              placeholder="Ex: React, Node.js, SQL"
              className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400" />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Description / Contenu du post *</label>
            <textarea name="description" rows="5" value={formData.description} onChange={handleInputChange} required
              placeholder="Décrivez l'offre ou utilisez l'IA à droite pour générer le texte..."
              className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400" />
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
            <label className="block text-sm font-semibold mb-4 text-blue-900 dark:text-blue-300">
              Cochez les documents obligatoires pour postuler (le CV est toujours requis) :
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['permit:Permis de conduire', 'diplome:Copie du diplôme', 'habilitation:Justif. habitation', 'lettre:Lettre (PDF)'].map(item => {
                const [key, label] = item.split(':');
                const fieldName = `require_${key}`;
                return (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" name={fieldName} checked={formData[fieldName]} onChange={handleCheckboxChange} className="peer sr-only" />
                      <div className="w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                        <FiCheckCircle className="text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 transition-colors">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#262a35] p-4 rounded-lg mt-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold mb-3 dark:text-gray-300 flex items-center gap-2">
              <FiGlobe /> Diffuser cette offre sur :
            </label>
            {availablePlatforms.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune plateforme configurée.</p>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {availablePlatforms.map(plat => {
                  const isSelected = selectedPlatforms.includes(plat.nom);
                  return (
                    <label key={plat.id} className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl cursor-pointer border-2 transition-all select-none ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                      <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handlePlatformToggle(plat.nom)} />
                      {renderPlatformIcon(plat.nom, 24)}
                      <span className={`text-[10px] mt-2 font-semibold text-center truncate w-full ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>{plat.nom}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onCancel} disabled={submitting} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={submitting} className={`px-6 py-2 text-white rounded font-semibold shadow-md transition-all duration-300 ${submitting ? 'bg-blue-400 cursor-not-allowed opacity-75' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publication...
                </span>
              ) : (
                "Publier l'offre"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full lg:w-[450px]">
        <AIChatAssistant onApplyText={applyAIText} />
      </div>

    </div>
  );
};

export default CreateOffre;