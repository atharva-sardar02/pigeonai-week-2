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

  /**
   * Handle app state changes (foreground/background)
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (!user) return;

      try {
        // App moved to foreground
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          console.log('🟢 App moved to foreground - setting user online');
          await FirestoreService.updatePresence(user.uid, true);
        }

        // App moved to background
        if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          console.log('🔴 App moved to background - setting user offline');
          await FirestoreService.updatePresence(user.uid, false, new Date());
        }

        appState.current = nextAppState;
      } catch (error) {
        console.error('Error updating presence on app state change:', error);
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  /**
   * Set user online when they log in / app starts
   */
  useEffect(() => {
    const setInitialPresence = async () => {
      if (user && AppState.currentState === 'active') {
        try {
          console.log('🟢 User logged in - setting online');
          await FirestoreService.updatePresence(user.uid, true);
        } catch (error) {
          console.error('Error setting initial presence:', error);
        }
      }
    };

    setInitialPresence();
  }, [user]);

  const value: PresenceContextType = {
    // Currently no exposed state - presence is read via usePresence hook
  };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

