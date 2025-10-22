/**
 * Priority Detection Lambda Function
 * 
 * Automatically detects and classifies message urgency/priority for distributed teams.
 * Uses GPT-3.5-turbo for speed (real-time classification).
 * 
 * Features:
 * - Real-time priority classification (high/medium/low)
 * - Context-aware analysis (considers recent messages)
 * - Fast response (<1s with GPT-3.5)
 * - No caching (priorities depend on real-time context)
 * 
 * Endpoint: POST /ai/detect-priority
 * 
 * Request Body:
 * {
 *   "conversationId": "string",
 *   "messageContent": "string",
 *   "messageId": "string" (optional),
 *   "senderName": "string" (optional),
 *   "conversationType": "dm" | "group" (optional),
 *   "includeContext": boolean (optional, default: true)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "priority": "high" | "medium" | "low",
 *   "metadata": {
 *     "label": "High Priority",
 *     "color": "#EF4444",
 *     "icon": "🔴",
 *     "description": "Urgent - needs immediate attention"
 *   },
 *   "confidence": 0.95,
 *   "processingTime": 850
 * }
 */

const { openaiClient } = require('../utils/openaiClient');
const { firestoreClient } = require('../utils/firestoreClient');
const { responseUtils } = require('../utils/responseUtils');
const {
  generatePriorityPrompt,
  getSystemPrompt,
  validatePriorityResponse,
  getPriorityMetadata,
} = require('../prompts/priorityDetection');

/**
 * Detect message priority
 * @param {Object} event - Lambda event object
 * @returns {Object} API Gateway response
 */
async function detectPriority(event) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const {
      conversationId,
      messageContent,
      messageId,
      senderName,
      conversationType,
      includeContext = true,
    } = body;
    
    // Validate required fields
    if (!conversationId || !messageContent) {
      return responseUtils.error(
        'Missing required fields: conversationId, messageContent',
        400
      );
    }
    
    // Validate message content length
    if (messageContent.trim().length === 0) {
      return responseUtils.error('Message content cannot be empty', 400);
    }
    
    if (messageContent.length > 2000) {
      return responseUtils.error('Message content too long (max 2000 characters)', 400);
    }
    
    console.log(`🎯 Detecting priority for message in conversation ${conversationId}`);
    
    // Fetch recent messages for context (if enabled)
    let recentMessages = [];
    if (includeContext) {
      try {
        recentMessages = await fetchRecentMessages(conversationId, 3);
        console.log(`📚 Fetched ${recentMessages.length} recent messages for context`);
      } catch (error) {
        console.warn('⚠️ Failed to fetch context, proceeding without it:', error.message);
        // Continue without context
      }
    }
    
    // Generate prompt
    const context = {
      senderName,
      conversationType,
      recentMessages,
    };
    
    const userPrompt = generatePriorityPrompt(messageContent, context);
    const systemPrompt = getSystemPrompt();
    
    console.log(`🤖 Calling OpenAI GPT-3.5-turbo for priority detection...`);
    
    // Call OpenAI with GPT-3.5-turbo (fast and cheap for real-time classification)
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for consistent classification
      max_tokens: 10, // Only need one word response
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    
    const rawResponse = completion.choices[0].message.content;
    console.log(`✅ OpenAI response: "${rawResponse}"`);
    
    // Validate and normalize response
    const priority = validatePriorityResponse(rawResponse);
    console.log(`🎯 Detected priority: ${priority}`);
    
    // Get priority metadata
    const metadata = getPriorityMetadata(priority);
    
    // Calculate confidence (based on token probability if available)
    const confidence = 0.95; // Placeholder - GPT-3.5 doesn't return probabilities
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Processing time: ${processingTime}ms`);
    
    // Return response
    return responseUtils.success({
      priority,
      metadata,
      confidence,
      processingTime,
      cached: false,
    });
    
  } catch (error) {
    console.error('❌ Error in detectPriority:', error);
    
    if (error.code === 'insufficient_quota') {
      return responseUtils.error('OpenAI API quota exceeded', 503);
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return responseUtils.error('Rate limit exceeded, please try again later', 429);
    }
    
    if (error.response?.status === 401) {
      return responseUtils.error('OpenAI API authentication failed', 500);
    }
    
    return responseUtils.error(
      `Failed to detect priority: ${error.message}`,
      500
    );
  }
}

/**
 * Fetch recent messages from Firestore for context
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of recent messages to fetch
 * @returns {Promise<Array>} Recent messages
 */
async function fetchRecentMessages(conversationId, limit = 3) {
  try {
    const messagesRef = firestoreClient
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const snapshot = await messagesRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        content: data.content,
        senderId: data.senderId,
        senderName: data.senderName || 'Unknown',
        timestamp: data.timestamp,
      });
    });
    
    // Reverse to chronological order (oldest first)
    return messages.reverse();
    
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    throw error;
  }
}

/**
 * Batch detect priority for multiple messages
 * @param {Object} event - Lambda event object
 * @returns {Object} API Gateway response
 */
async function batchDetectPriority(event) {
  const startTime = Date.now();
  
  try {
    const body = JSON.parse(event.body || '{}');
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return responseUtils.error('Missing or invalid messages array', 400);
    }
    
    if (messages.length === 0) {
      return responseUtils.error('Messages array cannot be empty', 400);
    }
    
    if (messages.length > 50) {
      return responseUtils.error('Maximum 50 messages per batch', 400);
    }
    
    console.log(`🎯 Batch detecting priority for ${messages.length} messages`);
    
    // Process messages in parallel (with concurrency limit)
    const CONCURRENCY_LIMIT = 5;
    const results = [];
    
    for (let i = 0; i < messages.length; i += CONCURRENCY_LIMIT) {
      const batch = messages.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map(msg => 
        detectPriority({
          body: JSON.stringify({
            conversationId: msg.conversationId,
            messageContent: msg.content,
            messageId: msg.id,
            senderName: msg.senderName,
            conversationType: msg.conversationType,
            includeContext: false, // Skip context in batch mode for speed
          }),
        }).then(response => ({
          messageId: msg.id,
          ...JSON.parse(response.body),
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Batch processing time: ${processingTime}ms`);
    
    return responseUtils.success({
      results,
      totalMessages: messages.length,
      processingTime,
    });
    
  } catch (error) {
    console.error('❌ Error in batchDetectPriority:', error);
    return responseUtils.error(
      `Failed to batch detect priority: ${error.message}`,
      500
    );
  }
}

module.exports = {
  detectPriority,
  batchDetectPriority,
};

