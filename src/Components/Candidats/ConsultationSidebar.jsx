// src/Components/Candidats/ConsultationSidebar.jsx
import React, { useState } from 'react';

const ConsultationSidebar = ({ filters, onFilterChange, collapsed, onToggle }) => {
  const [local, setLocal] = useState({
    titre: filters?.titre || '',
    ville: filters?.ville || '',
    entreprise: filters?.entreprise || '',
  });

  const handleChange = (key, value) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onFilterChange?.(updated);
  };

  const clearAll = () => {
    const cleared = { titre: '', ville: '', entreprise: '' };
    setLocal(cleared);
    onFilterChange?.(cleared);
  };

  const hasFilters = local.titre || local.ville || local.entreprise;

  return (
    <div className={`transition-all duration-300 ${collapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-72'}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Consultation
          </h3>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Title filter */}
        <div className="space-y-1">
          <label className="jc-label">Titre du poste</label>
          <input
            type="text"
            value={local.titre}
            onChange={e => handleChange('titre', e.target.value)}
            placeholder="Ex: Développeur..."
            className="jc-input text-sm"
          />
        </div>

        {/* City filter */}
        <div className="space-y-1">
          <label className="jc-label">Ville</label>
          <input
            type="text"
            value={local.ville}
            onChange={e => handleChange('ville', e.target.value)}
            placeholder="Ex: Casablanca..."
            className="jc-input text-sm"
          />
        </div>

        {/* Company filter */}
        <div className="space-y-1">
          <label className="jc-label">Entreprise / Département</label>
          <input
            type="text"
            value={local.entreprise}
            onChange={e => handleChange('entreprise', e.target.value)}
            placeholder="Ex: IT..."
            className="jc-input text-sm"
          />
        </div>

        {/* Active filters indicator */}
        {hasFilters && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Filtres actifs : {[local.titre && 'Titre', local.ville && 'Ville', local.entreprise && 'Entreprise'].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationSidebar;
