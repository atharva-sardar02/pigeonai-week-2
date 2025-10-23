/**
 * Redis Cache Client for Lambda Functions
 * 
 * Provides:
 * - Get/Set cached AI responses
 * - Auto-TTL based on cache type
 * - Cache invalidation
 */

const Redis = require('ioredis');

// Check if Redis is configured
const REDIS_ENABLED = !!process.env.REDIS_ENDPOINT;

// Initialize Redis client only if endpoint is configured
let redis = null;

if (REDIS_ENABLED) {
  redis = new Redis({
    host: process.env.REDIS_ENDPOINT,
    port: 6379,
    tls: {}, // Enable TLS for Serverless Valkey
    enableReadyCheck: true,
    maxRetriesPerRequest: 1, // Reduced from 3
    connectTimeout: 3000, // 3 second timeout
    retryStrategy: (times) => {
      if (times > 2) return null; // Stop retrying after 2 attempts
      return Math.min(times * 50, 1000);
    },
    lazyConnect: true,
  });

  // Connection event handlers
  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });
} else {
  console.log('⚠️ Redis not configured - caching disabled');
}

/**
 * TTL Configuration (in seconds)
 */
const TTL = {
  SUMMARY: 3600,        // 1 hour
  ACTION_ITEMS: 7200,   // 2 hours
  SEARCH: 1800,         // 30 minutes
  DECISIONS: 7200,      // 2 hours
  PRIORITY: 3600,       // 1 hour
  MEETING: 7200,        // 2 hours
};

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Parsed value or null
 */
async function get(key) {
  if (!REDIS_ENABLED || !redis) {
    console.log(`⚠️ Cache disabled - skipping get: ${key}`);
    return null;
  }
  
  try {
    const value = await redis.get(key);
    if (!value) {
      console.log(`⚠️ Cache miss: ${key}`);
      return null;
    }
    console.log(`✅ Cache hit: ${key}`);
    return JSON.parse(value);
  } catch (error) {
    console.error(`❌ Cache get error for ${key}:`, error.message);
    return null;
  }
}

/**
 * Set cached value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<boolean>}
 */
async function set(key, value, ttl) {
  if (!REDIS_ENABLED || !redis) {
    console.log(`⚠️ Cache disabled - skipping set: ${key}`);
    return false;
  }
  
  try {
    const serialized = JSON.stringify(value);
    
    // Auto-detect TTL based on key prefix if not provided
    if (!ttl) {
      if (key.startsWith('summary:')) ttl = TTL.SUMMARY;
      else if (key.startsWith('actions:')) ttl = TTL.ACTION_ITEMS;
      else if (key.startsWith('search:')) ttl = TTL.SEARCH;
      else if (key.startsWith('decisions:')) ttl = TTL.DECISIONS;
      else if (key.startsWith('priority:')) ttl = TTL.PRIORITY;
      else if (key.startsWith('meeting:')) ttl = TTL.MEETING;
      else ttl = 3600; // Default 1 hour
    }
    
    await redis.setex(key, ttl, serialized);
    console.log(`✅ Cached: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`❌ Cache set error for ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete cached value
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
async function del(key) {
  try {
    await redis.del(key);
    console.log(`🗑️ Deleted cache: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Cache delete error for ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete all cache entries matching pattern
 * @param {string} pattern - Key pattern (e.g., 'summary:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
async function delPattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Deleted ${keys.length} keys matching: ${pattern}`);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Cache pattern delete error for ${pattern}:`, error.message);
    return 0;
  }
}

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
async function exists(key) {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`❌ Cache exists error for ${key}:`, error.message);
    return false;
  }
}

/**
 * Get remaining TTL for a key
 * @param {string} key - Cache key
 * @returns {Promise<number>} TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
 */
async function ttl(key) {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error(`❌ Cache TTL error for ${key}:`, error.message);
    return -2;
  }
}

/**
 * Ping Redis to check connection
 * @returns {Promise<boolean>}
 */
async function ping() {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('❌ Redis ping failed:', error.message);
    return false;
  }
}

/**
 * Close Redis connection
 */
async function close() {
  await redis.quit();
  console.log('👋 Redis connection closed');
}

/**
 * Generate cache key for conversation summary
 * @param {string} conversationId
 * @returns {string}
 */
function summaryCacheKey(conversationId) {
  return `summary:${conversationId}`;
}

/**
 * Generate cache key for action items
 * @param {string} conversationId
 * @returns {string}
 */
function actionItemsCacheKey(conversationId) {
  return `actions:${conversationId}`;
}

/**
 * Generate cache key for search results
 * @param {string} query
 * @param {string} conversationId
 * @returns {string}
 */
function searchCacheKey(query, conversationId = 'all') {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, '-');
  return `search:${conversationId}:${normalizedQuery}`;
}

/**
 * Generate cache key for priority detection
 * @param {string} conversationId
 * @returns {string}
 */
function priorityCacheKey(conversationId) {
  return `priority:${conversationId}`;
}

/**
 * Generate cache key for decisions
 * @param {string} conversationId
 * @returns {string}
 */
function decisionsCacheKey(conversationId) {
  return `decisions:${conversationId}`;
}

/**
 * Generate cache key for meeting scheduling
 * @param {string} conversationId
 * @param {string} slotId
 * @returns {string}
 */
function meetingCacheKey(conversationId, slotId = 'default') {
  return `meeting:${conversationId}:${slotId}`;
}

module.exports = {
  redis,
  get,
  set,
  del,
  delPattern,
  exists,
  ttl,
  ping,
  close,
  TTL,
  // Cache key generators
  summaryCacheKey,
  actionItemsCacheKey,
  searchCacheKey,
  priorityCacheKey,
  decisionsCacheKey,
  meetingCacheKey,
};

