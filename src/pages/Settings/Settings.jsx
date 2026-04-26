import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Settings2, ChevronRight } from 'lucide-react';
import CardHeader from '../../Components/dashboard_components/CardHeader';
import GeneralSettings from '../../Components/settings_components/GeneralSettings';
import { apiRequest } from '../../api';

const Settings = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role') || 'employee';

    const [settings, setSettings] = useState({
        cvLimitGeneral: 50,
        cvLimitPerOffer: 10,
        oldPostsRetentionDays: 7,
        refusedCandidatesRetentionDays: 30,
        endedOfferCandidatesRetentionDays: 7,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Load settings from API on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await apiRequest('/api/parametres/recruitment');
            console.log('Settings loaded:', response);
            
            setSettings(prev => ({
                ...prev,
                cvLimitGeneral: response.cv_limit || 50,
                oldPostsRetentionDays: response.old_posts_retention_days || 7,
                refusedCandidatesRetentionDays: response.refused_candidates_retention_days || 30,
                endedOfferCandidatesRetentionDays: response.ended_offer_candidates_retention_days || 7,
            }));
            setError(null);
        } catch (err) {
            console.error('Error loading settings:', err);
            setError('Erreur lors du chargement des paramètres');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                cv_limit: settings.cvLimitGeneral,
                old_posts_retention_days: settings.oldPostsRetentionDays,
                refused_candidates_retention_days: settings.refusedCandidatesRetentionDays,
                ended_offer_candidates_retention_days: settings.endedOfferCandidatesRetentionDays,
            };

            console.log('Saving settings:', payload);
            const response = await apiRequest('/api/parametres/recruitment', 'PUT', payload);
            console.log('Settings saved:', response);

            setSaveSuccess(true);
            setError(null);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(`Erreur lors de l'enregistrement: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };


    return (
        <div className="p-6 md:p-8 font-inter dark:bg-gray-900 transition-colors duration-200 min-h-screen">
            <div className="max-w-full mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 tracking-tight">
                            Paramètres de recrutement
                        </h1>
                        <p className="mt-1 text-sm font-sans text-gray-500 dark:text-gray-400">
                            Gérez vos limites, intégrations et clés d'API
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 shadow-sm"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            Enregistrer les modifications
                        </button>

                        {userRole === 'admin' && (
                            <button
                                onClick={() => navigate('/recrutement/admin-settings')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-white shadow-md hover:shadow-lg"
                                style={{
                                    background: 'linear-gradient(135deg, #14b8a6, #a855f7)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                <Settings2 size={18} />
                                Paramètres Avancés
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {saveSuccess && (
                     <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center gap-3 border border-green-200 dark:border-green-800">
                        <AlertCircle size={20} />
                        <span>Paramètres enregistrés avec succès.</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 border border-red-200 dark:border-red-800">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="inline-flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <GeneralSettings settings={settings} updateSetting={updateSetting} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
