import React, { useMemo } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    Tooltip, Legend 
} from 'recharts';
import CardHeader from './CardHeader';

const CompatibilityChart = ({ candidates = [] }) => {
    const data = useMemo(() => {
        const counts = {
            Excellent: 0,
            Bon: 0,
            Moyen: 0,
            Faible: 0
        };

        candidates.forEach(c => {
            const score = c.score_ia || 0;
            if (score >= 80) counts.Excellent++;
            else if (score >= 60) counts.Bon++;
            else if (score >= 40) counts.Moyen++;
            else counts.Faible++;
        });

        return [
            { name: 'Excellent (80-100%)', value: counts.Excellent, color: '#10b981' },
            { name: 'Bon (60-79%)', value: counts.Bon, color: '#3b82f6' },
            { name: 'Moyen (40-59%)', value: counts.Moyen, color: '#f59e0b' },
            { name: 'Faible (< 40%)', value: counts.Faible, color: '#ef4444' }
        ].filter(d => d.value > 0);
    }, [candidates]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 shadow-xl border border-gray-100 dark:border-gray-700 rounded-lg outline-none font-inter">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {payload[0].value} candidat{payload[0].value > 1 ? 's' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
            <CardHeader title="Compatibilité des CV" colorClass="bg-purple-500" />
            
            <div className="p-6 h-[300px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                                formatter={(value) => (
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 font-inter">
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                            Pas assez de données pour générer le graphique
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompatibilityChart;
