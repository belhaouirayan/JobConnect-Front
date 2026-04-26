import React, { useState, useEffect } from "react";
import FilterBar from "../../Components/ActualitesRH/FilterBar";
import CreatePost from "../../Components/ActualitesRH/CreatePost";
import PostList from "../../Components/ActualitesRH/PostList";
import { apiRequest } from "../../api";

//

const ActualitesRH = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // all, internal, external, pinned
  const userRole = localStorage.getItem("role") || "employee"; // "admin", "rh", "manager", "employee"

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No authentication token found. User must log in.");
      setError("Vous devez être connecté pour accéder à cette page. Redirection vers la connexion...");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log("Fetching posts from API...");
      const token = localStorage.getItem("token");
      console.log("Token available:", !!token);
      
      const result = await apiRequest('/actualites-rh');
      console.log("Posts fetched successfully:", result);
      
      if (Array.isArray(result)) {
        // Map backend structure to frontend expectations
        const mappedPosts = result.map(post => ({
          ...post,
          timestamp: post.created_at,
          isInternal: post.type === 'internal',
          likes: post.likes_count || 0,
          hasLiked: post.is_liked_by_user || false,
          comments: post.comments.map(c => ({
            ...c,
            timestamp: c.created_at,
            text: c.content
          })),
          attachment: post.attachment_path ? {
            name: post.attachment_path.split('/').pop(),
            preview: `http://127.0.0.1:8000/storage/${post.attachment_path}`
          } : null
        }));
        setPosts(mappedPosts);
        setError(null);
      } else {
        console.warn("API returned non-array result:", result);
        setPosts([]);
        setError("Format de réponse inattendu du serveur");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        token: localStorage.getItem("token") ? "exists" : "missing"
      });
      
      // More specific error messages
      if (err.message.includes("401")) {
        setError("Vous n'êtes pas authentifié. Veuillez vous reconnecter.");
      } else if (err.message.includes("403")) {
        setError("Vous n'avez pas la permission d'accéder à ces données.");
      } else if (err.message.includes("Network")) {
        setError("Erreur de connexion au serveur.");
      } else {
        setError(`Erreur lors du chargement: ${err.message}`);
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const canCreatePost = ["admin", "rh", "manager"].includes(userRole?.toLowerCase());

  const handleOpenDm = (recipient = null) => {
    window.dispatchEvent(new CustomEvent('openDmModal', { detail: { recipient } }));
  };

  const handleAddPost = async (newPostData) => {
    try {
      console.log("Creating post with data:", newPostData);
      console.log("Token present:", !!localStorage.getItem("token"));
      
      const formData = new FormData();
      formData.append('content', newPostData.content);
      formData.append('type', newPostData.isInternal ? 'internal' : 'external');
      formData.append('is_pinned', newPostData.isPinned ? 1 : 0);
      
      if (newPostData.attachment && newPostData.attachment.rawFile) {
        formData.append('attachment', newPostData.attachment.rawFile);
      }

      console.log("Sending POST request to API...");
      const result = await apiRequest('/actualites-rh', 'POST', formData);
      console.log("Post created successfully:", result);
      
      // Reload posts to get mapped and fresh data
      await fetchPosts();
      setError(null);
    } catch (err) {
      console.error("Error adding post:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack
      });
      
      let errorMsg = "Erreur lors de la création de la publication";
      if (err.message.includes("401")) {
        errorMsg = "Vous n'êtes pas authentifié. Veuillez vous reconnecter.";
      } else if (err.message.includes("403")) {
        errorMsg = "Vous n'avez pas la permission de créer une publication.";
      } else if (err.message.includes("validation")) {
        errorMsg = "Format invalide. Vérifiez vos données.";
      } else {
        errorMsg = `Erreur: ${err.message}`;
      }
      
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await apiRequest(`/actualites-rh/${postId}/like`, 'POST');
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hasLiked: !post.hasLiked,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const result = await apiRequest(`/actualites-rh/${postId}/comments`, 'POST', {
        content: commentText
      });
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const newComment = {
            ...result,
            timestamp: result.created_at,
            text: result.content
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
      try {
        await apiRequest(`/actualites-rh/${postId}`, 'DELETE');
        setPosts(prev => prev.filter(post => post.id !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
        // Fallback for local UI removal if API fails or for demo purposes
        setPosts(prev => prev.filter(post => post.id !== postId));
      }
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      try {
        await apiRequest(`/actualites-rh/comments/${commentId}`, 'DELETE');
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== commentId)
            };
          }
          return post;
        }));
      } catch (err) {
        console.error("Error deleting comment:", err);
        // Fallback for local UI removal
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== commentId)
            };
          }
          return post;
        }));
      }
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Search query filter
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Category filter
    if (categoryFilter === "internal") return post.isInternal;
    if (categoryFilter === "external") return !post.isInternal;
    if (categoryFilter === "pinned") return post.isPinned;
    
    return true; // "all"
  }).sort((a, b) => {
    // Sort pinned posts first if we are not specifically viewing only pinned
    if (categoryFilter !== "pinned") {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }
    // Then sort by newest
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="min-h-screen transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 tracking-tight">
              Actualité RH
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Restez informé des dernières nouvelles et annonces de l'entreprise.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex justify-between items-start">
            <div className="flex gap-3">
              <div className="text-red-600 dark:text-red-400 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* FilterBar */}
        <FilterBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />

        {/* Create Post (Conditional based on role) */}
        {canCreatePost && (
          <CreatePost onAddPost={handleAddPost} />
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <PostList 
            posts={filteredPosts} 
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDeletePost={handleDeletePost}
            onDeleteComment={handleDeleteComment}
            onMessageAuthor={handleOpenDm}
          />
        )}

      </div>
    </div>
  );
};

export default ActualitesRH;
