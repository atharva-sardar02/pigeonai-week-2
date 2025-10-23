/**
 * Lambda Function: Action Item Extraction
 * 
 * Extracts structured action items from conversations for Remote Team Professional persona.
 * Returns tasks with assignees, deadlines, priorities, and dependencies.
 */

const { admin } = require('./utils/firebaseAdmin'); // Destructure admin from exports
const { chatCompletion } = require('./utils/openaiClient');
const { get, set, actionItemsCacheKey } = require('./utils/cacheClient');
const {
  success,
  badRequest,
  internalError,
  parseBody,
  validateRequiredFields,
  logInvocation,
  measureTime,
} = require('./utils/responseUtils');
const { getActionItemPrompt } = require('./prompts/actionItems');

const db = admin.firestore();

/**
 * Fetch messages from Firestore
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Array>} - Array of messages with IDs
 */
async function fetchMessages(conversationId, limit = 100) {
  try {
    const messagesRef = db
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await messagesRef.get();
    
    if (snapshot.empty) {
      return [];
    }

    // Reverse to get chronological order (oldest first)
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.unshift({
        id: doc.id,
        content: data.content,
        senderId: data.senderId,
        senderName: data.senderName || 'Unknown User',
        timestamp: data.timestamp?.toDate?.() || new Date(),
        type: data.type || 'text',
      });
    });

    return messages.filter(msg => msg.type === 'text' && msg.content);
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Extract action items using OpenAI with structured output
 * @param {Array} messages - Array of messages
 * @returns {Promise<Array>} - Array of action items
 */
async function extractActionItems(messages) {
  try {
    const currentDate = new Date().toISOString();
    const promptMessages = getActionItemPrompt(messages, currentDate);

    // Use JSON mode for structured output
    const result = await chatCompletion(promptMessages, {
      model: 'gpt-4-turbo',
      temperature: 0.2, // Low temperature for consistent structured output
      maxTokens: 2000,
      responseFormat: 'json', // Enable JSON mode
    });

    // Parse the JSON response
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const actionItems = parsed.actionItems || [];

    console.log(`✅ Extracted ${actionItems.length} action items`);
    return actionItems;

  } catch (error) {
    console.error('❌ Error extracting action items:', error.message);
    throw new Error(`Failed to extract action items: ${error.message}`);
  }
}

/**
 * Lambda handler
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - API Gateway response
 */
exports.handler = async (event) => {
  logInvocation('ExtractActionItems', event);

  try {
    // Parse and validate request
    const body = parseBody(event);
    validateRequiredFields(body, ['conversationId']);

    const { 
      conversationId, 
      messageLimit,
      messageCount, // Backwards compatibility with frontend
      forceRefresh = false,
    } = body;

    // Accept both messageLimit and messageCount (backwards compatible)
    const messageLimitValue = messageLimit || messageCount || 100;

    // Validate message limit (max 200 to avoid token limits)
    const limit = Math.min(Math.max(messageLimitValue, 1), 200);

    // Generate cache key
    const cacheKey = `${actionItemsCacheKey(conversationId)}:${limit}`;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await get(cacheKey);
      if (cached) {
        console.log('✅ Returning cached action items');
        return success({
          ...cached,
          cached: true,
        });
      }
    }

    // Measure performance
    const { result, duration } = await measureTime(async () => {
      // Fetch messages from Firestore
      console.log(`📥 Fetching last ${limit} messages from conversation ${conversationId}`);
      const messages = await fetchMessages(conversationId, limit);

      if (messages.length === 0) {
        throw new Error('No messages found in conversation');
      }

      const actualCount = messages.length;
      console.log(`✅ Fetched ${actualCount} messages`);

      // Extract action items using OpenAI
      console.log(`🤖 Extracting action items with GPT-4...`);
      const actionItems = await extractActionItems(messages);

      return {
        actionItems,
        conversationId,
        messageCount: actualCount,
        requestedLimit: limit,
        extractedAt: new Date().toISOString(),
        totalItems: actionItems.length,
        breakdown: {
          high: actionItems.filter(item => item.priority === 'high').length,
          medium: actionItems.filter(item => item.priority === 'medium').length,
          low: actionItems.filter(item => item.priority === 'low').length,
          assigned: actionItems.filter(item => item.assignee && item.assignee !== 'Unassigned').length,
          unassigned: actionItems.filter(item => !item.assignee || item.assignee === 'Unassigned').length,
        },
      };
    });

    console.log(`⏱️ Action items extracted in ${duration}ms`);

    // Cache result (2 hour TTL)
    await set(cacheKey, result);

    // Return response
    return success({
      ...result,
      cached: false,
      duration,
    });

  } catch (err) {
    console.error('❌ Error in action items handler:', err.message);

    // Handle specific errors
    if (err.message.includes('Missing required fields')) {
      return badRequest(err.message);
    }

    if (err.message.includes('No messages found')) {
      return badRequest('Conversation has no messages to analyze');
    }

    if (err.message.includes('Failed to fetch messages')) {
      return internalError('Could not access conversation data', err);
    }

    if (err.message.includes('Failed to extract action items')) {
      return internalError('AI service temporarily unavailable', err);
    }

    // Generic error handling
    return internalError(err);
  }
};

