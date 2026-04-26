import React, { useState } from "react";
import { apiRequest } from "../../api";
import { useLanguage } from "../../Components/Navbar/LanguageContext";
import AddEntretienModal from "../../Components/Entretiens/AddEntretienModal";
import EntretiensCalendarView from "./EntretiensCalendarView";
import TabNavigation from "./TabNavigation";

const Candidats = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab actif = "entretien" car on est sur cette page
  const activeTab = "entretien";
  const setActiveTab = () => {}; // navigation gérée par TabNavigation

  return (
    <div className="min-h-screen p-6 text-gray-200">

      {/* ✅ TabNavigation — même style que CandidatesList et FinalDecision */}
      <div className="flex items-center justify-between">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Vue Entretiens */}
      <EntretiensCalendarView onAddClick={() => setIsModalOpen(true)} />

      {/* Modal Planification */}
      {isModalOpen && (
        <AddEntretienModal
          onClose={() => setIsModalOpen(false)}
          onRefresh={() => {
            window.dispatchEvent(new Event("refreshEntretiens"));
          }}
        />
      )}
    </div>
  );
};

export default Candidats;