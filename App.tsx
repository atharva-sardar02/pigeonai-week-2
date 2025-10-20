import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Main App Component
 * 
 * Wraps the entire app with:
 * - SafeAreaProvider (for safe area handling)
 * - AuthProvider (for global auth state)
 * - AppNavigator (for navigation)
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

