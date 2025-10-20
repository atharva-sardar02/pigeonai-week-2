import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * App Navigator
 * 
 * Root navigator that handles authentication flow:
 * - Shows Splash screen while checking auth state
 * - Shows Auth screens if user is not logged in
 * - Shows Main screens if user is logged in
 */
export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

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
        {loading ? (
          // Show splash screen while checking auth state
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : user ? (
          // User is logged in - show main app screens
          // TODO: Replace with MainNavigator when implemented
          <Stack.Screen 
            name="Main" 
            component={PlaceholderMainScreen}
            options={{ title: 'Pigeon AI' }}
          />
        ) : (
          // User is not logged in - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Placeholder Main Screen
 * TODO: Replace with actual MainNavigator in PR #3
 */
const PlaceholderMainScreen: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.title}>
        Welcome to Pigeon AI! 🎉
      </Text>
      <Text style={placeholderStyles.subtitle}>
        You're logged in as: {user?.email}
      </Text>
      <TouchableOpacity
        style={placeholderStyles.button}
        onPress={signOut}
      >
        <Text style={placeholderStyles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <Text style={placeholderStyles.note}>
        Main app screens will be implemented in PR #3
      </Text>
    </View>
  );
};

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: COLORS.textTertiary,
    marginTop: 32,
    fontSize: 14,
    textAlign: 'center',
  },
});

