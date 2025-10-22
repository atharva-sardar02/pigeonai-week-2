/**
 * Redis Client for AI Response Caching
 * 
 * Purpose:
 * - Cache AI responses to reduce OpenAI API costs
 * - Store conversation summaries, action items, search results, decisions
 * - TTL-based expiration for different types of cached data
 * 
 * Usage:
 * const cache = require('./redisClient');
 * await cache.set('summary:conv123', data, 3600); // 1 hour
 * const result = await cache.get('summary:conv123');
 */

const Redis = require('ioredis');

// Redis configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_ENDPOINT || 'pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com',
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined, // Serverless Valkey doesn't require password by default
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on readonly errors
    }
    return false;
  },
};

// Create Redis client
const redis = new Redis(REDIS_CONFIG);

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('ready', () => {
  console.log('🟢 Redis ready');
});

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
 * Set cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (optional, defaults based on key prefix)
 */
async function set(key, value, ttl) {
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
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any} Parsed value or null if not found/expired
 */
async function get(key) {
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
 * Delete cache entry
 * @param {string} key - Cache key
 */
async function del(key) {
  try {
    await redis.del(key);
    console.log(`🗑️ Deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Cache delete error for ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete all cache entries matching pattern
 * @param {string} pattern - Key pattern (e.g., 'summary:*')
 */
async function delPattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Deleted ${keys.length} keys matching: ${pattern}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Cache pattern delete error for ${pattern}:`, error.message);
    return false;
  }
}

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {boolean}
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
 * @returns {number} TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
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
 * @returns {boolean}
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

module.exports = {
  redis,
  set,
  get,
  del,
  delPattern,
  exists,
  ttl,
  ping,
  close,
  TTL,
};

