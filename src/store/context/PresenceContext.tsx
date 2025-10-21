import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import * as FirestoreService from '../../services/firebase/firestoreService';

/**
 * Presence Context
 * Manages user presence (online/offline) status based on app state
 */

interface PresenceContextType {
  // Currently just manages presence, doesn't expose state
  // (presence is read via usePresence hook for specific users)
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const usePresenceContext = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresenceContext must be used within PresenceProvider');
  }
  return context;
};

interface PresenceProviderProps {
  children: React.ReactNode;
}

export const PresenceProvider: React.FC<PresenceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const hasSetInitialPresence = useRef(false); // Track if we've set initial presence
  const userIdRef = useRef<string | null>(null); // Stable reference to user ID

  // Update userIdRef when user changes
  useEffect(() => {
    userIdRef.current = user?.uid || null;
  }, [user]);

  /**
   * Handle app state changes (foreground/background)
   * Only depends on userIdRef, not user object (prevents listener churn)
   */
  useEffect(() => {
    console.log('📱 PresenceContext: Setting up AppState listener');
    
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const userId = userIdRef.current;
      console.log(`📱 AppState change: ${appState.current} → ${nextAppState}, user: ${userId || 'none'}`);
      
      if (!userId) {
        console.log('⚠️ No user, skipping presence update');
        return;
      }

      try {
        // App moved to foreground
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          console.log('🟢 App moved to foreground - setting user online');
          await FirestoreService.updatePresence(userId, true);
        }

        // App moved to background
        if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          console.log('🔴 App moved to background - setting user offline');
          await FirestoreService.updatePresence(userId, false, new Date());
        }

        appState.current = nextAppState;
      } catch (error) {
        console.error('❌ Error updating presence on app state change:', error);
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      console.log('📱 PresenceContext: Removing AppState listener');
      subscription.remove();
    };
  }, []); // Empty dependency array - listener stays active throughout app lifecycle

  /**
   * Set user online when they log in (only once per login session)
   */
  useEffect(() => {
    const setInitialPresence = async () => {
      if (user && AppState.currentState === 'active' && !hasSetInitialPresence.current) {
        try {
          console.log('🟢 User logged in - setting online');
          await FirestoreService.updatePresence(user.uid, true);
          hasSetInitialPresence.current = true;
        } catch (error) {
          console.error('Error setting initial presence:', error);
        }
      }
      
      // Reset the flag when user logs out
      if (!user) {
        hasSetInitialPresence.current = false;
      }
    };

    setInitialPresence();
  }, [user]);

  const value: PresenceContextType = {
    // Currently no exposed state - presence is read via usePresence hook
  };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

