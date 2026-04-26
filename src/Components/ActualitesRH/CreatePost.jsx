import React, { useState } from 'react';
import { Send, Image as ImageIcon, Paperclip, Pin, Users, Globe, X } from 'lucide-react';

const CreatePost = ({ onAddPost }) => {
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [attachment, setAttachment] = useState(null);
  
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddPost({
      content,
      isInternal,
      isPinned,
      attachment
    });

    // Reset form
    setContent('');
    setIsInternal(true);
    setIsPinned(false);
    setAttachment(null);
    setIsExpanded(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment({
        name: file.name,
        type: file.type,
        rawFile: file, // Store the raw file object for FormData
        preview: URL.createObjectURL(file) 
      });
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-gray-50 dark:border-gray-800/50 bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
          {/* Default avatar initials */}
          RH
        </div>
        <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Créer une publication</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Quoi de neuf ?"
          className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 resize-none ${isExpanded ? 'h-32' : 'h-14'}`}
        />

        {attachment && (
          <div className="mt-3 relative inline-block">
            {attachment.type.startsWith('image/') ? (
              <img src={attachment.preview} alt="Attachment" className="max-h-40 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Paperclip size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{attachment.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* File Input */}
              <label className="cursor-pointer text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 text-sm font-medium">
                <ImageIcon size={18} />
                <span className="hidden sm:inline">Image/Fichier</span>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>

              {/* Toggles Group */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-auto sm:mr-0">
                <button
                  type="button"
                  onClick={() => setIsInternal(!isInternal)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isInternal 
                      ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  title="Visibilité"
                >
                  {isInternal ? <Users size={14} /> : <Globe size={14} />}
                  {isInternal ? 'Interne' : 'Externe'}
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isPinned 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  title="Épingler en haut"
                >
                  <Pin size={14} className={isPinned ? 'fill-current' : ''} />
                  Épingler
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onClick={() => {
                  setIsExpanded(false);
                  setContent('');
                  setAttachment(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg shadow-blue-500/20"
              >
                <span>Publier</span>
                <Send size={16} className={content.trim() ? 'translate-x-0.5' : ''} />
              </button>
            </div>

          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
