import { apiRequest } from '../../api';

const STATUS_ALIASES = {
  accepted: ['accepted', 'active', 'approved', 'open'],
  pending: ['pending', 'requested', 'request', 'waiting'],
  declined: ['declined', 'rejected', 'refused', 'denied'],
  blocked: ['blocked', 'block'],
};

const ACTION_VARIANTS = {
  accept: ['accept', 'approve'],
  refuse: ['refuse', 'decline', 'reject'],
  block: ['block'],
  unblock: ['unblock'],
};

const ACTION_TO_STATUS = {
  accept: 'accepted',
  refuse: 'declined',
  block: 'blocked',
  unblock: 'accepted',
};

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const isSameId = (a, b) => String(a) === String(b);

const toTimestamp = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeStatus = (conversation = {}) => {
  const rawStatus = String(
    firstDefined(
      conversation.status,
      conversation.conversation_status,
      conversation.request_status,
      conversation.relationship_status,
      ''
    )
  ).toLowerCase();

  if (conversation.is_blocked === true) return 'blocked';
  if (conversation.is_pending === true || conversation.requires_approval === true) return 'pending';
  if (conversation.is_declined === true || conversation.is_refused === true) return 'declined';

  if (STATUS_ALIASES.blocked.some((value) => rawStatus.includes(value))) return 'blocked';
  if (STATUS_ALIASES.pending.some((value) => rawStatus.includes(value))) return 'pending';
  if (STATUS_ALIASES.declined.some((value) => rawStatus.includes(value))) return 'declined';
  if (STATUS_ALIASES.accepted.some((value) => rawStatus.includes(value))) return 'accepted';

  return 'accepted';
};

export const getCurrentUserId = () => JSON.parse(localStorage.getItem('user') || '{}')?.id;

export const resolveOtherUserFromConversation = (conversation, currentUserId = getCurrentUserId()) => {
  if (!conversation) return null;
  if (conversation.user_one && conversation.user_two) {
    return isSameId(conversation.user_one.id, currentUserId) ? conversation.user_two : conversation.user_one;
  }
  if (conversation.other_user && !isSameId(conversation.other_user.id, currentUserId)) {
    return conversation.other_user;
  }
  return conversation.other_user || null;
};

export const getConversationLastActivityAt = (conversation = {}) =>
  firstDefined(
    conversation.latest_message?.created_at,
    conversation.last_message_at,
    conversation.last_activity_at,
    conversation.updated_at,
    conversation.created_at
  );

export const sortConversationsByLatestActivity = (conversations = []) =>
  [...conversations].sort((a, b) => toTimestamp(getConversationLastActivityAt(b)) - toTimestamp(getConversationLastActivityAt(a)));

export const getConversationPermissions = (conversation = {}, currentUserId = getCurrentUserId()) => {
  const status = normalizeStatus(conversation);
  const blockedById = firstDefined(
    conversation.blocked_by_id,
    conversation.blocked_by?.id,
    conversation.blocked_by_user_id
  );
  const requestedById = firstDefined(
    conversation.requested_by_id,
    conversation.requested_by?.id,
    conversation.initiator_id,
    conversation.created_by_id
  );

  const isBlocked = status === 'blocked' || blockedById !== undefined || conversation.is_blocked === true;
  const isBlockedByMe = blockedById !== undefined
    ? isSameId(blockedById, currentUserId)
    : conversation.is_blocked_by_me === true;

  const isPending = status === 'pending';
  const isDeclined = status === 'declined';

  const incomingFromRequesterField =
    conversation.request_direction === 'incoming' ||
    conversation.is_incoming_request === true ||
    conversation.can_accept === true;

  const outgoingFromRequesterField =
    conversation.request_direction === 'outgoing' ||
    conversation.is_requester === true;

  let isIncomingRequest = false;
  if (isPending || isDeclined) {
    if (requestedById !== undefined) {
      isIncomingRequest = !isSameId(requestedById, currentUserId);
    } else if (incomingFromRequesterField) {
      isIncomingRequest = true;
    } else if (outgoingFromRequesterField) {
      isIncomingRequest = false;
    } else {
      isIncomingRequest = true;
    }
  }

  const canAccept =
    !isBlocked &&
    (conversation.can_accept === true || ((isPending || isDeclined) && isIncomingRequest));

  const canRefuse =
    !isBlocked &&
    (conversation.can_refuse === true || conversation.can_decline === true || (isPending && isIncomingRequest));

  const canBlock =
    !isBlocked &&
    (conversation.can_block === true || status === 'accepted');

  const canUnblock =
    isBlocked &&
    (conversation.can_unblock === true || isBlockedByMe || blockedById === undefined);

  const canSend = status === 'accepted' && !isBlocked;

  return {
    status,
    isPending,
    isDeclined,
    isBlocked,
    isBlockedByMe,
    isIncomingRequest,
    canAccept,
    canRefuse,
    canBlock,
    canUnblock,
    canSend,
  };
};

export const countUnreadConversationUsers = (conversations = [], currentUserId = getCurrentUserId()) => {
  const unreadUserIds = new Set();
  conversations.forEach((conversation) => {
    if ((conversation.unread_count || 0) <= 0) return;
    const otherUser = resolveOtherUserFromConversation(conversation, currentUserId);
    if (otherUser?.id !== undefined && otherUser?.id !== null) {
      unreadUserIds.add(String(otherUser.id));
      return;
    }
    unreadUserIds.add(String(conversation.id));
  });
  return unreadUserIds.size;
};

const extractConversationFromActionResponse = (response) =>
  firstDefined(
    response?.conversation,
    response?.data?.conversation,
    response?.data,
    response
  );

const isRetryableActionError = (error) => /\b(404|405)\b/.test(String(error?.message || ''));

export const runConversationAction = async (conversationId, action) => {
  const actionName = String(action || '').toLowerCase();
  const actionVariants = ACTION_VARIANTS[actionName];
  if (!actionVariants || !conversationId) {
    throw new Error('Invalid conversation action.');
  }

  const requests = [];
  actionVariants.forEach((variant) => {
    requests.push({ method: 'POST', url: `/api/dm/conversations/${conversationId}/${variant}` });
    requests.push({ method: 'PUT', url: `/api/dm/conversations/${conversationId}/${variant}` });
  });

  requests.push({
    method: 'PATCH',
    url: `/api/dm/conversations/${conversationId}/status`,
    body: { status: ACTION_TO_STATUS[actionName] },
  });
  requests.push({
    method: 'PATCH',
    url: `/api/dm/conversations/${conversationId}`,
    body: { status: ACTION_TO_STATUS[actionName] },
  });

  let lastError = null;
  for (const request of requests) {
    try {
      const result = await apiRequest(request.url, request.method, request.body || null);
      return extractConversationFromActionResponse(result);
    } catch (error) {
      lastError = error;
      if (!isRetryableActionError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Unable to update conversation status.');
};

