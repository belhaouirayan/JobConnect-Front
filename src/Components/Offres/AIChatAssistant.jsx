import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../api'; 
import { FiSend, FiCpu, FiUser, FiCheckSquare } from 'react-icons/fi';

const AIChatAssistant = ({ onApplyText }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Bonjour ! Je suis votre assistant IA. Décrivez-moi l'offre que vous souhaitez publier. (Ex: Je cherche un Dev React à Casablanca pour 15000 MAD)" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { role: 'user', content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // ------------------------------------------------------------------------
      // NOUVELLE RÈGLE : L'IA doit collecter les infos spécifiques et ignorer le reste
      // ------------------------------------------------------------------------
      const instructionSecrete = `
      \n\nIMPORTANT: Agis comme un assistant RH très poli et humain. 
      Ton objectif est de rédiger une offre parfaite. 
      Vérifie si tu as toutes ces informations : Titre, Lieu, Type de contrat, Salaire, Devise, Date limite, Compétences clés.
      Si certaines de ces informations manquent, pose des questions courtes à l'utilisateur pour les obtenir.
      NE DEMANDE JAMAIS : le manager responsable, les plateformes de diffusion, ni les documents obligatoires (l'utilisateur s'en chargera).
      
      Dès que tu as assez d'informations pour générer l'offre, tu DOIS obligatoirement ajouter ce bloc à la toute fin de ton message avec ces mots-clés exacts :
      
      Titre : [Le titre de l'offre]
      Lieu : [Ville ou Remote, ou 'Non précisé']
      Type de contrat : [CDI, CDD, Stage ou Freelance]
      Salaire : [Uniquement les chiffres, ex: 5000, ou 'Non précisé']
      Devise : [Code exact de la devise, ex: MAD, EUR, USD, ou 'Non précisée']
      Date limite : [Date au format YYYY-MM-DD, ou 'Non précisée']
      Compétences : [Les compétences requises séparées par des virgules]
      Description :
      [Ton texte complet ici avec de vrais sauts de ligne naturels, des puces pour les missions, etc.]
      `;

      const chatHistoryForAPI = [...messages, userMessage]
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          text: msg.role === 'user' ? msg.content + instructionSecrete : msg.content
        }));

      const data = await apiRequest('/ai/generate', 'POST', {
        messages: chatHistoryForAPI
      });
      
      if (data && data.success) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.data }]);
      } else {
        const errorMessage = data?.error || data?.message || "Une erreur est survenue.";
        setMessages((prev) => [...prev, { role: 'ai', content: errorMessage, isError: true }]);
      }

    } catch (err) {
      console.error("Erreur API:", err);
      setMessages((prev) => [...prev, { role: 'ai', content: err.message || "Erreur de connexion.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[900px] w-full bg-gray-50 dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors duration-200">
      
      <div className="bg-white dark:bg-[#262a35] p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
          <FiCpu /> <span>Assistant JobConnect</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm flex flex-col shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : msg.isError 
                  ? 'bg-red-100 text-red-700 rounded-bl-none'
                  : 'bg-white dark:bg-[#262a35] text-gray-800 dark:text-gray-200 rounded-bl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold">
                {msg.role === 'user' ? <><FiUser/> Vous</> : <><FiCpu/> IA JobConnect</>}
              </div>
              
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              
              {/* BOUTON MAGIQUE */}
              {msg.role === 'ai' && !msg.isError && idx !== 0 && (() => {
                const text = msg.content;
                const hasTitre = /Titre\s*:\s*(.+)/i.test(text);
                const hasContrat = /Type de contrat\s*:\s*(.+)/i.test(text);
                const hasDescription = /Description\s*:\s*([\s\S]+)/i.test(text);
                return hasTitre && hasContrat && hasDescription;
              })() && (
                <button 
                  type="button"
                  onClick={() => {
                    const text = msg.content;
                    let extractedData = {};

                    try {
                      const titreMatch = text.match(/Titre\s*:\s*(.+)/i);
                      if (titreMatch) extractedData.titre = titreMatch[1].replace(/\*\*/g, '').trim();

                      // Ajout extraction Lieu
                      const lieuMatch = text.match(/Lieu\s*:\s*(.+)/i);
                      if (lieuMatch && !lieuMatch[1].toLowerCase().includes("précisé")) {
                        extractedData.lieu = lieuMatch[1].replace(/\*\*/g, '').trim();
                      }

                      const contratMatch = text.match(/Type de contrat\s*:\s*(.+)/i);
                      if (contratMatch) extractedData.type_contrat = contratMatch[1].replace(/\*\*/g, '').trim();

                      const competencesMatch = text.match(/Comp[ée]tences\s*:\s*(.+)/i);
                      if (competencesMatch) extractedData.competences = competencesMatch[1].replace(/\*\*/g, '').trim();

                      const descMatch = text.match(/Description\s*:\s*([\s\S]+)/i);
                      if (descMatch) extractedData.description = descMatch[1].trim();

                      const salaireMatch = text.match(/Salaire\s*:\s*(.+)/i);
                      if (salaireMatch && !salaireMatch[1].toLowerCase().includes("précisé")) {
                        const rawSalaire = salaireMatch[1].replace(/\*\*/g, '').trim();
                        const numbersOnly = rawSalaire.replace(/[^0-9.]/g, ''); 
                        extractedData.salaire = numbersOnly || rawSalaire;
                      }

                      const deviseMatch = text.match(/Devise\s*:\s*(.+)/i);
                      if (deviseMatch && !deviseMatch[1].toLowerCase().includes("précisée")) {
                        extractedData.devise = deviseMatch[1].replace(/\*\*/g, '').trim();
                      }

                      const dateLimiteMatch = text.match(/Date limite\s*:\s*(.+)/i);
                      if (dateLimiteMatch && !dateLimiteMatch[1].toLowerCase().includes("précisée")) {
                        extractedData.date_limite = dateLimiteMatch[1].replace(/\*\*/g, '').trim();
                      }

                      onApplyText(extractedData); 

                    } catch (error) {
                      console.error("Erreur de lecture du texte :", error);
                      onApplyText({ description: text }); 
                    }
                  }}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-bold border border-blue-200 transition-colors"
                >
                  <FiCheckSquare size={16} /> Remplir le formulaire avec ce texte
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 text-sm italic text-gray-500 rounded-lg rounded-bl-none shadow-sm">
              L'IA rédige une réponse...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#262a35] border-t border-gray-200 dark:border-gray-700 flex gap-2 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Poser une question"
          className="flex-1 bg-gray-50 dark:bg-[#1e222d] border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none h-10"
          rows="1"
        />
        <button 
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 rounded-md flex items-center justify-center"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant;