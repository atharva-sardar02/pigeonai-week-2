import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Check if we're running in a development/test environment (Expo Go)
 * vs production build (EAS Build)
 */
export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

/**
 * Trigger a local notification for a new message
 * Used in development (Expo Go) to simulate push notifications
 * 
 * @param senderName - Name of the message sender
 * @param messageContent - Content of the message
 * @param conversationId - ID of the conversation
 * @param senderId - ID of the sender
 */
export const triggerLocalNotification = async (
  senderName: string,
  messageContent: string,
  conversationId: string,
  senderId: string
): Promise<void> => {
  try {
    // Check if we should use local notifications (Expo Go) or rely on remote push (EAS Build)
    if (!isExpoGo()) {
      return; // Remote push notifications will handle this in EAS Build
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: senderName,
        body: messageContent.length > 100 
          ? messageContent.substring(0, 100) + '...' 
          : messageContent,
        data: {
          screen: 'Chat',
          conversationId,
          senderId,
        },
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error triggering local notification:', error);
  }
};

/**
 * Check if local notifications should be used
 * Returns true if in Expo Go (development), false if in EAS Build (production)
 */
export const shouldUseLocalNotifications = (): boolean => {
  return isExpoGo();
};

