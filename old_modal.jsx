import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserSelector from './UserSelector';
import { apiRequest } from '../../api';

const DirectMessagesModal = ({ isOpen, onClose, initialRecipient }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'chat', 'select'
  // Get fresh user ID from localStorage
  const getCurrentUserId = () => JSON.parse(localStorage.getItem('user') || '{}')?.id;

  // Helper to resolve the other user from a conversation object
  const resolveOtherUser = (conv) => {
    const userId = getCurrentUserId();
    
    // Check user_one and user_two first as they are most reliable
    if (conv.user_one && conv.user_two) {
      return conv.user_one.id == userId ? conv.user_two : conv.user_one;
    }
    
    // Check if conv.other_user exists and is not the current user
    if (conv.other_user && conv.other_user.id != userId) {
      return conv.other_user;
    }
    
    return conv.other_user; // Fallback
  };

  // Reset state when modal opens to prevent stale data from previous roles/sessions
  React.useEffect(() => {
    if (isOpen) {
      setActiveConversation(null);
      setOtherUser(null);
      setView('list');
      setShowUserSelector(false);
    }
  }, [isOpen]);

  // If we have an initial recipient, start conversation with them
  React.useEffect(() => {
    if (initialRecipient && isOpen) {
      handleSelectUser(initialRecipient);
    }
  }, [initialRecipient, isOpen]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setOtherUser(resolveOtherUser(conv));
    setView('chat');
    setShowUserSelector(false);
  };

  const handleSelectUser = async (user) => {
    try {
      const result = await apiRequest('/api/dm/conversations', 'POST', {
        recipient_id: user.id,
      });
      setActiveConversation(result);
      setOtherUser(user);
      setView('chat');
      setShowUserSelector(false);
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Erreur lors de la cr├®ation de la conversation.');
    }
  };

  const handleBackToList = () => {
    setActiveConversation(null);
    setOtherUser(null);
    setView('list');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-[-26px] inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
        >
          <X size={18} />
        </button>

        {/* Left Panel: Conversations or User Selector */}
        <div className={`w-full sm:w-80 flex-shrink-0 bg-white dark:bg-[#1a202c] ${view === 'chat' ? 'hidden sm:flex sm:flex-col' : 'flex flex-col'}`}>
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
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/20 dark:to-teal-900/20 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg">Messages Directs</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                S├®lectionnez une conversation ou d├®marrez une nouvelle discussion avec un coll├¿gue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessagesModal;
