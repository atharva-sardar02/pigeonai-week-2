import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';
import { validateEmail, validatePassword } from '../../utils/validators';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  loading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  loading = false,
  error = null,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateForm = (): boolean => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    return !emailValidation && !passwordValidation;
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    if (touched.email) {
      setEmailError(validateEmail(email));
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    if (touched.password) {
      setPasswordError(validatePassword(password));
    }
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[
              styles.input,
              touched.email && emailError ? styles.inputError : null,
            ]}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (touched.email) {
                setEmailError(validateEmail(text));
              }
            }}
            onBlur={handleEmailBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {touched.email && emailError && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              touched.password && passwordError ? styles.inputError : null,
            ]}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (touched.password) {
                setPasswordError(validatePassword(text));
              }
            }}
            onBlur={handlePasswordBlur}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {touched.password && passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
          
          {/* Forgot Password Link - Inside password container */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={onForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.buttonPrimaryText} />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SIZES.paddingMedium,
  },
  passwordContainer: {
    marginBottom: SIZES.paddingLarge,
  },
  label: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.paddingSmall,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    fontSize: SIZES.fontMedium,
    color: COLORS.inputText,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.error,
    marginTop: SIZES.paddingSmall,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 0,
  },
  forgotPasswordText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    padding: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusSmall,
    marginBottom: SIZES.paddingLarge,
  },
  errorMessage: {
    fontSize: SIZES.fontMedium,
    color: COLORS.error,
  },
  submitButton: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
});

