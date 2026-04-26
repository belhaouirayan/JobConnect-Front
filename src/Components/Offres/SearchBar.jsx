import { FiSearch } from 'react-icons/fi';
import { useLanguage } from '../Navbar/LanguageContext';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const { t } = useLanguage();
  
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder="Rechercher..."
        className="w-full h-[40px] pl-10 pr-4 py-2 text-sm bg-white dark:!bg-gray-900 text-gray-900 dark:!text-gray-100 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-0 focus:border-blue-500 transition-colors duration-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;