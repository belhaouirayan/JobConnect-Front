import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail, Calendar, Clock, MapPin, Video, Info } from 'lucide-react';
import { apiRequest } from '../../api';
import { formatDateFR } from '../../Components/Entretiens/entretienUtils';

// Helpers générateurs de liens Calendar
const generateGoogleCalendarLink = (entretien) => {
  if (!entretien || !entretien.date_entretien) return '#';
  const dateDebut = new Date(entretien.date_entretien);
  
  let dateFin;
  if (entretien.heure_fin) {
    const parts = entretien.heure_fin.split(':');
    dateFin = new Date(dateDebut);
    dateFin.setHours(parseInt(parts[0], 10), parseInt(parts[1] || 0, 10), 0);
  } else {
    dateFin = new Date(dateDebut.getTime() + 60 * 60 * 1000); // +1 heure par défaut
  }

  // Format YYYYMMDDTHHmmssZ
  const formatICSDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

  const strDebut = formatICSDate(dateDebut);
  const strFin = formatICSDate(dateFin);

  const title = encodeURIComponent(`Entretien d'embauche - ${entretien.candidat?.offre?.titre || 'JobConnect'}`);
  const details = encodeURIComponent(`Entretien ${entretien.type}\n\nLien/Lieu: ${entretien.lien_visio || entretien.lieu || 'Non spécifié'}`);
  const location = encodeURIComponent(entretien.type?.toLowerCase() === 'visio' ? (entretien.lien_visio || 'En ligne') : (entretien.lieu || ''));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${strDebut}/${strFin}&details=${details}&location=${location}`;
};

const generateOutlookCalendarLink = (entretien) => {
  if (!entretien || !entretien.date_entretien) return '#';
  const dateDebut = new Date(entretien.date_entretien);
  
  let dateFin;
  if (entretien.heure_fin) {
    const parts = entretien.heure_fin.split(':');
    dateFin = new Date(dateDebut);
    dateFin.setHours(parseInt(parts[0], 10), parseInt(parts[1] || 0, 10), 0);
  } else {
    dateFin = new Date(dateDebut.getTime() + 60 * 60 * 1000);
  }

  const formatICSDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

  const strDebut = formatICSDate(dateDebut);
  const strFin = formatICSDate(dateFin);

  const title = encodeURIComponent(`Entretien d'embauche - ${entretien.candidat?.offre?.titre || 'JobConnect'}`);
  const details = encodeURIComponent(`Entretien ${entretien.type}\n\nLien/Lieu: ${entretien.lien_visio || entretien.lieu || 'Non spécifié'}`);
  const location = encodeURIComponent(entretien.type?.toLowerCase() === 'visio' ? (entretien.lien_visio || 'En ligne') : (entretien.lieu || ''));

  // Outlook Online Compose Link
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${strDebut}&enddt=${strFin}&subject=${title}&body=${details}&location=${location}`;
};

const EntretienConfirm = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [entretien, setEntretien] = useState(null);

  const hasCalled = React.useRef(false);
  
  useEffect(() => {
    const confirmInterview = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;
      
      try {
        const response = await apiRequest(`/entretiens/respond/${token}`, 'POST', {
          status: status
        });
        setIsSuccess(true);
        setMessage(response.message || 'Votre réponse a bien été enregistrée.');
        if (response.entretien) {
          setEntretien(response.entretien);
        }
      } catch (error) {
        setIsSuccess(false);
        setMessage(
          error.message || 
          "Une erreur est survenue, ou ce lien n'est plus valide."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && status) {
      confirmInterview();
    } else {
      setIsLoading(false);
      setIsSuccess(false);
      setMessage("Lien invalide ou paramètres manquants.");
    }
  }, [token, status]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500">
        
        {/* Header Decoratif */}
        <div className={`p-8 flex flex-col items-center justify-center transition-colors duration-500 ${
          isLoading ? 'bg-blue-600' : isSuccess ? (status === 'accepted' ? 'bg-emerald-600' : 'bg-red-600') : 'bg-slate-400'
        }`}>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md mb-4">
            {isLoading ? (
              <Loader className="text-white w-10 h-10 animate-spin" />
            ) : isSuccess ? (
              status === 'accepted' ? <CheckCircle className="text-white w-10 h-10" /> : <XCircle className="text-white w-10 h-10" />
            ) : (
              <XCircle className="text-white w-10 h-10" />
            )}
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            {isLoading ? "Traitement en cours..." : isSuccess ? (status === 'accepted' ? "Entretien Confirmé" : "Invitation Déclinée") : "Une erreur est survenue"}
          </h1>
        </div>
        
        <div className="p-8 text-center">
          {isLoading ? (
            <div className="py-6">
              <p className="text-slate-500 animate-pulse font-medium">Nous enregistrons votre réponse auprès du recruteur...</p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-gray-300 font-medium">
                  {message}
                </p>
                {status === 'accepted' && (
                  <p className="text-sm text-slate-400">
                    Un email récapitulatif vous a été envoyé.
                  </p>
                )}
              </div>

              {entretien && status === 'accepted' && (
                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-5 text-left border border-slate-100 dark:border-gray-600 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} /> Rappel du rendez-vous
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-blue-500" size={18} />
                      <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{formatDateFR(entretien.date_entretien)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="text-blue-500" size={18} />
                      <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                        {new Date(entretien.date_entretien).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {entretien.heure_fin && ` - ${entretien.heure_fin}`}
                        {entretien.timezone && <span className="ml-2 font-normal text-slate-400">({entretien.timezone})</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(entretien.type || '').toLowerCase() === 'visio' ? (
                        <Video className="text-blue-500" size={18} />
                      ) : (
                        <MapPin className="text-blue-500" size={18} />
                      )}
                      <span className="text-sm font-semibold text-slate-700 dark:text-gray-200 capitalize">
                        {entretien.type}
                        {(entretien.lieu || entretien.lien_visio) && (
                          <span className="ml-2 font-normal text-slate-500">
                            - {entretien.lien_visio || entretien.lieu}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'ajout à l'agenda */}
                  <div className="pt-4 border-t border-slate-200 dark:border-gray-600 flex flex-col sm:flex-row gap-3">
                    <a
                      href={generateGoogleCalendarLink(entretien)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-slate-700 dark:text-gray-200 shadow-sm"
                    >
                      <svg viewBox="0 0 48 48" width="16px" height="16px" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"/>
                        <path fill="#FFF" d="M34 14L14 14 14 34 34 34z"/>
                        <path fill="#34A853" d="M14 14L14 34 34 34 34 14z"/>
                        <path fill="#FBBC05" d="M32 16L16 16 16 32 32 32z"/>
                        <path fill="#EA4335" d="M31 17L17 17 17 31 31 31z"/>
                        <path fill="#FFF" d="M22.428 27.935H20.73v-5.918h-1.611v-1.428h3.31v7.346zm5.228-3.03l2.091-4.316h1.838l-2.887 5.518-1.571 2.828h-1.74l1.391-2.483-2.617-4.864h1.838l1.657 3.317z"/>
                      </svg>
                      Google Agenda
                    </a>
                    <a
                      href={generateOutlookCalendarLink(entretien)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
                    >
                      <svg fill="#ffffff" viewBox="0 0 32 32" width="16px" height="16px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 12 6 C 10.895 6 10 6.895 10 8 L 10 24 C 10 25.105 10.895 26 12 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 8 C 26 6.895 25.105 6 24 6 L 12 6 z M 12 8 L 24 8 L 24 24 L 12 24 L 12 8 z" />
                        <path d="M 6 10 L 6 28 C 6 29.105 6.895 30 8 30 L 20 30 L 20 28 L 8 28 L 8 10 L 6 10 z" />
                      </svg>
                      Outlook / iCal
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-red-500 font-medium">{message}</p>
              <p className="text-slate-400 text-sm mt-2">Veuillez contacter directement le service recrutement.</p>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-gray-900/50 p-6 border-t border-slate-100 dark:border-gray-700 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-400 font-medium">Vous pouvez fermer cet onglet en toute sécurité.</p>
          <div className="mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Powered by JobConnect</div>
        </div>
      </div>
    </div>
  );
};

export default EntretienConfirm;
