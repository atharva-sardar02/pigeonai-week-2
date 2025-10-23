/**
 * Decision Tracking Lambda Function
 * 
 * Automatically identifies and tracks agreed-upon technical decisions
 * for distributed teams working remotely.
 * 
 * Use Case: Remote Team Professional persona
 * - Track architectural decisions made in chat
 * - Create audit trail of technical choices
 * - Link decisions to source messages
 * 
 * Model: OpenAI GPT-4-turbo (high accuracy for decision identification)
 * Caching: Redis (2 hour TTL)
 * Response Time Target: <2 seconds
 */

const { chatCompletion } = require('./utils/openaiClient');
const { get: cacheGet, set: cacheSet, decisionsCacheKey } = require('./utils/cacheClient');
const responseUtils = require('./utils/responseUtils');
const { admin } = require('./utils/firebaseAdmin'); // Destructure admin from exports
const { DECISION_TRACKING_PROMPT } = require('./prompts/decisionTracking');

const db = admin.firestore();

/**
 * Main handler for decision tracking
 * 
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.handler = async (event) => {
  const startTime = Date.now();
  console.log('🧠 Decision Tracking Lambda invoked');

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { conversationId, userId, limit = 100 } = body;

    // Validate inputs
    if (!conversationId) {
      return responseUtils.error('conversationId is required', 400);
    }

    if (!userId) {
      return responseUtils.error('userId is required', 400);
    }

    // Generate cache key
    const cacheKey = `decisions:${conversationId}:${limit}`;
    console.log(`📦 Cache key: ${cacheKey}`);

    // Check cache first
    const cachedDecisions = await cacheGet(cacheKey);
    if (cachedDecisions) {
      console.log('✅ Cache hit - returning cached decisions');
      const duration = Date.now() - startTime;
      return responseUtils.success({
        decisions: cachedDecisions,
        cached: true,
        messageCount: cachedDecisions.length,
        duration,
      });
    }

    console.log('❌ Cache miss - fetching messages from Firestore');

    // Fetch messages from Firestore
    const messages = await fetchMessages(conversationId, limit);
    console.log(`📨 Fetched ${messages.length} messages`);

    if (messages.length === 0) {
      return responseUtils.success({
        decisions: [],
        cached: false,
        messageCount: 0,
        duration: Date.now() - startTime,
      });
    }

    // Format messages for GPT-4
    const formattedMessages = await formatMessagesForAI(messages);

    // Call OpenAI to extract decisions
    console.log('🤖 Calling OpenAI GPT-4 for decision tracking...');
    const decisions = await extractDecisions(formattedMessages, conversationId);

    console.log(`✅ Extracted ${decisions.length} decisions`);

    // Cache the results (2 hour TTL)
    await cacheSet(cacheKey, decisions, 7200); // 2 hours = 7200 seconds
    console.log('💾 Decisions cached for 2 hours');

    const duration = Date.now() - startTime;
    console.log(`⏱️ Request completed in ${duration}ms`);

    return responseUtils.success({
      decisions,
      cached: false,
      messageCount: messages.length,
      duration,
    });

  } catch (error) {
    console.error('❌ Error in decision tracking:', error);
    return responseUtils.error(
      'Failed to track decisions',
      500,
      { message: error.message }
    );
  }
};

/**
 * Fetch messages from Firestore conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Maximum number of messages to fetch
 * @returns {Promise<Array>} Array of message objects
 */
async function fetchMessages(conversationId, limit) {
  try {
    const db = admin.firestore();
    const messagesRef = db
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await messagesRef.get();

    if (snapshot.empty) {
      console.log('⚠️ No messages found in conversation');
      return [];
    }

    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        type: data.type || 'text',
      });
    });

    // Reverse to get chronological order (oldest first)
    return messages.reverse();

  } catch (error) {
    console.error('❌ Error fetching messages from Firestore:', error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Format messages for AI processing
 * Fetches sender names from Firestore users collection
 * 
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} Formatted messages string
 */
async function formatMessagesForAI(messages) {
  try {
    const db = admin.firestore();
    
    // Get unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.senderId))];
    
    // Fetch sender names
    const senderNames = {};
    for (const senderId of senderIds) {
      try {
        const userDoc = await db.collection('users').doc(senderId).get();
        if (userDoc.exists) {
          senderNames[senderId] = userDoc.data().displayName || 'Unknown User';
        } else {
          senderNames[senderId] = 'Unknown User';
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch user ${senderId}:`, error.message);
        senderNames[senderId] = 'Unknown User';
      }
    }

    // Format messages with timestamps and sender names
    const formatted = messages
      .filter(m => m.type === 'text' && m.content) // Only text messages
      .map(m => {
        const timestamp = m.timestamp.toISOString();
        const senderName = senderNames[m.senderId] || 'Unknown User';
        return `[${timestamp}] ${senderName}: ${m.content}`;
      })
      .join('\n');

    return formatted;

  } catch (error) {
    console.error('❌ Error formatting messages:', error);
    throw new Error(`Failed to format messages: ${error.message}`);
  }
}

/**
 * Extract decisions from conversation using OpenAI GPT-4
 * 
 * @param {string} formattedMessages - Formatted conversation messages
 * @param {string} conversationId - Conversation ID for reference
 * @returns {Promise<Array>} Array of decision objects
 */
async function extractDecisions(formattedMessages, conversationId) {
  try {
    const messages = [
      {
        role: 'system',
        content: DECISION_TRACKING_PROMPT,
      },
      {
        role: 'user',
        content: `CONVERSATION:\n\n${formattedMessages}\n\nReturn decisions as JSON array.`,
      },
    ];

    const response = await chatCompletion(messages, {
      model: 'gpt-4-turbo',
      temperature: 0.3,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    console.log('🤖 OpenAI response received');

    // chatCompletion already parses JSON when responseFormat is set
    const parsed = response;

    // Handle both array and object responses
    const decisionsArray = Array.isArray(parsed) ? parsed : (parsed.decisions || []);

    // Validate and enrich decisions
    const decisions = decisionsArray.map((decision, index) => ({
      id: `decision_${Date.now()}_${index}`,
      decision: decision.decision || 'Unknown decision',
      context: decision.context || '',
      participants: Array.isArray(decision.participants) ? decision.participants : [],
      timestamp: decision.timestamp || new Date().toISOString(),
      conversationId,
      messageIds: Array.isArray(decision.messageIds) ? decision.messageIds : [],
      confidence: decision.confidence || 'medium',
      alternatives: Array.isArray(decision.alternatives) ? decision.alternatives : [],
      createdAt: new Date().toISOString(),
    }));

    console.log(`✅ Validated ${decisions.length} decisions`);

    return decisions;

  } catch (error) {
    console.error('❌ Error calling OpenAI:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Health check endpoint
 */
exports.healthCheck = () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      service: 'decision-tracking',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }),
  };
};

