import { useState, useEffect, useCallback } from 'react';
import * as FirestoreService from '../services/firebase/firestoreService';
import { useAuth } from '../store/context/AuthContext';

/**
 * useTypingIndicator Hook
 * Manages typing indicators for a conversation
 */

interface UseTypingIndicatorReturn {
  typingUsers: string[]; // Array of user IDs who are typing (excluding current user)
  setTyping: (isTyping: boolean) => Promise<void>;
}

/**
 * Custom hook to manage typing indicators in a conversation
 * @param conversationId - The conversation ID (null to disable)
 * @returns Object with typingUsers array and setTyping function
 */
export function useTypingIndicator(conversationId: string | null): UseTypingIndicatorReturn {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  /**
   * Set up listener for typing status updates
   */
  useEffect(() => {
    if (!conversationId) {
      setTypingUsers([]);
      return;
    }

    // Listen to typing status changes
    const unsubscribe = FirestoreService.listenToTyping(
      conversationId,
      (typingUsersData) => {
        // Filter out only current user (no time expiry - let MessageInput control the lifetime)
        const activeTypingUsers = typingUsersData
          .filter((tu) => tu.userId !== user?.uid)
          .map((tu) => tu.userId);

        setTypingUsers(activeTypingUsers);
      },
      (error) => {
        console.error('Error in typing indicator listener:', error);
      }
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [conversationId, user]);

  /**
   * Set typing status for current user
   * No auto-clear - MessageInput manages the lifecycle
   */
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId || !user) return;

      try {
        // Update typing status in Firestore
        await FirestoreService.setTypingStatus(conversationId, user.uid, isTyping);
      } catch (error) {
        console.error('Error setting typing status:', error);
      }
    },
    [conversationId, user]
  );

  return { typingUsers, setTyping };
}

