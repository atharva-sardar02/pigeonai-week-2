import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AppState, AppStateStatus } from 'react-native';
import * as authService from '../../services/firebase/authService';
import { User, AuthContextType } from '../../types';

/**
 * Auth Context
 * 
 * Provides global authentication state and functions throughout the app.
 * Handles:
 * - User authentication state
 * - Auth state persistence
 * - Loading states
 * - Error handling
 * - User presence (online/offline)
 * - App lifecycle management
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userProfile = await authService.getUserProfile(firebaseUser.uid);
      if (userProfile) {
        return userProfile;
      }

      // If Firestore profile doesn't exist, create one from Firebase Auth data
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        bio: '',
        createdAt: new Date(),
        lastSeen: new Date(),
        isOnline: true,
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  /**
   * Handle auth state changes
   */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
        
        // Set up presence system
        if (firebaseUser.uid) {
          await authService.setupPresence(firebaseUser.uid);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [initializing]);

  /**
   * Handle app state changes (foreground/background)
   * Update user presence based on app state
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (!user) return;

      try {
        if (nextAppState === 'active') {
          // App came to foreground - set user as online
          await authService.setUserOnlineStatus(user.uid, true);
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App went to background - set user as offline
          await authService.setUserOnlineStatus(user.uid, false);
        }
      } catch (err) {
        // Don't block app state changes if status update fails
        console.warn('Failed to update online status on app state change:', err);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  /**
   * Handle app unmount/close
   * Set user as offline when app is closed
   */
  useEffect(() => {
    return () => {
      if (user) {
        // Try to set user offline when component unmounts
        // This is best-effort and may not always succeed
        authService.setUserOnlineStatus(user.uid, false).catch((err) => {
          console.warn('Failed to update online status on unmount:', err);
        });
      }
    };
  }, [user]);

  /**
   * Sign up a new user
   */
  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signUp(email, password, displayName);
      
      // Auth state listener will handle setting the user
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signIn(email, password);
      
      // Auth state listener will handle setting the user
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signOut();
      
      // Auth state listener will handle clearing the user
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (
    displayName?: string | null,
    photoURL?: string | null
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updateUserProfile(displayName, photoURL);
      
      // Refresh user data
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedProfile = await fetchUserProfile(currentUser);
        setUser(updatedProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user bio
   */
  const updateBio = async (bio: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updateUserBio(bio);
      
      // Update local user state
      if (user) {
        setUser({ ...user, bio });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update bio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading: loading || initializing,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  // Show nothing while initializing
  if (initializing) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * 
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Export AuthContext for advanced use cases
 */
export { AuthContext };

