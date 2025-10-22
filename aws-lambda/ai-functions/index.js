/**
 * Main Lambda Handler with Routing
 * 
 * Routes requests to appropriate AI function or push notification handler
 * based on API Gateway path
 */

// AI Function Handlers
const summarizeHandler = require('./summarize');
const actionItemsHandler = require('./actionItems');

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
    
    // Semantic Search (PR #18 - TODO)
    if (path === '/ai/search' || path.endsWith('/ai/search')) {
      return {
        statusCode: 501,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Not Implemented',
          message: 'Semantic search will be implemented in PR #18',
        }),
      };
    }
    
    // Priority Detection (PR #19 - TODO)
    if (path === '/ai/detect-priority' || path.endsWith('/ai/detect-priority')) {
      return {
        statusCode: 501,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Not Implemented',
          message: 'Priority detection will be implemented in PR #19',
        }),
      };
    }
    
    // Decision Tracking (PR #20 - TODO)
    if (path === '/ai/track-decisions' || path.endsWith('/ai/track-decisions')) {
      return {
        statusCode: 501,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Not Implemented',
          message: 'Decision tracking will be implemented in PR #20',
        }),
      };
    }
    
    // Meeting Scheduling (PR #21 - TODO)
    if (path === '/ai/schedule-meeting' || path.endsWith('/ai/schedule-meeting')) {
      return {
        statusCode: 501,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Not Implemented',
          message: 'Meeting scheduling will be implemented in PR #21',
        }),
      };
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

