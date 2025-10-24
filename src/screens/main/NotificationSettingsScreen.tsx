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

type NotificationSettingsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'NotificationSettings'
>;

interface NotificationSettingsScreenProps {
  navigation: NotificationSettingsScreenNavigationProp;
}

export function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notification System</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              PigeonAi uses Firebase Cloud Messaging (FCM) and AWS Lambda to deliver real-time push notifications for new messages.
            </Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ How It Works</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Message Sent</Text>
            <Text style={styles.cardText}>
              When someone sends you a message, it's stored in Firebase Firestore.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. AWS Lambda Trigger</Text>
            <Text style={styles.cardText}>
              Our AWS Lambda function detects the new message and processes it.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Push Notification</Text>
            <Text style={styles.cardText}>
              Lambda sends a push notification via FCM to your device, even if the app is closed or in the background.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>4. Instant Delivery</Text>
            <Text style={styles.cardText}>
              You receive the notification within 1-2 seconds, regardless of app state.
            </Text>
          </View>
        </View>

        {/* Notification States */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App States</Text>
          <View style={styles.stateCard}>
            <View style={styles.stateHeader}>
              <Ionicons name="radio-button-on" size={20} color={COLORS.success} />
              <Text style={styles.stateTitle}>Foreground</Text>
            </View>
            <Text style={styles.stateText}>
              App is open and active. Notifications appear as in-app alerts.
            </Text>
          </View>

          <View style={styles.stateCard}>
            <View style={styles.stateHeader}>
              <Ionicons name="pause-circle" size={20} color={COLORS.warning} />
              <Text style={styles.stateTitle}>Background</Text>
            </View>
            <Text style={styles.stateText}>
              App is open but minimized. Notifications appear in the notification tray.
            </Text>
          </View>

          <View style={styles.stateCard}>
            <View style={styles.stateHeader}>
              <Ionicons name="close-circle" size={20} color={COLORS.error} />
              <Text style={styles.stateTitle}>Terminated</Text>
            </View>
            <Text style={styles.stateText}>
              App is fully closed. Notifications still appear in the notification tray.
            </Text>
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📨 Notification Types</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New Messages</Text>
            <Text style={styles.cardText}>
              Receive notifications for every new message in your conversations.
            </Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Example:</Text>
              <Text style={styles.exampleText}>
                "John: Hey, are you free for a call?"{'\n'}
                "Work Group: Meeting at 3 PM today"
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Group Messages</Text>
            <Text style={styles.cardText}>
              Get notified when someone posts in a group you're part of. Shows group name and sender.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Priority Messages (Future)</Text>
            <Text style={styles.cardText}>
              High-priority messages will have enhanced notifications with urgent sounds and vibrations.
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Technical Details</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Infrastructure</Text>
            <Text style={styles.cardText}>
              • <Text style={styles.bold}>FCM</Text>: Firebase Cloud Messaging for notification delivery{'\n'}
              • <Text style={styles.bold}>AWS Lambda</Text>: Serverless function to send notifications{'\n'}
              • <Text style={styles.bold}>Device Tokens</Text>: Unique identifiers for your device{'\n'}
              • <Text style={styles.bold}>Multi-Device</Text>: Supports multiple devices per account
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payload Format</Text>
            <Text style={styles.codeText}>
              {'{\n'}
              {'  "notification": {\n'}
              {'    "title": "John Doe",\n'}
              {'    "body": "Message content",\n'}
              {'    "badge": 3\n'}
              {'  },\n'}
              {'  "data": {\n'}
              {'    "conversationId": "...",\n'}
              {'    "senderId": "..."\n'}
              {'  }\n'}
              {'}'}
            </Text>
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Troubleshooting</Text>
          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>Not receiving notifications?</Text>
            <Text style={styles.troubleshootText}>
              1. Check device notification permissions for PigeonAi{'\n'}
              2. Ensure the app is connected to the internet{'\n'}
              3. Check if Do Not Disturb is enabled{'\n'}
              4. Try signing out and back in to refresh device token{'\n'}
              5. Restart the app or device
            </Text>
          </View>

          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>Delayed notifications?</Text>
            <Text style={styles.troubleshootText}>
              • Android/iOS may delay notifications to save battery{'\n'}
              • Add PigeonAi to battery optimization exceptions{'\n'}
              • Check your network connection speed{'\n'}
              • Lambda cold starts can add 1-2 seconds delay (rare)
            </Text>
          </View>

          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>Duplicate notifications?</Text>
            <Text style={styles.troubleshootText}>
              If you use multiple devices, each device gets a notification. This is normal behavior.
            </Text>
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Permissions</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              PigeonAi requests notification permissions on first launch. You can manage these permissions in your device settings:{'\n\n'}
              <Text style={styles.bold}>iOS</Text>: Settings → PigeonAi → Notifications{'\n'}
              <Text style={styles.bold}>Android</Text>: Settings → Apps → PigeonAi → Notifications
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

  stateCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  } as ViewStyle,

  stateTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginLeft: SPACING.xs,
  } as TextStyle,

  stateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  exampleBox: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  } as ViewStyle,

  exampleTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  exampleText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  } as TextStyle,

  comingSoonBadge: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.warning,
  } as ViewStyle,

  comingSoonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.warning,
  } as TextStyle,

  codeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 16,
    backgroundColor: COLORS.backgroundTertiary,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.xs,
  } as TextStyle,

  bold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
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
});

