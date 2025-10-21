import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Track message IDs to prevent duplicates BEFORE state update
  const messageIdsRef = useRef(new Set<string>());

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
      // Clear the message ID tracking ref
      messageIdsRef.current.clear();
      return;
    }

    // Clear message IDs when conversation changes
    messageIdsRef.current.clear();
    
    loadMessages();

    // Cleanup function: Unsubscribe from Firestore listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
      // Clear the message ID tracking ref on cleanup
      messageIdsRef.current.clear();
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
            
            // Initialize our tracking ref with cached message IDs
            messageIdsRef.current = new Set(cachedMessages.map(m => m.id));
          } else {
            setLoading(true); // Only show loading if no cached messages
          }

        // Then set up real-time Firestore listener for updates
        const listener = FirestoreService.listenToMessages(
          conversationId,
          async (firestoreMessages) => {
            // Real-time update received
            // Note: Global notifications are handled by useGlobalNotifications hook
            
            // CRITICAL: Use a single atomic update to prevent any race conditions
            setMessages((prevMessages) => {
              // Create a Map of existing messages by ID for quick lookup
              const existingMessagesMap = new Map(prevMessages.map(m => [m.id, m]));
              
              // Process all Firestore messages
              const updatedMessages: typeof prevMessages = [];
              const processedIds = new Set<string>();
              
              // First, process all messages from Firestore (new or updated)
              for (const firestoreMsg of firestoreMessages) {
                const existingMsg = existingMessagesMap.get(firestoreMsg.id);
                
                if (existingMsg) {
                  // Message exists - check if it's been updated (e.g., readBy changed)
                  const hasChanges = 
                    JSON.stringify(existingMsg.readBy) !== JSON.stringify(firestoreMsg.readBy) ||
                    existingMsg.status !== firestoreMsg.status;
                  
                  if (hasChanges) {
                    // Update the message with new data
                    updatedMessages.push(firestoreMsg);
                  } else {
                    // No changes, keep existing
                    updatedMessages.push(existingMsg);
                  }
                } else {
                  // New message from Firestore
                  updatedMessages.push(firestoreMsg);
                  messageIdsRef.current.add(firestoreMsg.id);
                }
                
                processedIds.add(firestoreMsg.id);
              }
              
              // Then, add any temp/optimistic messages that aren't in Firestore yet
              for (const prevMsg of prevMessages) {
                if (prevMsg.id.startsWith('temp_') && !processedIds.has(prevMsg.id)) {
                  // Check if this temp message has been replaced by a real one
                  const hasRealVersion = firestoreMessages.some(realMsg => 
                    realMsg.senderId === prevMsg.senderId &&
                    realMsg.content === prevMsg.content &&
                    Math.abs(realMsg.timestamp.getTime() - prevMsg.timestamp.getTime()) < 2000
                  );
                  
                  if (!hasRealVersion) {
                    // Keep the temp message
                    updatedMessages.push(prevMsg);
                  } else {
                    // Remove temp ID from tracking
                    messageIdsRef.current.delete(prevMsg.id);
                  }
                }
              }
              
              // Final deduplication using Map (safety net)
              const uniqueMap = new Map<string, typeof updatedMessages[0]>();
              for (const msg of updatedMessages) {
                if (!uniqueMap.has(msg.id)) {
                  uniqueMap.set(msg.id, msg);
                }
              }
              
              const uniqueMessages = Array.from(uniqueMap.values());
              
              // Sort by timestamp (oldest first)
              const sorted = uniqueMessages.sort((a, b) => 
                a.timestamp.getTime() - b.timestamp.getTime()
              );
              
              return sorted;
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

        // Track this temp ID in our ref to prevent duplicates
        messageIdsRef.current.add(tempId);

        // Step 2: Add to UI immediately (optimistic update)
        // Add to BEGINNING of array (for inverted list - newest messages at top/index 0)
        setMessages((prev) => {
          const updated = [optimisticMessage, ...prev];
          return updated;
        });

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


