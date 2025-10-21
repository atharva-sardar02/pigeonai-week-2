import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/context/AuthContext';
import { PresenceProvider } from './src/store/context/PresenceContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Main App Component
 * 
 * Wraps the entire app with:
 * - SafeAreaProvider (for safe area handling)
 * - AuthProvider (for global auth state)
 * - PresenceProvider (for online/offline presence management)
 * - AppNavigator (for navigation)
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PresenceProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </PresenceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

