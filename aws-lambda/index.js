const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
  // Service account credentials will be provided via environment variables
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * AWS Lambda Handler
 * Triggered by HTTP POST from Firestore webhook
 * Sends FCM push notifications to message recipients
 */
exports.handler = async (event) => {
  try {
    console.log('📨 Lambda triggered:', JSON.stringify(event, null, 2));

    // Parse the webhook payload
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event.body;
    }

    const { conversationId, messageId, message } = body;

    if (!conversationId || !messageId || !message) {
      console.error('❌ Missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: conversationId, messageId, message' })
      };
    }

    console.log(`📬 Processing message ${messageId} in conversation ${conversationId}`);

    // Get conversation to find participants
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();

    if (!conversationSnap.exists) {
      console.log('❌ Conversation not found');
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Conversation not found' })
      };
    }

    const conversation = conversationSnap.data();
    const participants = conversation?.participants || [];
    const senderId = message.senderId;
    // Check if it's a group: Firestore stores "type": "group" not "isGroup"
    const isGroupChat = conversation?.type === 'group';
    const groupName = conversation?.name || 'Group Chat';

    console.log(`🔍 Conversation type: ${isGroupChat ? 'GROUP' : 'DM'}`);
    console.log(`🔍 Group name: ${groupName}`);
    console.log(`🔍 Full conversation data:`, JSON.stringify(conversation, null, 2));

    // Get sender's profile for display name
    const senderRef = db.collection('users').doc(senderId);
    const senderSnap = await senderRef.get();
    const senderName = senderSnap.exists ? (senderSnap.data()?.displayName || 'Someone') : 'Someone';
    
    console.log(`🔍 Sender name: ${senderName}`);
    
    // Build notification title based on conversation type
    const notificationTitle = isGroupChat ? `${groupName} - ${senderName}` : senderName;
    
    console.log(`🔍 Final notification title: ${notificationTitle}`);

    // Find recipients (all participants except sender)
    const recipientIds = participants.filter(id => id !== senderId);

    console.log(`👥 Found ${recipientIds.length} recipients`);

    if (recipientIds.length === 0) {
      console.log('⚠️  No recipients found');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No recipients to notify' })
      };
    }

    // Get FCM tokens for all recipients
    const tokenPromises = recipientIds.map(async (recipientId) => {
      const userRef = db.collection('users').doc(recipientId);
      const userSnap = await userRef.get();
      const fcmTokens = userSnap.exists ? (userSnap.data()?.fcmTokens || []) : [];
      return { recipientId, tokens: fcmTokens };
    });

    const recipientTokens = await Promise.all(tokenPromises);

    // Flatten all tokens
    const allTokens = [];
    recipientTokens.forEach(({ tokens }) => {
      allTokens.push(...tokens);
    });

    if (allTokens.length === 0) {
      console.log('⚠️  No push tokens found for recipients');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No push tokens found' })
      };
    }

    console.log(`🔔 Sending notification to ${allTokens.length} device(s)`);

    // Separate FCM and Expo tokens
    const fcmTokens = allTokens.filter(token => !token.startsWith('ExponentPushToken'));
    const expoTokens = allTokens.filter(token => token.startsWith('ExponentPushToken'));

    console.log(`📊 Token breakdown: ${fcmTokens.length} FCM, ${expoTokens.length} Expo`);

    let successCount = 0;
    let failureCount = 0;

    // Send via FCM if we have FCM tokens
    if (fcmTokens.length > 0) {
      // Prepare notification payload
      const notificationPayload = {
        notification: {
          title: notificationTitle,
          body: message.content.length > 100 
            ? message.content.substring(0, 100) + '...' 
            : message.content,
        },
        data: {
          screen: 'Chat',
          conversationId: conversationId,
          senderId: senderId,
          messageId: messageId,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            // Always show notification, even when app is in foreground
            visibility: 'public',
            defaultSound: true,
            defaultVibrateTimings: true,
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            }
          }
        }
      };

      // Send notification to all FCM tokens
      const fcmResponse = await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        ...notificationPayload,
      });

      successCount += fcmResponse.successCount;
      failureCount += fcmResponse.failureCount;

      console.log(`✅ FCM sent: ${fcmResponse.successCount} success, ${fcmResponse.failureCount} failed`);

      // Remove invalid FCM tokens
      if (fcmResponse.failureCount > 0) {
        const invalidTokens = [];
        fcmResponse.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(fcmTokens[idx]);
            console.log(`❌ Failed FCM token: ${fcmTokens[idx].substring(0, 20)}...`);
          }
        });

        // Remove invalid tokens from Firestore
        for (const tokenData of recipientTokens) {
          const tokensToRemove = tokenData.tokens.filter(token => 
            invalidTokens.includes(token)
          );

          if (tokensToRemove.length > 0) {
            await db.collection('users')
              .doc(tokenData.recipientId)
              .update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
              });
            console.log(`🗑️  Removed ${tokensToRemove.length} invalid FCM token(s) from user ${tokenData.recipientId}`);
          }
        }
      }
    }

    // Send via Expo Push API if we have Expo tokens
    if (expoTokens.length > 0) {
      const axios = require('axios');
      
      const expoMessages = expoTokens.map(token => ({
        to: token,
        sound: 'default',
        title: notificationTitle,
        body: message.content.length > 100 
          ? message.content.substring(0, 100) + '...' 
          : message.content,
        data: {
          screen: 'Chat',
          conversationId: conversationId,
          senderId: senderId,
          messageId: messageId,
        },
        channelId: 'default',
        priority: 'high',
      }));

      try {
        const expoResponse = await axios.post(
          'https://exp.host/--/api/v2/push/send',
          expoMessages,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }
        );

        console.log(`✅ Expo sent: ${expoResponse.data.data?.length || 0} notifications`);
        successCount += expoResponse.data.data?.filter(r => r.status === 'ok').length || 0;
        failureCount += expoResponse.data.data?.filter(r => r.status === 'error').length || 0;

        // Log any Expo errors
        expoResponse.data.data?.forEach((result, idx) => {
          if (result.status === 'error') {
            console.log(`❌ Expo error for token ${expoTokens[idx].substring(0, 20)}...: ${result.message}`);
          }
        });
      } catch (expoError) {
        console.error('❌ Expo Push API error:', expoError.response?.data || expoError.message);
        failureCount += expoTokens.length;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notification sent successfully',
        successCount: successCount,
        failureCount: failureCount
      })
    };

  } catch (error) {
    console.error('❌ Error in Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

