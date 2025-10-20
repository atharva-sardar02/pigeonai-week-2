import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { AuthStackParamList } from '../types';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator
 * 
 * Handles navigation between authentication screens:
 * - Splash (initial loading)
 * - Login
 * - Signup
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack.Navigator>
  );
};

