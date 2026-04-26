import React from 'react';
import CardHeader from '../dashboard_components/CardHeader';
import { Settings2, Clock } from 'lucide-react';

const GeneralSettings = ({ settings, updateSetting }) => {
    return (
        <>

            {/* CV Limits Card */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
                <CardHeader title="Limites de CV" colorClass="bg-blue-500" icon={<Settings2 size={18} className="text-white" />} />
                
                <div className="p-5 sm:p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Limite de CV par offre
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                min="1"
                                value={settings.cvLimitPerOffer}
                                onChange={(e) => updateSetting('cvLimitPerOffer', parseInt(e.target.value) || 0)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">CVs par poste</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Le nombre maximum de candidatures autorisées pour une seule offre d'emploi.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Limite de CV globale (Espace de stockage)
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                min="1"
                                value={settings.cvLimitGeneral}
                                onChange={(e) => updateSetting('cvLimitGeneral', parseInt(e.target.value) || 0)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">CVs au total</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            La capacité totale de CVs que vous pouvez stocker sur votre compte.
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Retention Card */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
                <CardHeader title="Rétention des données" colorClass="bg-teal-500" icon={<Clock size={18} className="text-white" />} />
                
                <div className="p-5 sm:p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Masquer les anciens posts après
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                min="1"
                                max="365"
                                value={settings.oldPostsRetentionDays}
                                onChange={(e) => updateSetting('oldPostsRetentionDays', parseInt(e.target.value) || 7)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">jours</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Les posts plus anciens que cette période seront masqués de l'interface (non supprimés de la base de données).
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Masquer les candidats refusés après
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                min="1"
                                max="365"
                                value={settings.refusedCandidatesRetentionDays}
                                onChange={(e) => updateSetting('refusedCandidatesRetentionDays', parseInt(e.target.value) || 30)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">jours</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Les candidatures refusées plus anciennes que cette période seront masquées des listes.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Masquer les candidats des offres terminées après
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                min="1"
                                max="365"
                                value={settings.endedOfferCandidatesRetentionDays}
                                onChange={(e) => updateSetting('endedOfferCandidatesRetentionDays', parseInt(e.target.value) || 7)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">jours</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Les candidats provenant d'offres terminées seront masqués après cette période.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeneralSettings;
