import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../api'; 
import { FiSend, FiCpu, FiUser, FiCheckSquare } from 'react-icons/fi';

const AIChatAssistantEntretien = ({ onApplyText, candidateName, interviewType, offerTitle, offerDescription, offerCompetences, aiScore, currentEvaluation }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: `Je suis prêt à rédiger le compte-rendu pour ${candidateName} (Poste : ${offerTitle || 'Non spécifié'}). Transmettez-moi vos notes ou points clés de l'entretien.` 
    }
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
      const instructionSecrete = `
      \n\nCONTEXTE: Entretien avec ${candidateName} (${interviewType}).
      POSTE CONCERNÉ: ${offerTitle && offerTitle.trim() !== '' ? offerTitle : 'Candidature spontanée ou Poste non renseigné'}
      DÉTAILS DE L'OFFRE: ${offerDescription ? offerDescription : "Aucune description de l'offre fournie"}
      COMPÉTENCES REQUISES: ${offerCompetences ? offerCompetences : "Aucune compétence spécifique répertoriée"}
      
      ÉVALUATION DU CANDIDAT (POURCENTAGE):
      - Score IA (Matching Initial): ${aiScore ? aiScore + '%' : 'Non évalué'}
      - Évaluation Recruteur Actuelle: ${currentEvaluation ? currentEvaluation + '%' : 'Non renseigné'}
      
      TON RÔLE: Tu es un expert RH spécialisé UNIQUEMENT dans la RÉDACTION DE COMPTE-RENDU D'ENTRETIEN.
      
      CONSIGNES CRITIQUES ET INTERDICTIONS ABSOLUES :
      - NE DEMANDE JAMAIS QUEL EST LE POSTE DU CANDIDAT ou le pourcentage. Tu as toutes ces informations ci-dessus.
      - Ne pose JAMAIS la moindre question au recruteur à la fin de ton message GÉNÉRE RÉELLEMENT LE RAPPORT.
      - Si l'utilisateur dit simplement "Bonjour", "Hello", ou une salutation, réponds poliment et rappelle-lui que tu es prêt à recevoir ses notes pour générer le rapport. NE génère AUCUN rapport tant que tu n'as pas de notes.
      - RÈGLE D'OR DE L'ÉQUILIBRE : Si les notes fournies par le recruteur ne mentionnent que des points Forts/Avantages, NE GÉNÈRE PAS LE RAPPORT TOUT DE SUITE. Remercie pour ces points et demande poliment au recruteur s'il a identifié des "Points de vigilance" ou des "Axes d'amélioration" pour que le dossier soit complet et impartial.
      - GÉNÈRE LE RAPPORT IMMÉDIATEMENT UNIQUEMENT dès que tu as des notes équilibrées (ou si le recruteur confirme qu'il n'y a pas de points faibles après ta demande). Agis en mode "Exécution", pas en mode "Conversation".
      - Utilise les "Compétences Requises" pour valider la pertinence des points forts/faibles mentionnés.
      - Si l'Évaluation Recruteur Actuelle est basse, ton rapport doit être cohérent avec cette note de vigilance.
      
      TA MISSION :
      Analyser les notes pour produire le rapport final complet INSTANTANÉMENT, en comparant les retours d'entretien avec les exigences de l'offre.
      
      STRUCTURE DU RAPPORT À GÉNÉRER :
      - Synthèse de l'échange
      - Points Forts (Techniques & Soft Skills relatifs à l'offre)
      - Points de vigilance (Écarts par rapport à l'offre)
      - Opinion / Verdict RH (Analyse de l'adéquation spécifique au poste : ${offerTitle})
      - Recommandation finale (Embauche, 2ème entretien, ou Rejet)
      
      CONSIGNE DE RÉDACTION DE L'OPINION :
      L'Opinion RH doit être tranchée. Utilise les "Détails de l'offre" et les "Compétences Requises" pour justifier si le candidat est le "bon fit" pour ce poste précis. Ne sois pas générique, sois spécifique aux besoins de l'entreprise.
      
      RÈGLE D'OR 1: PAS de gras (**), listes simples (-).
      RÈGLE D'OR 2: Langage RH direct et affirmatif.
      RÈGLE D'OR 3: Encadre strictement tout ton rapport entre les mots [DEBUT_RAPPORT] et [FIN_RAPPORT].
      `;

      // On retire le tout premier message (le message de bienvenue de l'IA)
      // car Google Gemini exige que la conversation commence par l'utilisateur.
      const chatHistoryForAPI = [...messages, userMessage]
        .filter((msg, index) => !msg.isError && index !== 0) 
        .map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          text: msg.content
        }));

      // Validation de l'alternance stricte user / model pour Google Gemini
      const filteredHistory = [];
      let lastRole = null;
      for (const msg of chatHistoryForAPI) {
        if (msg.role !== lastRole) {
          filteredHistory.push(msg);
          lastRole = msg.role;
        } else {
          // Fusionner avec le précédent message si même rôle
          filteredHistory[filteredHistory.length - 1].text += "\n\n" + msg.text;
        }
      }

      // Le premier message doit absolument être "user"
      if (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
        filteredHistory.shift();
      }

      const data = await apiRequest('/ai/generate', 'POST', {
        messages: filteredHistory,
        system_instruction: instructionSecrete
      });
      
      if (data && data.success) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.data }]);
      } else {
        let errorMessage = "Une erreur est survenue.";
        const errorBody = data?.error?.toString() || "";
        
        if (errorBody.includes("surchargé") || errorBody.includes("429")) {
          errorMessage = "L'assistant est temporairement surchargé (Quota API atteint). Veuillez patienter environ 1 minute avant de renvoyer votre message.";
        } else if (errorBody.includes("400")) {
          errorMessage = "Erreur de configuration (HTTP 400). Vérifiez votre clé API dans les paramètres.";
        } else {
          errorMessage = data?.error || data?.message || "Erreur lors de la communication avec l'IA.";
        }
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
    <div className="flex flex-col h-[500px] w-full bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all">
      
      <div className="bg-blue-600 p-3 border-b border-blue-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-white font-semibold">
          <FiCpu /> <span>Assistant de Rédaction IA</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-3 text-sm flex flex-col shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : msg.isError 
                  ? 'bg-red-100 text-red-700 rounded-bl-none'
                  : 'bg-white dark:bg-[#262a35] text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] font-bold uppercase tracking-wider">
                {msg.role === 'user' ? <><FiUser/> Vous</> : <><FiCpu/> IA JobConnect</>}
              </div>
              
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              
              {msg.role === 'ai' && !msg.isError && idx !== 0 && idx === messages.length - 1 && 
                (msg.content.includes("[DEBUT_RAPPORT]") || msg.content.toUpperCase().includes("RAPPORT FINAL")) && (
                <button 
                  type="button"
                  onClick={() => {
                    // Extraction par regex plus flexible des balises DEBUT_RAPPORT et FIN_RAPPORT
                    let textToApply = msg.content;
                    const match = textToApply.match(/(?:\[?DEBUT_RAPPORT\]?)([\s\S]*?)(?:\[?FIN_RAPPORT\]?)/i);
                    
                    if (match && match[1]) {
                      textToApply = match[1].trim();
                    } else if (textToApply.toLowerCase().includes("rapport final")) {
                      // Fallback si l'IA utilise une autre nomenclature
                      const parts = textToApply.split(/RAPPORT FINAL\s*:?/i);
                      textToApply = parts[parts.length - 1].trim();
                    }
                    
                    // Nettoyage complet du Markdown (gras, titres, listes à puces, citations)
                    textToApply = textToApply
                      .replace(/\*\*/g, '')           // Supprime le gras
                      .replace(/\*/g, '')            // Supprime l'italique ou puces simples
                      .replace(/#{1,6}\s?/g, '')     // Supprime les titres MD (# Heur)
                      .replace(/^>\s*/gm, '')        // Supprime les citations (>)
                      .replace(/- /g, '• ')          // Harmonise les puces
                      .trim();
                    
                    onApplyText(textToApply);
                  }}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800 transition-all"
                >
                  <FiCheckSquare size={14} /> Utiliser ce compte-rendu
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#262a35] p-3 text-xs italic text-gray-500 rounded-lg rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700">
              Analyse des notes et rédaction...
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
          placeholder="Décrivez l'entretien (ex: Bonnes soft skills, manque xp React...)"
          className="flex-1 bg-gray-50 dark:bg-[#1e222d] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-12"
          rows="1"
        />
        <button 
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white w-12 rounded-lg flex items-center justify-center transition-colors shadow-md"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistantEntretien;
