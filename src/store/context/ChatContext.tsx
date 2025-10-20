import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, Message, MessageType, ChatContextType } from '../../types';
import { useAuth } from './AuthContext';
import * as FirestoreService from '../../services/firebase/firestoreService';
import * as LocalDatabase from '../../services/database/localDatabase';
import NetInfo from '@react-native-community/netinfo';

/**
 * Chat Context
 * Manages conversations and messages state globally
 */

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listeners cleanup
  const [conversationsUnsubscribe, setConversationsUnsubscribe] = useState<(() => void) | null>(null);
  const [messagesUnsubscribe, setMessagesUnsubscribe] = useState<(() => void) | null>(null);

  /**
   * Initialize database and load cached data
   */
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('📦 Initializing Chat Context...');
        
        // Initialize local database
        await LocalDatabase.initDatabase();
        
        // Load conversations from local cache
        const cachedConversations = await LocalDatabase.getConversations();
        if (cachedConversations.length > 0) {
          setConversations(cachedConversations);
          console.log(`✅ Loaded ${cachedConversations.length} conversations from cache`);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        setError('Failed to initialize chat');
      }
    };

    initializeChat();
  }, []);

  /**
   * Monitor network connectivity
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = isOnline;
      const isNowOnline = state.isConnected ?? false;
      setIsOnline(isNowOnline);

      // If coming back online, sync queued operations
      if (!wasOnline && isNowOnline) {
        console.log('🌐 Back online - syncing queued operations...');
        syncOfflineQueue();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  /**
   * Load conversations when user logs in
   */
  useEffect(() => {
    if (!user || !isInitialized) return;

    loadConversations();

    // Cleanup listeners on unmount
    return () => {
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
      }
      if (messagesUnsubscribe) {
        messagesUnsubscribe();
      }
    };
  }, [user, isInitialized]);

  /**
   * Load conversations from Firestore with real-time updates
   */
  const loadConversations = useCallback(async () => {
    if (!user) {
      console.warn('⚠️ Cannot load conversations: No user');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        // Set up real-time listener
        const unsubscribe = FirestoreService.listenToConversations(
          user.uid,
          async (firestoreConversations) => {
            console.log(`📬 Received ${firestoreConversations.length} conversations`);
            setConversations(firestoreConversations);

            // Cache conversations locally
            for (const conversation of firestoreConversations) {
              await LocalDatabase.insertConversation(conversation);
            }
          },
          (error) => {
            console.error('❌ Error listening to conversations:', error);
            setError(error.message);
          }
        );

        setConversationsUnsubscribe(() => unsubscribe);
      } else {
        // Offline - load from cache
        const cachedConversations = await LocalDatabase.getConversations();
        setConversations(cachedConversations);
        console.log('📴 Offline - loaded conversations from cache');
      }
    } catch (error: any) {
      console.error('❌ Error loading conversations:', error);
      setError(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user, isOnline]);

  /**
   * Select a conversation and load its messages
   */
  const selectConversation = useCallback(async (conversationId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot select conversation: No user');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Stop listening to previous conversation
      if (messagesUnsubscribe) {
        messagesUnsubscribe();
        setMessagesUnsubscribe(null);
      }

      // Find conversation
      let conversation = conversations.find((c) => c.id === conversationId);
      
      if (!conversation) {
        // Try to fetch from Firestore
        if (isOnline) {
          conversation = await FirestoreService.getConversation(conversationId);
        } else {
          // Try local cache
          conversation = await LocalDatabase.getConversation(conversationId);
        }
      }

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      setActiveConversation(conversation);

      // Load messages
      await loadMessages(conversationId);

      // Mark messages as read
      if (isOnline) {
        await FirestoreService.resetUnreadCount(conversationId, user.uid);
      }
    } catch (error: any) {
      console.error('❌ Error selecting conversation:', error);
      setError(error.message || 'Failed to select conversation');
    } finally {
      setLoading(false);
    }
  }, [user, conversations, isOnline, messagesUnsubscribe]);

  /**
   * Load messages for active conversation
   */
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot load messages: No user');
      return;
    }

    try {
      if (isOnline) {
        // Set up real-time listener for messages
        const unsubscribe = FirestoreService.listenToMessages(
          conversationId,
          async (firestoreMessages) => {
            console.log(`💬 Received ${firestoreMessages.length} messages`);
            setMessages(firestoreMessages);

            // Cache messages locally
            for (const message of firestoreMessages) {
              await LocalDatabase.insertMessage(message, true);
            }
          },
          (error) => {
            console.error('❌ Error listening to messages:', error);
            setError(error.message);
          }
        );

        setMessagesUnsubscribe(() => unsubscribe);
      } else {
        // Offline - load from cache
        const cachedMessages = await LocalDatabase.getMessages(conversationId);
        setMessages(cachedMessages);
        console.log('📴 Offline - loaded messages from cache');
      }
    } catch (error: any) {
      console.error('❌ Error loading messages:', error);
      setError(error.message || 'Failed to load messages');
    }
  }, [user, isOnline]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string, type: MessageType = 'text') => {
      if (!user || !activeConversation) {
        console.warn('⚠️ Cannot send message: No user or active conversation');
        return;
      }

      try {
        setError(null);

        // Create optimistic message
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const optimisticMessage: Message = {
          id: tempId,
          senderId: user.uid,
          conversationId: activeConversation.id,
          content,
          timestamp: new Date(),
          status: 'sending',
          type,
          readBy: { [user.uid]: new Date() },
        };

        // Add to UI immediately (optimistic update)
        setMessages((prev) => [...prev, optimisticMessage]);

        // Save to local database
        await LocalDatabase.insertMessage(optimisticMessage, false);

        if (isOnline) {
          try {
            // Send to Firestore
            const messageId = await FirestoreService.sendMessage(
              activeConversation.id,
              user.uid,
              content,
              type
            );

            // Update with real ID and mark as sent
            const sentMessage: Message = {
              ...optimisticMessage,
              id: messageId,
              status: 'sent',
            };

            // Update UI
            setMessages((prev) =>
              prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
            );

            // Update local database
            await LocalDatabase.deleteMessage(tempId);
            await LocalDatabase.insertMessage(sentMessage, true);

            console.log('✅ Message sent:', messageId);
          } catch (error: any) {
            console.error('❌ Error sending message to Firestore:', error);
            
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
                conversationId: activeConversation.id,
                senderId: user.uid,
                content,
                type,
                tempId,
              },
            });

            throw error;
          }
        } else {
          // Offline - queue for later
          console.log('📴 Offline - message queued');
          await LocalDatabase.enqueueOperation({
            operationType: 'sendMessage',
            data: {
              conversationId: activeConversation.id,
              senderId: user.uid,
              content,
              type,
              tempId,
            },
          });
        }
      } catch (error: any) {
        console.error('❌ Error sending message:', error);
        setError(error.message || 'Failed to send message');
      }
    },
    [user, activeConversation, isOnline]
  );

  /**
   * Sync offline queue when coming back online
   */
  const syncOfflineQueue = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
      const queuedOperations = await LocalDatabase.getQueuedOperations();
      console.log(`🔄 Syncing ${queuedOperations.length} queued operations...`);

      for (const operation of queuedOperations) {
        try {
          if (operation.operationType === 'sendMessage') {
            const { conversationId, senderId, content, type, tempId } = operation.data;

            // Send to Firestore
            const messageId = await FirestoreService.sendMessage(
              conversationId,
              senderId,
              content,
              type
            );

            // Update local message with real ID
            await LocalDatabase.deleteMessage(tempId);
            await LocalDatabase.insertMessage(
              {
                id: messageId,
                senderId,
                conversationId,
                content,
                timestamp: new Date(),
                status: 'sent',
                type,
                readBy: { [senderId]: new Date() },
              },
              true
            );

            // Remove from queue
            if (operation.id) {
              await LocalDatabase.dequeueOperation(operation.id);
            }

            console.log('✅ Queued message synced:', messageId);
          }
        } catch (error: any) {
          console.error('❌ Error syncing operation:', error);
          
          // Increment retry count
          if (operation.id) {
            await LocalDatabase.incrementRetryCount(operation.id);
          }
        }
      }

      console.log('✅ Offline queue synced');
    } catch (error) {
      console.error('❌ Error syncing offline queue:', error);
    }
  }, [user, isOnline]);

  /**
   * Create a new conversation (DM or group)
   */
  const createConversation = useCallback(
    async (participantIds: string[], type: 'dm' | 'group' = 'dm') => {
      if (!user) {
        console.warn('⚠️ Cannot create conversation: No user');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        let conversationId: string;

        if (type === 'dm' && participantIds.length === 1) {
          // Check if DM already exists
          conversationId = await FirestoreService.findOrCreateDMConversation(
            user.uid,
            participantIds[0]
          );
        } else {
          // Create new conversation
          const allParticipants = [user.uid, ...participantIds];
          conversationId = await FirestoreService.createConversation(
            allParticipants,
            type
          );
        }

        console.log('✅ Conversation created:', conversationId);
        return conversationId;
      } catch (error: any) {
        console.error('❌ Error creating conversation:', error);
        setError(error.message || 'Failed to create conversation');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    loadConversations,
    selectConversation,
    sendMessage,
    loadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to use Chat Context
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}


