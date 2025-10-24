import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation } from '../types';
import { useAuth } from '../store/context/AuthContext';
import * as FirestoreService from '../services/firebase/firestoreService';
import * as AuthService from '../services/firebase/authService';
import * as LocalDatabase from '../services/database/localDatabase';
import NetInfo from '@react-native-community/netinfo';

/**
 * useConversations Hook
 * Manages conversations for the current user
 */

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  createConversation: (participantIds: string[], type?: 'dm' | 'group', groupName?: string) => Promise<string | null>;
  findOrCreateDM: (otherUserId: string) => Promise<string | null>;
  refreshConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  
  // Track conversation IDs to prevent duplicates BEFORE state update
  const conversationIdsRef = useRef(new Set<string>());

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
   * Load conversations when user changes
   */
  useEffect(() => {
    if (!user) {
      setConversations([]);
      // Cleanup any existing listener immediately when user logs out
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
      // Clear the conversation ID tracking ref
      conversationIdsRef.current.clear();
      return;
    }

    // Clear conversation IDs when user changes
    conversationIdsRef.current.clear();
    
    loadConversations();

    // Cleanup listener on unmount or when user changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
      // Clear the conversation ID tracking ref on cleanup
      conversationIdsRef.current.clear();
    };
  }, [user, isOnline]);

  /**
   * Load conversations from Firestore with real-time updates
   * OFFLINE-FIRST: Always loads from cache immediately, then syncs with Firestore
   */
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      // STEP 1: ALWAYS load from cache first (offline-first)
      console.log('📦 Loading conversations from cache...');
      const cachedConversations = await LocalDatabase.getConversations(user.uid);
      
      if (cachedConversations.length > 0) {
        console.log(`✅ Loaded ${cachedConversations.length} conversations from cache`);
        setConversations(cachedConversations);
        setLoading(false); // Display immediately
        
        // Initialize our tracking ref with cached conversation IDs
        conversationIdsRef.current = new Set(cachedConversations.map(c => c.id));
        
        // Pre-fetch user profiles for all participants (non-blocking)
        const participantIds = new Set<string>();
        cachedConversations.forEach(conv => {
          conv.participants.forEach(id => {
            if (id !== user.uid) participantIds.add(id);
          });
        });
        
        // Fetch all user profiles in parallel (fails silently if offline)
        Promise.all(
          Array.from(participantIds).map(id => AuthService.getUserProfile(id))
        ).catch(err => console.warn('⚠️ Error pre-fetching user profiles (offline?):', err.message));
      } else {
        console.log('📦 No cached conversations, showing loading state');
        setLoading(true);
      }

      // STEP 2: If online, set up real-time listener for updates (non-blocking)
      if (isOnline) {
        console.log('🌐 Setting up Firestore listener...');
        try {
          const listener = FirestoreService.listenToConversations(
            user.uid,
            async (firestoreConversations) => {
              console.log(`🔄 Received ${firestoreConversations.length} conversations from Firestore`);
              
              // Pre-filter: Remove any conversations that already exist in our ref
              const newFirestoreConversations = firestoreConversations.filter(conv => {
                // If we've already seen this ID, skip it immediately
                if (conversationIdsRef.current.has(conv.id)) {
                  return false;
                }
                return true;
              });
              
              // Add new conversation IDs to our tracking ref
              newFirestoreConversations.forEach(conv => conversationIdsRef.current.add(conv.id));
              
              // Update state with all conversations (cached + new from Firestore)
              setConversations(firestoreConversations);
              setLoading(false);

              // Pre-fetch user profiles for all participants
              const participantIds = new Set<string>();
              firestoreConversations.forEach(conv => {
                conv.participants.forEach(id => {
                  if (id !== user.uid) participantIds.add(id);
                });
              });
              
              // Fetch all user profiles in parallel
              Promise.all(
                Array.from(participantIds).map(id => AuthService.getUserProfile(id))
              ).catch(err => console.warn('⚠️ Error pre-fetching user profiles:', err.message));

              // Cache conversations locally
              for (const conversation of firestoreConversations) {
                await LocalDatabase.insertConversation(conversation);
              }
            },
            (err) => {
              // Suppress permission errors during logout
              if (err.message.includes('permission') || err.message.includes('permissions') || err.message.includes('Permission denied')) {
                console.warn('⚠️ Firestore listener permission error (expected during logout)');
                setLoading(false);
                return;
              }
              console.error('❌ Error listening to conversations:', err);
              setError(err.message);
              setLoading(false);
            }
          );

          setUnsubscribe(() => listener);
        } catch (err: any) {
          // If Firestore listener fails (offline), just continue with cached data
          console.warn('⚠️ Failed to setup Firestore listener (offline?):', err.message);
          setLoading(false);
        }
      } else {
        console.log('📴 Offline mode - using cached conversations only');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setLoading(false);
    }
  }, [user, isOnline]);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(
    async (
      participantIds: string[],
      type: 'dm' | 'group' = 'dm',
      groupName?: string
    ): Promise<string | null> => {
      if (!user || !isOnline) {
        setError('Cannot create conversation while offline');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Add current user to participants if not already included
        const allParticipants = participantIds.includes(user.uid)
          ? participantIds
          : [user.uid, ...participantIds];

        const conversationId = await FirestoreService.createConversation(
          allParticipants,
          type,
          groupName
        );

        console.log('✅ Conversation created:', conversationId);
        return conversationId;
      } catch (err: any) {
        console.error('Error creating conversation:', err);
        setError(err.message || 'Failed to create conversation');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, isOnline]
  );

  /**
   * Find existing DM or create new one
   */
  const findOrCreateDM = useCallback(
    async (otherUserId: string): Promise<string | null> => {
      if (!user || !isOnline) {
        setError('Cannot create conversation while offline');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const conversationId = await FirestoreService.findOrCreateDMConversation(
          user.uid,
          otherUserId
        );

        console.log('✅ DM conversation found/created:', conversationId);
        return conversationId;
      } catch (err: any) {
        console.error('Error finding/creating DM:', err);
        setError(err.message || 'Failed to find/create DM');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, isOnline]
  );

  /**
   * Refresh conversations (force reload)
   * OFFLINE-FIRST: Loads from cache first, then syncs with Firestore if online
   */
  const refreshConversations = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      // STEP 1: Load from cache first
      console.log('🔄 Refreshing conversations from cache...');
      const cachedConversations = await LocalDatabase.getConversations(user.uid);
      setConversations(cachedConversations);
      
      if (cachedConversations.length > 0) {
        setLoading(false); // Display immediately
      } else {
        setLoading(true);
      }

      // STEP 2: If online, sync with Firestore (non-blocking)
      if (isOnline) {
        console.log('🌐 Syncing conversations with Firestore...');
        try {
          const firestoreConversations = await Promise.race([
            FirestoreService.getConversations(user.uid),
            new Promise<Conversation[]>((resolve) => 
              setTimeout(() => resolve([]), 5000) // 5s timeout
            )
          ]);
          
          if (firestoreConversations.length > 0) {
            setConversations(firestoreConversations);

            // Update cache
            for (const conversation of firestoreConversations) {
              await LocalDatabase.insertConversation(conversation);
            }
          }
        } catch (err: any) {
          console.warn('⚠️ Failed to sync with Firestore (offline?):', err.message);
          // Continue with cached data
        }
      } else {
        console.log('📴 Offline - using cached conversations only');
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error refreshing conversations:', err);
      setError(err.message || 'Failed to refresh conversations');
      setLoading(false);
    }
  }, [user, isOnline]);

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Delete from local database
        await LocalDatabase.deleteConversation(conversationId);

        // Remove from state
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));

        console.log('✅ Conversation deleted:', conversationId);
      } catch (err: any) {
        console.error('Error deleting conversation:', err);
        setError(err.message || 'Failed to delete conversation');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    conversations,
    loading,
    error,
    createConversation,
    findOrCreateDM,
    refreshConversations,
    deleteConversation,
  };
}


