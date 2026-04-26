import React, { useMemo, useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import {
  getCurrentUserId,
  getConversationLastActivityAt,
  getConversationPermissions,
  resolveOtherUserFromConversation,
  sortConversationsByLatestActivity,
} from './dmConversationUtils';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'j';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'min';
  return 'maintenant';
};

const getStatusBadge = (permissions) => {
  if (permissions.isBlocked) {
    return { label: 'Bloque', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
  }

  if (permissions.isPending && permissions.isIncomingRequest) {
    return { label: 'Demande', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
  }

  if (permissions.isPending && !permissions.isIncomingRequest) {
    return { label: 'En attente', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }

  if (permissions.isDeclined) {
    return { label: 'Refuse', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' };
  }

  return null;
};

const getConversationPreview = (conversation, permissions) => {
  if (conversation.latest_message?.content) return conversation.latest_message.content;
  if (permissions.isPending && permissions.isIncomingRequest) return 'Nouvelle demande de message';
  if (permissions.isPending) return 'Demande envoyee';
  if (permissions.isDeclined) return 'Demande refusee';
  if (permissions.isBlocked) return permissions.isBlockedByMe ? 'Vous avez bloque ce contact' : 'Conversation bloquee';
  return 'Aucun message';
};

const ConversationList = ({
  conversations = [],
  loading = false,
  onSelectConversation,
  onNewConversation,
  activeConversationId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const currentUserId = getCurrentUserId();

  const processedConversations = useMemo(() => {
    return sortConversationsByLatestActivity(conversations).map((conversation) => {
      const otherUser = resolveOtherUserFromConversation(conversation, currentUserId);
      const permissions = getConversationPermissions(conversation, currentUserId);
      return {
        ...conversation,
        __otherUser: otherUser,
        __permissions: permissions,
      };
    });
  }, [conversations, currentUserId]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return processedConversations;

    return processedConversations.filter((conversation) => {
      const otherUser = conversation.__otherUser;
      return (otherUser?.name || '').toLowerCase().includes(query);
    });
  }, [processedConversations, searchQuery]);

  return (
    <div className="flex flex-col h-full border-r border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Messages</h3>
        </div>
        <button
          onClick={onNewConversation}
          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          title="Nouvelle conversation"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucune conversation</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Commencez a discuter avec un collegue</p>
            <button
              onClick={onNewConversation}
              className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Nouvelle conversation
            </button>
          </div>
        ) : (
          <div className="p-1">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.__otherUser || conversation.other_user;
              const permissions = conversation.__permissions;
              const statusBadge = getStatusBadge(permissions);
              const unreadCount = conversation.unread_count || 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                    activeConversationId === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600 flex items-center justify-center text-blue-700 dark:text-gray-300 font-bold text-sm">
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        otherUser?.name?.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {otherUser?.name || 'Utilisateur'}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {timeAgo(getConversationLastActivityAt(conversation))}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {getConversationPreview(conversation, permissions)}
                      </p>
                      {statusBadge && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;

