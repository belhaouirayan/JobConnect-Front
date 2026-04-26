import React, { useEffect } from 'react';
import { useRecruitment } from '../../stores/RecruitmentStore';
import CardHeader from '../../Components/dashboard_components/CardHeader';

const ModerationOffres = () => {
  const { state, fetchModerationData } = useRecruitment();
  const { flaggedOffers, loading, error } = state.moderation;

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const handleWarn = (id) => {
    // API call to warn user
    console.log('Warning for offer:', id);
  };

  const handleBlock = (id) => {
    // API call to block user
    console.log('Blocking for offer:', id);
  };

  if (loading && flaggedOffers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="text-lg font-bold text-gray-500 uppercase tracking-widest">Analyse en cours...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 font-inter dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
            Sécurité du Contenu
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
            Modération des Offres / Surveillance IA
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold">
            Erreur: {error}
          </div>
        )}

        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader title="CONTENU SIGNALÉ" colorClass="bg-rose-600" />
          
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {flaggedOffers.map(offer => (
              <div key={offer.id} className="p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {offer.titre}
                    </h3>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] bg-rose-600 text-white border border-rose-600">
                      FLAGGED
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
                    ID: {offer.id} / PAR {offer.manager?.nom || 'INCONNU'} / LE {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 border-l-2 border-rose-500">
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Motif de signalement</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">Contenu potentiellement inapproprié détecté par l'analyseur sémantique.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button 
                    onClick={() => handleWarn(offer.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Avertir
                  </button>
                  <button 
                    onClick={() => handleBlock(offer.id)}
                    className="px-4 py-2 bg-gray-900 dark:bg-black hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Bloquer
                  </button>
                </div>
              </div>
            ))}
            {flaggedOffers.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-400 dark:text-gray-600 text-xs font-bold uppercase tracking-widest">
                Aucune alerte de sécurité active
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationOffres;
