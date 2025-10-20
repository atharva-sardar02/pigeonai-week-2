import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Create a new conversation
 */
export const createConversation = async (
  participantIds: string[],
  type: 'dm' | 'group' = 'dm'
) => {
  try {
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      type,
      participants: participantIds,
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return conversationRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create conversation');
  }
};

/**
 * Get conversations for a user
 */
export const getConversations = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get conversations');
  }
};

/**
 * Listen to conversations in real-time
 */
export const listenToConversations = (
  userId: string,
  callback: (conversations: any[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(conversations);
  });
};

/**
 * Send a message
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: 'text' | 'image' = 'text'
) => {
  try {
    const messageRef = await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      {
        senderId,
        content,
        type,
        timestamp: serverTimestamp(),
        status: 'sent',
        readBy: { [senderId]: serverTimestamp() },
      }
    );

    // Update conversation with last message
    await setDoc(
      doc(db, 'conversations', conversationId),
      {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return messageRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send message');
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  messageLimit: number = 50
) => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get messages');
  }
};

/**
 * Listen to messages in real-time
 */
export const listenToMessages = (
  conversationId: string,
  callback: (messages: any[]) => void
) => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  try {
    // This would need to update multiple messages
    // Implementation depends on your exact requirements
    console.log('Mark messages as read:', conversationId, userId);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark messages as read');
  }
};

