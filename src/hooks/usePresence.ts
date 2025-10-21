import { useState, useEffect } from 'react';
import * as FirestoreService from '../services/firebase/firestoreService';

/**
 * usePresence Hook
 * Listens to a user's online/offline presence status in real-time
 */

interface UsePresenceReturn {
  isOnline: boolean;
  lastSeen: Date | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to track a user's presence status
 * @param userId - The user ID to track (null to disable)
 * @returns Object with isOnline, lastSeen, loading, and error
 */
export function usePresence(userId: string | null): UsePresenceReturn {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsOnline(false);
      setLastSeen(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Set up real-time listener for presence updates
    const unsubscribe = FirestoreService.listenToPresence(
      userId,
      (online, seen) => {
        setIsOnline(online);
        setLastSeen(seen);
        setLoading(false);
      },
      (err) => {
        console.error('Error in presence listener:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or when userId changes
    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { isOnline, lastSeen, loading, error };
}

