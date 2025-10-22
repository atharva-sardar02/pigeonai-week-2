/**
 * Example Lambda Function Template
 * 
 * This is a template showing how to use all shared utilities.
 * Copy this template when creating new AI Lambda functions.
 */

const { chatCompletion, generateEmbedding } = require('./utils/openaiClient');
const { insertEmbedding, searchSimilar } = require('./utils/opensearchClient');
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

/**
 * Lambda handler
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - API Gateway response
 */
exports.handler = async (event) => {
  // Log invocation
  logInvocation('ExampleFunction', event);

  try {
    // Parse and validate request
    const body = parseBody(event);
    validateRequiredFields(body, ['conversationId', 'messageCount']);

    const { conversationId, messageCount = 50 } = body;

    // Generate cache key
    const cacheKey = summaryCacheKey(conversationId);

    // Check cache first
    const cached = await get(cacheKey);
    if (cached) {
      console.log('✅ Returning cached result');
      return success({
        ...cached,
        cached: true,
      });
    }

    // Perform AI operation with timing
    const { result, duration } = await measureTime(async () => {
      // Example: Generate a summary
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes conversations.',
        },
        {
          role: 'user',
          content: `Summarize the last ${messageCount} messages in this conversation.`,
        },
      ];

      const summary = await chatCompletion(messages, {
        model: 'gpt-4-turbo',
        temperature: 0.7,
        maxTokens: 500,
      });

      return {
        conversationId,
        summary,
        messageCount,
        timestamp: new Date().toISOString(),
      };
    });

    // Cache result
    await set(cacheKey, result);

    // Return response
    return success({
      ...result,
      cached: false,
      duration,
    });

  } catch (err) {
    // Handle specific errors
    if (err.message.includes('Missing required fields')) {
      return badRequest(err.message);
    }

    // Generic error handling
    return internalError(err);
  }
};

