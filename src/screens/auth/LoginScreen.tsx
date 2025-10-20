import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../store/context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';
import { AuthStackParamList } from '../../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, loading, error } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // Navigation will be handled by auth state change
    } catch (err: any) {
      // Error is already in context
      console.error('Sign in error:', err);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async (email) => {
            if (email) {
              try {
                // TODO: Implement password reset
                Alert.alert(
                  'Success',
                  'Password reset email sent! Check your inbox.'
                );
              } catch (err: any) {
                Alert.alert('Error', err.message);
              }
            }
          },
        },
      ],
      'plain-text',
      '',
      'email-address'
    );
  };

  const handleNavigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Pigeon AI</Text>
            <Text style={styles.subtitle}>
              New gen ai based messaging
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Sign in to continue to your account
            </Text>

            <LoginForm
              onSubmit={handleSignIn}
              onForgotPassword={handleForgotPassword}
              loading={loading}
              error={error}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={handleNavigateToSignup}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingLarge,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: SIZES.paddingMedium,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.paddingSmall,
  },
  subtitle: {
    fontSize: SIZES.fontLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.paddingSmall,
  },
  formSubtitle: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.paddingLarge + SIZES.paddingSmall,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.paddingSmall,
    marginTop: 5,
  },
  footerText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: SIZES.fontMedium,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

