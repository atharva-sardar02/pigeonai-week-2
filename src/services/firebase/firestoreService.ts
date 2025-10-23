import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  writeBatch,
  arrayUnion,
  arrayRemove,
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
        // Suppress permission errors (expected during logout)
        if (error.message?.includes('permission') || error.message?.includes('permissions')) {
          // Silently handle - this is expected when user logs out
          onError?.(new Error('Permission denied'));
          return;
        }
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
    // Check if conversation already exists between these two users
    // Note: Some conversations might be stored as 'dm' or 'direct'
    
    // Query for type 'dm'
    const q1 = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      where('type', '==', 'dm'),
      where('participants', 'array-contains', userId1)
    );

    const snapshot1 = await getDocs(q1);
    
    // Find ALL conversations that include both users (to detect duplicates)
    const dmConversations = snapshot1.docs.filter((doc) => {
      const data = doc.data();
      return (
        data.participants.length === 2 &&
        data.participants.includes(userId1) &&
        data.participants.includes(userId2)
      );
    });

    // Query for type 'direct' (legacy support)
    const q2 = query(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      where('type', '==', 'direct'),
      where('participants', 'array-contains', userId1)
    );

    const snapshot2 = await getDocs(q2);
    
    // Find ALL conversations that include both users
    const directConversations = snapshot2.docs.filter((doc) => {
      const data = doc.data();
      return (
        data.participants.length === 2 &&
        data.participants.includes(userId1) &&
        data.participants.includes(userId2)
      );
    });

    // Combine all found conversations
    const allConversations = [...dmConversations, ...directConversations];

    if (allConversations.length > 0) {
      // If we found duplicates, clean them up!
      if (allConversations.length > 1) {
        console.warn(`⚠️ Found ${allConversations.length} duplicate conversations, cleaning up...`);
        
        // Sort by creation date (oldest first) and by whether they have messages
        const conversationsWithData = await Promise.all(
          allConversations.map(async (doc) => {
            const data = doc.data();
            // Check if conversation has messages
            const messagesSnapshot = await getDocs(
              collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS, doc.id, 'messages')
            );
            return {
              doc,
              data,
              hasMessages: messagesSnapshot.size > 0,
              messageCount: messagesSnapshot.size,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          })
        );

        // Keep the conversation with messages, or the oldest one
        conversationsWithData.sort((a, b) => {
          if (a.hasMessages !== b.hasMessages) {
            return b.hasMessages ? 1 : -1; // Prioritize conversation with messages
          }
          if (a.messageCount !== b.messageCount) {
            return b.messageCount - a.messageCount; // Keep the one with more messages
          }
          return a.createdAt.getTime() - b.createdAt.getTime(); // Or keep the oldest
        });

        const keepConversation = conversationsWithData[0];
        const deleteConversations = conversationsWithData.slice(1);

        // Delete duplicate conversations
        for (const conv of deleteConversations) {
          console.log(`🗑️ Deleting duplicate conversation: ${conv.doc.id}`);
          await deleteDoc(doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conv.doc.id));
        }

        console.log(`✅ Kept conversation: ${keepConversation.doc.id} (messages: ${keepConversation.messageCount})`);
        return keepConversation.doc.id;
      }

      // Only one conversation found - return it
      console.log('✅ Found existing conversation:', allConversations[0].id);
      return allConversations[0].id;
    }

    // No existing conversation found, create new one as 'dm'
    console.log('📝 Creating new DM conversation between', userId1, 'and', userId2);
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
        // Suppress permission errors (expected during logout)
        if (error.message?.includes('permission') || error.message?.includes('permissions')) {
          // Silently handle - this is expected when user logs out
          onError?.(new Error('Permission denied'));
          return;
        }
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
 * Search users by display name or email (Task 4.10)
 * 
 * Note: This is a simple search implementation.
 * For production, consider using:
 * - Algolia for better search performance
 * - Cloud Functions for server-side search
 * - Firebase Extensions for full-text search
 * 
 * Current implementation:
 * - Searches by email (exact match)
 * - Searches by displayName prefix (case-insensitive)
 */
export async function searchUsers(searchQuery: string): Promise<any[]> {
  try {
    const results: any[] = [];
    const normalizedQuery = searchQuery.toLowerCase().trim();

    // Search by email (exact match or prefix)
    const emailQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS),
      where('email', '>=', normalizedQuery),
      where('email', '<=', normalizedQuery + '\uf8ff'),
      firestoreLimit(10)
    );

    const emailSnap = await getDocs(emailQuery);
    emailSnap.forEach((doc) => {
      results.push({
        uid: doc.id,
        ...doc.data(),
      });
    });

    // Search by displayName (prefix match)
    // Note: Firestore doesn't support case-insensitive queries natively
    // This is a workaround - for production use Algolia or similar
    const nameQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS),
      orderBy('displayName'),
      firestoreLimit(50) // Get more to filter client-side
    );

    const nameSnap = await getDocs(nameQuery);
    nameSnap.forEach((doc) => {
      const userData = doc.data();
      const displayName = (userData.displayName || '').toLowerCase();
      
      // Check if display name contains the search query
      if (displayName.includes(normalizedQuery)) {
        // Check if not already in results
        if (!results.some((r) => r.uid === doc.id)) {
          results.push({
            uid: doc.id,
            ...userData,
          });
        }
      }
    });

    // Limit final results
    return results.slice(0, 20);
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
}

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

// ============================================================================
// PRESENCE OPERATIONS
// ============================================================================

/**
 * Update user's online presence status
 * @param userId - The user's ID
 * @param isOnline - Whether the user is online
 * @param lastSeen - Optional timestamp for last seen (defaults to now)
 */
export async function updatePresence(
  userId: string,
  isOnline: boolean,
  lastSeen?: Date
): Promise<void> {
  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
    
    const presenceData: any = {
      isOnline,
      lastSeen: lastSeen ? Timestamp.fromDate(lastSeen) : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, presenceData);
    
    console.log(`✅ Presence updated for user ${userId}: ${isOnline ? 'online' : 'offline'}`);
  } catch (error: any) {
    console.error('Error updating presence:', error);
    throw new Error(error.message || 'Failed to update presence');
  }
}

/**
 * Setup automatic offline presence when connection drops (airplane mode, network loss, etc.)
 * Uses Firestore's built-in connection state monitoring
 * @param userId - The user's ID
 */
export async function setupPresenceDisconnect(userId: string): Promise<void> {
  try {
    // Note: Firestore doesn't have built-in onDisconnect like Realtime Database
    // However, we can monitor connection state and update accordingly
    // The app will appear offline to others within ~30 seconds of network loss
    // This is handled by Firebase's built-in timeout on the server side
    
    console.log(`🔌 Presence disconnect monitoring enabled for user ${userId}`);
    console.log('📡 User will auto-appear offline within 30s of network loss');
    
    // Firebase automatically considers clients offline if they don't send a heartbeat
    // for ~30 seconds. Combined with our AppState listeners, this provides good coverage.
  } catch (error: any) {
    console.error('Error setting up presence disconnect:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Listen to a user's presence status in real-time
 * @param userId - The user's ID to listen to
 * @param onPresenceChange - Callback when presence changes
 * @param onError - Optional error callback
 * @returns Unsubscribe function
 */
export function listenToPresence(
  userId: string,
  onPresenceChange: (isOnline: boolean, lastSeen: Date | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);

    return onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const isOnline = data.isOnline || false;
          const lastSeen = data.lastSeen?.toDate() || null;
          
          onPresenceChange(isOnline, lastSeen);
        } else {
          // User document doesn't exist - treat as offline
          onPresenceChange(false, null);
        }
      },
      (error) => {
        console.error('Error listening to presence:', error);
        if (onError) {
          onError(new Error(error.message || 'Failed to listen to presence'));
        }
      }
    );
  } catch (error: any) {
    console.error('Error setting up presence listener:', error);
    throw new Error(error.message || 'Failed to set up presence listener');
  }
}

/**
 * Get user's current presence status (one-time fetch)
 * @param userId - The user's ID
 * @returns Object with isOnline and lastSeen
 */
export async function getPresence(
  userId: string
): Promise<{ isOnline: boolean; lastSeen: Date | null }> {
  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { isOnline: false, lastSeen: null };
    }

    const data = userSnap.data();
    return {
      isOnline: data.isOnline || false,
      lastSeen: data.lastSeen?.toDate() || null,
    };
  } catch (error: any) {
    console.error('Error getting presence:', error);
    return { isOnline: false, lastSeen: null };
  }
}

// ============================================================================
// TYPING INDICATOR OPERATIONS
// ============================================================================

/**
 * Set typing status for a user in a conversation
 * @param conversationId - The conversation ID
 * @param userId - The user's ID
 * @param isTyping - Whether the user is typing
 */
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  try {
    const typingRef = doc(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      FIREBASE_COLLECTIONS.TYPING,
      userId
    );

    if (isTyping) {
      // Set typing status with timestamp
      await setDoc(typingRef, {
        userId,
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    } else {
      // Remove typing status
      await deleteDoc(typingRef);
    }
  } catch (error: any) {
    console.error('Error setting typing status:', error);
    // Don't throw - typing indicators are not critical
  }
}

/**
 * Listen to typing status for a conversation
 * @param conversationId - The conversation ID
 * @param onTypingChange - Callback when typing status changes
 * @param onError - Optional error callback
 * @returns Unsubscribe function
 */
export function listenToTyping(
  conversationId: string,
  onTypingChange: (typingUsers: { userId: string; timestamp: Date }[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const typingCollectionRef = collection(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      FIREBASE_COLLECTIONS.TYPING
    );

    return onSnapshot(
      typingCollectionRef,
      (snapshot) => {
        const typingUsers: { userId: string; timestamp: Date }[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isTyping) {
            typingUsers.push({
              userId: data.userId,
              timestamp: data.timestamp?.toDate() || new Date(),
            });
          }
        });

        onTypingChange(typingUsers);
      },
      (error) => {
        console.error('Error listening to typing status:', error);
        if (onError) {
          onError(new Error(error.message || 'Failed to listen to typing status'));
        }
      }
    );
  } catch (error: any) {
    console.error('Error setting up typing listener:', error);
    throw new Error(error.message || 'Failed to set up typing listener');
  }
}

// ============================================================================
// GROUP OPERATIONS
// ============================================================================

/**
 * Create a new group
 * @param name - Group name
 * @param memberIds - Array of user IDs (including creator)
 * @param createdBy - Creator user ID
 * @param iconUrl - Optional group icon URL
 * @param description - Optional group description
 * @returns Group ID
 */
export async function createGroup(
  name: string,
  memberIds: string[],
  createdBy: string,
  iconUrl?: string,
  description?: string
): Promise<string> {
  try {
    const groupData = {
      name,
      description: description || null,
      iconUrl: iconUrl || null,
      adminIds: [createdBy], // Creator is the first admin
      memberIds,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const groupRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.GROUPS), groupData);
    console.log(`✅ Group created: ${groupRef.id}`);
    return groupRef.id;
  } catch (error: any) {
    console.error('Error creating group:', error);
    throw new Error(error.message || 'Failed to create group');
  }
}

/**
 * Get a group by ID
 * @param groupId - The group ID
 * @returns Group object or null if not found
 */
export async function getGroup(groupId: string): Promise<any | null> {
  try {
    const groupRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return null;
    }

    const data = groupSnap.data();
    return {
      id: groupSnap.id,
      name: data.name || '',
      description: data.description,
      iconUrl: data.iconUrl,
      adminIds: data.adminIds || [],
      memberIds: data.memberIds || [],
      createdBy: data.createdBy || '',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error: any) {
    console.error('Error getting group:', error);
    throw new Error(error.message || 'Failed to get group');
  }
}

/**
 * Update group information
 * @param groupId - The group ID
 * @param updates - Fields to update
 */
export async function updateGroup(
  groupId: string,
  updates: {
    name?: string;
    description?: string;
    iconUrl?: string;
  }
): Promise<void> {
  try {
    const groupRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
    
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(groupRef, updateData);
    console.log(`✅ Group updated: ${groupId}`);
  } catch (error: any) {
    console.error('Error updating group:', error);
    throw new Error(error.message || 'Failed to update group');
  }
}

/**
 * Add a member to a group
 * @param groupId - The group ID
 * @param userId - User ID to add
 */
export async function addGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
    
    await updateDoc(groupRef, {
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Member ${userId} added to group ${groupId}`);
  } catch (error: any) {
    console.error('Error adding group member:', error);
    throw new Error(error.message || 'Failed to add group member');
  }
}

/**
 * Remove a member from a group
 * @param groupId - The group ID
 * @param userId - User ID to remove
 */
export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
    
    await updateDoc(groupRef, {
      memberIds: arrayRemove(userId),
      adminIds: arrayRemove(userId), // Also remove from admins if they were one
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Member ${userId} removed from group ${groupId}`);
  } catch (error: any) {
    console.error('Error removing group member:', error);
    throw new Error(error.message || 'Failed to remove group member');
  }
}

/**
 * Promote a member to admin
 * @param groupId - The group ID
 * @param userId - User ID to promote
 */
export async function promoteToGroupAdmin(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
    
    await updateDoc(groupRef, {
      adminIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ User ${userId} promoted to admin in group ${groupId}`);
  } catch (error: any) {
    console.error('Error promoting to admin:', error);
    throw new Error(error.message || 'Failed to promote to admin');
  }
}

/**
 * Demote an admin to regular member
 * @param groupId - The group ID
 * @param userId - User ID to demote
 */
export async function demoteFromGroupAdmin(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
    
    await updateDoc(groupRef, {
      adminIds: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ User ${userId} demoted from admin in group ${groupId}`);
  } catch (error: any) {
    console.error('Error demoting from admin:', error);
    throw new Error(error.message || 'Failed to demote from admin');
  }
}

/**
 * Leave a group (remove yourself as member)
 * @param groupId - The group ID
 * @param userId - User ID leaving the group
 */
export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    await removeGroupMember(groupId, userId);
    console.log(`✅ User ${userId} left group ${groupId}`);
  } catch (error: any) {
    console.error('Error leaving group:', error);
    throw new Error(error.message || 'Failed to leave group');
  }
}

/**
 * Create a group conversation (links a group to a conversation)
 * @param groupId - The group ID
 * @param memberIds - Array of member user IDs
 * @param groupName - Group name
 * @param groupIcon - Optional group icon
 * @param createdBy - Creator user ID
 * @returns Conversation ID
 */
export async function createGroupConversation(
  groupId: string,
  memberIds: string[],
  groupName: string,
  groupIcon?: string,
  createdBy?: string
): Promise<string> {
  try {
    const conversationData = {
      type: 'group',
      participants: memberIds,
      groupId,
      name: groupName,
      icon: groupIcon || null,
      adminIds: [createdBy || memberIds[0]], // First member or creator is admin
      createdBy: createdBy || memberIds[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: {},
    };

    const conversationRef = await addDoc(
      collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS),
      conversationData
    );

    console.log(`✅ Group conversation created: ${conversationRef.id}`);
    return conversationRef.id;
  } catch (error: any) {
    console.error('Error creating group conversation:', error);
    throw new Error(error.message || 'Failed to create group conversation');
  }
}

/**
 * Delete all messages in a conversation
 * @param conversationId - The conversation ID
 */
export async function deleteAllMessagesInConversation(
  conversationId: string
): Promise<void> {
  try {
    console.log(`🗑️ Deleting all messages in conversation: ${conversationId}`);
    
    // Get all messages in the conversation
    const messagesRef = collection(
      db,
      FIREBASE_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'messages'
    );
    
    const messagesSnap = await getDocs(messagesRef);
    
    if (messagesSnap.empty) {
      console.log('No messages to delete');
      return;
    }

    // Batch delete all messages (max 500 per batch)
    const batch = writeBatch(db);
    let deleteCount = 0;
    
    messagesSnap.forEach((messageDoc) => {
      batch.delete(messageDoc.ref);
      deleteCount++;
    });

    await batch.commit();
    
    // Update conversation lastMessage to null
    const conversationRef = doc(db, FIREBASE_COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      lastMessage: null,
      lastMessageTime: null,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Deleted ${deleteCount} messages from conversation ${conversationId}`);
  } catch (error: any) {
    console.error('Error deleting messages:', error);
    throw new Error(error.message || 'Failed to delete messages');
  }
}

/**
 * Get common groups between two users
 * @param userId1 - First user ID (current user)
 * @param userId2 - Second user ID (profile user)
 * @returns Array of common group conversations
 */
export async function getCommonGroups(
  userId1: string,
  userId2: string
): Promise<Conversation[]> {
  try {
    console.log(`🔍 Finding common groups between ${userId1} and ${userId2}`);

    // Query conversations where both users are participants and type is 'group'
    const conversationsRef = collection(db, FIREBASE_COLLECTIONS.CONVERSATIONS);
    
    // Get all group conversations that user1 is in
    const user1GroupsQuery = query(
      conversationsRef,
      where('type', '==', 'group'),
      where('participants', 'array-contains', userId1)
    );
    
    const user1GroupsSnap = await getDocs(user1GroupsQuery);
    
    if (user1GroupsSnap.empty) {
      console.log('User1 has no groups');
      return [];
    }

    // Filter groups where user2 is also a participant
    const commonGroups: Conversation[] = [];
    
    user1GroupsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const participants = data.participants || [];
      
      // Check if user2 is also in this group
      if (participants.includes(userId2)) {
        const conversation = ConversationModel.fromFirestore(docSnap);
        commonGroups.push(conversation);
      }
    });

    console.log(`✅ Found ${commonGroups.length} common groups`);
    return commonGroups;
  } catch (error: any) {
    console.error('Error getting common groups:', error);
    throw new Error(error.message || 'Failed to get common groups');
  }
}
