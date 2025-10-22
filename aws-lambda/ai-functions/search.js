/**
 * Semantic Search Lambda Function (PR #18)
 * 
 * Features:
 * - Natural language search queries
 * - Vector similarity search using OpenSearch k-NN
 * - Generates embeddings for search queries
 * - Returns top-K most relevant messages
 * - Redis caching (30-minute TTL)
 * 
 * Persona: Remote Team Professional
 * Use Case: "Find where we discussed database migration strategy"
 */

const openaiClient = require('./utils/openaiClient');
const opensearchClient = require('./utils/opensearchClient');
const cacheClient = require('./utils/cacheClient');
const { success, badRequest, internalError, measureTime } = require('./utils/responseUtils');
const admin = require('./utils/firebaseAdmin');

/**
 * Main handler for semantic search
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} - HTTP response
 */
exports.handler = async (event) => {
  const startTime = Date.now();
  console.log('🔍 Semantic Search Request');

  try {
    // Parse request body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    const { 
      query, 
      conversationId, 
      limit = 5,
      minScore = 0.7,
      forceRefresh = false 
    } = body;

    // Validation
    if (!query || typeof query !== 'string') {
      return badRequest('Missing or invalid "query" parameter');
    }

    if (!conversationId || typeof conversationId !== 'string') {
      return badRequest('Missing or invalid "conversationId" parameter');
    }

    if (query.trim().length === 0) {
      return badRequest('Query cannot be empty');
    }

    if (query.length > 500) {
      return badRequest('Query too long (max 500 characters)');
    }

    console.log(`📝 Query: "${query}"`);
    console.log(`📊 Conversation: ${conversationId}`);
    console.log(`🔢 Limit: ${limit}, Min Score: ${minScore}`);

    // Check cache (unless force refresh)
    if (!forceRefresh) {
      const cacheKey = cacheClient.searchCacheKey(query, conversationId);
      const cached = await cacheClient.get(cacheKey);
      
      if (cached) {
        const duration = Date.now() - startTime;
        console.log(`✅ Cache hit! Returning cached results (${duration}ms)`);
        
        return success({
          results: cached.results,
          query,
          conversationId,
          resultCount: cached.results.length,
          cached: true,
          duration,
        });
      }
      
      console.log('⚠️ Cache miss, proceeding with search');
    }

    // Step 1: Generate embedding for search query
    console.log('🔄 Step 1: Generating query embedding...');
    const embeddingStartTime = Date.now();
    
    const queryEmbedding = await openaiClient.generateEmbedding(query);
    
    const embeddingDuration = Date.now() - embeddingStartTime;
    console.log(`✅ Query embedding generated (${embeddingDuration}ms)`);

    // Step 2: Search OpenSearch for similar message embeddings
    console.log('🔄 Step 2: Searching OpenSearch for similar messages...');
    const searchStartTime = Date.now();
    
    const searchResults = await opensearchClient.searchSimilar(queryEmbedding, {
      k: limit * 2, // Fetch 2x to allow filtering
      conversationId,
      minScore,
    });
    
    const searchDuration = Date.now() - searchStartTime;
    console.log(`✅ Found ${searchResults.length} results (${searchDuration}ms)`);

    // Step 3: Fetch full message details from Firestore
    console.log('🔄 Step 3: Fetching message details from Firestore...');
    const firestoreStartTime = Date.now();
    
    const enrichedResults = await enrichWithFirestoreData(searchResults, conversationId);
    
    const firestoreDuration = Date.now() - firestoreStartTime;
    console.log(`✅ Enriched ${enrichedResults.length} messages (${firestoreDuration}ms)`);

    // Step 4: Limit results
    const finalResults = enrichedResults.slice(0, limit);

    // Cache results
    const cacheKey = cacheClient.searchCacheKey(query, conversationId);
    await cacheClient.set(cacheKey, { results: finalResults }, 1800); // 30-minute TTL
    console.log('💾 Results cached');

    const duration = Date.now() - startTime;
    console.log(`✅ Search complete in ${duration}ms`);
    console.log(`⏱️ Breakdown: Embedding=${embeddingDuration}ms, Search=${searchDuration}ms, Firestore=${firestoreDuration}ms`);

    return success({
      results: finalResults,
      query,
      conversationId,
      resultCount: finalResults.length,
      cached: false,
      duration,
      breakdown: {
        embedding: embeddingDuration,
        search: searchDuration,
        firestore: firestoreDuration,
      },
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    return internalError(error);
  }
};

/**
 * Enrich search results with full message data from Firestore
 * @param {Array} searchResults - Results from OpenSearch
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} - Enriched results
 */
async function enrichWithFirestoreData(searchResults, conversationId) {
  if (searchResults.length === 0) {
    return [];
  }

  try {
    const db = admin.firestore();
    const messagesRef = db.collection('conversations').doc(conversationId).collection('messages');

    // Fetch all messages in parallel
    const messagePromises = searchResults.map(async (result) => {
      try {
        const messageDoc = await messagesRef.doc(result.messageId).get();
        
        if (!messageDoc.exists) {
          console.warn(`⚠️ Message not found: ${result.messageId}`);
          return null;
        }

        const messageData = messageDoc.data();
        
        // Fetch sender name
        let senderName = 'Unknown User';
        if (messageData.senderId) {
          try {
            const userDoc = await db.collection('users').doc(messageData.senderId).get();
            if (userDoc.exists) {
              senderName = userDoc.data().displayName || 'Unknown User';
            }
          } catch (userError) {
            console.warn(`⚠️ Could not fetch user: ${messageData.senderId}`);
          }
        }

        return {
          messageId: result.messageId,
          content: messageData.content || result.text,
          senderId: messageData.senderId,
          senderName,
          timestamp: messageData.timestamp?.toDate?.().toISOString() || result.timestamp,
          score: result.score,
          relevance: calculateRelevancePercentage(result.score),
        };
      } catch (error) {
        console.error(`❌ Error enriching message ${result.messageId}:`, error.message);
        return null;
      }
    });

    const enrichedMessages = await Promise.all(messagePromises);
    
    // Filter out null results and sort by score
    return enrichedMessages
      .filter(msg => msg !== null)
      .sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error('❌ Firestore enrichment error:', error);
    throw error;
  }
}

/**
 * Convert OpenSearch similarity score to percentage (0-100)
 * @param {number} score - Similarity score
 * @returns {number} - Relevance percentage
 */
function calculateRelevancePercentage(score) {
  // OpenSearch k-NN scores are typically in range 0-2
  // Normalize to 0-100%
  const normalized = Math.min(score / 2, 1.0);
  return Math.round(normalized * 100);
}

module.exports = { handler };

