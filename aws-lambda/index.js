const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
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

    // Get sender's profile for display name
    const senderRef = db.collection('users').doc(senderId);
    const senderSnap = await senderRef.get();
    const senderName = senderSnap.exists ? (senderSnap.data()?.displayName || 'Someone') : 'Someone';

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
      console.log('⚠️  No FCM tokens found for recipients');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No FCM tokens found' })
      };
    }

    console.log(`🔔 Sending notification to ${allTokens.length} device(s)`);

    // Prepare notification payload
    const notificationPayload = {
      notification: {
        title: senderName,
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

    // Send notification to all tokens
    const response = await messaging.sendEachForMulticast({
      tokens: allTokens,
      ...notificationPayload,
    });

    console.log(`✅ Notification sent: ${response.successCount} success, ${response.failureCount} failed`);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          invalidTokens.push(allTokens[idx]);
          console.log(`❌ Failed token: ${allTokens[idx].substring(0, 20)}...`);
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
          console.log(`🗑️  Removed ${tokensToRemove.length} invalid token(s) from user ${tokenData.recipientId}`);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notification sent successfully',
        successCount: response.successCount,
        failureCount: response.failureCount
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

