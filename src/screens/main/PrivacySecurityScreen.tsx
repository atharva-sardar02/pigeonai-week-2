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

type PrivacySecurityScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'PrivacySecurity'
>;

interface PrivacySecurityScreenProps {
  navigation: PrivacySecurityScreenNavigationProp;
}

export function PrivacySecurityScreen({ navigation }: PrivacySecurityScreenProps) {
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Your Data is Secure</Text>
          <View style={styles.card}>
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.success} />
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>End-to-End Security</Text>
                <Text style={styles.securityText}>
                  Your messages are protected with Firebase Authentication and Firestore Security Rules.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.securityRow}>
              <Ionicons name="key" size={32} color={COLORS.primary} />
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Secure Authentication</Text>
                <Text style={styles.securityText}>
                  Passwords are hashed using industry-standard Firebase Auth. We never store plain-text passwords.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.securityRow}>
              <Ionicons name="cloud-done" size={32} color={COLORS.primary} />
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Cloud Security</Text>
                <Text style={styles.securityText}>
                  All data is stored on Google's secure Firebase infrastructure with automatic backups.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Privacy Policy</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What Data We Collect</Text>
            <Text style={styles.cardText}>
              • Email address and password (for authentication){'\n'}
              • Display name and profile picture (optional){'\n'}
              • Messages and conversation history{'\n'}
              • Device tokens (for push notifications){'\n'}
              • Usage statistics (for improving the app)
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How We Use Your Data</Text>
            <Text style={styles.cardText}>
              • <Text style={styles.bold}>Authentication</Text>: To verify your identity and keep your account secure{'\n'}
              • <Text style={styles.bold}>Messaging</Text>: To store and deliver your messages to recipients{'\n'}
              • <Text style={styles.bold}>AI Features</Text>: To process conversations for summarization, action items, etc.{'\n'}
              • <Text style={styles.bold}>Notifications</Text>: To alert you of new messages
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>What We DON'T Do</Text>
            <Text style={styles.cardText}>
              ❌ We do NOT sell your data to third parties{'\n'}
              ❌ We do NOT share messages with advertisers{'\n'}
              ❌ We do NOT train AI models on your conversations{'\n'}
              ❌ We do NOT read your messages (except via AI features you activate)
            </Text>
          </View>
        </View>

        {/* AI Processing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI Data Processing</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>OpenAI Processing</Text>
            <Text style={styles.cardText}>
              When you use AI features (summarization, action items, etc.), your messages are sent to OpenAI's GPT-4o-mini API for processing. This is done securely through our AWS Lambda backend.
            </Text>
            <View style={styles.highlight}>
              <Text style={styles.highlightText}>
                💡 AI features are opt-in. Your messages are only processed when you explicitly use an AI feature.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vector Embeddings</Text>
            <Text style={styles.cardText}>
              For semantic search, we generate vector embeddings of your messages using OpenAI's embedding model. These are stored in AWS OpenSearch for fast similarity search.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Retention</Text>
            <Text style={styles.cardText}>
              • Messages are stored indefinitely in Firebase Firestore{'\n'}
              • Embeddings are stored in OpenSearch for search functionality{'\n'}
              • AI API responses are not stored long-term{'\n'}
              • You can delete your account anytime by contacting support
            </Text>
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App Permissions</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Required Permissions</Text>
            <View style={styles.permissionRow}>
              <Ionicons name="notifications" size={20} color={COLORS.primary} />
              <Text style={styles.permissionText}>
                <Text style={styles.bold}>Notifications</Text> - To alert you of new messages
              </Text>
            </View>
            <View style={styles.permissionRow}>
              <Ionicons name="wifi" size={20} color={COLORS.primary} />
              <Text style={styles.permissionText}>
                <Text style={styles.bold}>Network Access</Text> - To send and receive messages
              </Text>
            </View>
            <View style={styles.permissionRow}>
              <Ionicons name="camera" size={20} color={COLORS.primary} />
              <Text style={styles.permissionText}>
                <Text style={styles.bold}>Camera/Photos</Text> - To upload profile pictures (optional)
              </Text>
            </View>
          </View>
        </View>

        {/* Security Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Firestore Security Rules</Text>
          <View style={styles.codeCard}>
            <Text style={styles.codeTitle}>Access Control</Text>
            <Text style={styles.codeText}>
              • You can only read conversations you're a participant in{'\n'}
              • You can only send messages as yourself{'\n'}
              • Only conversation participants can read messages{'\n'}
              • Profile updates require authentication{'\n'}
              • All operations validate user identity
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last Updated: October 24, 2025{'\n\n'}
            For privacy concerns or data deletion requests, contact:{'\n'}
            <Text style={styles.emailText}>atharva.sardar02@gmail.com</Text>
          </Text>
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

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  securityContent: {
    flex: 1,
    marginLeft: SPACING.md,
  } as ViewStyle,

  securityTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  securityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
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

  permissionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
  } as ViewStyle,

  permissionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    lineHeight: 20,
  } as TextStyle,

  codeCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  } as ViewStyle,

  codeTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs,
  } as TextStyle,

  codeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: 'monospace',
  } as TextStyle,

  footer: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,

  emailText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
  } as TextStyle,
});

