import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateDisplayName,
} from '../../utils/validators';

interface SignupFormProps {
  onSubmit: (email: string, password: string, displayName: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateForm = (): boolean => {
    const nameValidation = validateDisplayName(displayName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);

    setDisplayNameError(nameValidation);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmValidation);

    return !nameValidation && !emailValidation && !passwordValidation && !confirmValidation;
  };

  const handleFieldBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'displayName':
        setDisplayName(value);
        if (touched.displayName) {
          setDisplayNameError(validateDisplayName(value));
        }
        break;
      case 'email':
        setEmail(value);
        if (touched.email) {
          setEmailError(validateEmail(value));
        }
        break;
      case 'password':
        setPassword(value);
        if (touched.password) {
          setPasswordError(validatePassword(value));
        }
        if (touched.confirmPassword && confirmPassword) {
          setConfirmPasswordError(validatePasswordConfirmation(value, confirmPassword));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (touched.confirmPassword) {
          setConfirmPasswordError(validatePasswordConfirmation(password, value));
        }
        break;
    }
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(email, password, displayName);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const isFormValid =
    displayName.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  return (
    <View style={styles.formContainer}>
        {/* Display Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={[
              styles.input,
              touched.displayName && displayNameError ? styles.inputError : null,
            ]}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={displayName}
            onChangeText={(text) => handleFieldChange('displayName', text)}
            onBlur={() => handleFieldBlur('displayName')}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />
          {touched.displayName && displayNameError && (
            <Text style={styles.errorText}>{displayNameError}</Text>
          )}
        </View>

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
            onChangeText={(text) => handleFieldChange('email', text)}
            onBlur={() => handleFieldBlur('email')}
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
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              touched.password && passwordError ? styles.inputError : null,
            ]}
            placeholder="Create a password"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={password}
            onChangeText={(text) => handleFieldChange('password', text)}
            onBlur={() => handleFieldBlur('password')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {touched.password && passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
          {!passwordError && password.length > 0 && (
            <Text style={styles.hintText}>At least 6 characters</Text>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              touched.confirmPassword && confirmPasswordError ? styles.inputError : null,
            ]}
            placeholder="Confirm your password"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={confirmPassword}
            onChangeText={(text) => handleFieldChange('confirmPassword', text)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {touched.confirmPassword && confirmPasswordError && (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          )}
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
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Terms Notice */}
        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  inputContainer: {
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
  hintText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.paddingSmall,
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
    marginBottom: SIZES.paddingMedium,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
  termsText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

