import React, { useState, useEffect } from 'react';
import ApiSettings from '../../Components/settings_components/ApiSettings';
import PlatformSettings from '../../Components/settings_components/PlatformSettings';
import BrandingSettings from '../../Components/settings_components/BrandingSettings';
import EmailSettings from '../../Components/settings_components/EmailSettings';
import { apiRequest } from '../../api';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        gemini_api_key: '',
        gemini_model: 'gemini-3.1-pro',
        emailRefuseSujet: 'Suite à votre candidature',
        emailRefuseCorps: '',
        logoUrl: null,
        nomEntreprise: '',
        emailRecruteSujet: 'Bienvenue dans l\'équipe !',
        emailRecruteCorps: '',
        emailInvitationSujet: 'Invitation à un entretien d\'embauche',
        emailInvitationCorps: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const [adminRes, recruitmentRes] = await Promise.all([
                apiRequest('/api/parametres/admin'),
                apiRequest('/api/parametres/recruitment'),
            ]);

            setSettings(prev => ({
                ...prev,
                gemini_api_key: adminRes.gemini_api_key || '',
                gemini_model: adminRes.gemini_model || 'gemini-3.1-pro',
                emailRefuseSujet: recruitmentRes.email_refuse_sujet || '',
                emailRefuseCorps: recruitmentRes.email_refuse_corps || '',
                logoUrl: recruitmentRes.logo_url || null,
                nomEntreprise: recruitmentRes.nom_entreprise || '',
                emailRecruteSujet: recruitmentRes.email_recrute_sujet || '',
                emailRecruteCorps: recruitmentRes.email_recrute_corps || '',
                emailInvitationSujet: recruitmentRes.email_invitation_sujet || '',
                emailInvitationCorps: recruitmentRes.email_invitation_corps || '',
            }));
            setError(null);
        } catch (err) {
            console.error('Error loading admin settings:', err);
            setError('Erreur lors du chargement des paramètres admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                email_refuse_sujet: settings.emailRefuseSujet,
                email_refuse_corps: settings.emailRefuseCorps,
                email_recrute_sujet: settings.emailRecruteSujet,
                email_recrute_corps: settings.emailRecruteCorps,
                email_invitation_sujet: settings.emailInvitationSujet,
                email_invitation_corps: settings.emailInvitationCorps,
                nom_entreprise: settings.nomEntreprise,
            };

            console.log('Saving settings:', payload);
            await apiRequest('/api/parametres/admin', 'PUT', payload);
            
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

    const handleLogoUpload = async (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        
        try {
            const response = await apiRequest('/api/parametres/logo', 'POST', formData);
            setSettings(prev => ({ ...prev, logoUrl: response.logo_url }));
            return response.logo_url;
        } catch (err) {
            console.error('Error uploading logo:', err);
            throw err;
        }
    };

    const handleLogoDelete = async () => {
        try {
            await apiRequest('/api/parametres/logo', 'DELETE');
            setSettings(prev => ({ ...prev, logoUrl: null }));
        } catch (err) {
            console.error('Error deleting logo:', err);
            throw err;
        }
    };

    const handleNameSave = async () => {
        setIsSaving(true);
        try {
            // Wait, does apiRequest /api/parametres work without trailing slash?
            await apiRequest('/api/parametres/admin', 'PUT', { nom_entreprise: settings.nomEntreprise });
            setSaveSuccess(true);
            setError(null);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving company name:', err);
            setError(`Erreur lors de l'enregistrement: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 font-inter dark:bg-gray-900 transition-colors duration-200 min-h-screen">
            <div className="max-w-full mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            Paramètres Plateforme
                        </h1>
                        <p className="mt-1 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            IDENTITÉ VISUELLE / EMAILS / IA / APP STORE
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Enregistrement..." : "Sauvegarder les modifications"}
                        </button>
                    </div>
                </div>

                {saveSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                        Configuration enregistrée avec succès.
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 p-4 text-[10px] font-black uppercase tracking-widest border border-rose-200 dark:border-rose-800">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="inline-flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <BrandingSettings 
                            settings={settings} 
                            updateSetting={updateSetting} 
                            onLogoUpload={handleLogoUpload}
                            onLogoDelete={handleLogoDelete}
                            onNameSave={handleNameSave}
                        />
                        <EmailSettings settings={settings} updateSetting={updateSetting} />
                        <ApiSettings settings={settings} updateSetting={updateSetting} />
                        <PlatformSettings />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
