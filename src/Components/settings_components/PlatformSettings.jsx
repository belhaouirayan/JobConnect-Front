import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { FiCheckCircle, FiGlobe, FiAlertCircle, FiLinkedin, FiBriefcase, FiX, FiLink, FiTrash2, FiPlus, FiCopy } from 'react-icons/fi';

// 🛒 LE CATALOGUE STANDARD
const STANDARD_CATALOG = [
  // International
  { nom: 'LinkedIn', type_integration: 'api', pays: 'International', desc: 'Publiez directement sur votre page entreprise LinkedIn.' },
  { nom: 'Indeed', type_integration: 'xml', pays: 'International', desc: 'Générez un flux XML pour Indeed.' },
  { nom: 'Glassdoor', type_integration: 'xml', pays: 'International', desc: 'Diffusez vos annonces sur Glassdoor.' },
  { nom: 'Monster', type_integration: 'xml', pays: 'International', desc: 'Flux XML de diffusion pour Monster.' },
  { nom: 'Adzuna', type_integration: 'xml', pays: 'International', desc: 'Agrégateur mondial Adzuna.' },
  { nom: 'Jooble', type_integration: 'xml', pays: 'International', desc: 'Synchronisation automatique avec Jooble.' },
  { nom: 'WhatJobs', type_integration: 'xml', pays: 'International', desc: 'Réseau de diffusion WhatJobs.' },
  // France
  { nom: 'France Travail', type_integration: 'api', pays: 'France', desc: 'Connexion API (JTMO) au service public.' },
  { nom: 'Apec', type_integration: 'api', pays: 'France', desc: 'Plateforme dédiée aux cadres.' },
  { nom: 'Cadremploi', type_integration: 'api', pays: 'France', desc: 'Diffusion sur Cadremploi.' },
  // Maroc
  { nom: 'Rekrute', type_integration: 'api', pays: 'Maroc', desc: 'Envoyez vos offres sur le portail Rekrute via API.' },
  { nom: 'AmalJob', type_integration: 'xml', pays: 'Maroc', desc: 'Flux de diffusion standard pour AmalJob.' },
  { nom: 'Emploi.ma', type_integration: 'xml', pays: 'Maroc', desc: 'Flux de diffusion pour Emploi.ma.' },
  // Allemagne
  { nom: 'StepStone', type_integration: 'api', pays: 'Allemagne', desc: 'Diffusion directe sur StepStone Allemagne.' },
  { nom: 'XING', type_integration: 'api', pays: 'Allemagne', desc: 'Réseau professionnel leader en Allemagne.' },
  { nom: 'Jobbörse', type_integration: 'api', pays: 'Allemagne', desc: 'Agence fédérale allemande pour l\'emploi.' },
];

const PlatformSettings = () => {
  const [displayList, setDisplayList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Filtre Pays
  const [selectedCountry, setSelectedCountry] = useState('Maroc');

  // Modales
  const [activeModal, setActiveModal] = useState(null); 
  const [customModal, setCustomModal] = useState(false); 
  
  const [credentials, setCredentials] = useState({ api_key: '', api_secret: '' });
  const [customData, setCustomData] = useState({ nom: '', type_integration: 'xml', pays: 'Autre' });
  const [isSaving, setIsSaving] = useState(false);

  const currentCompanyId = 1; 
  const baseUrl = "https://api.hrlinktis.com";

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    setIsLoading(true);
    try {
      const savedPlatforms = await apiRequest('/plateformes', 'GET') || [];
      
      let mergedList = STANDARD_CATALOG.map(catalogItem => {
        const savedMatch = savedPlatforms.find(saved => saved.nom.toLowerCase() === catalogItem.nom.toLowerCase());
        return savedMatch 
          ? { ...catalogItem, ...savedMatch, isConnected: true } 
          : { ...catalogItem, isConnected: false };
      });

      const customSaved = savedPlatforms.filter(saved => 
        !STANDARD_CATALOG.some(catalogItem => catalogItem.nom.toLowerCase() === saved.nom.toLowerCase())
      );
      
      customSaved.forEach(custom => {
        mergedList.push({ ...custom, isConnected: true, desc: 'Plateforme personnalisée ajoutée manuellement.' });
      });

      setDisplayList(mergedList);
    } catch (error) {
      console.error("Erreur", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openConnectModal = (platform) => {
    setActiveModal(platform);
    setCredentials({ api_key: '', api_secret: '' });
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { nom: activeModal.nom, type_integration: activeModal.type_integration, pays: activeModal.pays, ...credentials };
    try {
      const res = await apiRequest('/plateformes', 'POST', payload);
      if (res?.success) {
        setMessage({ text: `${activeModal.nom} connecté !`, type: 'success' });
        setActiveModal(null);
        fetchPlatforms();
      }
    } catch (err) {
      setMessage({ text: "Erreur de connexion.", type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleAddCustom = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiRequest('/plateformes', 'POST', { ...customData, ...credentials });
      if (res?.success) {
        setMessage({ text: 'Plateforme personnalisée ajoutée !', type: 'success' });
        setCustomModal(false);
        // Si le pays personnalisé n'est pas International, on bascule l'affichage sur ce pays
        if (customData.pays !== 'International') {
          setSelectedCountry(customData.pays);
        }
        setCustomData({ nom: '', type_integration: 'xml', pays: 'Autre' });
        setCredentials({ api_key: '', api_secret: '' });
        fetchPlatforms();
      }
    } catch (err) {
      setMessage({ text: "Erreur lors de l'ajout.", type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleUnlink = async (id, nom) => {
    if (!window.confirm(`Voulez-vous vraiment dissocier ${nom} ?`)) return;
    try {
      const res = await apiRequest(`/plateformes/${id}`, 'DELETE');
      if (res?.success) {
        setMessage({ text: `${nom} a été dissocié.`, type: 'success' });
        fetchPlatforms();
      }
    } catch (err) {
      setMessage({ text: "Erreur lors de la dissociation.", type: 'error' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Lien XML copié !");
  };

  // --- LOGIQUE DE FILTRAGE ---
  const internationalPlatforms = displayList.filter(plat => plat.pays === 'International');
  
  // Extraire les pays uniques (hors International) pour le menu déroulant
  const availableCountries = [...new Set(displayList.map(p => p.pays))].filter(pays => pays !== 'International').sort();
  
  const localPlatforms = displayList.filter(plat => plat.pays === selectedCountry);

  // --- SOUS-COMPOSANT POUR LES CARTES ---
  const renderPlatformCard = (plat, idx) => (
    <div key={idx} className={`bg-white dark:bg-[#1e222d] p-5 rounded-xl border flex flex-col transition-all ${plat.isConnected ? 'border-green-400 dark:border-green-600 shadow-md' : 'border-gray-200 dark:border-gray-700 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${plat.nom === 'LinkedIn' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
            {plat.nom === 'LinkedIn' ? <FiLinkedin size={20} /> : <FiBriefcase size={20} />}
          </div>
          <span className="font-bold text-gray-800 dark:text-white">{plat.nom}</span>
        </div>
        {plat.isConnected ? (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400 px-2 py-1 rounded-full">
            <FiCheckCircle /> Lié
          </span>
        ) : (
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${plat.type_integration === 'api' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {plat.type_integration}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 flex-grow">{plat.desc}</p>

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        {!plat.isConnected ? (
          <button 
            onClick={() => openConnectModal(plat)}
            className="w-full py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm flex justify-center items-center gap-2"
          >
            <FiLink /> Connecter
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {plat.type_integration === 'xml' ? (
              <div className="flex-grow flex items-center gap-2">
                <input type="text" readOnly value={`${baseUrl}/feeds/${currentCompanyId}/${plat.nom.toLowerCase().replace(/\s+/g, '')}.xml`} className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 outline-none" />
                <button onClick={() => copyToClipboard(`${baseUrl}/feeds/${currentCompanyId}/${plat.nom.toLowerCase().replace(/\s+/g, '')}.xml`)} className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 transition-colors">
                  <FiCopy size={14} />
                </button>
              </div>
            ) : (
              <span className="flex-grow text-xs text-gray-500 font-medium">Clés API actives</span>
            )}
            <button onClick={() => handleUnlink(plat.id, plat.nom)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Dissocier">
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) return <div className="text-gray-500 p-6 flex justify-center">Chargement du catalogue...</div>;

  return (
    <div className="bg-transparent rounded-xl w-full relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiGlobe className="text-blue-500" /> App Store Recrutement
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez vos intégrations pour diffuser vos offres dans le monde entier.
          </p>
        </div>
        <button 
          onClick={() => { setCustomModal(true); setCredentials({ api_key: '', api_secret: '' }); }}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md transition-colors"
        >
          <FiPlus /> Ajouter une plateforme personnalisée
        </button>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* SECTION INTERNATIONAL (Toujours visible) */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">International</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internationalPlatforms.map(renderPlatformCard)}
        </div>
      </div>

      {/* SECTION LOCALE (Menu déroulant + Résultats) */}
      {availableCountries.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-[#262a35] p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 sm:mb-0">
              Plateformes Locales
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Filtrer par pays :</span>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full sm:w-48 bg-white dark:bg-[#1e222d] border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500 dark:text-white"
              >
                {availableCountries.map(pays => (
                  <option key={pays} value={pays}>{pays}</option>
                ))}
              </select>
            </div>
          </div>
          
          {localPlatforms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {localPlatforms.map(renderPlatformCard)}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">Aucune plateforme trouvée pour {selectedCountry}.</p>
          )}
        </div>
      )}

      {/* --- MODALE DE CONNEXION (Depuis le Catalogue) --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e222d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Lier {activeModal.nom}</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-red-500"><FiX size={24} /></button>
            </div>
            <form onSubmit={handleConnect} className="p-6">
              {activeModal.type_integration === 'api' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saisissez les identifiants API fournis par la plateforme.</p>
                  <div>
                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Client ID / Token *</label>
                    <input type="text" required value={credentials.api_key} onChange={e => setCredentials({...credentials, api_key: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Clé secrète / ID Page (Optionnel)</label>
                    <input type="password" value={credentials.api_secret} onChange={e => setCredentials({...credentials, api_secret: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                  <p>Aucun mot de passe requis pour {activeModal.nom}.</p>
                  <p className="mt-1">Cliquez sur Activer pour générer le flux XML de synchronisation.</p>
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Annuler</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{isSaving ? 'Connexion...' : 'Activer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE D'AJOUT PERSONNALISÉ (Hors catalogue) --- */}
      {customModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e222d] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Ajouter une plateforme personnalisée</h3>
              <button onClick={() => setCustomModal(false)} className="text-gray-500 hover:text-red-500"><FiX size={24} /></button>
            </div>
            <form onSubmit={handleAddCustom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Nom du Job Board *</label>
                  <input type="text" required value={customData.nom} onChange={e => setCustomData({...customData, nom: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Pays / Zone *</label>
                  <input type="text" required placeholder="Ex: Canada, Autre..." value={customData.pays} onChange={e => setCustomData({...customData, pays: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Type d'intégration *</label>
                <select value={customData.type_integration} onChange={e => setCustomData({...customData, type_integration: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none dark:text-white">
                  <option value="xml">Flux XML (Standard)</option>
                  <option value="api">API Sécurisée</option>
                </select>
              </div>
              
              {customData.type_integration === 'api' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Clé API *</label>
                    <input type="text" required value={credentials.api_key} onChange={e => setCredentials({...credentials, api_key: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Secret API (Optionnel)</label>
                    <input type="password" value={credentials.api_secret} onChange={e => setCredentials({...credentials, api_secret: e.target.value})} className="w-full bg-gray-50 dark:bg-[#262a35] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none dark:text-white" />
                  </div>
                </>
              )}
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setCustomModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Annuler</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black">{isSaving ? 'Ajout...' : 'Créer & Connecter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlatformSettings;