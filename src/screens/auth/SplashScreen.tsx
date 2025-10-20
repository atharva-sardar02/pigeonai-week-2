import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

/**
 * Splash Screen
 * 
 * Displays a loading screen while checking authentication state.
 * Shows app branding and a loading indicator.
 */
export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* App Branding */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* App Icon */}
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>Pigeon AI</Text>
        <Text style={styles.tagline}>New gen ai based messaging</Text>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge,
  },
  logoContainer: {
    marginBottom: SIZES.paddingLarge + SIZES.paddingMedium,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.paddingSmall,
  },
  tagline: {
    fontSize: SIZES.fontLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.paddingLarge * 2,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: SIZES.paddingLarge,
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
    marginTop: SIZES.paddingMedium,
  },
  footer: {
    paddingBottom: SIZES.paddingLarge + SIZES.paddingMedium,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textTertiary,
  },
});

