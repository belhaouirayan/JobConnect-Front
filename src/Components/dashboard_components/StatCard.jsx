import React from 'react';

const StatCard = ({ label, count, color }) => (
    <div className="jc-card p-5 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center gap-4">
            <div className={`w-2 h-12 rounded-full ${color || 'bg-blue-500'}`} />
            <div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    {count ?? '—'}
                </div>
                <div className="jc-label mt-0.5">{label}</div>
            </div>
        </div>
    </div>
);

export default StatCard;
