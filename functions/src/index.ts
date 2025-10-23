import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function: Send push notification when a new message is created
 * Triggers on: New document in /conversations/{conversationId}/messages
 */
export const sendMessageNotification = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    try {
      const message = snapshot.data();
      const conversationId = context.params.conversationId;
      const messageId = context.params.messageId;

      console.log(`📨 New message ${messageId} in conversation ${conversationId}`);

      // Get the conversation to find all participants
      const conversationRef = admin.firestore()
        .collection('conversations')
        .doc(conversationId);
      
      const conversationSnap = await conversationRef.get();
      
      if (!conversationSnap.exists) {
        console.log('❌ Conversation not found');
        return null;
      }

      const conversation = conversationSnap.data();
      const participants = conversation?.participants || [];
      const senderId = message.senderId;

      // Get sender's profile for display name
      const senderRef = admin.firestore().collection('users').doc(senderId);
      const senderSnap = await senderRef.get();
      const senderName = senderSnap.data()?.displayName || 'Someone';

      // Find recipients (all participants except sender)
      const recipientIds = participants.filter((id: string) => id !== senderId);

      console.log(`👥 Found ${recipientIds.length} recipients`);

      // Get FCM tokens for all recipients
      const tokenPromises = recipientIds.map(async (recipientId: string) => {
        const userRef = admin.firestore().collection('users').doc(recipientId);
        const userSnap = await userRef.get();
        const fcmTokens = userSnap.data()?.fcmTokens || [];
        return { recipientId, tokens: fcmTokens };
      });

      const recipientTokens = await Promise.all(tokenPromises);

      // Flatten all tokens
      const allTokens: string[] = [];
      recipientTokens.forEach(({ tokens }) => {
        allTokens.push(...tokens);
      });

      if (allTokens.length === 0) {
        console.log('⚠️  No FCM tokens found for recipients');
        return null;
      }

      console.log(`🔔 Sending notification to ${allTokens.length} device(s)`);

      // Prepare notification payload
      const notificationPayload = {
        notification: {
          title: senderName,
          body: message.content.length > 100 
            ? message.content.substring(0, 100) + '...' 
            : message.content,
          sound: 'default',
        },
        data: {
          screen: 'Chat',
          conversationId: conversationId,
          senderId: senderId,
          messageId: messageId,
        },
      };

      // Send notification to all tokens
      const response = await admin.messaging().sendEachForMulticast({
        tokens: allTokens,
        ...notificationPayload,
      });

      console.log(`✅ Notification sent: ${response.successCount} success, ${response.failureCount} failed`);

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(allTokens[idx]);
            console.log(`❌ Failed token: ${allTokens[idx].substring(0, 20)}...`);
          }
        });

        // Remove invalid tokens from Firestore
        for (const tokenData of recipientTokens) {
          const tokensToRemove = tokenData.tokens.filter((token: string) => 
            invalidTokens.includes(token)
          );

          if (tokensToRemove.length > 0) {
            await admin.firestore()
              .collection('users')
              .doc(tokenData.recipientId)
              .update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
              });
            console.log(`🗑️  Removed ${tokensToRemove.length} invalid token(s) from user ${tokenData.recipientId}`);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return null;
    }
  });

