import { Send, ArrowLeft, Clock, Plus, Paperclip, FileText, Image, Mic, File, Download, Trash2, CheckSquare, Square, X as XIcon, Ban, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { apiRequest, BASE_URL } from '../../api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getConversationPermissions, runConversationAction } from './dmConversationUtils';
const timeFormat = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const dateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.setDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ChatWindow = ({ conversation, otherUser, onBack, onRefreshConversations }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showMedia, setShowMedia] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  
  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

  const messagesEndRef = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const conversationPermissions = getConversationPermissions(conversation, currentUserId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const result = await apiRequest(`/api/dm/conversations/${conversation.id}/messages`);
      const messagesList = result.data || result;
      setMessages(Array.isArray(messagesList) ? messagesList : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  const fetchAttachments = useCallback(async () => {
    setLoadingAttachments(true);
    try {
      const result = await apiRequest(`/api/dm/conversations/${conversation.id}/attachments`);
      setAttachments(result || []);
    } catch (err) {
      console.error('Error fetching attachments:', err);
    } finally {
      setLoadingAttachments(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    if (showMedia) {
      fetchAttachments();
    }
  }, [showMedia, fetchAttachments]);

  useEffect(() => {
    if (conversation?.id) {
      setLoading(true);
      fetchMessages();
      if (onRefreshConversations) onRefreshConversations();
      const draft = sessionStorage.getItem(`draft_${conversation.id}`);
      setNewMessage(draft || '');
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversation?.id, fetchMessages, onRefreshConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Direct download failed, falling back to window.open', err);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      link.target = '_blank';
      link.click();
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType(type);
      setShowAttachmentMenu(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending || !conversationPermissions.canSend) return;

    const messageText = newMessage.trim();
    const file = selectedFile;
    const type = fileType;

    setNewMessage('');
    sessionStorage.removeItem(`draft_${conversation.id}`);
    setSelectedFile(null);
    setFileType(null);
    setSending(true);

    // Create FormData
    const formData = new FormData();
    if (messageText) formData.append('content', messageText);
    if (file) {
      formData.append('attachment', file);
      formData.append('attachment_type', type);
    }

    // Optimistic add
    const tempMessage = {
      id: 'temp-' + Date.now(),
      content: messageText,
      sender_id: currentUserId,
      sender: { id: currentUserId, name: 'Moi' },
      created_at: new Date().toISOString(),
      attachment_path: file ? URL.createObjectURL(file) : null,
      attachment_type: type,
      attachment_name: file ? file.name : null,
      _pending: true,
      _localUrl: file ? URL.createObjectURL(file) : null
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const result = await apiRequest(`/api/dm/conversations/${conversation.id}/messages`, 'POST', formData);
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? result : m));
      if (file) fetchAttachments(); // Refresh gallery if we sent a file
      if (onRefreshConversations) await onRefreshConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageText);
      sessionStorage.setItem(`draft_${conversation.id}`, messageText);
      setSelectedFile(file);
      setFileType(type);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      await apiRequest(`/api/dm/messages/${messageId}`, 'DELETE');
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setAttachments(prev => prev.filter(a => a.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Erreur lors de la suppression du message.');
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMessages(new Set());
  };

  const toggleMessageSelection = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ces ${selectedMessages.size} messages ?`)) return;

    try {
      await Promise.all(Array.from(selectedMessages).map(id => apiRequest(`/api/dm/messages/${id}`, 'DELETE')));
      setMessages(prev => prev.filter(m => !selectedMessages.has(m.id)));
      setAttachments(prev => prev.filter(a => !selectedMessages.has(a.id)));
      setIsSelectionMode(false);
      setSelectedMessages(new Set());
    } catch (err) {
      console.error('Error bulk deleting messages:', err);
      alert('Erreur lors de la suppression de certains messages.');
      fetchMessages();
    }
  };

  const handleConversationAction = async (action) => {
    if (!conversation?.id || actionLoading) return;

    const actionLabelMap = {
      accept: 'accepter',
      refuse: 'refuser',
      block: 'bloquer',
      unblock: 'debloquer',
    };
    const actionLabel = actionLabelMap[action] || action;

    const shouldConfirm = action === 'refuse' || action === 'block' || action === 'unblock';
    if (shouldConfirm && !window.confirm(`Voulez-vous vraiment ${actionLabel} ce contact ?`)) {
      return;
    }

    setActionLoading(action);
    try {
      await runConversationAction(conversation.id, action);
      if (onRefreshConversations) await onRefreshConversations();
      await fetchMessages();
    } catch (err) {
      console.error(`Error while trying to ${actionLabel}:`, err);
      alert(`Impossible de ${actionLabel} ce contact pour le moment.`);
    } finally {
      setActionLoading('');
    }
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const label = dateLabel(msg.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'rh': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'manager': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getRestrictionMessage = () => {
    if (conversationPermissions.isBlocked) {
      return conversationPermissions.isBlockedByMe
        ? 'Vous avez bloque ce contact. Debloquez pour envoyer des messages.'
        : 'Cette conversation est bloquee. Vous ne pouvez pas envoyer de message.';
    }
    if (conversationPermissions.isPending && conversationPermissions.isIncomingRequest) {
      return 'Demande de message recue. Acceptez ou refusez avant de continuer.';
    }
    if (conversationPermissions.isPending && !conversationPermissions.isIncomingRequest) {
      return 'Demande envoyee. Attendez la reponse avant de renvoyer un message.';
    }
    if (conversationPermissions.isDeclined) {
      return conversationPermissions.canAccept
        ? 'Demande refusee. Vous pouvez toujours l accepter plus tard.'
        : 'Votre demande a ete refusee. Vous ne pouvez pas envoyer de message pour le moment.';
    }
    return '';
  };

  const getInputPlaceholder = () => {
    if (conversationPermissions.canSend) return 'Ecrire un message...';
    if (conversationPermissions.isBlocked) return 'Conversation bloquee';
    if (conversationPermissions.isPending) return 'En attente de validation';
    if (conversationPermissions.isDeclined) return 'Demande refusee';
    return 'Vous ne pouvez pas envoyer de message';
  };

  const renderAttachment = (msg) => {
    if (!msg.attachment_path) return null;

    const storageUrl = BASE_URL.replace('/api', '/storage');
    const url = msg._localUrl || `${storageUrl}/${msg.attachment_path}`;

    switch (msg.attachment_type) {
      case 'image':
        return (
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <img src={url} alt="Attachment" className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => window.open(url)} />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <video src={url} controls className="max-w-full max-h-64" />
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <audio src={url} controls className="w-full h-8" />
          </div>
        );
      default:
        return (
          <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" onClick={() => window.open(url)}>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileIcon type={msg.attachment_type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{msg.attachment_name || 'Document'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{msg.attachment_type || 'File'}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleDownload(url, msg.attachment_name); }}
              className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <Download size={16} />
            </button>
          </div>
        );
    }
  };

  const FileIcon = ({ type }) => {
    switch (type) {
      case 'document': return <FileText size={20} />;
      case 'audio': return <Mic size={20} />;
      default: return <File size={20} />;
    }
  };

  const attachmentOptions = [
    { id: 'document', label: 'Document', icon: <FileText size={20} />, color: 'bg-indigo-500', accept: '*' },
    { id: 'image', label: 'Photos & vidéos', icon: <Image size={20} />, color: 'bg-blue-500', accept: 'image/*,video/*' },
  ];

  const MediaGallery = () => {
    const storageUrl = BASE_URL.replace('/api', '/storage');
    const images = attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video');
    const docs = attachments.filter(a => a.attachment_type !== 'image' && a.attachment_type !== 'video');

    return (
      <div className="absolute inset-0 z-[60] bg-white dark:bg-[#1a202c] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMedia(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Médias et Fichiers</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loadingAttachments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <Paperclip size={48} className="mb-4 text-gray-400" />
              <p>Aucun média partagé</p>
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Média ({images.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map(img => (
                      <div key={img.id} className="relative group aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer">
                         <div className="w-full h-full hover:opacity-90 transition-opacity" onClick={() => window.open(`${storageUrl}/${img.attachment_path}`, '_blank')}>
                           {img.attachment_type === 'image' ? (
                             <img src={`${storageUrl}/${img.attachment_path}`} className="w-full h-full object-cover" alt="Media" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white relative">
                               <Image size={24} />
                               <span className="absolute bottom-1 right-1 bg-black/50 text-[8px] px-1 rounded">VIDEO</span>
                             </div>
                           )}
                         </div>
                         {String(img.sender_id) === String(currentUserId) && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                             className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                             title="Supprimer"
                           >
                             <Trash2 size={12} />
                           </button>
                         )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {docs.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Documents ({docs.length})</h4>
                  <div className="space-y-2">
                    {docs.map(doc => {
                      const url = `${storageUrl}/${doc.attachment_path}`;
                      return (
                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 group">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FileIcon type={doc.attachment_type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{doc.attachment_name || 'Document'}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">{doc.attachment_type || 'File'}</p>
                          </div>
                          <button 
                            onClick={() => handleDownload(url, doc.attachment_name)}
                            className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {showMedia && <MediaGallery />}
      
      {/* Chat Header */}
      {isSelectionMode ? (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10 min-h-[69px]">
           <div className="flex items-center gap-3">
             <button onClick={toggleSelectionMode} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
               <XIcon size={18} />
             </button>
             <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{selectedMessages.size} sélectionné(s)</span>
           </div>
           <button 
             onClick={handleBulkDelete}
             disabled={selectedMessages.size === 0}
             className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
           >
             <Trash2 size={16} />
             <span>Supprimer</span>
           </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 pr-12 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a202c] min-h-[69px]">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors lg:hidden"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600 flex items-center justify-center text-blue-700 dark:text-gray-300 font-bold text-sm flex-shrink-0">
            {otherUser?.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              otherUser?.name?.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{otherUser?.name}</h4>
              {otherUser?.role && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${getRoleBadgeClass(otherUser.role)}`}>
                  {otherUser.role}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {conversationPermissions.canAccept && (
              <button
                onClick={() => handleConversationAction('accept')}
                disabled={Boolean(actionLoading)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Accepter"
              >
                <UserCheck size={14} />
                <span className="hidden md:inline">Accepter</span>
              </button>
            )}

            {conversationPermissions.canRefuse && (
              <button
                onClick={() => handleConversationAction('refuse')}
                disabled={Boolean(actionLoading)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Refuser"
              >
                <UserX size={14} />
                <span className="hidden md:inline">Refuser</span>
              </button>
            )}

            {conversationPermissions.canBlock && (
              <button
                onClick={() => handleConversationAction('block')}
                disabled={Boolean(actionLoading)}
                className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Bloquer"
              >
                <Ban size={14} />
                <span className="hidden md:inline">Bloquer</span>
              </button>
            )}

            {conversationPermissions.canUnblock && (
              <button
                onClick={() => handleConversationAction('unblock')}
                disabled={Boolean(actionLoading)}
                className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Debloquer"
              >
                <ShieldCheck size={14} />
                <span className="hidden md:inline">Debloquer</span>
              </button>
            )}

            <button
              onClick={() => setShowMedia(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all flex items-center gap-2"
              title="Medias et Fichiers"
            >
              <Paperclip size={20} />
              <span className="text-xs font-semibold hidden md:inline">Medias</span>
            </button>
            <button
              onClick={toggleSelectionMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all flex items-center gap-2"
              title="Selectionner des messages"
            >
              <CheckSquare size={20} />
            </button>
          </div>
        </div>
      )}

      {!conversationPermissions.canSend && (
        <div className="px-4 py-2 border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs font-medium">
          {getRestrictionMessage()}
        </div>
      )}
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <Send size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aucun message</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Envoyez le premier message !</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([label, msgs]) => (
            <div key={label}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
              {msgs.map((msg) => {
                const isOwn = String(msg.sender_id) === String(currentUserId);
                const isSelected = selectedMessages.has(msg.id);
                return (
                  <div key={msg.id} className={`flex mb-3 group items-center ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {isSelectionMode && isOwn && !msg._pending && (
                       <button onClick={() => toggleMessageSelection(msg.id)} className="mr-3 text-gray-400 hover:text-blue-500 transition-colors">
                          {isSelected ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                       </button>
                    )}
                    <div className={`max-w-[75%] min-w-0 ${isOwn ? 'order-2' : ''}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isOwn
                          ? 'bg-blue-600 text-white rounded-br-md shadow-blue-500/10'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-gray-700'
                      } ${msg._pending ? 'opacity-70' : ''}`}>
                        {renderAttachment(msg)}
                        {msg.content && <p className={msg.attachment_path ? 'mt-2' : ''} style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400">{timeFormat(msg.created_at)}</span>
                        {isOwn && !msg._pending && (
                          <button 
                            onClick={() => handleDelete(msg.id)}
                            className="ml-2 p-1 text-gray-300 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <FileIcon type={fileType} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">{fileType}</p>
            </div>
          </div>
          <button onClick={() => { setSelectedFile(null); setFileType(null); }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-full transition-colors">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <div className="absolute bottom-20 left-4 z-50 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 origin-bottom-left">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 min-w-[200px]">
            {attachmentOptions.map((opt) => (
              <label
                key={opt.id}
                onClick={opt.action}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${opt.color} text-white flex items-center justify-center shadow-lg shadow-${opt.color.split('-')[1]}-500/20 group-hover:scale-105 transition-transform`}>
                  {opt.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                {!opt.action && (
                  <input
                    type="file"
                    className="hidden"
                    accept={opt.accept}
                    onChange={(e) => handleFileSelect(e, opt.id)}
                  />
                )}
              </label>
            ))}
          </div>
          {/* Backdrop to close */}
          <div className="fixed inset-0 -z-10 bg-transparent" onClick={() => setShowAttachmentMenu(false)} />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a202c]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={!conversationPermissions.canSend}
            className={`p-2.5 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${showAttachmentMenu ? 'bg-blue-600 text-white rotate-45' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <Plus size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            disabled={!conversationPermissions.canSend}
            onChange={(e) => {
              const val = e.target.value;
              setNewMessage(val);
              sessionStorage.setItem(`draft_${conversation.id}`, val);
            }}
            placeholder={getInputPlaceholder()}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || sending || !conversationPermissions.canSend}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg shadow-blue-500/20 disabled:shadow-none"
          >
            <Send size={18} className={(newMessage.trim() || selectedFile) ? '-ml-0.5' : ''} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

