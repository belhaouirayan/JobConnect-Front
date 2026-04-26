import React, { useState } from 'react';
import CardHeader from '../dashboard_components/CardHeader';
import { Link2, Linkedin, Chrome } from 'lucide-react';

const IntegrationSettings = ({ settings, updateSetting }) => {
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [googleEmail, setGoogleEmail] = useState('');
    const [linkedinError, setLinkedinError] = useState('');
    const [googleError, setGoogleError] = useState('');

    const handleLinkedinConnect = () => {
        if (!linkedinUrl) {
            setLinkedinError('Veuillez entrer une URL LinkedIn.');
            return;
        }
        
        // Basic LinkedIn URL validation
        const regex = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/*/;
        if (!regex.test(linkedinUrl)) {
            setLinkedinError('Veuillez entrer une URL LinkedIn valide (ex: https://linkedin.com/in/profil).');
            return;
        }

        setLinkedinError('');
        updateSetting('linkedinConnected', true);
        updateSetting('linkedinUrl', linkedinUrl);
    };

    const handleGoogleConnect = () => {
        if (!googleEmail) {
            setGoogleError('Veuillez entrer une adresse e-mail Google.');
            return;
        }

        // Basic Email validation
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(googleEmail)) {
            setGoogleError('Veuillez entrer une adresse e-mail valide.');
            return;
        }

        setGoogleError('');
        updateSetting('googleConnected', true);
        updateSetting('googleEmail', googleEmail);
    };

    const handleDisconnect = (provider) => {
        if (provider === 'linkedin') {
            updateSetting('linkedinConnected', false);
            updateSetting('linkedinUrl', '');
            setLinkedinUrl('');
        } else if (provider === 'google') {
            updateSetting('googleConnected', false);
            updateSetting('googleEmail', '');
            setGoogleEmail('');
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
            <CardHeader title="Comptes liés" colorClass="bg-indigo-500" icon={<Link2 size={18} className="text-white" />} />
            
            <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Liez vos comptes pour faciliter la connexion, le partage d'offres et l'importation de candidats.
                </p>

                <div className="space-y-6">
                    {/* LinkedIn Integration */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#0A66C2] p-2.5 rounded-lg text-white">
                                    <Linkedin size={22} fill="currentColor" className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">LinkedIn</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Lien vers la page de l'entreprise ou recruteur</p>
                                </div>
                            </div>
                            
                            {settings.linkedinConnected ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Connecté</span>
                                    <button 
                                        onClick={() => handleDisconnect('linkedin')}
                                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                    >
                                        Dissocier
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {!settings.linkedinConnected && (
                            <div className="mt-3 flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input 
                                        type="url"
                                        placeholder="https://linkedin.com/in/votre-profil"
                                        value={linkedinUrl}
                                        onChange={(e) => {
                                            setLinkedinUrl(e.target.value);
                                            setLinkedinError('');
                                        }}
                                        className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${linkedinError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    />
                                    {linkedinError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{linkedinError}</p>}
                                </div>
                                <button 
                                    onClick={handleLinkedinConnect}
                                    className="whitespace-nowrap px-4 py-2.5 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Lier le compte
                                </button>
                            </div>
                        )}
                        {settings.linkedinConnected && settings.linkedinUrl && (
                             <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md" title={settings.linkedinUrl}>
                                {settings.linkedinUrl}
                             </p>
                        )}
                    </div>

                    {/* Google Workspace Integration */}
                     <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-white border border-gray-200 dark:border-gray-600 dark:bg-gray-700 p-2.5 rounded-lg">
                                    <Chrome size={22} className="text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Google Workspace</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Adresse e-mail professionnelle</p>
                                </div>
                            </div>

                             {settings.googleConnected ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Connecté</span>
                                    <button 
                                        onClick={() => handleDisconnect('google')}
                                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                    >
                                        Dissocier
                                    </button>
                                </div>
                            ) : null}
                        </div>

                         {!settings.googleConnected && (
                            <div className="mt-3 flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input 
                                        type="email"
                                        placeholder="recrutement@votre-entreprise.com"
                                        value={googleEmail}
                                        onChange={(e) => {
                                            setGoogleEmail(e.target.value);
                                            setGoogleError('');
                                        }}
                                        className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${googleError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    />
                                     {googleError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{googleError}</p>}
                                </div>
                                <button 
                                    onClick={handleGoogleConnect}
                                    className="whitespace-nowrap px-4 py-2.5 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Lier le compte
                                </button>
                            </div>
                        )}
                         {settings.googleConnected && settings.googleEmail && (
                             <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                                {settings.googleEmail}
                             </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationSettings;
