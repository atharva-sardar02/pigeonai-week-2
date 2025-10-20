import { useState, useEffect, useCallback } from 'react';
import { Message, MessageType } from '../types';
import { useAuth } from '../store/context/AuthContext';
import * as FirestoreService from '../services/firebase/firestoreService';
import * as LocalDatabase from '../services/database/localDatabase';
import NetInfo from '@react-native-community/netinfo';

/**
 * useMessages Hook
 * Manages messages for a specific conversation
 */

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, type?: MessageType, imageUrl?: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export function useMessages(conversationId: string | null): UseMessagesReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  /**
   * Monitor network connectivity
   */
  useEffect(() => {
    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      netInfoUnsubscribe();
    };
  }, []);

  /**
   * Load messages when conversationId changes
   */
  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      return;
    }

    loadMessages();

    // Cleanup listener on unmount or conversation change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [conversationId, user, isOnline]);

  /**
   * Load messages from Firestore with real-time updates
   */
  const loadMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        // Set up real-time listener
        const listener = FirestoreService.listenToMessages(
          conversationId,
          async (firestoreMessages) => {
            setMessages(firestoreMessages);
            setLoading(false);

            // Cache messages locally
            for (const message of firestoreMessages) {
              await LocalDatabase.insertMessage(message, true);
            }
          },
          (err) => {
            console.error('Error listening to messages:', err);
            setError(err.message);
            setLoading(false);
          }
        );

        setUnsubscribe(() => listener);
      } else {
        // Offline - load from cache
        const cachedMessages = await LocalDatabase.getMessages(conversationId);
        setMessages(cachedMessages);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Failed to load messages');
      setLoading(false);
    }
  }, [conversationId, user, isOnline]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string, type: MessageType = 'text', imageUrl?: string) => {
      if (!conversationId || !user) {
        throw new Error('Cannot send message: No conversation or user');
      }

      try {
        setError(null);

        // Create optimistic message
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const optimisticMessage: Message = {
          id: tempId,
          senderId: user.uid,
          conversationId,
          content,
          timestamp: new Date(),
          status: 'sending',
          type,
          imageUrl,
          readBy: { [user.uid]: new Date() },
        };

        // Add to UI immediately
        setMessages((prev) => [...prev, optimisticMessage]);

        // Save to local database
        await LocalDatabase.insertMessage(optimisticMessage, false);

        if (isOnline) {
          try {
            // Send to Firestore
            const messageId = await FirestoreService.sendMessage(
              conversationId,
              user.uid,
              content,
              type,
              imageUrl
            );

            // Update with real ID
            const sentMessage: Message = {
              ...optimisticMessage,
              id: messageId,
              status: 'sent',
            };

            setMessages((prev) =>
              prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
            );

            // Update local database
            await LocalDatabase.deleteMessage(tempId);
            await LocalDatabase.insertMessage(sentMessage, true);
          } catch (err: any) {
            // Mark as failed
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempId ? { ...msg, status: 'failed' } : msg
              )
            );

            // Queue for retry
            await LocalDatabase.enqueueOperation({
              operationType: 'sendMessage',
              data: {
                conversationId,
                senderId: user.uid,
                content,
                type,
                imageUrl,
                tempId,
              },
            });

            throw err;
          }
        } else {
          // Offline - queue for later
          await LocalDatabase.enqueueOperation({
            operationType: 'sendMessage',
            data: {
              conversationId,
              senderId: user.uid,
              content,
              type,
              imageUrl,
              tempId,
            },
          });
        }
      } catch (err: any) {
        console.error('Error sending message:', err);
        setError(err.message || 'Failed to send message');
        throw err;
      }
    },
    [conversationId, user, isOnline]
  );

  /**
   * Refresh messages (force reload)
   */
  const refreshMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        const firestoreMessages = await FirestoreService.getMessages(conversationId);
        setMessages(firestoreMessages);

        // Update cache
        for (const message of firestoreMessages) {
          await LocalDatabase.insertMessage(message, true);
        }
      } else {
        const cachedMessages = await LocalDatabase.getMessages(conversationId);
        setMessages(cachedMessages);
      }
    } catch (err: any) {
      console.error('Error refreshing messages:', err);
      setError(err.message || 'Failed to refresh messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, isOnline]);

  /**
   * Mark a message as read
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!conversationId || !user || !isOnline) return;

      try {
        await FirestoreService.markMessageAsRead(conversationId, messageId, user.uid);
      } catch (err: any) {
        console.error('Error marking message as read:', err);
      }
    },
    [conversationId, user, isOnline]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages,
    markAsRead,
  };
}


