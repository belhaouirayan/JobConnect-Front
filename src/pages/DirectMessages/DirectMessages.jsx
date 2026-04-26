import React, { useState, useEffect, useCallback } from 'react';
import ConversationList from '../../Components/ActualitesRH/ConversationList';
import ChatWindow from '../../Components/ActualitesRH/ChatWindow';
import UserSelector from '../../Components/ActualitesRH/UserSelector';
import { apiRequest } from '../../api';
import { MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  getCurrentUserId,
  resolveOtherUserFromConversation,
  sortConversationsByLatestActivity,
  countUnreadConversationUsers,
} from '../../Components/ActualitesRH/dmConversationUtils';

const DirectMessages = ({ initialRecipientProp = null, isModal = false }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'chat', 'select'
  const location = useLocation();
  const currentUserId = getCurrentUserId();

  const emitConversationsUpdate = useCallback((nextConversations) => {
    window.dispatchEvent(
      new CustomEvent('dm-conversations-updated', {
        detail: {
          conversations: nextConversations,
          unreadUsers: countUnreadConversationUsers(nextConversations, currentUserId),
        },
      })
    );
  }, [currentUserId]);

  const fetchConversations = useCallback(async (showLoader = false) => {
    if (showLoader) setLoadingConversations(true);

    try {
      const result = await apiRequest('/api/dm/conversations');
      const rawList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];
      const sorted = sortConversationsByLatestActivity(rawList);
      setConversations(sorted);
      emitConversationsUpdate(sorted);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (showLoader) setLoadingConversations(false);
    }
  }, [emitConversationsUpdate]);

  const handleSelectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    setOtherUser(resolveOtherUserFromConversation(conv, currentUserId));
    setView('chat');
    setShowUserSelector(false);
  }, [currentUserId]);

  const handleSelectUser = useCallback(async (user) => {
    try {
      const result = await apiRequest('/api/dm/conversations', 'POST', {
        recipient_id: user.id,
      });
      const createdConversation = result?.conversation || result?.data?.conversation || result?.data || result;
      setActiveConversation(createdConversation);
      setOtherUser(user);
      setView('chat');
      setShowUserSelector(false);
      fetchConversations(false);
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Erreur lors de la creation de la conversation.');
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations(true);
    const interval = setInterval(() => fetchConversations(false), 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversation?.id || conversations.length === 0) return;
    const refreshedActive = conversations.find((conv) => String(conv.id) === String(activeConversation.id));
    if (refreshedActive) {
      setActiveConversation(refreshedActive);
      setOtherUser(resolveOtherUserFromConversation(refreshedActive, currentUserId));
    }
  }, [conversations, activeConversation?.id, currentUserId]);

  useEffect(() => {
    // Handle initial recipient passed via state if any
    const state = location.state;
    if (state && state.initialRecipient) {
      handleSelectUser(state.initialRecipient);
      // Clean up state
      window.history.replaceState({}, document.title);
    } else if (initialRecipientProp) {
      handleSelectUser(initialRecipientProp);
    }
  }, [location.state, initialRecipientProp, handleSelectUser]);


  const handleBackToList = () => {
    setActiveConversation(null);
    setOtherUser(null);
    setView('list');
  };

  return (
    <div className={`flex overflow-hidden bg-white dark:bg-[#1a202c] ${isModal ? 'h-full w-full' : 'h-[calc(100vh-64px)]'}`}>
      {/* Container to match other pages like Dashboard with some padding/margin */}
      <div className={`flex-1 flex justify-center bg-gray-50 dark:bg-gray-900 ${isModal ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
        <div className={`w-full max-w-full h-full bg-white dark:bg-[#1a202c] overflow-hidden flex ${isModal ? 'rounded-none border-0' : 'rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800'}`}>
          
          {/* Left Panel: Conversations or User Selector */}
          <div className={`w-full sm:w-80 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-[#1a202c] ${view === 'chat' ? 'hidden sm:flex sm:flex-col' : 'flex flex-col'}`}>
            {showUserSelector || view === 'select' ? (
              <UserSelector
                onSelectUser={handleSelectUser}
                onClose={() => {
                  setShowUserSelector(false);
                  setView('list');
                }}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                loading={loadingConversations}
                onSelectConversation={handleSelectConversation}
                onNewConversation={() => {
                  setShowUserSelector(true);
                  setView('select');
                }}
                activeConversationId={activeConversation?.id}
              />
            )}
          </div>

          {/* Right Panel: Chat Window */}
          <div className={`flex-1 flex flex-col ${view !== 'chat' ? 'hidden sm:flex' : 'flex'}`}>
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                otherUser={otherUser}
                onBack={handleBackToList}
                onRefreshConversations={fetchConversations}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-[#1a202c]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 flex items-center justify-center mb-6">
                  <MessageSquare size={40} className="text-blue-500/50 dark:text-blue-400/50" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-xl mb-2">Vos Messages</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm leading-relaxed">
                  Sélectionnez une conversation dans la liste ou démarrez une nouvelle discussion avec un collègue en cliquant sur le "+".
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DirectMessages;

