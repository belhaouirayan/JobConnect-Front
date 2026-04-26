import React from 'react';
import { Search, Filter, Pin, Users, Globe, LayoutList } from 'lucide-react';

const FilterBar = ({ searchQuery, setSearchQuery, categoryFilter, setCategoryFilter }) => {
  
  const filters = [
    { id: 'all', label: 'Toutes', icon: <LayoutList size={16} /> },
    { id: 'internal', label: 'Interne', icon: <Users size={16} /> },
    { id: 'external', label: 'Externe', icon: <Globe size={16} /> },
    { id: 'pinned', label: 'Épinglé', icon: <Pin size={16} /> },
  ];

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCategoryFilter(filter.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                categoryFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-[#1a202c] border focus:border-blue-500 dark:border-gray-700 dark:focus:border-blue-500 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none transition-all duration-300 shadow-sm focus:shadow-md focus:shadow-blue-500/10 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

      </div>
    </div>
  );
};

export default FilterBar;
