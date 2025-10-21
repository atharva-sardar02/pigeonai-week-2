import { useState, useEffect } from 'react';
import * as AuthService from '../services/firebase/authService';
import { UserProfile } from '../types';

/**
 * useUserProfile Hook
 * 
 * Fetches and caches user profile data.
 * This hook ensures we only fetch each user profile once
 * and cache it for subsequent use.
 */

// Global cache for user profiles (persists across component mounts)
export const userProfileCache: Map<string, UserProfile> = new Map();

export function useUserProfile(userId: string | null | undefined) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    // Check cache first
    const cached = userProfileCache.get(userId);
    if (cached) {
      setUser(cached);
      return;
    }

    // Fetch from Firestore
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProfile = await AuthService.getUserProfile(userId);
        if (userProfile) {
          userProfileCache.set(userId, userProfile); // Cache it
          setUser(userProfile);
        } else {
          setError('User not found');
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

/**
 * Hook to get user display name quickly
 */
export function useUserDisplayName(userId: string | null | undefined): string {
  const { user } = useUserProfile(userId);
  return user?.displayName || 'Unknown User';
}

/**
 * Clear the user profile cache (useful for logout)
 */
export function clearUserProfileCache() {
  userProfileCache.clear();
}

