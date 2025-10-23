/**
 * Message Embedding Generator (PR #18)
 * 
 * Background job to generate embeddings for new messages
 * Stores embeddings in OpenSearch for semantic search
 * 
 * Trigger: Called when new message is created
 * Model: OpenAI text-embedding-3-small (1536 dimensions)
 */

const openaiClient = require('./utils/openaiClient');
const opensearchClient = require('./utils/opensearchClient');
const { admin } = require('./utils/firebaseAdmin');
const { success, badRequest, internalError } = require('./utils/responseUtils');

/**
 * Generate and store embedding for a message
 * @param {Object} event - API Gateway event or direct invocation
 * @returns {Promise<Object>} - HTTP response
 */
exports.handler = async (event) => {
  const startTime = Date.now();
  console.log('🔄 Embedding Generation Request');

  try {
    // Parse request body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    const { messageId, conversationId, content, senderId } = body;

    // Validation
    if (!messageId || typeof messageId !== 'string') {
      return badRequest('Missing or invalid "messageId" parameter');
    }

    if (!conversationId || typeof conversationId !== 'string') {
      return badRequest('Missing or invalid "conversationId" parameter');
    }

    if (!content || typeof content !== 'string') {
      return badRequest('Missing or invalid "content" parameter');
    }

    if (content.trim().length === 0) {
      return badRequest('Content cannot be empty');
    }

    if (content.length > 10000) {
      console.log('⚠️ Content too long, truncating to 10000 characters');
    }

    console.log(`📝 Message ID: ${messageId}`);
    console.log(`📊 Conversation: ${conversationId}`);
    console.log(`📏 Content length: ${content.length} characters`);

    // Truncate content if too long (OpenAI has token limits)
    const truncatedContent = content.slice(0, 10000);

    // Step 1: Generate embedding
    console.log('🔄 Step 1: Generating embedding...');
    const embeddingStartTime = Date.now();
    
    const embedding = await openaiClient.generateEmbedding(truncatedContent);
    
    const embeddingDuration = Date.now() - embeddingStartTime;
    console.log(`✅ Embedding generated (${embeddingDuration}ms, ${embedding.length} dimensions)`);

    // Step 2: Store in OpenSearch
    console.log('🔄 Step 2: Storing embedding in OpenSearch...');
    const storeStartTime = Date.now();
    
    await opensearchClient.insertEmbedding(
      messageId,
      conversationId,
      truncatedContent,
      embedding,
      {
        senderId,
        contentLength: content.length,
      }
    );
    
    const storeDuration = Date.now() - storeStartTime;
    console.log(`✅ Embedding stored (${storeDuration}ms)`);

    const duration = Date.now() - startTime;
    console.log(`✅ Embedding generation complete in ${duration}ms`);

    return success({
      messageId,
      conversationId,
      embeddingDimensions: embedding.length,
      duration,
      breakdown: {
        embedding: embeddingDuration,
        storage: storeDuration,
      },
    });

  } catch (error) {
    console.error('❌ Embedding generation error:', error);
    return internalError(error);
  }
};

/**
 * Batch generate embeddings for multiple messages
 * Useful for backfilling existing messages
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - HTTP response
 */
exports.batchHandler = async (event) => {
  const startTime = Date.now();
  console.log('🔄 Batch Embedding Generation Request');

  try {
    // Parse request body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    const { conversationId, messageLimit = 100 } = body;

    if (!conversationId) {
      return badRequest('Missing "conversationId" parameter');
    }

    console.log(`📊 Conversation: ${conversationId}`);
    console.log(`🔢 Message limit: ${messageLimit}`);

    // Fetch messages from Firestore
    const db = admin.firestore();
    const messagesRef = db.collection('conversations').doc(conversationId).collection('messages');
    
    const snapshot = await messagesRef
      .orderBy('timestamp', 'desc')
      .limit(messageLimit)
      .get();

    if (snapshot.empty) {
      return success({
        conversationId,
        processed: 0,
        message: 'No messages found',
        duration: Date.now() - startTime,
      });
    }

    console.log(`📬 Found ${snapshot.size} messages`);

    // Process messages in parallel (batch of 10 at a time to avoid rate limits)
    const messages = snapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data(),
    }));

    const batchSize = 10;
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messages.length / batchSize)}`);

      const batchResults = await Promise.allSettled(
        batch.map(async (message) => {
          if (!message.content || message.content.trim().length === 0) {
            console.log(`⏭️ Skipping empty message: ${message.messageId}`);
            return null;
          }

          try {
            const embedding = await openaiClient.generateEmbedding(message.content);
            await opensearchClient.insertEmbedding(
              message.messageId,
              conversationId,
              message.content,
              embedding,
              {
                senderId: message.senderId,
                contentLength: message.content.length,
              }
            );
            return { success: true, messageId: message.messageId };
          } catch (error) {
            console.error(`❌ Failed to process message ${message.messageId}:`, error.message);
            return { success: false, messageId: message.messageId, error: error.message };
          }
        })
      );

      // Count results
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value && result.value.success) {
          processed++;
        } else if (result.status === 'fulfilled' && result.value === null) {
          // Skipped empty message, don't count as failure
        } else {
          failed++;
        }
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Batch complete: ${processed} processed, ${failed} failed (${duration}ms)`);

    return success({
      conversationId,
      processed,
      failed,
      total: messages.length,
      duration,
    });

  } catch (error) {
    console.error('❌ Batch embedding generation error:', error);
    return internalError(error);
  }
};

module.exports = { 
  handler: exports.handler,
  batchHandler: exports.batchHandler,
};

