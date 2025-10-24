import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

type HelpSupportScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HelpSupport'
>;

interface HelpSupportScreenProps {
  navigation: HelpSupportScreenNavigationProp;
}

export function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const handleBack = () => {
    navigation.goBack();
  };

  const handleEmailPress = async () => {
    const email = 'atharva.sardar02@gmail.com';
    const subject = 'PigeonAi Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Email Not Available', 'Please email us at: atharva.sardar02@gmail.com');
      }
    } catch (error) {
      Alert.alert('Email Not Available', 'Please email us at: atharva.sardar02@gmail.com');
    }
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>📞 Contact Us</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AS</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Atharva Sardar</Text>
              <Text style={styles.contactRole}>CEO & Founder</Text>
              <TouchableOpacity 
                style={styles.emailButton}
                onPress={handleEmailPress}
                activeOpacity={0.7}
              >
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                <Text style={styles.emailText}>atharva.sardar02@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.contactNote}>
            💡 We typically respond within 24 hours during business days.
          </Text>
        </View>

        {/* Quick Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Quick Help</Text>
          
          <View style={styles.helpCard}>
            <Text style={styles.helpQuestion}>How do I send a message?</Text>
            <Text style={styles.helpAnswer}>
              Tap on any conversation, type your message in the input field at the bottom, and hit send.
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpQuestion}>How do I create a group?</Text>
            <Text style={styles.helpAnswer}>
              On the conversation list screen, tap the + button, then select "New Group". Add members and give your group a name.
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpQuestion}>How do I use AI features?</Text>
            <Text style={styles.helpAnswer}>
              In any chat, tap the "AI Features" button (✨) in the header. Choose from Thread Summary, Action Items, Search, Priority Filter, Decisions, or Scheduling Assistant.
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpQuestion}>What if my messages aren't sending?</Text>
            <Text style={styles.helpAnswer}>
              Check your internet connection. Messages will automatically send when you're back online. If the problem persists, try signing out and back in.
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpQuestion}>How do I change my profile picture?</Text>
            <Text style={styles.helpAnswer}>
              Go to Profile → Tap on your profile picture → Select a new photo from your gallery.
            </Text>
          </View>
        </View>

        {/* Documentation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Documentation</Text>
          
          <View style={styles.docCard}>
            <Ionicons name="rocket-outline" size={24} color={COLORS.primary} />
            <View style={styles.docContent}>
              <Text style={styles.docTitle}>Getting Started</Text>
              <Text style={styles.docText}>
                PigeonAi is an AI-enhanced messaging app built for remote teams. Send messages, create groups, and leverage powerful AI features to stay productive.
              </Text>
            </View>
          </View>

          <View style={styles.docCard}>
            <Ionicons name="flash-outline" size={24} color={COLORS.primary} />
            <View style={styles.docContent}>
              <Text style={styles.docTitle}>Core Features</Text>
              <Text style={styles.docText}>
                • Real-time messaging with instant delivery{'\n'}
                • Group chats with unlimited members{'\n'}
                • Offline support - messages sync when online{'\n'}
                • Push notifications for new messages{'\n'}
                • Read receipts and typing indicators
              </Text>
            </View>
          </View>

          <View style={styles.docCard}>
            <Ionicons name="sparkles-outline" size={24} color={COLORS.primary} />
            <View style={styles.docContent}>
              <Text style={styles.docTitle}>AI Features</Text>
              <Text style={styles.docText}>
                • Thread Summarization - Get quick summaries{'\n'}
                • Action Items - Never miss a task{'\n'}
                • Smart Search - Find by meaning, not keywords{'\n'}
                • Priority Detection - Flag urgent messages{'\n'}
                • Decision Tracking - Track important decisions{'\n'}
                • Scheduling Assistant - Coordinate meetings
              </Text>
            </View>
          </View>

          <View style={styles.docCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
            <View style={styles.docContent}>
              <Text style={styles.docTitle}>Privacy & Security</Text>
              <Text style={styles.docText}>
                Your messages are secured with Firebase Authentication. AI features process messages server-side to keep your data safe. We never share your data with third parties.
              </Text>
            </View>
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Troubleshooting</Text>
          
          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>App won't load?</Text>
            <Text style={styles.troubleshootText}>
              • Check your internet connection{'\n'}
              • Force close and reopen the app{'\n'}
              • Clear app cache in Profile → Storage → Clear Cache{'\n'}
              • Restart your device
            </Text>
          </View>

          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>Messages not syncing?</Text>
            <Text style={styles.troubleshootText}>
              • Ensure you're connected to the internet{'\n'}
              • Check if Firebase is down (rare){'\n'}
              • Sign out and sign back in{'\n'}
              • Contact support if issue persists
            </Text>
          </View>

          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>AI features not working?</Text>
            <Text style={styles.troubleshootText}>
              • Make sure you have an active conversation{'\n'}
              • Check your internet connection{'\n'}
              • Some features require multiple messages{'\n'}
              • Try again or contact support
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            PigeonAi v1.0.0 (MVP){'\n'}
            Built with ❤️ for Remote Teams
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

  contactSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.md,
  } as TextStyle,

  contactCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.buttonPrimaryText,
  } as TextStyle,

  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  } as ViewStyle,

  contactName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  contactRole: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  } as TextStyle,

  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs / 2,
  } as ViewStyle,

  emailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs / 2,
  } as TextStyle,

  contactNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    lineHeight: 16,
  } as TextStyle,

  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  } as ViewStyle,

  helpCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  helpQuestion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  helpAnswer: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  docCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  docContent: {
    flex: 1,
    marginLeft: SPACING.md,
  } as ViewStyle,

  docTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  docText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  troubleshootCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  troubleshootTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs,
  } as TextStyle,

  troubleshootText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  footer: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,

  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
});

