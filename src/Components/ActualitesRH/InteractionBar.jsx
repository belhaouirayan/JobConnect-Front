import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const InteractionBar = ({ post, onToggleLike, onToggleComments, showComments }) => {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-1 sm:gap-2 w-full">
        {/* Like Button */}
        <button
          onClick={onToggleLike}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            post.hasLiked 
              ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Heart size={18} className={post.hasLiked ? 'fill-current' : ''} />
          <span className="hidden xs:inline">J'aime</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={onToggleComments}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            showComments
              ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <MessageCircle size={18} className={showComments ? 'fill-current text-blue-500/50' : ''} />
          <span className="hidden xs:inline">Commenter</span>
        </button>
      </div>

      {/* Share Button removed as per request */}
    </div>
  );
};

export default InteractionBar;
