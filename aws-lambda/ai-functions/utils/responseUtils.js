/**
 * Response Utilities for Lambda Functions
 * 
 * Provides standardized HTTP responses for API Gateway
 */

/**
 * CORS headers for all responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Success response
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} - Lambda response object
 */
function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      data,
    }),
  };
}

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} details - Additional error details
 * @returns {Object} - Lambda response object
 */
function error(message, statusCode = 500, details = null) {
  const body = {
    success: false,
    error: message,
  };

  if (details) {
    body.details = details;
  }

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

/**
 * Bad request response (400)
 * @param {string} message - Error message
 * @returns {Object} - Lambda response object
 */
function badRequest(message) {
  return error(message, 400);
}

/**
 * Unauthorized response (401)
 * @param {string} message - Error message
 * @returns {Object} - Lambda response object
 */
function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}

/**
 * Not found response (404)
 * @param {string} message - Error message
 * @returns {Object} - Lambda response object
 */
function notFound(message = 'Not found') {
  return error(message, 404);
}

/**
 * Internal server error response (500)
 * @param {Error} err - Error object
 * @returns {Object} - Lambda response object
 */
function internalError(err) {
  console.error('❌ Internal error:', err);
  return error(
    'Internal server error',
    500,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
}

/**
 * Parse JSON body from API Gateway event
 * @param {Object} event - API Gateway event
 * @returns {Object} - Parsed body
 * @throws {Error} - If body is invalid JSON
 */
function parseBody(event) {
  try {
    if (!event.body) {
      throw new Error('Request body is empty');
    }
    return JSON.parse(event.body);
  } catch (err) {
    throw new Error(`Invalid JSON body: ${err.message}`);
  }
}

/**
 * Validate required fields in body
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Required field names
 * @throws {Error} - If any required field is missing
 */
function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter(field => !(field in body) || body[field] === null || body[field] === undefined);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Extract user ID from event (from authorizer or query params)
 * @param {Object} event - API Gateway event
 * @returns {string|null} - User ID or null
 */
function getUserId(event) {
  // Try authorizer context first
  if (event.requestContext?.authorizer?.userId) {
    return event.requestContext.authorizer.userId;
  }
  
  // Try query parameters
  if (event.queryStringParameters?.userId) {
    return event.queryStringParameters.userId;
  }
  
  // Try body
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      if (body.userId) {
        return body.userId;
      }
    } catch (err) {
      // Ignore parse errors
    }
  }
  
  return null;
}

/**
 * Log Lambda invocation
 * @param {string} functionName - Function name
 * @param {Object} event - API Gateway event
 */
function logInvocation(functionName, event) {
  console.log(`🚀 ${functionName} invoked`);
  console.log(`   Method: ${event.httpMethod || event.requestContext?.http?.method}`);
  console.log(`   Path: ${event.path || event.requestContext?.http?.path}`);
  console.log(`   Source IP: ${event.requestContext?.identity?.sourceIp}`);
  
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      console.log(`   Body keys: ${Object.keys(body).join(', ')}`);
    } catch (err) {
      console.log(`   Body: ${event.body.substring(0, 100)}...`);
    }
  }
}

/**
 * Measure execution time
 * @param {Function} fn - Async function to measure
 * @returns {Promise<{result: any, duration: number}>}
 */
async function measureTime(fn) {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  
  console.log(`⏱️ Execution time: ${duration}ms`);
  
  return { result, duration };
}

module.exports = {
  CORS_HEADERS,
  success,
  error,
  badRequest,
  unauthorized,
  notFound,
  internalError,
  parseBody,
  validateRequiredFields,
  getUserId,
  logInvocation,
  measureTime,
};

