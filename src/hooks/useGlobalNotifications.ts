import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../store/context/AuthContext';
import * as FirestoreService from '../services/firebase/firestoreService';
import { triggerLocalNotification, shouldUseLocalNotifications } from '../services/notifications/localNotificationHelper';
import { userProfileCache } from './useUserProfile';

/**
 * Global notification hook
 * Listens to ALL conversations and triggers notifications for new messages
 * Also checks for missed messages when user comes online
 * Works everywhere in the app, not just in specific chat screens
 */
export function useGlobalNotifications() {
  const { user } = useAuth();
  const processedMessageIds = useRef(new Set<string>());
  const isInitialized = useRef(false);
  const activeListeners = useRef(new Map<string, () => void>());
  const lastSeenTimestamps = useRef(new Map<string, Date>());
  const appState = useRef(AppState.currentState);
  const hasCheckedMissedOnInit = useRef(false); // Prevent checking missed messages on reload

  // Check for missed messages when user comes online
  const checkMissedMessages = async () => {
    if (!user) return;

    console.log('🔍 Checking for missed messages...');

    try {
      const conversations = await FirestoreService.getConversations(user.uid);

      for (const conv of conversations) {
        try {
          const messages = await FirestoreService.getMessages(conv.id);
          
          // Get last seen timestamp for this conversation
          const lastSeen = lastSeenTimestamps.current.get(conv.id);
          
          console.log(`📊 Conv ${conv.id.substring(0, 8)}: ${messages.length} total, lastSeen: ${lastSeen?.toISOString() || 'none'}`);
          
          // Find messages that arrived while user was offline
          const missedMessages = messages.filter(msg => {
            const isFromOther = msg.senderId !== user.uid;
            const isNotProcessed = !processedMessageIds.current.has(msg.id);
            const isAfterLastSeen = lastSeen ? msg.timestamp > lastSeen : false;
            
            console.log(`  📨 ${msg.id.substring(0, 8)}: fromOther=${isFromOther}, notProcessed=${isNotProcessed}, afterLastSeen=${isAfterLastSeen}, msgTime=${msg.timestamp.toISOString()}`);
            
            return isFromOther && isNotProcessed && isAfterLastSeen;
          });

          console.log(`✅ Found ${missedMessages.length} missed messages`);

          // Sort by timestamp (oldest first)
          missedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          // Trigger notifications for missed messages
          for (const msg of missedMessages) {
            console.log(`📤 Notifying: "${msg.content}" from ${msg.senderId}`);
            
            // Mark as processed
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
              
              // Small delay between notifications to avoid overwhelming
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error('Error triggering missed message notification:', error);
            }
          }

          // Update last seen timestamp to NOW (not latest message time)
          if (missedMessages.length > 0) {
            lastSeenTimestamps.current.set(conv.id, new Date());
            console.log(`⏰ Updated lastSeen for ${conv.id.substring(0, 8)} to NOW`);
          }
        } catch (error) {
          console.error(`Error checking missed messages for ${conv.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking missed messages:', error);
    }
  };

  // Listen for app state changes to detect when user comes online
  useEffect(() => {
    if (!user || !shouldUseLocalNotifications()) {
      return;
    }

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App moved to foreground (user came online)
      // Only check if we've already done initial setup (hasCheckedMissedOnInit is true)
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Only check missed messages if this is NOT the first time app state is changing
        if (hasCheckedMissedOnInit.current) {
          console.log('📱 User came online - checking for missed messages...');
          await checkMissedMessages();
        } else {
          // First app state change after initialization - mark as checked
          hasCheckedMissedOnInit.current = true;
          console.log('📱 Skipping missed message check on initial load');
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

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
          console.log(`🔄 [Global] Initializing for user ${user.uid.substring(0, 8)} - marking existing messages as seen...`);
          
          // For each conversation, get current messages and mark them as processed
          let totalMessages = 0;
          for (const conv of conversations) {
            try {
              // IMPORTANT: Get ALL messages (no limit) to mark them all as seen
              const messages = await FirestoreService.getMessages(conv.id, 9999);
              console.log(`  📦 Conv ${conv.id.substring(0, 8)}: ${messages.length} messages`);
              
              messages.forEach(msg => {
                processedMessageIds.current.add(msg.id);
                console.log(`    ✓ Marked ${msg.id.substring(0, 8)} from ${msg.senderId.substring(0, 8)} as seen`);
              });
              
              totalMessages += messages.length;
              
              // Set initial last seen timestamp
              if (messages.length > 0) {
                const latestMessage = messages.reduce((latest, msg) => 
                  msg.timestamp > latest.timestamp ? msg : latest
                );
                lastSeenTimestamps.current.set(conv.id, latestMessage.timestamp);
              }
            } catch (error) {
              console.error(`Error loading initial messages for ${conv.id}:`, error);
            }
          }
          
          isInitialized.current = true;
          console.log(`✅ [Global] Initialization complete for user ${user.uid.substring(0, 8)} - ${totalMessages} total messages marked as seen`);
          console.log(`📊 [Global] processedMessageIds size: ${processedMessageIds.current.size}`);
          
          // Now proceed to set up listeners (fall through to code below)
        }

        // For each conversation, set up a listener if we don't have one already
        for (const conv of conversations) {
          // Skip if we already have a listener for this conversation
          if (activeListeners.current.has(conv.id)) {
            continue;
          }

          console.log(`📡 [Global] Setting up listener for conversation ${conv.id.substring(0, 8)}`);

          // Listen to messages in this conversation
          const messageUnsubscribe = FirestoreService.listenToMessages(
            conv.id,
            async (messages) => {
              // Only process if initialized
              if (!isInitialized.current) {
                console.log(`⏸️  [Global] Conv ${conv.id.substring(0, 8)}: Skipping - not initialized`);
                return;
              }

              console.log(`📨 [Global] Conv ${conv.id.substring(0, 8)}: Listener fired with ${messages.length} messages`);

              // Find truly NEW messages (not in our processed set)
              const newMessages = messages.filter(msg => {
                const isProcessed = processedMessageIds.current.has(msg.id);
                const isFromOther = msg.senderId !== user.uid;
                const isNew = !isProcessed && isFromOther;
                
                if (!isNew && !isProcessed) {
                  console.log(`  ⏭️  ${msg.id.substring(0, 8)}: Skip (isProcessed=${isProcessed}, fromOther=${isFromOther})`);
                }
                
                return isNew;
              });

              console.log(`  🔔 [Global] Found ${newMessages.length} NEW messages to notify`);

              if (newMessages.length > 0) {
                for (const msg of newMessages) {
                  console.log(`  📤 [Global] Notifying: "${msg.content}" from ${msg.senderId.substring(0, 8)}`);
                  
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
                
                // Update last seen timestamp to NOW
                lastSeenTimestamps.current.set(conv.id, new Date());
              }
            },
            (error) => {
              // Silently ignore permission errors for new conversations
              // They will be retried when conversation is fully created
              if (error.message && !error.message.includes('Permission denied')) {
                console.error('Error in message listener:', error);
              }
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
      lastSeenTimestamps.current.clear();
      isInitialized.current = false;
    };
  }, [user]);
}

