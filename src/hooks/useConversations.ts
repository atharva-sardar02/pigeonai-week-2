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
   */
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      if (isOnline) {
        // Load from cache first for instant display
        // IMPORTANT: Filter by userId to ensure user only sees their conversations
        const cachedConversations = await LocalDatabase.getConversations(user.uid);
        if (cachedConversations.length > 0) {
          setConversations(cachedConversations);
          setLoading(false); // Stop loading immediately
          
          // Initialize our tracking ref with cached conversation IDs
          conversationIdsRef.current = new Set(cachedConversations.map(c => c.id));
          
          // Pre-fetch user profiles for all participants
          // This ensures names are cached before display
          const participantIds = new Set<string>();
          cachedConversations.forEach(conv => {
            conv.participants.forEach(id => {
              if (id !== user.uid) participantIds.add(id);
            });
          });
          
          // Fetch all user profiles in parallel
          Promise.all(
            Array.from(participantIds).map(id => AuthService.getUserProfile(id))
          ).catch(err => console.warn('Error pre-fetching user profiles:', err));
        } else {
          setLoading(true); // Only show loading if no cache
        }

        // Then set up real-time listener for updates
        const listener = FirestoreService.listenToConversations(
          user.uid,
          async (firestoreConversations) => {
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
            ).catch(err => console.warn('Error pre-fetching user profiles:', err));

            // Cache conversations locally
            for (const conversation of firestoreConversations) {
              await LocalDatabase.insertConversation(conversation);
            }
          },
          (err) => {
            // Suppress permission errors during logout
            if (err.message.includes('permission') || err.message.includes('permissions') || err.message.includes('Permission denied')) {
              // Don't log anything - already logged as warning in service
              setLoading(false);
              return;
            }
            console.error('Error listening to conversations:', err);
            setError(err.message);
            setLoading(false);
          }
        );

        setUnsubscribe(() => listener);
      } else {
        // Offline - load from cache
        // IMPORTANT: Filter by userId to ensure user only sees their conversations
        setLoading(true);
        const cachedConversations = await LocalDatabase.getConversations(user.uid);
        setConversations(cachedConversations);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
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
   */
  const refreshConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        const firestoreConversations = await FirestoreService.getConversations(user.uid);
        setConversations(firestoreConversations);

        // Update cache
        for (const conversation of firestoreConversations) {
          await LocalDatabase.insertConversation(conversation);
        }
      } else {
        const cachedConversations = await LocalDatabase.getConversations();
        setConversations(cachedConversations);
      }
    } catch (err: any) {
      console.error('Error refreshing conversations:', err);
      setError(err.message || 'Failed to refresh conversations');
    } finally {
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


