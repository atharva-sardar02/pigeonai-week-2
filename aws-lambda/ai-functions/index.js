/**
 * Main Lambda Handler with Routing
 * 
 * Routes requests to appropriate AI function or push notification handler
 * based on API Gateway path
 */

// AI Function Handlers
const summarizeHandler = require('./summarize');
const actionItemsHandler = require('./actionItems');
const searchHandler = require('./search');
const embeddingHandler = require('./generateEmbedding');
const priorityHandler = require('./priorityDetection');
const decisionTrackingHandler = require('./decisionTracking');
const schedulingAgentHandler = require('./schedulingAgent');
const imageUploadHandler = require('./imageUpload');

/**
 * Main Lambda Handler
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('📨 Lambda triggered:', JSON.stringify(event.requestContext || {}, null, 2));
    
    // Get the request path
    const path = event.path || event.requestContext?.http?.path || event.rawPath || '';
    const method = event.httpMethod || event.requestContext?.http?.method || '';
    
    console.log(`🔍 Route: ${method} ${path}`);
    
    // AI Summarization
    if (path === '/ai/summarize' || path.endsWith('/ai/summarize')) {
      console.log('🤖 Routing to summarization handler');
      return await summarizeHandler.handler(event);
    }
    
    // Action Item Extraction (PR #17)
    if (path === '/ai/extract-action-items' || path.endsWith('/ai/extract-action-items')) {
      console.log('🤖 Routing to action items handler');
      return await actionItemsHandler.handler(event);
    }
    
    // Semantic Search (PR #18)
    if (path === '/ai/search' || path.endsWith('/ai/search')) {
      console.log('🤖 Routing to semantic search handler');
      return await searchHandler.handler(event);
    }
    
    // Generate Embedding (PR #18 - background job)
    if (path === '/ai/generate-embedding' || path.endsWith('/ai/generate-embedding')) {
      console.log('🤖 Routing to embedding generation handler');
      return await embeddingHandler.handler(event);
    }
    
    // Batch Generate Embeddings (PR #18 - backfill tool)
    if (path === '/ai/batch-generate-embeddings' || path.endsWith('/ai/batch-generate-embeddings')) {
      console.log('🤖 Routing to batch embedding generation handler');
      return await embeddingHandler.batchHandler(event);
    }
    
    // Priority Detection (PR #19)
    if (path === '/ai/detect-priority' || path.endsWith('/ai/detect-priority')) {
      console.log('🤖 Routing to priority detection handler');
      return await priorityHandler.detectPriority(event);
    }
    
    // Batch Priority Detection (PR #19)
    if (path === '/ai/batch-detect-priority' || path.endsWith('/ai/batch-detect-priority')) {
      console.log('🤖 Routing to batch priority detection handler');
      return await priorityHandler.batchDetectPriority(event);
    }
    
    // Decision Tracking (PR #20)
    if (path === '/ai/track-decisions' || path.endsWith('/ai/track-decisions')) {
      console.log('🤖 Routing to decision tracking handler');
      return await decisionTrackingHandler.handler(event);
    }
    
    // Meeting Scheduling Agent (PR #21)
    if (path === '/ai/schedule-meeting' || path.endsWith('/ai/schedule-meeting')) {
      console.log('🤖 Routing to scheduling agent handler');
      return await schedulingAgentHandler.handler(event);
    }
    
    // Image Upload - Generate S3 Presigned URL
    if (path === '/ai/upload-image' || path.endsWith('/ai/upload-image')) {
      console.log('📸 Routing to image upload handler');
      return await imageUploadHandler.handler(event);
    }
    
    // Default: Push notification handler (backward compatibility)
    console.log('📬 Routing to push notification handler (legacy)');
    
    // Inline push notification handler (no external require needed)
    const admin = require('./utils/firebaseAdmin').admin;
    const db = admin.firestore();
    const messaging = admin.messaging();
    
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
    const isGroupChat = conversation?.type === 'group';
    const groupName = conversation?.name || 'Group Chat';

    // Get sender's profile for display name
    const senderRef = db.collection('users').doc(senderId);
    const senderSnap = await senderRef.get();
    const senderName = senderSnap.exists ? (senderSnap.data()?.displayName || 'Someone') : 'Someone';
    
    const notificationTitle = isGroupChat ? `${groupName} - ${senderName}` : senderName;

    // Find recipients (all participants except sender)
    const recipientIds = participants.filter(id => id !== senderId);

    if (recipientIds.length === 0) {
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
    const allTokens = [];
    recipientTokens.forEach(({ tokens }) => {
      allTokens.push(...tokens);
    });

    if (allTokens.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No push tokens found' })
      };
    }

    // Send FCM notifications
    const fcmTokens = allTokens.filter(token => !token.startsWith('ExponentPushToken'));
    let successCount = 0;
    let failureCount = 0;

    if (fcmTokens.length > 0) {
      const fcmResponse = await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: notificationTitle,
          body: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
        },
        data: {
          screen: 'Chat',
          conversationId,
          senderId,
          messageId,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            visibility: 'public',
            defaultSound: true,
            defaultVibrateTimings: true,
          }
        },
      });

      successCount += fcmResponse.successCount;
      failureCount += fcmResponse.failureCount;
      console.log(`✅ FCM sent: ${fcmResponse.successCount} success, ${fcmResponse.failureCount} failed`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notification sent successfully',
        successCount,
        failureCount
      })
    };
    
    
  } catch (error) {
    console.error('❌ Routing error:', error);
    console.error('❌ Error stack:', error.stack);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack, // Show full error for debugging
      }),
    };
  }
};

