import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { COLORS, SIZES } from '../../utils/constants';

/**
 * NotificationTestScreen
 * 
 * Temporary screen for testing push notifications without EAS Build.
 * Tests local notifications, navigation, banner display, and permission flow.
 * 
 * TO USE:
 * 1. Add this screen to your navigator
 * 2. Navigate to it from your profile or settings
 * 3. Test each button
 * 4. Remove before production
 */

export const NotificationTestScreen = ({ navigation }: any) => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
    console.log(message);
  };

  // Test 1: Simple local notification
  const testSimpleNotification = async () => {
    try {
      addLog('📱 Testing simple notification...');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test message",
        },
        trigger: { seconds: 2 }
      });
      
      addLog('✅ Notification scheduled for 2 seconds');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  // Test 2: Notification with navigation data
  const testNavigationNotification = async () => {
    try {
      addLog('🧭 Testing notification with navigation...');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "John Doe",
          body: "Hey, are we still meeting today?",
          data: {
            screen: 'Chat',
            conversationId: 'test-conversation-123',
            senderId: 'test-user-456'
          }
        },
        trigger: { seconds: 2 }
      });
      
      addLog('✅ Navigation notification scheduled');
      addLog('💡 Tap notification to test navigation');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  // Test 3: Background notification
  const testBackgroundNotification = async () => {
    try {
      addLog('🌙 Testing background notification...');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Background Test",
          body: "Minimize app, wait 10 seconds, tap notification",
          data: {
            screen: 'Chat',
            conversationId: 'test-123'
          }
        },
        trigger: { seconds: 10 }
      });
      
      addLog('✅ Background notification scheduled for 10 seconds');
      addLog('📱 Minimize the app now and wait...');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  // Test 4: Request permissions
  const testPermissions = async () => {
    try {
      addLog('🔐 Requesting notification permissions...');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      addLog(`Current status: ${existingStatus}`);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        addLog('❌ Permission denied');
        return;
      }
      
      addLog('✅ Permission granted');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  // Test 5: Try to get push token (will fail in Expo Go, but tests code)
  const testPushToken = async () => {
    try {
      addLog('🎫 Attempting to get Expo Push Token...');
      addLog('⚠️ This will fail in Expo Go (expected)');
      
      const token = await Notifications.getExpoPushTokenAsync();
      addLog(`✅ Token: ${token.data}`);
    } catch (error: any) {
      addLog(`❌ Expected error in Expo Go: ${error.message}`);
      addLog('💡 Token will work in EAS Build');
    }
  };

  // Test 6: Multiple notifications
  const testMultipleNotifications = async () => {
    try {
      addLog('📬 Scheduling multiple notifications...');
      
      const users = ['Alice', 'Bob', 'Charlie'];
      
      for (let i = 0; i < users.length; i++) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: users[i],
            body: `Message ${i + 1} from ${users[i]}`,
            data: { conversationId: `test-${i}` }
          },
          trigger: { seconds: (i + 1) * 3 }
        });
      }
      
      addLog(`✅ Scheduled ${users.length} notifications`);
      addLog('⏰ Will appear at 3, 6, and 9 seconds');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  // Test 7: Cancel all notifications
  const cancelAllNotifications = async () => {
    try {
      addLog('🚫 Cancelling all scheduled notifications...');
      await Notifications.cancelAllScheduledNotificationsAsync();
      addLog('✅ All notifications cancelled');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs cleared');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Notification Tests</Text>
        <Text style={styles.subtitle}>Test without EAS Build</Text>
      </View>

      <ScrollView style={styles.testsContainer}>
        <TestButton
          title="1. Simple Notification"
          description="Basic notification after 2 seconds"
          onPress={testSimpleNotification}
        />
        
        <TestButton
          title="2. Navigation Test"
          description="Notification with chat data - tap to navigate"
          onPress={testNavigationNotification}
        />
        
        <TestButton
          title="3. Background Test"
          description="Minimize app, wait 10 seconds, tap notification"
          onPress={testBackgroundNotification}
        />
        
        <TestButton
          title="4. Request Permissions"
          description="Test permission flow"
          onPress={testPermissions}
        />
        
        <TestButton
          title="5. Get Push Token"
          description="Will fail in Expo Go (expected)"
          onPress={testPushToken}
        />
        
        <TestButton
          title="6. Multiple Notifications"
          description="Schedule 3 notifications"
          onPress={testMultipleNotifications}
        />
        
        <TestButton
          title="🚫 Cancel All"
          description="Cancel scheduled notifications"
          onPress={cancelAllNotifications}
          danger
        />
      </ScrollView>

      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>📋 Logs</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.logsList}>
          {logs.length === 0 ? (
            <Text style={styles.emptyLogs}>No logs yet. Press a test button!</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

interface TestButtonProps {
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}

const TestButton: React.FC<TestButtonProps> = ({ title, description, onPress, danger }) => (
  <TouchableOpacity 
    style={[styles.testButton, danger && styles.testButtonDanger]}
    onPress={onPress}
  >
    <Text style={styles.testButtonTitle}>{title}</Text>
    <Text style={styles.testButtonDescription}>{description}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.fontExtraLarge,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginSmall / 2,
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
  },
  testsContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  testButton: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.marginSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testButtonDanger: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  testButtonTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  testButtonDescription: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
  },
  logsContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: 200,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logsTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clearButton: {
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logsList: {
    maxHeight: 150,
  },
  emptyLogs: {
    padding: SIZES.padding,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 4,
  },
  backButton: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButtonText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

