import React, { useState } from 'react';
import AddClientsButton from './AddOffresButton';
import ExportButton from './ExportButton';
import SearchBar from './SearchBar';
import DigitalSignatureButton from './SignatureButton';

const SearchAndFilterClients = ({ 
  searchTerm, 
  setSearchTerm, 
  onAddNew,
  currentViewData,
  allData
}) => {
 const [isModalOpen, setIsModalOpen] = useState(false);
  const [signature, setSignature] = useState(null);

  
  React.useEffect(() => {
    const savedSignature = localStorage.getItem('savedSignature');
    if (savedSignature) {
      setSignature(savedSignature);
    }
  }, []);
  
  const handleAddNew = (companyData) => {
    onAddNew(companyData);
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="flex flex-col my-3 md:flex-row justify-between items-start md:items-center">
        <AddClientsButton onClick={onAddNew} />
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
  <div className="flex space-x-2">
       
  <ExportButton currentViewData={currentViewData} allData={allData} 
    signature={signature}
    />
    <DigitalSignatureButton onClick={() => {/* handler */}} 
        onSaveSignature={(sig) => setSignature(sig)} 
        signature={signature}/>
  </div>
  
  <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
</div>
      </div>

     
    </>
  );
};

export default SearchAndFilterClients;