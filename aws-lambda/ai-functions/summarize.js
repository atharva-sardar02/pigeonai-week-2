/**
 * Lambda Function: Conversation Summarization
 * 
 * Provides AI-powered thread summarization for Remote Team Professional persona.
 * Focuses on decisions, action items, blockers, and technical details.
 */

const { admin } = require('./utils/firebaseAdmin'); // Destructure admin from exports
const { chatCompletion } = require('./utils/openaiClient');
const { get, set, summaryCacheKey } = require('./utils/cacheClient');
const {
  success,
  badRequest,
  internalError,
  parseBody,
  validateRequiredFields,
  logInvocation,
  measureTime,
} = require('./utils/responseUtils');
const { getSummarizationPrompt, getQuickSummaryPrompt } = require('./prompts/summarization');

const db = admin.firestore();

/**
 * Fetch messages from Firestore
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Array>} - Array of messages
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

    return messages.filter(msg => msg.type === 'text' && msg.content); // Only text messages with content
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Generate summary using OpenAI
 * @param {Array} messages - Array of messages
 * @param {number} messageCount - Number of messages
 * @returns {Promise<string>} - Generated summary
 */
async function generateSummary(messages, messageCount) {
  try {
    // For very short conversations, use quick summary
    if (messageCount < 10) {
      const promptMessages = getQuickSummaryPrompt(messages, messageCount);
      const summary = await chatCompletion(promptMessages, {
        model: 'gpt-4o-mini',
        temperature: 0.5,
        maxTokens: 200,
      });
      return `📋 Quick Summary\n\n${summary}`;
    }

    // For longer conversations, use full structured summary
    const promptMessages = getSummarizationPrompt(messages, messageCount);
    const summary = await chatCompletion(promptMessages, {
      model: 'gpt-4-turbo',
      temperature: 0.3, // Lower temperature for more factual summaries
      maxTokens: 1000,
    });

    return summary;
  } catch (error) {
    console.error('❌ Error generating summary:', error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

/**
 * Lambda handler
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - API Gateway response
 */
exports.handler = async (event) => {
  logInvocation('SummarizeConversation', event);

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

    // Generate cache key (includes limit for cache busting)
    const cacheKey = `${summaryCacheKey(conversationId)}:${limit}`;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await get(cacheKey);
      if (cached) {
        console.log('✅ Returning cached summary');
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

      // Generate summary using OpenAI
      console.log(`🤖 Generating summary with GPT-4...`);
      const summary = await generateSummary(messages, actualCount);

      return {
        summary,
        conversationId,
        messageCount: actualCount,
        requestedLimit: limit,
        generatedAt: new Date().toISOString(),
      };
    });

    console.log(`⏱️ Summary generated in ${duration}ms`);

    // Cache result (1 hour TTL)
    await set(cacheKey, result);

    // Return response
    return success({
      ...result,
      cached: false,
      duration,
    });

  } catch (err) {
    console.error('❌ Error in summarize handler:', err.message);

    // Handle specific errors
    if (err.message.includes('Missing required fields')) {
      return badRequest(err.message);
    }

    if (err.message.includes('No messages found')) {
      return badRequest('Conversation has no messages to summarize');
    }

    if (err.message.includes('Failed to fetch messages')) {
      return internalError('Could not access conversation data', err);
    }

    if (err.message.includes('Failed to generate summary')) {
      return internalError('AI service temporarily unavailable', err);
    }

    // Generic error handling
    return internalError(err);
  }
};

