import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useLanguage } from '../Navbar/LanguageContext';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems
}) => {
  const { t } = useLanguage();
  
  const getPageNumbers = () => {
    const delta = 2; 
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white dark:!bg-gray-900 border-t border-gray-200 dark:!border-gray-800 gap-4">
      <div className="text-sm text-gray-600 dark:!text-gray-300">
        <span className="font-medium dark:!text-gray-200">{indexOfFirstItem + 1}</span>
        {" - "}
        <span className="font-medium dark:!text-gray-200">
          {Math.min(indexOfLastItem, totalItems)}
        </span>
        {" "}{t("of")}{" "}
        <span className="font-medium dark:!text-gray-200">{totalItems}</span>
        {" "}{t("results") || "résultats"}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-2xl ${
            currentPage === 1
              ? "text-gray-400 dark:!text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:!text-gray-300 hover:bg-gray-100 dark:hover:!bg-gray-800 hover:text-gray-900 dark:hover:!text-gray-100"
          }`}
          aria-label={t("firstPage") || "Première page"}
        >
          <FiChevronsLeft size={18} />
        </button>

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-2xl ${
            currentPage === 1
              ? "text-gray-400 dark:!text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:!text-gray-300 hover:bg-gray-100 dark:hover:!bg-gray-800 hover:text-gray-900 dark:hover:!text-gray-100"
          }`}
          aria-label={t("previous") || "Précédent"}
        >
          <FiChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((pageNumber, index) => (
            pageNumber === '...' ? (
              <span key={`dots-${index}`} className="px-2 py-1 text-gray-400 dark:!text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`min-w-[36px] h-9 flex items-center justify-center rounded-2xl text-sm font-medium ${
                  currentPage === pageNumber
                    ? "bg-blue-500 dark:!bg-blue-600 text-white"
                    : "text-gray-600 dark:!text-gray-300 hover:bg-gray-100 dark:hover:!bg-gray-800"
                }`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-2xl ${
            currentPage === totalPages
              ? "text-gray-400 dark:!text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:!text-gray-300 hover:bg-gray-100 dark:hover:!bg-gray-800 hover:text-gray-900 dark:hover:!text-gray-100"
          }`}
          aria-label={t("next") || "Suivant"}
        >
          <FiChevronRight size={18} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-2xl ${
            currentPage === totalPages
              ? "text-gray-400 dark:!text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:!text-gray-300 hover:bg-gray-100 dark:hover:!bg-gray-800 hover:text-gray-900 dark:hover:!text-gray-100"
          }`}
          aria-label={t("lastPage") || "Dernière page"}
        >
          <FiChevronsRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:!text-gray-300">{t("goTo") || "Aller à"}:</span>
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 dark:!border-gray-600 rounded-2xl bg-white dark:!bg-gray-800 text-gray-700 dark:!text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:!focus:ring-blue-400"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
        <span className="text-gray-600 dark:!text-gray-300">
          / {totalPages}
        </span>
      </div>
    </div>
  );
};

export default Pagination;