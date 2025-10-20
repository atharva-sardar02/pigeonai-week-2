import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SignupForm } from '../../components/auth/SignupForm';
import { useAuth } from '../../store/context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';
import { AuthStackParamList } from '../../types';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Signup'
>;

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signUp, loading, error } = useAuth();

  const handleSignUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      await signUp(email, password, displayName);
      // Navigation will be handled by auth state change
    } catch (err: any) {
      // Error is already in context
      console.error('Sign up error:', err);
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
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

          {/* Signup Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>
              Sign up to get started with Pigeon AI
            </Text>

            <SignupForm
              onSubmit={handleSignUp}
              loading={loading}
              error={error}
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={handleNavigateToLogin}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Sign In</Text>
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
    marginBottom: 13,
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

