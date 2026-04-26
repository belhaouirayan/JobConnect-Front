import React from 'react';
import CardHeader from '../dashboard_components/CardHeader';

const BrandingSettings = ({ settings, updateSetting, onLogoUpload, onLogoDelete, onNameSave }) => {
    return (
        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
            <CardHeader title="Identité Visuelle" colorClass="bg-indigo-500" />
            
            <div className="p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 group transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                            {settings.logoUrl ? (
                                <>
                                    <img 
                                        src={settings.logoUrl} 
                                        alt="Logo Entreprise" 
                                        className="max-w-full max-h-full object-contain p-2" 
                                    />
                                    <button 
                                        onClick={onLogoDelete}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-black text-white text-[10px] uppercase tracking-widest"
                                    >
                                        SUPPRIMER
                                    </button>
                                </>
                            ) : (
                                <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest">LOGO</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Logo de l'entreprise</h3>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 max-w-md uppercase tracking-tight">
                            Formats : PNG, JPG, SVG. Max 2 Mo.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <label className="cursor-pointer px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest transition-all">
                                {settings.logoUrl ? "CHANGER" : "CHOISIR"}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) onLogoUpload(file);
                                    }}
                                />
                            </label>
                            {settings.logoUrl && (
                                <button 
                                    onClick={onLogoDelete}
                                    className="px-4 py-2 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30"
                                >
                                    SUPPRIMER
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                        Nom de l'entreprise
                    </label>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={settings.nomEntreprise || ''}
                            onChange={(e) => updateSetting('nomEntreprise', e.target.value)}
                            placeholder="Ex: JobConnect"
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-none focus:ring-0 focus:border-gray-900 block p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold" 
                        />
                        <button 
                            onClick={onNameSave}
                            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            ENREGISTRER
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingSettings;
