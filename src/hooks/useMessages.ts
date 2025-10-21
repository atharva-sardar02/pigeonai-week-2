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
   * Set up and cleanup real-time listener when conversation changes
   * 
   * Cleanup is critical to prevent:
   * - Memory leaks
   * - Unnecessary Firestore reads (costs money!)
   * - Stale data updates
   */
  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      // Cleanup any existing listener immediately when user logs out
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
      return;
    }

    loadMessages();

    // Cleanup function: Unsubscribe from Firestore listener
    return () => {
      if (unsubscribe) {
        console.log(`Cleaning up message listener for conversation: ${conversationId}`);
        unsubscribe();
        setUnsubscribe(null);
      }
    };
  }, [conversationId, user, isOnline]);

  /**
   * Load messages and set up real-time listener (Task 4.7)
   * 
   * Optimized flow (cache-first for instant loading):
   * 1. Load from cache immediately for instant display
   * 2. Subscribe to Firestore onSnapshot for real-time updates
   * 3. Receive immediate snapshot with current messages from Firestore
   * 4. Receive updates whenever any message changes (new, edited, status update)
   * 5. Cache messages locally for offline access
   * 6. Cleanup listener when conversation changes or component unmounts
   */
  const loadMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      setError(null);

      if (isOnline) {
        // Load from cache first for instant display ⚡
        const cachedMessages = await LocalDatabase.getMessages(conversationId);
        if (cachedMessages.length > 0) {
          setMessages(cachedMessages);
          setLoading(false); // Stop loading immediately - show cached data!
        } else {
          setLoading(true); // Only show loading if no cached messages
        }

        // Then set up real-time Firestore listener for updates
        const listener = FirestoreService.listenToMessages(
          conversationId,
          async (firestoreMessages) => {
            // Real-time update received
            // Deduplicate: Remove any temp messages that now have real counterparts
            setMessages((prevMessages) => {
              // Create a set of real message IDs from Firestore
              const realMessageIds = new Set(firestoreMessages.map(m => m.id));
              
              // Filter out temp messages that have real counterparts
              const tempMessages = prevMessages.filter(msg => {
                if (!msg.id.startsWith('temp_')) return false;
                
                // Check if this temp message has a real counterpart by ID
                if (realMessageIds.has(msg.id)) return false;
                
                // Check if this temp message has a real counterpart by matching
                // content, sender, and timestamp (within 2 seconds)
                const hasDuplicate = firestoreMessages.some(realMsg => 
                  realMsg.senderId === msg.senderId &&
                  realMsg.content === msg.content &&
                  Math.abs(realMsg.timestamp.getTime() - msg.timestamp.getTime()) < 2000
                );
                
                if (hasDuplicate) return false;
                
                return true;
              });
              
              // Merge: temp messages + real messages
              const mergedMessages = [...tempMessages, ...firestoreMessages];
              
              // Remove any duplicate IDs (final safety - use Map to keep only first occurrence)
              const seenIds = new Set<string>();
              const uniqueMessages = mergedMessages.filter(msg => {
                if (seenIds.has(msg.id)) {
                  console.log('Duplicate ID detected and removed:', msg.id);
                  return false;
                }
                seenIds.add(msg.id);
                return true;
              });
              
              // Sort by timestamp (oldest first, for inverted list)
              return uniqueMessages.sort((a, b) => 
                a.timestamp.getTime() - b.timestamp.getTime()
              );
            });
            
            setLoading(false);

            // Cache messages locally for offline access
            for (const message of firestoreMessages) {
              await LocalDatabase.insertMessage(message, true);
            }
          },
          (err) => {
            // Suppress permission errors during logout
            if (err.message.includes('permission') || err.message.includes('permissions') || err.message.includes('Permission denied')) {
              // Don't log anything - already logged as warning in service
              setLoading(false);
              return;
            }
            // Listener error callback
            console.error('Error in real-time message listener:', err);
            setError(err.message);
            setLoading(false);
          }
        );

        // Store unsubscribe function for cleanup
        setUnsubscribe(() => listener);
      } else {
        // Offline - load from local cache
        setLoading(true);
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
   * Send a message with optimistic UI updates
   * 
   * Flow:
   * 1. Create temporary message with status "sending"
   * 2. Add to local state immediately (optimistic update)
   * 3. Save to local database
   * 4. Send to Firestore (if online)
   * 5. On success: Update status to "sent" and replace temp ID
   * 6. On failure: Update status to "failed" and queue for retry
   */
  const sendMessage = useCallback(
    async (content: string, type: MessageType = 'text', imageUrl?: string) => {
      if (!conversationId || !user) {
        throw new Error('Cannot send message: No conversation or user');
      }

      try {
        setError(null);

        // Step 1: Create optimistic message with temporary ID
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const optimisticMessage: Message = {
          id: tempId,
          senderId: user.uid,
          conversationId,
          content,
          timestamp: new Date(),
          status: 'sending', // Show as "sending"
          type,
          imageUrl,
          readBy: { [user.uid]: new Date() },
        };

        // Step 2: Add to UI immediately (optimistic update)
        // Note: MessageList is inverted, so new messages go at the start
        setMessages((prev) => [optimisticMessage, ...prev]);

        // Step 3: Save to local database
        await LocalDatabase.insertMessage(optimisticMessage, false);

        if (isOnline) {
          try {
            // Step 4: Send to Firestore
            const messageId = await FirestoreService.sendMessage(
              conversationId,
              user.uid,
              content,
              type,
              imageUrl
            );

            // Step 5: Update local database with real ID
            // Note: We don't update the UI state here because the Firestore
            // real-time listener will receive the message and handle deduplication
            await LocalDatabase.deleteMessage(tempId);
            
            // The real message will come from the Firestore listener
            // and replace the temp message automatically
          } catch (err: any) {
            // Step 6: On failure - Mark as failed
            console.error('Failed to send message to Firestore:', err);
            
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempId ? { ...msg, status: 'failed' } : msg
              )
            );

            // Update local database with failed status
            await LocalDatabase.updateMessage(tempId, { status: 'failed' });

            // Queue for retry when connection is restored
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
          // Offline - keep as "sending" and queue for later
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


