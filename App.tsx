import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/store/context/AuthContext';
import { PresenceProvider } from './src/store/context/PresenceContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationBanner } from './src/components/common';
import { GlobalNotificationListener } from './src/components/GlobalNotificationListener';
import { NavigationContainerRef } from '@react-navigation/native';

// Suppress expo-notifications Expo Go warnings (in-app yellow banners)
LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notifications',
  'remote notifications',
  'SDK 53',
  'development build',
  'Expo Go',
]);

// Suppress console output as well
if (__DEV__) {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('expo-notifications: Android Push notifications') ||
       args[0].includes('remote notifications') ||
       args[0].includes('SDK 53'))
    ) {
      return; // Suppress Expo Go notification warnings
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('expo-notifications') ||
       args[0].includes('development build'))
    ) {
      return; // Suppress Expo Go notification warnings
    }
    originalWarn.apply(console, args);
  };
}

/**
 * Main App Component
 * 
 * Wraps the entire app with:
 * - SafeAreaProvider (for safe area handling)
 * - AuthProvider (for global auth state)
 * - PresenceProvider (for online/offline presence management)
 * - AppNavigator (for navigation)
 * - Notification handlers (foreground & tap handling)
 */
export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  // State for notification banner
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerData, setBannerData] = useState<any>(null);

  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received (foreground):', notification);
      
      // Extract notification data
      const { title, body, data } = notification.request.content;
      console.log('📬 Title:', title);
      console.log('📬 Body:', body);
      console.log('📬 Data:', data);
      
      // Show custom in-app banner
      setBannerTitle(title as string || 'New Message');
      setBannerMessage(body as string || '');
      setBannerData(data);
      setBannerVisible(true);
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Extract data from notification
      const data = response.notification.request.content.data;
      console.log('👆 Navigation data:', data);
      
      // Navigate to the appropriate screen
      if (data && navigationRef.current) {
        const { conversationId, screen } = data as any;
        
        if (screen === 'Chat' && conversationId) {
          // Navigate to ChatScreen with conversationId
          console.log('🧭 Navigating to Chat:', conversationId);
          navigationRef.current.navigate('Main', {
            screen: 'Chat',
            params: { conversationId },
          });
        }
      }
    });

    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        console.log('🚀 App opened from notification:', response);
        // Handle the notification that opened the app
        const data = response.notification.request.content.data;
        if (data && navigationRef.current) {
          const { conversationId, screen } = data as any;
          if (screen === 'Chat' && conversationId) {
            setTimeout(() => {
              navigationRef.current?.navigate('Main', {
                screen: 'Chat',
                params: { conversationId },
              });
            }, 1000);
          }
        }
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  /**
   * Handle banner tap - navigate to conversation
   */
  const handleBannerPress = () => {
    if (bannerData && navigationRef.current) {
      const { conversationId, screen } = bannerData as any;
      
      if (screen === 'Chat' && conversationId) {
        console.log('🧭 Banner tapped - navigating to Chat:', conversationId);
        navigationRef.current.navigate('Main', {
          screen: 'Chat',
          params: { conversationId },
        });
      }
    }
    setBannerVisible(false);
  };

  /**
   * Handle banner dismiss
   */
  const handleBannerDismiss = () => {
    setBannerVisible(false);
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PresenceProvider>
          {/* Global notification listener - triggers notifications from anywhere in the app */}
          <GlobalNotificationListener />
          
          <StatusBar style="light" />
          <AppNavigator ref={navigationRef} />
          
          {/* Custom notification banner for foreground notifications */}
          <NotificationBanner
            visible={bannerVisible}
            title={bannerTitle}
            message={bannerMessage}
            onPress={handleBannerPress}
            onDismiss={handleBannerDismiss}
          />
        </PresenceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

