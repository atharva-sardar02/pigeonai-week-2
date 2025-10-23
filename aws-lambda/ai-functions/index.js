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

/**
 * Main Lambda Handler
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - HTTP response
 */
exports.handler = async (event) => {
  console.log('📨 Lambda triggered:', JSON.stringify(event.requestContext || {}, null, 2));
  
  // Get the request path
  const path = event.path || event.requestContext?.http?.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  
  console.log(`🔍 Route: ${method} ${path}`);
  
  // Route to appropriate handler based on path
  try {
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
    
    // Default: Push notification handler (backward compatibility)
    console.log('📬 Routing to push notification handler (legacy)');
    const pushNotificationHandler = require('../index'); // Main index.js
    return await pushNotificationHandler.handler(event);
    
  } catch (error) {
    console.error('❌ Routing error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};

