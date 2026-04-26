import React from 'react';

const Badge = ({ status, children }) => {
    const getColors = (status) => {
        const s = status?.toLowerCase().replace('é', 'e');
        switch (s) {
            case 'admis':
            case 'accepted':
            case 'publiee':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
            case 'en_attente':
            case 'en attente':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
            case 'entretien':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30';
            case 'refuse':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const displayStatus = (s) => {
        const lower = s?.toLowerCase().replace('é', 'e');
        if (lower === 'admis' || lower === 'accepted' || lower === 'accepte') return 'ACCEPTÉ';
        return s?.replace('_', ' ');
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border backdrop-blur-sm transition-all duration-300 ${getColors(status)}`}>
            {children || displayStatus(status)}
        </span>
    );
};

export default Badge;
