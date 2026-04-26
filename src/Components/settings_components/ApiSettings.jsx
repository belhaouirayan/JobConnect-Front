import React, { useState, useEffect } from 'react';
import CardHeader from '../dashboard_components/CardHeader';
import { apiRequest } from '../../api';

const ApiSettings = ({ settings, updateSetting }) => {
    const [showKey, setShowKey] = useState(false);
    
    // États locaux
    const [localKey, setLocalKey] = useState('');
    const [localModel, setLocalModel] = useState('gemini-3.1-pro'); 
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Synchronisation de la clé et du modèle actifs
    const activeKey = (settings && settings.gemini_api_key && typeof settings.gemini_api_key === 'string' && settings.gemini_api_key.trim() !== '') 
        ? settings.gemini_api_key 
        : localStorage.getItem('gemini_api_key');

    const activeModel = (settings && settings.gemini_model && typeof settings.gemini_model === 'string' && settings.gemini_model.trim() !== '') 
        ? settings.gemini_model 
        : (localStorage.getItem('gemini_model') || 'gemini-3.1-pro');

    useEffect(() => {
        if (activeModel) {
            setLocalModel(activeModel);
        }
    }, [activeModel]);

    const handleSaveKey = async () => {
        if (!localKey.trim() && !activeKey) {
            setStatus({ type: 'error', message: 'Veuillez entrer une clé API valide.' });
            return;
        }

        const keyToSend = localKey.trim() !== '' ? localKey : activeKey;

        if (activeKey) {
            const isConfirmed = window.confirm(
                "Mettre à jour la configuration complète de l'IA ?"
            );
            if (!isConfirmed) return; 
        }

        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await apiRequest('/api/parametres/admin', 'PUT', {
                gemini_api_key: keyToSend,
                gemini_model: localModel
            });

            if (response && response.message) {
                setStatus({ type: 'success', message: 'Configuration mise à jour avec succès !' });
                updateSetting('gemini_api_key', keyToSend);
                updateSetting('gemini_model', localModel);
                localStorage.setItem('gemini_api_key', keyToSend);
                localStorage.setItem('gemini_model', localModel);
                setLocalKey('');
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Erreur lors de la sauvegarde.' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 4000);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader title="Configuration Avancée de l'IA" colorClass="bg-teal-500" />
            
            <div className="p-5 sm:p-6 space-y-6">
                
                {/* --- SÉLECTION DU MODÈLE (L'ENCYCLOPÉDIE GEMINI) --- */}
                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                        Choisir le moteur Gemini
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[10px] font-black text-gray-400 uppercase">
                            AI
                        </div>
                        <select 
                            value={localModel}
                            onChange={(e) => setLocalModel(e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <optgroup label=" Série Gemini 3.x ">
                                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
                                <option value="gemini-3-flash-preview">Gemini 3.1 Flash Preview</option>
                            </optgroup>
                            <optgroup label=" Série Gemini 2.x">
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro </option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash </option>
                                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash lite</option>
                                <option value="gemini-2.0-pro-exp">Gemini 2.0 Pro Experimental</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                {/* --- CHAMP CLÉ API --- */}
                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                        Clé API Google AI Studio
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[10px] font-black text-gray-400 uppercase">
                            KEY
                        </div>
                        <input 
                            type={showKey ? "text" : "password"}
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 block w-full pl-10 pr-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder="Saisir une nouvelle clé API..."
                        />
                        <button 
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-black uppercase tracking-tighter text-blue-600"
                        >
                            {showKey ? 'MASQUER' : 'AFFICHER'}
                        </button>
                    </div>

                    {/* --- AFFICHAGE STATUT ACTIF --- */}
                    {activeKey && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-none space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                                <span>Clé active : <strong>{activeKey.substring(0, 10)}••••••••</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-blue-600 dark:text-blue-500 pl-2 italic uppercase">
                                <span>Modèle : <strong>{activeModel}</strong></span>
                            </div>
                        </div>
                    )}

                    {status.message && (
                        <div className={`mt-4 p-3 text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {status.message}
                        </div>
                    )}

                    <div className="mt-6">
                        <button 
                            onClick={handleSaveKey}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
                        >
                            Mettre à jour la configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiSettings;