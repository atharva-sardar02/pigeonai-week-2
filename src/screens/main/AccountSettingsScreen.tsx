import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

type AccountSettingsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'AccountSettings'
>;

interface AccountSettingsScreenProps {
  navigation: AccountSettingsScreenNavigationProp;
}

export function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account Information</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Your account is managed through Firebase Authentication, which provides secure user authentication and session management.
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
              <Text style={styles.infoText}>Secure authentication with email & password</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={COLORS.success} />
              <Text style={styles.infoText}>Profile with display name and photo</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cloud" size={20} color={COLORS.success} />
              <Text style={styles.infoText}>Cloud-synced across all your devices</Text>
            </View>
          </View>
        </View>

        {/* Profile Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Profile Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change Display Name</Text>
            <Text style={styles.cardText}>
              Your display name is shown to other users in conversations. To change it, update your profile from the main profile screen.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Update Profile Picture</Text>
            <Text style={styles.cardText}>
              Profile pictures help others recognize you. Upload a photo or use your initials as a placeholder.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Email & Password</Text>
            <Text style={styles.cardText}>
              Your email is used for login and cannot be changed in the MVP. To reset your password, use the "Forgot Password" option on the login screen.
            </Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Local Cache</Text>
            <Text style={styles.cardText}>
              Messages are cached locally for offline access. You can clear your cache from the Profile screen under "Storage" to free up space.
            </Text>
            <View style={styles.highlight}>
              <Text style={styles.highlightText}>
                💡 Cache size: Messages and conversations are stored locally using SQLite for instant loading.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cloud Storage</Text>
            <Text style={styles.cardText}>
              All your messages are stored in Firebase Firestore, ensuring they're never lost even if you uninstall the app.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Deletion</Text>
            <Text style={styles.cardText}>
              To delete your account and all associated data, please contact support at atharva.sardar02@gmail.com. This action is permanent and cannot be undone.
            </Text>
          </View>
        </View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Technical Details</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hybrid Infrastructure</Text>
            <Text style={styles.cardText}>
              PigeonAi uses a hybrid Firebase + AWS infrastructure:{'\n\n'}
              • <Text style={styles.bold}>Firebase</Text>: Authentication, Firestore database, Cloud Messaging, Storage{'\n'}
              • <Text style={styles.bold}>AWS</Text>: Lambda (AI processing), OpenSearch (semantic search), API Gateway
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Synchronization</Text>
            <Text style={styles.cardText}>
              • Real-time sync via Firestore WebSocket connections{'\n'}
              • Offline queue for messages sent without internet{'\n'}
              • Optimistic UI updates for instant feedback{'\n'}
              • Conflict resolution using server timestamps
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  backButton: {
    padding: SPACING.xs,
  } as ViewStyle,

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  headerSpacer: {
    width: 40,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: SPACING.xxl,
  } as ViewStyle,

  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  } as ViewStyle,

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.md,
  } as TextStyle,

  card: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  } as ViewStyle,

  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs,
  } as TextStyle,

  cardText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  } as ViewStyle,

  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  } as TextStyle,

  highlight: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  } as ViewStyle,

  highlightText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    lineHeight: 18,
  } as TextStyle,

  bold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,
});

