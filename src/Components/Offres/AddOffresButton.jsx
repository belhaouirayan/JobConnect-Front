import React from 'react';
import { FiPlus } from 'react-icons/fi';

const AddOffresButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="bg-blue-600 font-semibold text-white px-3 py-2 rounded shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
    >
      <FiPlus className="mr-2" />
      Add
    </button>
  );
};

export default AddOffresButton;