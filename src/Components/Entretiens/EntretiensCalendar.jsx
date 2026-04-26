import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, MapPin, Moon, Sun } from 'lucide-react';

const EntretiensCalendar = ({ data, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("Month view");

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };
  
  const getDayOfWeekIndex = (date) => {
    let day = date.getDay();
    return day === 0 ? 6 : day - 1;
  };
  
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const navigatePrev = () => {
    if (viewMode === 'Year view') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    } else if (viewMode === 'Month view') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'Week view') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() - 7);
      setCurrentDate(newD);
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() - 1);
      setCurrentDate(newD);
    }
  };

  const navigateNext = () => {
    if (viewMode === 'Year view') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    } else if (viewMode === 'Month view') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'Week view') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + 7);
      setCurrentDate(newD);
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + 1);
      setCurrentDate(newD);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);

  const daysOfWeek = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Fonction utilitaire pour extraire le nom du candidat
  const getCandidatName = (candidat) => {
    if (!candidat) return "";
    if (typeof candidat === 'string') return candidat;
    if (typeof candidat === 'object') {
      return `${candidat.nom || ''} ${candidat.prenom || ''}`.trim();
    }
    return String(candidat);
  };

  const getEventsForExactDate = (dateObj) => {
    if(!dateObj) return [];
    
    const now = new Date();
    
    return data.filter(evt => {
      // Hide completed interviews
      if (evt.statut?.toLowerCase() === 'termine') return false;
      
      // Gérer différents champs de date
      let dateStr = evt.date || evt.date_entretien;
      if (!dateStr) return false;
      
      try {
        const d = new Date(dateStr);
        if (isNaN(d.valueOf())) return false;
        
        // Hide past events (comparing including time if present)
        const timeStr = evt.heure_debut || evt.time || evt.heure || "23:59";
        const [hours, minutes] = timeStr.split(':');
        const eventDateTime = new Date(d);
        if (hours && minutes) {
          eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        } else {
          eventDateTime.setHours(23, 59, 59, 999);
        }
        
        // On ne masque plus les événements passés pour permettre 
        // de cliquer dessus et de rédiger un résumé.
        if (eventDateTime < now) {
          // On peut éventuellement ajouter un flag 'past' ici if needed
        }
        
        return d.getDate() === dateObj.getDate() &&
               d.getMonth() === dateObj.getMonth() &&
               d.getFullYear() === dateObj.getFullYear();
      } catch (e) {
        console.warn("Format de date invalide:", dateStr, e);
        return false;
      }
    });
  };

  // Color generator based on interview object status
  const getEventColors = (evt) => {
    const status = evt.statut?.toLowerCase();
    
    // Accepté/Confirmé/Validé -> Vert
    if (status === 'accepte' || status === 'confirmé' || status === 'valide' || status === 'validé' || status === 'accepted') {
      return { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-700 dark:text-green-400", border: "border-green-500", icon: "text-green-500" };
    }
    
    // En attente -> Jaune
    if (status === 'en_attente' || status === 'attente' || status === 'pending') {
      return { bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-500", icon: "text-yellow-500" };
    }
    
    // Refusé/Annulé -> Rouge
    if (status === 'refuse' || status === 'refusé' || status === 'annulé' || status === 'rejected' || status === 'cancelled') {
      return { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-500", icon: "text-red-500" };
    }
    
    // Planifié (défaut) -> Bleu
    return { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500", icon: "text-blue-500" };
  };

  return (
    <div className="w-full bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden font-sans">
      
      {/* Header matching the screenshot exactly */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c]">
        
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col items-center justify-center w-12 h-12 mr-4 bg-white dark:bg-gray-800">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{monthNames[currentDate.getMonth()].substring(0,4)}</span>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{currentDate.getDate()}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center capitalize">
              {viewMode === 'Year view' ? (
                 `Année ${currentDate.getFullYear()}`
              ) : (
                <>
                  {monthNames[currentDate.getMonth()].toLowerCase()} {currentDate.getFullYear()}
                  <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 normal-case">
                    Semaine {(() => { const d = new Date(currentDate); d.setHours(0,0,0,0); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)); const week1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7); })()}
                  </span>
                </>
              )}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {viewMode === 'Year view' 
                ? `1 Janvier ${currentDate.getFullYear()} – 31 Décembre ${currentDate.getFullYear()}`
                : `1 ${monthNames[currentDate.getMonth()].toLowerCase()} ${currentDate.getFullYear()} – ${daysInMonth} ${monthNames[currentDate.getMonth()].toLowerCase()} ${currentDate.getFullYear()}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          
          <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <button onClick={navigatePrev} className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 outline-none">
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())} 
              className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium outline-none"
            >
              Today
            </button>
            <button onClick={navigateNext} className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-gray-600 outline-none">
              <ChevronRight size={16} />
            </button>
          </div>

          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 outline-none border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium cursor-pointer appearance-none pr-8 relative"
          >
            <option value="Month view">Month view</option>
            <option value="Week view">Week view</option>
            <option value="Day view">Day view</option>
            <option value="Year view">Year view</option>
          </select>
        </div>
      </div>

      {/* Grid Headers */}
      {viewMode !== 'Year view' && (
        <div className={`grid ${viewMode === 'Day view' ? 'grid-cols-1' : 'grid-cols-7'} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c]`}>
          {viewMode === 'Day view' ? (
            <div className="py-3 text-center text-[13px] font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-0 lowercase">
              {daysOfWeek[getDayOfWeekIndex(currentDate)]}
            </div>
          ) : (
            daysOfWeek.map((day) => (
              <div key={day} className="py-3 text-center text-[13px] font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-0 lowercase">
                {day}
              </div>
            ))
          )}
        </div>
      )}

      {/* Grid Cells */}
      {viewMode === 'Month view' && (
        <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)] bg-white dark:bg-[#1a202c]">
          {/* Empty cells for previous month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 bg-white dark:bg-[#1a202c] border-r border-b border-gray-200 dark:border-gray-700"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
            const isToday = dayNum === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForExactDate(targetDate);

            return (
              <div key={dayNum} className={`p-2 border-r border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : 'bg-white dark:bg-[#1a202c]'}`}>
                <div className="flex justify-start mb-2 mt-1">
                  <span className={`text-[13px] font-bold ${isToday ? 'bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300 ml-2'}`}>
                    {dayNum}
                  </span>
                </div>

                <div className="space-y-1.5 px-1">
                  {dayEvents.map((evt, idx) => {
                    const colors = getEventColors(evt);
                    return (
                      <div key={evt.id} onClick={() => onEventClick && onEventClick(evt)} className={`text-xs p-1.5 rounded-md ${colors.bg} ${colors.text} border ${colors.border} flex justify-between items-center group cursor-pointer hover:opacity-80 transition-opacity`} title={`${evt.heure_debut || evt.time || evt.heure} - ${getCandidatName(evt.candidat || evt.candidate)}`}>
                         <span className="truncate font-medium">{getCandidatName(evt.candidat || evt.candidate)}</span>
                         <span className="ml-1 opacity-70 flex-shrink-0 text-[10px] whitespace-nowrap">{evt.heure_debut || evt.time || evt.heure}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Padding for end of month to complete grid */}
          {Array.from({ length: (7 - ((firstDayIndex + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="p-2 border-b border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c]"></div>
          ))}
        </div>
      )}

      {viewMode === 'Week view' && (
        <div className="grid grid-cols-7 min-h-[500px] bg-white dark:bg-[#1a202c]">
          {Array.from({ length: 7 }).map((_, i) => {
            const startOfWeek = getStartOfWeek(currentDate);
            const targetDate = new Date(startOfWeek);
            targetDate.setDate(targetDate.getDate() + i);
            
            const isToday = targetDate.getDate() === new Date().getDate() && targetDate.getMonth() === new Date().getMonth() && targetDate.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForExactDate(targetDate);

            return (
              <div key={i} className={`p-3 border-r border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : 'bg-white dark:bg-[#1a202c]'}`}>
                <div className="flex justify-center mb-4 mt-2">
                  <span className={`text-[15px] font-bold ${isToday ? 'bg-purple-600 text-white rounded-full w-9 h-9 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'}`}>
                    {targetDate.getDate()}
                  </span>
                </div>

                <div className="space-y-2 px-1">
                  {dayEvents.map((evt, idx) => {
                    const colors = getEventColors(evt);
                    return (
                      <div key={evt.id} onClick={() => onEventClick && onEventClick(evt)} className={`text-sm p-2 rounded-md ${colors.bg} ${colors.text} border ${colors.border} flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity`} title={`${evt.heure_debut || evt.time || evt.heure} - ${getCandidatName(evt.candidat || evt.candidate)}`}>
                         <span className="flex items-center gap-1 opacity-80 text-xs font-semibold">
                           <MapPin size={10} /> {evt.heure_debut || evt.time || evt.heure}
                         </span>
                         <span className="font-bold">{getCandidatName(evt.candidat || evt.candidate)}</span>
                         <span className="opacity-75 text-xs truncate capitalize">{evt.type}</span>
                         {evt.type?.toLowerCase() === 'visio' && evt.lien_visio && (
                           <span className="opacity-75 text-xs truncate flex items-center gap-1">
                             <Video size={10} /> Visio
                           </span>
                         )}
                         {evt.type?.toLowerCase() === 'téléphonique' && (
                           <span className="opacity-75 text-xs truncate flex items-center gap-1">
                             Téléphonique
                           </span>
                         )}
                         {evt.type?.toLowerCase() !== 'visio' && evt.type?.toLowerCase() !== 'téléphonique' && evt.lieu && (
                           <span className="opacity-75 text-xs truncate flex items-center gap-1">
                             <MapPin size={10} /> {evt.lieu}
                           </span>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'Day view' && (
        <div className="grid grid-cols-1 min-h-[500px] bg-white dark:bg-[#1a202c] p-6">
          <div className="w-full max-w-4xl mx-auto">
            {(() => {
              const dayEvents = getEventsForExactDate(currentDate);
              if (dayEvents.length === 0) {
                return (
                  <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-gray-400">
                    Aucun événement prévu pour cette journée.
                  </div>
                );
              }
              
              // Sort events by time
              const sortedEvents = [...dayEvents].sort((a, b) => {
                const timeA = a.heure_debut || a.time || a.heure || "00:00";
                const timeB = b.heure_debut || b.time || b.heure || "00:00";
                return timeA.localeCompare(timeB);
              });

              return (
                <div className="space-y-4">
                  {sortedEvents.map((evt, idx) => {
                    const colors = getEventColors(evt);
                    return (
                      <div 
                        key={evt.id} 
                        onClick={() => onEventClick && onEventClick(evt)}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${colors.bg} ${colors.text} ${colors.border} cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        <div className="flex-shrink-0 w-20 text-lg font-bold">
                          {evt.heure_debut || evt.time || evt.heure}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold mb-1">{getCandidatName(evt.candidat || evt.candidate)}</h4>
                          <div className="flex items-center gap-4 text-sm opacity-80">
                            <span className="flex items-center gap-1 capitalize">
                              {evt.type === 'visio' ? <Video size={14}/> : <MapPin size={14}/>} {evt.type}
                            </span>
                            {evt.statut && (
                              <span className="capitalize px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-xs font-semibold">
                                Statut: {evt.statut}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {viewMode === 'Year view' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-[#1a202c]">
          {Array.from({ length: 12 }).map((_, monthIndex) => {
            const tempDate = new Date(currentDate.getFullYear(), monthIndex, 1);
            const daysInMonthThis = getDaysInMonth(tempDate);
            const firstDayIndexThis = getFirstDayOfMonth(tempDate);

            return (
              <div key={monthIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                <h3 
                  className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 ml-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                  onClick={() => {
                      setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
                      setViewMode('Month view');
                  }}
                  title={`Voir le mois de ${monthNames[monthIndex]}`}
                >
                  {monthNames[monthIndex]}
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                    <div key={day} className="text-[10px] font-bold text-gray-400">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: firstDayIndexThis }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-6"></div>
                  ))}
                  
                  {Array.from({ length: daysInMonthThis }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateObj = new Date(currentDate.getFullYear(), monthIndex, dayNum);
                    
                    const now = new Date();
                    const isToday = dayNum === now.getDate() && monthIndex === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
                    
                    const dayEvents = getEventsForExactDate(dateObj);
                    const hasEvents = dayEvents.length > 0;
                    
                    let bgClass = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
                    if (isToday) {
                        bgClass = "bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700";
                    } else if (hasEvents) {
                        bgClass = "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer border border-blue-200 dark:border-blue-700";
                    }

                    return (
                      <div 
                        key={dayNum} 
                        className={`text-[12px] h-7 w-7 flex items-center justify-center rounded-full mx-auto transition-colors ${bgClass}`}
                        onClick={() => {
                            setCurrentDate(dateObj);
                            setViewMode('Day view');
                        }}
                        title={hasEvents ? `${dayEvents.length} entretien(s)` : ''}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EntretiensCalendar;
