import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, BackHandler } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
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
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasSetInitialPresence = useRef(false); // Track if we've set initial presence
  const userIdRef = useRef<string | null>(null); // Stable reference to user ID
  const isOnlineRef = useRef<boolean>(false); // Track current online status to prevent redundant updates
  const networkOnlineRef = useRef<boolean>(true); // Track network connectivity

  // Update userIdRef when user changes
  useEffect(() => {
    userIdRef.current = user?.uid || null;
    if (!user) {
      isOnlineRef.current = false; // Reset online status on logout
    }
  }, [user]);

  /**
   * Monitor network connectivity for presence updates
   * When network goes offline (airplane mode, etc.), set user offline
   */
  useEffect(() => {
    console.log('📡 PresenceContext: Setting up network listener');
    
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = networkOnlineRef.current;
      const isNowOnline = state.isConnected ?? false;
      
      networkOnlineRef.current = isNowOnline;
      
      const userId = userIdRef.current;
      
      if (!userId || !isOnlineRef.current) {
        // User not logged in or already offline
        return;
      }
      
      // Network connectivity changed
      if (wasOnline && !isNowOnline) {
        // Network went offline (airplane mode, WiFi off, etc.)
        console.log('📴 Network disconnected - setting user offline');
        
        // Try to send offline status (might fail if network already gone)
        // But this attempts it in the brief window before complete disconnect
        FirestoreService.updatePresence(userId, false, new Date())
          .then(() => {
            console.log('✅ Offline status sent successfully');
            isOnlineRef.current = false;
          })
          .catch((err) => {
            console.log('⚠️ Could not send offline status (network already down)');
            console.log('📡 Firebase will auto-timeout within 30s');
            isOnlineRef.current = false; // Update local ref anyway
          });
      } else if (!wasOnline && isNowOnline) {
        // Network came back online
        console.log('📶 Network reconnected - setting user online');
        
        FirestoreService.updatePresence(userId, true)
          .then(() => {
            console.log('✅ Online status sent successfully');
            isOnlineRef.current = true;
          })
          .catch((err) => {
            console.error('❌ Could not send online status:', err);
          });
      }
    });

    return () => {
      console.log('📡 PresenceContext: Removing network listener');
      unsubscribe();
    };
  }, []); // Empty deps - listener stays active

  /**
   * Handle app state changes (foreground/background)
   * Only depends on userIdRef, not user object (prevents listener churn)
   */
  useEffect(() => {
    console.log('📱 PresenceContext: Setting up AppState listener');
    console.log('📱 Initial AppState:', AppState.currentState);
    
    // Initialize with current state
    appState.current = AppState.currentState;
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Log everything in one call to avoid buffering issues
      console.log('📱 === AppState Handler Start ===');
      console.log(`📱 Transition: ${appState.current} → ${nextAppState}`);
      console.log(`📱 UserID: ${userIdRef.current?.substring(0, 8) || 'NULL'}`);
      console.log(`📱 Currently online: ${isOnlineRef.current}`);
      
      const userId = userIdRef.current;
      
      if (!userId) {
        console.log('⚠️ No user, skipping');
        appState.current = nextAppState;
        return;
      }

      // Execute presence update asynchronously (fire-and-forget)
      (async () => {
        try {
          // App is now active/foreground
          if (nextAppState === 'active' && !isOnlineRef.current) {
            console.log('🟢 Setting online');
            isOnlineRef.current = true;
            await FirestoreService.updatePresence(userId, true);
            console.log('✅ Online updated');
          }

          // App is now background/inactive
          if (nextAppState !== 'active' && isOnlineRef.current) {
            console.log('🔴 Setting offline');
            isOnlineRef.current = false;
            await FirestoreService.updatePresence(userId, false, new Date());
            console.log('✅ Offline updated');
          }
        } catch (error) {
          console.error('❌ Presence error:', error);
        }
      })().catch(err => console.error('❌ Handler error:', err));

      appState.current = nextAppState;
      console.log('📱 === AppState Handler End ===');
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
   * AND set up Firebase onDisconnect() to auto-set offline when network drops
   */
  useEffect(() => {
    const setInitialPresence = async () => {
      if (user && AppState.currentState === 'active' && !hasSetInitialPresence.current) {
        try {
          console.log('🟢 User logged in - setting online');
          await FirestoreService.updatePresence(user.uid, true);
          isOnlineRef.current = true; // Track that user is online
          hasSetInitialPresence.current = true;
          
          // ✅ NEW: Setup Firebase onDisconnect to auto-set offline when network drops
          await FirestoreService.setupPresenceDisconnect(user.uid);
          console.log('🔌 Firebase onDisconnect configured - will auto-set offline on network loss');
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

