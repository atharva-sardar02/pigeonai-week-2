import {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { Message, MessageStatus, MessageType } from '../types';

/**
 * Create a new Message object with defaults
 */
export function createMessage(
  senderId: string,
  conversationId: string,
  content: string,
  type: MessageType = 'text',
  imageUrl?: string
): Omit<Message, 'id'> {
  return {
    senderId,
    conversationId,
    content,
    timestamp: new Date(),
    status: 'sending',
    type,
    imageUrl,
    readBy: {},
  };
}

/**
 * Convert Firestore document to Message
 */
export function fromFirestore(
  snapshot: QueryDocumentSnapshot,
  options?: SnapshotOptions
): Message {
  const data = snapshot.data(options);
  
  // Convert readBy map timestamps
  const readBy: { [userId: string]: Date } = {};
  if (data.readBy) {
    Object.entries(data.readBy).forEach(([userId, timestamp]) => {
      readBy[userId] = timestamp instanceof Timestamp 
        ? timestamp.toDate() 
        : new Date(timestamp as any);
    });
  }

  return {
    id: snapshot.id,
    senderId: data.senderId || '',
    conversationId: data.conversationId || '',
    content: data.content || '',
    timestamp: data.timestamp instanceof Timestamp 
      ? data.timestamp.toDate() 
      : new Date(data.timestamp),
    status: data.status || 'sent',
    type: data.type || 'text',
    imageUrl: data.imageUrl,
    readBy,
  };
}

/**
 * Convert Message to Firestore document data
 */
export function toFirestore(message: Omit<Message, 'id'>): DocumentData {
  // Convert readBy dates to Firestore timestamps
  const readBy: { [userId: string]: Timestamp } = {};
  if (message.readBy) {
    Object.entries(message.readBy).forEach(([userId, date]) => {
      readBy[userId] = Timestamp.fromDate(date);
    });
  }

  return {
    senderId: message.senderId,
    conversationId: message.conversationId,
    content: message.content,
    timestamp: Timestamp.fromDate(message.timestamp),
    status: message.status,
    type: message.type,
    imageUrl: message.imageUrl || null,
    readBy,
  };
}

/**
 * Update message status
 */
export function updateStatus(
  message: Message,
  newStatus: MessageStatus
): Message {
  return {
    ...message,
    status: newStatus,
  };
}

/**
 * Mark message as read by a user
 */
export function markAsRead(message: Message, userId: string): Message {
  return {
    ...message,
    readBy: {
      ...message.readBy,
      [userId]: new Date(),
    },
  };
}

/**
 * Check if message is read by a specific user
 */
export function isReadBy(message: Message, userId: string): boolean {
  return !!message.readBy?.[userId];
}

/**
 * Check if message is read by all participants
 */
export function isRead(message: Message): boolean {
  return message.status === 'read';
}

/**
 * Check if message is delivered
 */
export function isDelivered(message: Message): boolean {
  return message.status === 'delivered' || message.status === 'read';
}

/**
 * Check if message is sent
 */
export function isSent(message: Message): boolean {
  return ['sent', 'delivered', 'read'].includes(message.status);
}

/**
 * Check if message is sending
 */
export function isSending(message: Message): boolean {
  return message.status === 'sending';
}

/**
 * Check if message failed
 */
export function isFailed(message: Message): boolean {
  return message.status === 'failed';
}

/**
 * Get count of users who read the message
 */
export function getReadByCount(message: Message): number {
  return Object.keys(message.readBy || {}).length;
}

/**
 * Check if message is an image
 */
export function isImageMessage(message: Message): boolean {
  return message.type === 'image' && !!message.imageUrl;
}

/**
 * Check if message is text
 */
export function isTextMessage(message: Message): boolean {
  return message.type === 'text';
}

/**
 * Format message timestamp (e.g., "2:30 PM", "Yesterday", "Jan 15")
 */
export function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Today - show time
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (timestamp >= today) {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  
  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (timestamp >= yesterday) {
    return 'Yesterday';
  }
  
  // This year - show month and day
  if (timestamp.getFullYear() === now.getFullYear()) {
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  
  // Different year - show full date
  return timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get message preview for conversation list (truncate long messages)
 */
export function getMessagePreview(message: Message, maxLength: number = 50): string {
  if (message.type === 'image') {
    return '📷 Image';
  }
  
  if (message.content.length <= maxLength) {
    return message.content;
  }
  
  return message.content.substring(0, maxLength).trim() + '...';
}

/**
 * Check if message is from current user
 */
export function isOwnMessage(message: Message, currentUserId: string): boolean {
  return message.senderId === currentUserId;
}

/**
 * Validate message object
 */
export function isValidMessage(message: any): message is Message {
  return (
    message &&
    typeof message.id === 'string' &&
    typeof message.senderId === 'string' &&
    typeof message.conversationId === 'string' &&
    typeof message.content === 'string' &&
    message.timestamp instanceof Date &&
    ['sending', 'sent', 'delivered', 'read', 'failed'].includes(message.status) &&
    ['text', 'image'].includes(message.type)
  );
}

/**
 * Sort messages by timestamp (ascending - oldest first)
 */
export function sortMessagesByTimestamp(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: Message[]): { [date: string]: Message[] } {
  const grouped: { [date: string]: Message[] } = {};
  
  messages.forEach((message) => {
    const dateKey = message.timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(message);
  });
  
  return grouped;
}


