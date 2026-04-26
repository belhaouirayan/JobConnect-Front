import React, { useState } from 'react';
import { Send, Clock, Trash2 } from 'lucide-react';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " an(s)";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " mois";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " j";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return Math.floor(seconds) + " s";
};

const CommentSection = ({ comments, onAddComment, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const userRole = localStorage.getItem("role") || "employee";
  const currentUser = "Current User"; // Placeholder

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
      
      {/* Existing Comments */}
      {comments && comments.length > 0 && (
        <div className="space-y-4 mb-4">
          {comments.map((comment, index) => {
            const canDeleteComment = comment.author.name === currentUser || ["admin", "rh"].includes(userRole.toLowerCase());

            return (
              <div key={comment.id || index} className="flex gap-3 text-sm">
                {/* Avatar */}
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 font-bold text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs">
                  {comment.author.name.substring(0, 2).toUpperCase()}
                </div>
                
                {/* Comment Content */}
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl rounded-tl-none p-3 relative group">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{comment.author.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {timeAgo(comment.timestamp)}
                        </span>
                        {canDeleteComment && (
                          <button 
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{comment.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start mt-2">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-indigo-700 dark:text-gray-300 font-bold text-xs shadow-sm">
          ME {/* Placeholder for current user avatar */}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrire un commentaire..."
            className="w-full bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-[#1a202c] border focus:border-blue-500 dark:border-gray-700 rounded-full pl-4 pr-12 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition-all duration-300 shadow-sm focus:shadow-md focus:shadow-blue-500/10"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute right-1.5 top-1.5 p-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-colors"
          >
            <Send size={14} className={newComment.trim() ? '-ml-0.5' : ''} />
          </button>
        </div>
      </form>

    </div>
  );
};

export default CommentSection;
