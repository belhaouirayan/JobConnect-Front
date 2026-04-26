import React from 'react';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

// On récupère bien onView, onEdit, et onDelete du parent !
const ActionButtons = ({ offres, onView, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2">
      
      {/* BOUTON VOIR */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onView) onView(offres); // Envoie l'offre au parent (Offres.jsx)
        }}
        className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-full transition-colors duration-200"
        title="View"
      >
        <FiEye className="w-5 h-5" />
      </button>

      {/* BOUTON MODIFIER */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onEdit) onEdit(offres); // Envoie l'offre au parent (Offres.jsx)
        }}
        className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-full transition-colors duration-200"
        title="Edit"
      >
        <FiEdit className="w-5 h-5" />
      </button>

      {/* BOUTON SUPPRIMER */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onDelete) onDelete(offres); // Envoie l'offre au parent (Offres.jsx)
        }}
        className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-full transition-colors duration-200"
        title="Delete"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
      
    </div>
  );
};

export default ActionButtons;