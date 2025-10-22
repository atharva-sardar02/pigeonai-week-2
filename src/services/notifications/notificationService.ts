import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Export Notifications for external use
export { Notifications };

/**
 * Notification Service
 * Handles push notification permissions, tokens, and notification handling
 * Uses Expo Push Notification service
 */

// Configure how notifications should be displayed when app is in foreground
// NOTE: We return shouldShowAlert: false because AWS Lambda sends FCM notifications
// which should only appear when app is in background/closed.
// When app is open, the in-app UI already shows new messages.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // Don't show notification banner when app is open
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user
 * @returns Promise with permission status
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📱 Current permission status:', existingStatus);
    
    let finalStatus = existingStatus;

    // If permission not already granted, ask user
    if (existingStatus !== 'granted') {
      console.log('📱 Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
      console.log('📱 New permission status:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Notification permissions not granted');
      return false;
    }
    
    console.log('✅ Notification permissions granted');
    
    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
      });
      console.log('✅ Android notification channel created');
    }

    return true;
  } catch (error) {
    console.error('❌ Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get the FCM Push Token for this device
 * @returns Promise with the FCM Push Token or null
 */
export async function getDeviceToken(): Promise<string | null> {
  try {
    // Check if running on physical device
    if (!Constants.isDevice) {
      console.log('⚠️ Not a physical device, skipping FCM token');
      return null;
    }

    console.log('📱 Attempting to get push token...');
    
    // Try to get FCM token first (for EAS Build with google-services.json)
    try {
      const fcmToken = await Notifications.getDevicePushTokenAsync();
      console.log('📱 Got FCM token:', fcmToken.data.substring(0, 20) + '...');
      console.log('📱 Full token length:', fcmToken.data.length);
      return fcmToken.data;
    } catch (fcmError) {
      console.log('⚠️ FCM token failed, trying Expo push token:', fcmError);
      
      // Fallback to Expo Push Token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('❌ No project ID found');
        return null;
      }
      
      const expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log('📱 Got Expo push token:', expoToken.data);
      return expoToken.data;
    }
  } catch (error) {
    console.error('❌ Failed to get push token:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Complete flow to register device for push notifications
 * @returns Promise with the device token or null
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Step 1: Request permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    // Step 2: Get device token
    const token = await getDeviceToken();
    if (!token) {
      return null;
    }

    return token;
  } catch (error) {
    // Silently fail
    return null;
  }
}

/**
 * Handle a notification (log it, extract data, etc.)
 * @param notification - The notification object
 * @returns The notification data
 */
export function handleNotification(notification: Notifications.Notification): any {
  try {
    const { title, body, data } = notification.request.content;
    
    console.log('📬 Notification received:', {
      title,
      body,
      data,
    });

    return data;
  } catch (error) {
    console.error('Error handling notification:', error);
    return null;
  }
}

/**
 * Schedule a local notification
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data to include
 * @param seconds - Delay in seconds (default: immediate)
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 0
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: seconds > 0 ? { seconds } : null,
    });

    console.log('✅ Notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 * @param notificationId - The ID of the notification to cancel
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get the last notification response (when user taps a notification)
 * @returns Promise with the notification response or null
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response;
  } catch (error) {
    console.error('Error getting last notification response:', error);
    return null;
  }
}

/**
 * Set up listener for when notifications are received (foreground)
 * @param callback - Function to call when notification is received
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Set up listener for when user taps a notification
 * @param callback - Function to call when notification is tapped
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Set badge count on app icon (iOS only)
 * @param count - Number to display on badge (0 to clear)
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
    console.log('✅ Badge count set to:', count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Get current badge count
 * @returns Promise with the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    const count = await Notifications.getBadgeCountAsync();
    return count;
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Send push notification to specific device tokens using Expo Push API
 * @param tokens - Array of Expo Push Tokens
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data to send with notification
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    // Filter out invalid tokens
    const validTokens = tokens.filter(token => token && token.startsWith('ExponentPushToken'));
    
    if (validTokens.length === 0) {
      console.log('⚠️ No valid push tokens to send to');
      return;
    }

    // Construct push messages
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
      channelId: 'default',
    }));

    console.log('📤 Sending push notifications to', validTokens.length, 'devices');

    // Send to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Push notifications sent successfully:', result);
    } else {
      console.error('❌ Failed to send push notifications:', result);
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}

/**
 * Send push notification to multiple users
 * Fetches their FCM tokens from Firestore and sends notifications
 * @param userIds - Array of user IDs to send notifications to
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data to send with notification
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    // Import Firestore here to avoid circular dependencies
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../firebase/firebaseConfig');

    // Collect all tokens from all users
    const allTokens: string[] = [];

    for (const userId of userIds) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const tokens = userData.fcmTokens || [];
          allTokens.push(...tokens);
        }
      } catch (error) {
        console.error(`Error fetching tokens for user ${userId}:`, error);
      }
    }

    if (allTokens.length === 0) {
      console.log('⚠️ No push tokens found for users');
      return;
    }

    // Send notification to all tokens
    await sendPushNotification(allTokens, title, body, data);
  } catch (error) {
    console.error('❌ Error sending notifications to users:', error);
  }
}

