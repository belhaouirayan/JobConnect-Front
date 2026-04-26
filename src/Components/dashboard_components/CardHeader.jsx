import React from 'react';

const CardHeader = ({ title, colorClass = "bg-blue-500" }) => (
    <div className="px-6 py-5 border-b-2 border-blue-50 dark:border-gray-700/50 flex items-center gap-3 font-outfit">
        <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-gray-100 m-0 tracking-tight">{title}</h3>
    </div>
);

export default CardHeader;
