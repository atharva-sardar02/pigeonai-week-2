import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthService from '../services/firebase/authService';
import { UserProfile } from '../types';

/**
 * useUserProfile Hook
 * 
 * Fetches and caches user profile data.
 * This hook ensures we only fetch each user profile once
 * and cache it for subsequent use (both in-memory and AsyncStorage).
 */

const USER_PROFILE_CACHE_KEY = '@user_profiles_cache';

// Global cache for user profiles (in-memory, fast access)
export const userProfileCache: Map<string, UserProfile> = new Map();

/**
 * Load cached profiles from AsyncStorage on app start
 */
async function loadProfilesFromStorage() {
  try {
    const cached = await AsyncStorage.getItem(USER_PROFILE_CACHE_KEY);
    if (cached) {
      const profiles: Record<string, UserProfile> = JSON.parse(cached);
      Object.entries(profiles).forEach(([userId, profile]) => {
        userProfileCache.set(userId, profile);
      });
      console.log('[UserProfile] Loaded', userProfileCache.size, 'profiles from storage');
    }
  } catch (error) {
    console.error('[UserProfile] Error loading profiles from storage:', error);
  }
}

/**
 * Save profile to AsyncStorage
 */
async function saveProfileToStorage(userId: string, profile: UserProfile) {
  try {
    const cached = await AsyncStorage.getItem(USER_PROFILE_CACHE_KEY);
    const profiles: Record<string, UserProfile> = cached ? JSON.parse(cached) : {};
    profiles[userId] = profile;
    await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('[UserProfile] Error saving profile to storage:', error);
  }
}

// Load profiles on module load
loadProfilesFromStorage();

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
          userProfileCache.set(userId, userProfile); // Cache in memory
          saveProfileToStorage(userId, userProfile); // Cache in storage
          setUser(userProfile);
        } else {
          setError('User not found');
        }
      } catch (err: any) {
        console.error('[UserProfile] Error fetching user profile:', err);
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

