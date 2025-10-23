import Constants from 'expo-constants';
import axios from 'axios';

/**
 * AWS Lambda Notification Service
 * Calls AWS Lambda HTTP endpoint to trigger background push notifications
 */

const LAMBDA_ENDPOINT = Constants.expoConfig?.extra?.lambdaNotificationUrl || process.env.EXPO_PUBLIC_LAMBDA_NOTIFICATION_URL;

/**
 * Send notification via AWS Lambda
 * @param conversationId - ID of the conversation
 * @param messageId - ID of the message
 * @param message - Message object with content and senderId
 */
export const sendNotificationViaLambda = async (
  conversationId: string,
  messageId: string,
  message: {
    content: string;
    senderId: string;
  }
): Promise<void> => {
  try {
    if (!LAMBDA_ENDPOINT) {
      console.log('⚠️  Lambda endpoint not configured - skipping background notification');
      return;
    }

    console.log(`📤 Calling Lambda for message ${messageId}`);

    const response = await axios.post(
      LAMBDA_ENDPOINT,
      {
        conversationId,
        messageId,
        message,
      },
      {
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Lambda response:`, response.data);
  } catch (error) {
    // Don't throw - notifications are optional
    if (axios.isAxiosError(error)) {
      console.error('❌ Lambda error:', error.response?.data || error.message);
    } else {
      console.error('❌ Failed to call Lambda:', error);
    }
  }
};

