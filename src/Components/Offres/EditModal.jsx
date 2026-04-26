import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api'; 
import { FiX, FiCalendar, FiUser } from 'react-icons/fi';

const EditModal = ({ offre, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titre: '',
    lieu: '',
    contrat_id: '',
    manager_id: '',
    salaire: '',
    id_currency: '',
    competences: '',
    date_limite: '', 
    description: '',
    statut: '',
    // NOUVEAU: Initialisation des checkboxes
    require_permit: false,
    require_diplome: false,
    require_habilitation: false,
    require_lettre: false,
    require_autres: false,
  });

  const [contratsList, setContratsList] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);

  useEffect(() => {
    if (offre) {
      setFormData({
        titre: offre.titre || '',
        lieu: offre.lieu || '',
        contrat_id: offre.contrat_id || '',
        manager_id: offre.manager_id || '',
        salaire: offre.salaire || '',
        id_currency: offre.id_currency || '',
        competences: offre.competences || '',
        // CORRECTION: Assigner uniquement la partie date "YYYY-MM-DD"
        date_limite: offre.date_limite ? offre.date_limite.split('T')[0] : '', 
        description: offre.description || '',
        statut: offre.statut || 'brouillon',
        require_permit: !!offre.require_permit,
        require_diplome: !!offre.require_diplome,
        require_habilitation: !!offre.require_habilitation,
        require_lettre: !!offre.require_lettre,
        require_autres: !!offre.require_autres,
      });
    }

    const fetchLists = async () => {
      try {
        const [contractTypes, managers, currencies] = await Promise.all([
          apiRequest('/contract-types', 'GET'),
          apiRequest('/managers', 'GET'),
          apiRequest('/currencies', 'GET')
        ]);

        const normalizeList = (response) => {
          if (Array.isArray(response)) return response;
          if (Array.isArray(response?.data)) return response.data;
          return [];
        };

        const contractList = normalizeList(contractTypes);
        const managerList = normalizeList(managers);
        const currencyList = normalizeList(currencies);
        
        setContratsList(contractList);
        setManagersList(managerList);
        setCurrenciesList(currencyList);

        if (contractList.length === 0) {
          console.debug('[EditModal] /api/contract-types returned an empty array.', contractTypes);
        }
        if (managerList.length === 0) {
          console.debug('[EditModal] /api/managers returned an empty array.', managers);
        }
        if (currencyList.length === 0) {
          console.debug('[EditModal] /api/currencies returned an empty array.', currencies);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des listes:", error);
      }
    };

    fetchLists();
  }, [offre]);

  // Modifié pour gérer à la fois les textes et les checkboxes
  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        contrat_id: formData.contrat_id ? parseInt(formData.contrat_id, 10) : null,
        manager_id: formData.manager_id ? parseInt(formData.manager_id, 10) : null,
        id_currency: formData.id_currency ? parseInt(formData.id_currency, 10) : null,
        date_limite: formData.date_limite || null,
      };

      await apiRequest(`/offres/${offre.id}`, 'PUT', dataToSubmit);
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  if (!offre) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all">
        
        {/* Header Modale */}
        <div className="sticky top-0 bg-white dark:bg-[#1a202c] px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Modifier l'offre</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Corps Modale */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-gray-700 dark:text-gray-300">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre de l'offre</label>
              <input type="text" name="titre" value={formData.titre} onChange={handleInputChange} required
                className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lieu</label>
              <input type="text" name="lieu" value={formData.lieu} onChange={handleInputChange} required
                className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type de contrat</label>
              <select name="contrat_id" value={formData.contrat_id} onChange={handleInputChange} required
                className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner</option>
                {contratsList.map(c => <option key={c.id_contrat} value={c.id_contrat}>{c.type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FiUser/> Manager Responsable</label>
              <select name="manager_id" value={formData.manager_id} onChange={handleInputChange} required
                className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="">Assigner un manager</option>
                {managersList.map(m => <option key={m.id_employe} value={m.id_employe}>{m.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Salaire & Devise</label>
              <div className="flex gap-2">
                <input type="text" name="salaire" value={formData.salaire} onChange={handleInputChange} 
                  className="w-2/3 bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                <select name="id_currency" value={formData.id_currency} onChange={handleInputChange}
                  className="w-1/3 bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">Devise</option>
                  {currenciesList.map(c => <option key={c.id_currency} value={c.id_currency}>{c.currency}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FiCalendar/> Date limite</label>
              <input type="date" name="date_limite" value={formData.date_limite} onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Compétences</label>
            <input type="text" name="competences" value={formData.competences} onChange={handleInputChange}
              className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows="5" value={formData.description} onChange={handleInputChange} required
              className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select name="statut" value={formData.statut} onChange={handleInputChange}
              className="w-full bg-gray-50 dark:bg-[#2d3748] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="brouillon">Brouillon</option>
              <option value="publié">Publié</option>
              <option value="en attente">En attente</option>
              <option value="clôturé">Clôturé</option>
            </select>
          </div>

          {/* NOUVEAU : Case à cocher pour les documents requis */}
          <div className="bg-gray-50 dark:bg-[#2d3748] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold mb-3 dark:text-gray-300">
              Documents obligatoires pour postuler (Le CV est toujours requis) :
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'permit', label: 'Permis de conduire' },
                { id: 'diplome', label: 'Copie du diplôme' },
                { id: 'habilitation', label: 'Justif. habitation' },
                { id: 'lettre', label: 'Lettre de motiv.' }
              ].map(doc => (
                <label key={doc.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    name={`require_${doc.id}`} 
                    checked={formData[`require_${doc.id}`]} 
                    onChange={handleInputChange} 
                    className="w-4 h-4 text-blue-600 rounded" 
                  />
                  {doc.label}
                </label>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} 
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Annuler
            </button>
            <button type="submit" 
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;