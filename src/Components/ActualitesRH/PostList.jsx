import React from 'react';
import PostCard from './PostCard';

const PostList = ({ posts, onToggleLike, onAddComment, onDeletePost, onDeleteComment, onMessageAuthor }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[#1a202c] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aucune publication</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Il n'y a pas d'actualités correspondantes à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onToggleLike={onToggleLike}
          onAddComment={onAddComment}
          onDeletePost={onDeletePost}
          onDeleteComment={onDeleteComment}
          onMessageAuthor={onMessageAuthor}
        />
      ))}
    </div>
  );
};

export default PostList;

