import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickAction = ({ label, path, state, primary }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(path, { state })}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border text-center ${
                primary
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
            }`}
        >
            {primary ? '+ ' : ''}{label}
        </button>
    );
};

export default QuickAction;
