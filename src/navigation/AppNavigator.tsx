import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * App Navigator (Task 4.12)
 * 
 * Root navigator that handles authentication flow:
 * - Shows Splash screen while checking auth state
 * - Shows Auth screens if user is not logged in
 * - Shows Main screens if user is logged in
 */
export const AppNavigator: React.FC = () => {
  const { user, loading, initializing } = useAuth();

  // Show splash while initially checking auth or during sign in/out
  const showSplash = initializing || loading;

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,        // Now #4A9FF5 (pigeon blue)
          background: COLORS.background,
          card: COLORS.backgroundSecondary,
          text: COLORS.text,
          border: COLORS.border,
          notification: COLORS.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      >
        {showSplash ? (
          // Show splash screen while checking auth state or during sign in/out
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : user ? (
          // User is logged in - show main app screens
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // User is not logged in - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
