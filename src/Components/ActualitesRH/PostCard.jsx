import React, { useState } from 'react';
import { Pin, Users, Globe, Clock, MoreHorizontal, MessageSquare } from 'lucide-react';
import InteractionBar from './InteractionBar';
import CommentSection from './CommentSection';

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

const PostCard = ({ post, onToggleLike, onAddComment, onDeletePost, onDeleteComment, onMessageAuthor }) => {
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const userRole = localStorage.getItem("role") || "employee";
  const currentUser = "Current User"; // Placeholder, should be from auth context

  const canDelete = post.author.name === currentUser || ["admin", "rh"].includes(userRole.toLowerCase());

  return (
    <div className={`bg-gray-100 dark:bg-[#1a202c] rounded-xl shadow-sm border transition-all duration-300 ${post.isPinned ? 'border-amber-200 dark:border-amber-900/50 shadow-amber-500/5' : 'border-gray-200 dark:border-gray-800'}`}>
      
      {/* Pinned Header */}
      {post.isPinned && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-500 rounded-t-xl">
          <Pin size={14} className="fill-current" />
          Publication épinglée
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Author info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600 flex items-center justify-center text-blue-700 dark:text-gray-300 font-bold text-sm shadow-sm">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                post.author.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{post.author.name}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span>{post.author.role}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {timeAgo(post.timestamp)}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300" title={post.isInternal ? "Interne uniquement" : "Public/Externe"}>
                  {post.isInternal ? <Users size={12} className="text-teal-600 dark:text-teal-400" /> : <Globe size={12} className="text-blue-600 dark:text-blue-400" />}
                  {post.isInternal ? "Interne" : "Externe"}
                </span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10 animate-in fade-in zoom-in duration-200">
                {onMessageAuthor && (
                  <button
                    onClick={() => {
                      onMessageAuthor(post.author);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare size={14} className="text-blue-500" />
                    Message Direct
                  </button>
                )}
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Signaler
                </button>
                {canDelete && (
                  <button 
                    onClick={() => {
                      onDeletePost(post.id);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-4">
          {post.content}
        </div>

        {/* Attachment */}
        {post.attachment && (
          <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {post.attachment.type?.startsWith('image/') ? (
              <img src={post.attachment.preview} alt="Attachment" className="w-full max-h-96 object-contain" />
            ) : (
              <div className="p-4 flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Globe size={24} />
                </div>
                <div>
                  <h5 className="font-semibold text-sm dark:text-gray-200">{post.attachment.name}</h5>
                  <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Télécharger</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {(post.likes > 0 || post.comments.length > 0) && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3 mb-1">
            <div className="flex items-center gap-1">
              {post.likes > 0 && <span>{post.likes} J'aime</span>}
            </div>
            <div>
              {post.comments.length > 0 && <span>{post.comments.length} Commentaire{post.comments.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
        )}

        {/* Interaction Bar */}
        <InteractionBar 
          post={post} 
          onToggleLike={() => onToggleLike(post.id)} 
          onToggleComments={() => setShowComments(!showComments)} 
          showComments={showComments}
        />

        {/* Comments Section */}
        {showComments && (
          <CommentSection 
            comments={post.comments} 
            onAddComment={(text) => onAddComment(post.id, text)} 
            onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
          />
        )}
      </div>
    </div>
  );
};

export default PostCard;
