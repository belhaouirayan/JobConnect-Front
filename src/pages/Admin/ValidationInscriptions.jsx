import React, { useEffect } from 'react';
import { useRecruitment } from '../../stores/RecruitmentStore';
import CardHeader from '../../Components/dashboard_components/CardHeader';

const ValidationInscriptions = () => {
  const { state, fetchModerationData, approveUser } = useRecruitment();
  const { pendingUsers, loading, error } = state.moderation;

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const handleApprove = async (id) => {
    await approveUser(id);
  };

  const handleReject = async (id) => {
    // We could add a rejectUser action to the store
    // For now, let's just use approveUser as a template
    console.log('Rejecting user:', id);
  };

  if (loading && pendingUsers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="text-lg font-bold text-gray-500">Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 font-inter dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
            Validation Inscriptions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            ADMINISTRATION / GESTION DES COMPTES RECRUTEURS
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold">
            Erreur: {error}
          </div>
        )}

        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader title="DEMANDES EN ATTENTE" colorClass="bg-blue-600" />
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Candidat</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Rôle</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {pendingUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-gray-100 uppercase tracking-tight">{user.name}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">ID: {user.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleApprove(user.id)}
                          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-none hover:opacity-80 transition-all border border-transparent"
                        >
                          Approuver
                        </button>
                        <button 
                          onClick={() => handleReject(user.id)}
                          className="px-4 py-2 bg-transparent text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-rose-200 dark:border-rose-800"
                        >
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-xs font-bold uppercase tracking-widest">
                      Aucune demande en attente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationInscriptions;
