import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TabNavigation from "../../Components/Offres/TabNavigation";
import SearchAndFilterClients from "../../Components/Offres/SearchAndFilteroffres";
import CreateOffre from "../../Components/Offres/CreateOffre"; 
import TableView from "../../Components/Offres/TableView";
import ViewOffreModal from '../../Components/Offres/ViewModal';
import EditOffreModal from '../../Components/Offres/EditModal';
import DeleteOffreModal from '../../Components/Offres/DeleteModal'; 
import { apiRequest } from "../../api"; 

const Offres = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("offres");
  const [isCreating, setIsCreating] = useState(false);
  const [offresData, setOffresData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour gérer les fenêtres modales
  const [viewOffre, setViewOffre] = useState(null);
  const [editOffre, setEditOffre] = useState(null);
  const [deleteOffre, setDeleteOffre] = useState(null);

  useEffect(() => {
    if (location.state?.create) {
      setIsCreating(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchOffres = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/offres', 'GET');
      if (data && data.data && Array.isArray(data.data)) {
        setOffresData(data.data);
      } else if (Array.isArray(data)) {
        setOffresData(data);
      } else {
        setOffresData([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error);
      setOffresData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffres();
  }, []);

  const handleAddNew = () => setIsCreating(true);

  const handleFormClose = () => {
    setIsCreating(false);
    fetchOffres(); 
  };

  // Fonction pour confirmer la suppression (appelée par le DeleteModal)
  const handleDeleteConfirm = async (id) => {
    await apiRequest(`/offres/${id}`, 'DELETE');
    fetchOffres(); // Rafraîchit le tableau après suppression
  };

  // Sécurité : Si les boutons d'action envoient un ID au lieu de l'objet complet, on retrouve l'objet
  const handleOpenModal = (setter) => (offreOrId) => {
    const offre = typeof offreOrId === 'object' ? offreOrId : offresData.find(o => o.id === offreOrId);
    setter(offre);
  };

  const filteredOffres = offresData.filter((offre) =>
    offre.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offre.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // 'relative' est important pour que les modales (en absolute/fixed) se positionnent bien
    <div className="relative min-h-screen px-6 py-2 text-gray-200">
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {isCreating ? (
        <div className="mt-4">
            <button onClick={() => setIsCreating(false)} className="mb-4 text-sm text-gray-400 hover:text-white">
                &larr; Retour à la liste
            </button>
            <CreateOffre onCancel={handleFormClose} onSuccess={handleFormClose} />
        </div>
      ) : (
        <>
          <SearchAndFilterClients
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddNew={handleAddNew}
            currentViewData={filteredOffres}
            allData={offresData}
          />

          <TableView 
            offres={filteredOffres} 
            isLoading={isLoading} 
            onView={handleOpenModal(setViewOffre)}
            onEdit={handleOpenModal(setEditOffre)}
            onDelete={handleOpenModal(setDeleteOffre)}
          />
        </>
      )}

      {/* --- LES MODALES --- */}

      {/* 1. Modal Voir */}
      {viewOffre && (
        <ViewOffreModal 
          offre={viewOffre} 
          onClose={() => setViewOffre(null)} 
        />
      )}

      {/* 2. Modal Modifier */}
      {editOffre && (
        <EditOffreModal 
          offre={editOffre} 
          onClose={() => setEditOffre(null)} 
          onSuccess={() => {
            setEditOffre(null);
            fetchOffres(); // Rafraîchit les données après la modif
          }} 
        />
      )}

      {/* 3. Modal Supprimer (On ne le met pas dans un {deleteOffre &&} pour garder l'animation AnimatePresence de Framer Motion) */}
      <DeleteOffreModal 
        isOpen={!!deleteOffre} 
        offres={deleteOffre || {}} 
        onClose={() => setDeleteOffre(null)} 
        onConfirm={handleDeleteConfirm} 
      />

    </div>
  );
};

export default Offres;