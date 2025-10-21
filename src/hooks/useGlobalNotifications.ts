import { useEffect, useRef } from 'react';
import { useAuth } from '../store/context/AuthContext';
import * as FirestoreService from '../services/firebase/firestoreService';
import { triggerLocalNotification, shouldUseLocalNotifications } from '../services/notifications/localNotificationHelper';
import { userProfileCache } from './useUserProfile';

/**
 * Global notification hook
 * Listens to ALL conversations and triggers notifications for new messages
 * Works everywhere in the app, not just in specific chat screens
 */
export function useGlobalNotifications() {
  const { user } = useAuth();
  const processedMessageIds = useRef(new Set<string>());
  const isInitialized = useRef(false);
  const activeListeners = useRef(new Map<string, () => void>());

  useEffect(() => {
    if (!user || !shouldUseLocalNotifications()) {
      return;
    }

    // Listen to ALL conversations for this user
    const conversationUnsubscribe = FirestoreService.listenToConversations(
      user.uid,
      async (conversations) => {
        // On first load, mark all existing messages as "seen" to avoid notifying for old messages
        if (!isInitialized.current) {
          // For each conversation, get current messages and mark them as processed
          for (const conv of conversations) {
            try {
              const messages = await FirestoreService.getMessages(conv.id);
              messages.forEach(msg => processedMessageIds.current.add(msg.id));
            } catch (error) {
              console.error('Error loading initial messages:', error);
            }
          }
          
          isInitialized.current = true;
        }

        // For each conversation, set up a listener if we don't have one already
        for (const conv of conversations) {
          // Skip if we already have a listener for this conversation
          if (activeListeners.current.has(conv.id)) {
            continue;
          }

          // Listen to messages in this conversation
          const messageUnsubscribe = FirestoreService.listenToMessages(
            conv.id,
            async (messages) => {
              // Only process if initialized
              if (!isInitialized.current) {
                return;
              }

              // Find truly NEW messages (not in our processed set)
              const newMessages = messages.filter(msg => 
                !processedMessageIds.current.has(msg.id) && 
                msg.senderId !== user.uid
              );

              if (newMessages.length > 0) {
                for (const msg of newMessages) {
                  // Mark as processed immediately to avoid duplicates
                  processedMessageIds.current.add(msg.id);

                  // Get sender info
                  const senderProfile = userProfileCache.get(msg.senderId);
                  const senderName = senderProfile?.displayName || 'Someone';

                  // Trigger notification
                  try {
                    await triggerLocalNotification(
                      senderName,
                      msg.content,
                      conv.id,
                      msg.senderId
                    );
                  } catch (error) {
                    console.error('Error triggering notification:', error);
                  }
                }
              }
            },
            (error) => {
              console.error('Error in message listener:', error);
            }
          );

          // Store the unsubscribe function
          activeListeners.current.set(conv.id, messageUnsubscribe);
        }

        // Clean up listeners for conversations that no longer exist
        const currentConvIds = new Set(conversations.map(c => c.id));
        for (const [convId, unsubscribe] of activeListeners.current.entries()) {
          if (!currentConvIds.has(convId)) {
            unsubscribe();
            activeListeners.current.delete(convId);
          }
        }
      },
      (error) => {
        console.error('Error in conversation listener:', error);
      }
    );

    return () => {
      // Unsubscribe from conversation listener
      conversationUnsubscribe();
      
      // Unsubscribe from all message listeners
      for (const unsubscribe of activeListeners.current.values()) {
        unsubscribe();
      }
      
      // Clear state
      activeListeners.current.clear();
      processedMessageIds.current.clear();
      isInitialized.current = false;
    };
  }, [user]);
}

