import { Conversation, ConversationType } from '../types';
import { Timestamp } from 'firebase/firestore';

/**
 * Conversation Model (Task 3.2)
 * 
 * Pure functions for creating and manipulating conversation objects.
 * All functions are immutable - they return new objects rather than mutating.
 */

// ============================================================================
// CREATE & CONVERT
// ============================================================================

/**
 * Create a new conversation with default values
 */
export function createConversation(
  participants: string[],
  type: ConversationType = 'dm',
  name?: string,
  icon?: string,
  adminIds?: string[]
): Conversation {
  const now = new Date();
  
  return {
    id: '', // Will be set by Firestore
    type,
    participants,
    createdAt: now,
    updatedAt: now,
    createdBy: participants[0],
    ...(name && { name }),
    ...(icon && { icon }),
    ...(adminIds && { adminIds }),
    unreadCount: {},
  };
}

/**
 * Convert Firestore document to Conversation object
 */
export function fromFirestore(doc: any): Conversation {
  const data = doc.data();
  
  return {
    id: doc.id,
    type: data.type || 'dm',
    participants: data.participants || [],
    lastMessage: data.lastMessage,
    lastMessageTime: data.lastMessageTime?.toDate?.() || data.lastMessageTime,
    unreadCount: data.unreadCount || {},
    createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
    createdBy: data.createdBy,
    name: data.name,
    icon: data.icon,
    adminIds: data.adminIds,
  };
}

/**
 * Convert Conversation to Firestore document
 * Note: Firestore doesn't accept undefined values, so we conditionally include fields
 */
export function toFirestore(conversation: Conversation): any {
  const firestoreData: any = {
    type: conversation.type,
    participants: conversation.participants,
    unreadCount: conversation.unreadCount || {},
    createdAt: conversation.createdAt instanceof Date
      ? Timestamp.fromDate(conversation.createdAt)
      : conversation.createdAt,
    updatedAt: conversation.updatedAt instanceof Date
      ? Timestamp.fromDate(conversation.updatedAt)
      : conversation.updatedAt,
    createdBy: conversation.createdBy,
  };

  // Only include optional fields if they have values
  if (conversation.lastMessage !== undefined) {
    firestoreData.lastMessage = conversation.lastMessage;
  }
  
  if (conversation.lastMessageTime !== undefined) {
    firestoreData.lastMessageTime = conversation.lastMessageTime instanceof Date
      ? Timestamp.fromDate(conversation.lastMessageTime)
      : conversation.lastMessageTime;
  }
  
  if (conversation.name) {
    firestoreData.name = conversation.name;
  }
  
  if (conversation.icon) {
    firestoreData.icon = conversation.icon;
  }
  
  if (conversation.adminIds && conversation.adminIds.length > 0) {
    firestoreData.adminIds = conversation.adminIds;
  }

  return firestoreData;
}

// ============================================================================
// MESSAGE UPDATES
// ============================================================================

/**
 * Update last message info
 */
export function updateLastMessage(
  conversation: Conversation,
  lastMessage: string,
  lastMessageTime: Date
): Conversation {
  return {
    ...conversation,
    lastMessage,
    lastMessageTime,
    updatedAt: new Date(),
  };
}

// ============================================================================
// UNREAD COUNT MANAGEMENT
// ============================================================================

/**
 * Increment unread count for a user
 */
export function incrementUnreadCount(
  conversation: Conversation,
  userId: string
): Conversation {
  const currentCount = conversation.unreadCount?.[userId] || 0;
  
  return {
    ...conversation,
    unreadCount: {
      ...conversation.unreadCount,
      [userId]: currentCount + 1,
    },
  };
}

/**
 * Reset unread count for a user
 */
export function resetUnreadCount(
  conversation: Conversation,
  userId: string
): Conversation {
  return {
    ...conversation,
    unreadCount: {
      ...conversation.unreadCount,
      [userId]: 0,
    },
  };
}

/**
 * Get unread count for a specific user
 */
export function getUnreadCount(
  conversation: Conversation,
  userId: string
): number {
  return conversation.unreadCount?.[userId] || 0;
}

/**
 * Check if conversation has unread messages for a user
 */
export function hasUnreadMessages(
  conversation: Conversation,
  userId: string
): boolean {
  return getUnreadCount(conversation, userId) > 0;
}

// ============================================================================
// PARTICIPANT MANAGEMENT
// ============================================================================

/**
 * Add a participant to the conversation
 */
export function addParticipant(
  conversation: Conversation,
  userId: string
): Conversation {
  if (conversation.participants.includes(userId)) {
    return conversation;
  }
  
  return {
    ...conversation,
    participants: [...conversation.participants, userId],
    updatedAt: new Date(),
  };
}

/**
 * Remove a participant from the conversation
 */
export function removeParticipant(
  conversation: Conversation,
  userId: string
): Conversation {
  return {
    ...conversation,
    participants: conversation.participants.filter((id) => id !== userId),
    updatedAt: new Date(),
  };
}

/**
 * Check if user is a participant
 */
export function isParticipant(
  conversation: Conversation,
  userId: string
): boolean {
  return conversation.participants.includes(userId);
}

/**
 * Check if user is an admin (for groups)
 */
export function isAdmin(
  conversation: Conversation,
  userId: string
): boolean {
  return conversation.adminIds?.includes(userId) || false;
}

/**
 * Get participant count
 */
export function getParticipantCount(conversation: Conversation): number {
  return conversation.participants.length;
}

/**
 * Get the other participant's ID in a DM conversation
 */
export function getOtherParticipantId(
  conversation: Conversation,
  currentUserId: string
): string | null {
  if (conversation.type !== 'dm') {
    return null;
  }
  
  return conversation.participants.find((id) => id !== currentUserId) || null;
}

// ============================================================================
// TYPE CHECKS
// ============================================================================

/**
 * Check if conversation is a group
 */
export function isGroup(conversation: Conversation): boolean {
  return conversation.type === 'group';
}

/**
 * Check if conversation is a DM
 */
export function isDM(conversation: Conversation): boolean {
  return conversation.type === 'dm';
}

// ============================================================================
// DISPLAY & FORMATTING
// ============================================================================

/**
 * Get display name for conversation
 */
export function getDisplayName(
  conversation: Conversation,
  currentUserId: string,
  getUserDisplayName: (userId: string) => string
): string {
  // For groups, use the group name
  if (conversation.type === 'group') {
    return conversation.name || 'Group Chat';
  }
  
  // For DMs, use the other participant's name
  const otherParticipantId = getOtherParticipantId(conversation, currentUserId);
  if (otherParticipantId) {
    return getUserDisplayName(otherParticipantId);
  }
  
  return 'Chat';
}

/**
 * Format last message time
 */
export function formatLastMessageTime(date: Date | number | undefined): string {
  if (!date) return '';
  
  const messageDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate conversation object
 */
export function isValidConversation(conversation: any): conversation is Conversation {
  return (
    conversation &&
    typeof conversation.id === 'string' &&
    Array.isArray(conversation.participants) &&
    conversation.participants.length > 0 &&
    (conversation.type === 'dm' || conversation.type === 'group')
  );
}

// ============================================================================
// SORTING & FILTERING
// ============================================================================

/**
 * Sort conversations by last message time (most recent first)
 */
export function sortConversationsByTime(
  conversations: Conversation[]
): Conversation[] {
  return [...conversations].sort((a, b) => {
    const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
    const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Filter conversations by type
 */
export function filterByType(
  conversations: Conversation[],
  type: ConversationType
): Conversation[] {
  return conversations.filter((c) => c.type === type);
}

/**
 * Filter unread conversations for a user
 */
export function filterUnread(
  conversations: Conversation[],
  userId: string
): Conversation[] {
  return conversations.filter((c) => hasUnreadMessages(c, userId));
}

/**
 * Get total unread count across all conversations for a user
 */
export function getTotalUnreadCount(
  conversations: Conversation[],
  userId: string
): number {
  return conversations.reduce(
    (total, conversation) => total + getUnreadCount(conversation, userId),
    0
  );
}

