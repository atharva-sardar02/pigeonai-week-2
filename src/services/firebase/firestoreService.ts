import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Message, Conversation, MessageStatus } from '../../types';
import * as MessageModel from '../../models/Message';
import * as ConversationModel from '../../models/Conversation';
import { FIREBASE_COLLECTIONS } from '../../utils/constants';

/**
 * Firestore Service
 * Handles all Firestore database operations for messages and conversations
 */

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

/**
 * Create a new conversation
 */
export async function createConversation(
  participantIds: string[],
  type: 'dm' | 'group' = 'dm',
  groupName?: string,
  groupIcon?: string,
  adminIds?: string[]
): Promise<string> {
  try {
    // Create conversation object using model
    const conversationData = ConversationModel.createConversation(
      participantIds,
      type,
      groupName,
      groupIcon,
      adminIds
    );

    // Convert to Firestore format
    const firestoreData = ConversationModel.toFirestore(conversationData);

    // Add to Firestore
    const conversationRef = await addDoc(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      firestoreData
    );

    return conversationRef.id;
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    throw new Error(error.message || 'Failed to create conversation');
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const conversationRef = doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      return null;
    }

    // Convert Firestore document to Conversation model
    return ConversationModel.fromFirestore(conversationSnap);
  } catch (error: any) {
    console.error('Error getting conversation:', error);
    throw new Error(error.message || 'Failed to get conversation');
  }
}

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    // Convert all documents to Conversation models
    return querySnapshot.docs.map((doc) => 
      ConversationModel.fromFirestore(doc)
    );
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    throw new Error(error.message || 'Failed to get conversations');
  }
}

/**
 * Listen to conversations in real-time
 */
export function listenToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const conversations = querySnapshot.docs.map((doc) =>
          ConversationModel.fromFirestore(doc)
        );
        callback(conversations);
      },
      (error) => {
        console.error('Error listening to conversations:', error);
        onError?.(new Error(error.message || 'Failed to listen to conversations'));
      }
    );
  } catch (error: any) {
    console.error('Error setting up conversation listener:', error);
    throw new Error(error.message || 'Failed to set up conversation listener');
  }
}

/**
 * Find or create a DM conversation between two users
 */
export async function findOrCreateDMConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  try {
    // Check if conversation already exists
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      where('type', '==', 'dm'),
      where('participants', 'array-contains', userId1)
    );

    const querySnapshot = await getDocs(q);
    
    // Find conversation that includes both users
    const existingConversation = querySnapshot.docs.find((doc) => {
      const data = doc.data();
      return (
        data.participants.length === 2 &&
        data.participants.includes(userId2)
      );
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    return await createConversation([userId1, userId2], 'dm');
  } catch (error: any) {
    console.error('Error finding or creating DM conversation:', error);
    throw new Error(error.message || 'Failed to find or create DM conversation');
  }
}

/**
 * Update conversation's last message info
 */
export async function updateConversationLastMessage(
  conversationId: string,
  lastMessage: string,
  lastMessageTime: Date
): Promise<void> {
  try {
    const conversationRef = doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId);
    
    await updateDoc(conversationRef, {
      lastMessage,
      lastMessageTime: Timestamp.fromDate(lastMessageTime),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating conversation last message:', error);
    throw new Error(error.message || 'Failed to update conversation');
  }
}

/**
 * Increment unread count for a user in a conversation
 */
export async function incrementUnreadCount(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const conversationRef = doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }

    const conversation = ConversationModel.fromFirestore(conversationSnap);
    const updated = ConversationModel.incrementUnreadCount(conversation, userId);

    await updateDoc(conversationRef, {
      unreadCount: updated.unreadCount,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error incrementing unread count:', error);
    throw new Error(error.message || 'Failed to increment unread count');
  }
}

/**
 * Reset unread count for a user in a conversation
 */
export async function resetUnreadCount(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const conversationRef = doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }

    const conversation = ConversationModel.fromFirestore(conversationSnap);
    const updated = ConversationModel.resetUnreadCount(conversation, userId);

    await updateDoc(conversationRef, {
      unreadCount: updated.unreadCount,
    });
  } catch (error: any) {
    console.error('Error resetting unread count:', error);
    throw new Error(error.message || 'Failed to reset unread count');
  }
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Send a message to a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type: 'text' | 'image' = 'text',
  imageUrl?: string
): Promise<string> {
  try {
    // Create message using model
    const messageData = MessageModel.createMessage(
      senderId,
      conversationId,
      content,
      type,
      imageUrl
    );

    // Convert to Firestore format (without id)
    const firestoreData = MessageModel.toFirestore(messageData);

    // Add to Firestore
    const messageRef = await addDoc(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId, 'messages'),
      {
        ...firestoreData,
        timestamp: serverTimestamp(),
        status: 'sent', // Override status to 'sent' on server
      }
    );

    // Update conversation with last message
    await updateConversationLastMessage(
      conversationId,
      type === 'image' ? '📷 Image' : content,
      new Date()
    );

    return messageRef.id;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error.message || 'Failed to send message');
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId, 'messages'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    
    // Convert all documents to Message models and sort ascending (oldest first)
    const messages = querySnapshot.docs.map((doc) =>
      MessageModel.fromFirestore(doc)
    );

    return MessageModel.sortMessagesByTimestamp(messages);
  } catch (error: any) {
    console.error('Error getting messages:', error);
    throw new Error(error.message || 'Failed to get messages');
  }
}

/**
 * Listen to messages in real-time
 */
export function listenToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) =>
          MessageModel.fromFirestore(doc)
        );
        callback(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        onError?.(new Error(error.message || 'Failed to listen to messages'));
      }
    );
  } catch (error: any) {
    console.error('Error setting up message listener:', error);
    throw new Error(error.message || 'Failed to set up message listener');
  }
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  conversationId: string,
  messageId: string,
  status: MessageStatus
): Promise<void> {
  try {
    const messageRef = doc(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'messages',
      messageId
    );

    await updateDoc(messageRef, {
      status,
    });
  } catch (error: any) {
    console.error('Error updating message status:', error);
    throw new Error(error.message || 'Failed to update message status');
  }
}

/**
 * Mark a message as read by a user
 */
export async function markMessageAsRead(
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> {
  try {
    const messageRef = doc(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'messages',
      messageId
    );

    await updateDoc(messageRef, {
      [`readBy.${userId}`]: serverTimestamp(),
      status: 'read',
    });
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    throw new Error(error.message || 'Failed to mark message as read');
  }
}

/**
 * Mark all messages in a conversation as read for a user
 */
export async function markAllMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    // Get all unread messages
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId, 'messages'),
      where(`readBy.${userId}`, '==', null)
    );

    const querySnapshot = await getDocs(q);
    
    // Use batch to update multiple messages
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((messageDoc) => {
      const messageRef = doc(
        db,
        FIREBASE_COLLECTIONS.CONVERSATIONS,
        conversationId,
        'messages',
        messageDoc.id
      );
      
      batch.update(messageRef, {
        [`readBy.${userId}`]: serverTimestamp(),
        status: 'read',
      });
    });

    await batch.commit();

    // Reset unread count for the user
    await resetUnreadCount(conversationId, userId);
  } catch (error: any) {
    console.error('Error marking all messages as read:', error);
    // Don't throw error - this is a non-critical operation
  }
}

/**
 * Delete a message (soft delete - mark as deleted)
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  try {
    const messageRef = doc(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'messages',
      messageId
    );

    // Soft delete - update content
    await updateDoc(messageRef, {
      content: 'This message was deleted',
      status: 'failed',
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    throw new Error(error.message || 'Failed to delete message');
  }
}

// ============================================================================
// TYPING INDICATORS
// ============================================================================

/**
 * Set typing indicator for a user in a conversation
 */
export async function setTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  try {
    const typingRef = doc(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'typing',
      userId
    );

    if (isTyping) {
      await setDoc(typingRef, {
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    } else {
      // Remove typing indicator
      await setDoc(typingRef, {
        isTyping: false,
        timestamp: serverTimestamp(),
      });
    }
  } catch (error: any) {
    console.error('Error setting typing indicator:', error);
    // Don't throw - typing indicators are non-critical
  }
}

/**
 * Listen to typing indicators for a conversation
 */
export function listenToTypingIndicators(
  conversationId: string,
  callback: (typingUsers: { userId: string; isTyping: boolean }[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId, 'typing')
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const typingUsers = querySnapshot.docs
          .map((doc) => ({
            userId: doc.id,
            isTyping: doc.data().isTyping as boolean,
          }))
          .filter((user) => user.isTyping);
        
        callback(typingUsers);
      },
      (error) => {
        console.error('Error listening to typing indicators:', error);
        onError?.(new Error(error.message || 'Failed to listen to typing indicators'));
      }
    );
  } catch (error: any) {
    console.error('Error setting up typing indicator listener:', error);
    throw new Error(error.message || 'Failed to set up typing indicator listener');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a conversation exists
 */
export async function conversationExists(conversationId: string): Promise<boolean> {
  try {
    const conversationRef = doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    return conversationSnap.exists();
  } catch (error: any) {
    console.error('Error checking conversation existence:', error);
    return false;
  }
}

/**
 * Get conversation participant count
 */
export async function getParticipantCount(conversationId: string): Promise<number> {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) return 0;
    return ConversationModel.getParticipantCount(conversation);
  } catch (error: any) {
    console.error('Error getting participant count:', error);
    return 0;
  }
}
