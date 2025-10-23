import {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { Message, MessageStatus, MessageType, MessagePriority, PriorityMetadata } from '../types';

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

  // Handle timestamp - if serverTimestamp() hasn't resolved yet, use current time
  let timestamp: Date;
  if (data.timestamp instanceof Timestamp) {
    timestamp = data.timestamp.toDate();
  } else if (data.timestamp === null || data.timestamp === undefined) {
    // serverTimestamp() hasn't resolved yet - use current time
    console.warn(`Message ${snapshot.id} has null timestamp, using current time`);
    timestamp = new Date();
  } else {
    timestamp = new Date(data.timestamp);
  }

  return {
    id: snapshot.id,
    senderId: data.senderId || '',
    conversationId: data.conversationId || '',
    content: data.content || '',
    timestamp,
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
 * Format message timestamp (e.g., "2:30 PM", "Yesterday 2:30 PM", "Jan 15 2:30 PM")
 */
export function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  // Format time (e.g., "2:30 PM")
  const timeString = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Today - show time only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (timestamp >= today) {
    return timeString;
  }
  
  // Yesterday - show "Yesterday" + time
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (timestamp >= yesterday) {
    return `Yesterday ${timeString}`;
  }
  
  // This year - show month, day + time
  if (timestamp.getFullYear() === now.getFullYear()) {
    const dateString = timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dateString} ${timeString}`;
  }
  
  // Different year - show full date + time
  const dateString = timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${dateString} ${timeString}`;
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

/**
 * =======================
 * Priority Detection Functions (PR #19)
 * =======================
 */

/**
 * Get priority metadata for display
 * @param priority - Priority level (high/medium/low)
 * @returns Priority metadata
 */
export function getPriorityMetadata(priority: MessagePriority): PriorityMetadata {
  const metadata: Record<MessagePriority, PriorityMetadata> = {
    high: {
      label: 'High Priority',
      color: '#EF4444', // red-500
      icon: '🔴',
      description: 'Urgent - needs immediate attention',
      notificationImportance: 'high',
    },
    medium: {
      label: 'Medium Priority',
      color: '#F59E0B', // amber-500
      icon: '🟡',
      description: 'Important - respond when possible',
      notificationImportance: 'default',
    },
    low: {
      label: 'Low Priority',
      color: '#6B7280', // gray-500
      icon: '⚪',
      description: 'General discussion',
      notificationImportance: 'low',
    },
  };
  
  return metadata[priority];
}

/**
 * Set message priority
 * @param message - Message object
 * @param priority - Priority level
 * @returns Updated message with priority
 */
export function setPriority(message: Message, priority: MessagePriority): Message {
  return {
    ...message,
    priority,
    priorityMetadata: getPriorityMetadata(priority),
  };
}

/**
 * Check if message has high priority
 * @param message - Message object
 * @returns True if high priority
 */
export function isHighPriority(message: Message): boolean {
  return message.priority === 'high';
}

/**
 * Check if message has medium priority
 * @param message - Message object
 * @returns True if medium priority
 */
export function isMediumPriority(message: Message): boolean {
  return message.priority === 'medium';
}

/**
 * Check if message has low priority
 * @param message - Message object
 * @returns True if low priority
 */
export function isLowPriority(message: Message): boolean {
  return message.priority === 'low' || !message.priority;
}

/**
 * Filter messages by priority
 * @param messages - Array of messages
 * @param priority - Priority level to filter by
 * @returns Filtered messages
 */
export function filterByPriority(messages: Message[], priority: MessagePriority): Message[] {
  return messages.filter(msg => msg.priority === priority);
}

/**
 * Filter high and medium priority messages
 * @param messages - Array of messages
 * @returns High and medium priority messages
 */
export function filterHighAndMediumPriority(messages: Message[]): Message[] {
  return messages.filter(msg => msg.priority === 'high' || msg.priority === 'medium');
}

/**
 * Get priority count statistics
 * @param messages - Array of messages
 * @returns Priority count statistics
 */
export function getPriorityStats(messages: Message[]): {
  high: number;
  medium: number;
  low: number;
  total: number;
} {
  const stats = { high: 0, medium: 0, low: 0, total: messages.length };
  
  messages.forEach(msg => {
    if (msg.priority === 'high') stats.high++;
    else if (msg.priority === 'medium') stats.medium++;
    else stats.low++;
  });
  
  return stats;
}

/**
 * Sort messages by priority (high -> medium -> low) then by timestamp
 * @param messages - Array of messages
 * @returns Sorted messages
 */
export function sortByPriorityAndTime(messages: Message[]): Message[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return [...messages].sort((a, b) => {
    // Sort by priority first
    const priorityA = priorityOrder[a.priority || 'low'];
    const priorityB = priorityOrder[b.priority || 'low'];
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Then by timestamp (newest first for same priority)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}


