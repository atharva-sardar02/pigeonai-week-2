/**
 * OpenSearch Client for Lambda Functions
 * 
 * Provides:
 * - Vector search (k-NN)
 * - Insert embeddings
 * - Semantic search
 */

const { Client } = require('@opensearch-project/opensearch');

// Initialize OpenSearch client
const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false, // For self-signed certs
  },
});

const INDEX_NAME = 'message_embeddings';

/**
 * Insert message embedding
 * @param {string} messageId - Message ID
 * @param {string} conversationId - Conversation ID
 * @param {string} text - Message text
 * @param {Array<number>} embedding - Embedding vector (1536 dimensions)
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - Insert response
 */
async function insertEmbedding(messageId, conversationId, text, embedding, metadata = {}) {
  try {
    const document = {
      messageId,
      conversationId,
      text,
      embedding,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    const response = await client.index({
      index: INDEX_NAME,
      id: messageId,
      body: document,
      refresh: true, // Make available for search immediately
    });

    console.log(`✅ Inserted embedding: ${messageId}`);
    return response.body;
  } catch (error) {
    console.error('❌ Insert embedding error:', error.message);
    throw error;
  }
}

/**
 * Search for similar messages using k-NN
 * @param {Array<number>} queryEmbedding - Query embedding vector
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
async function searchSimilar(queryEmbedding, options = {}) {
  try {
    const {
      k = 10,
      conversationId = null,
      minScore = 0.7,
    } = options;

    // Build k-NN query
    const query = {
      knn: {
        embedding: {
          vector: queryEmbedding,
          k,
        },
      },
    };

    // Add conversation filter if provided
    const filter = conversationId ? [
      { term: { conversationId } },
    ] : [];

    const response = await client.search({
      index: INDEX_NAME,
      body: {
        size: k,
        query: filter.length > 0 ? {
          bool: {
            must: [query],
            filter,
          },
        } : query,
        _source: ['messageId', 'conversationId', 'text', 'timestamp'],
      },
    });

    // Format results
    const results = response.body.hits.hits
      .map(hit => ({
        messageId: hit._source.messageId,
        conversationId: hit._source.conversationId,
        text: hit._source.text,
        timestamp: hit._source.timestamp,
        score: hit._score,
      }))
      .filter(result => result.score >= minScore);

    console.log(`✅ Found ${results.length} similar messages (k=${k})`);
    return results;
  } catch (error) {
    console.error('❌ Search error:', error.message);
    throw error;
  }
}

/**
 * Delete embedding
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Delete response
 */
async function deleteEmbedding(messageId) {
  try {
    const response = await client.delete({
      index: INDEX_NAME,
      id: messageId,
    });

    console.log(`🗑️ Deleted embedding: ${messageId}`);
    return response.body;
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ Embedding not found: ${messageId}`);
      return null;
    }
    console.error('❌ Delete embedding error:', error.message);
    throw error;
  }
}

/**
 * Delete all embeddings for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<number>} - Number of deleted documents
 */
async function deleteConversationEmbeddings(conversationId) {
  try {
    const response = await client.deleteByQuery({
      index: INDEX_NAME,
      body: {
        query: {
          term: { conversationId },
        },
      },
    });

    const deleted = response.body.deleted || 0;
    console.log(`🗑️ Deleted ${deleted} embeddings for conversation: ${conversationId}`);
    return deleted;
  } catch (error) {
    console.error('❌ Delete conversation embeddings error:', error.message);
    throw error;
  }
}

/**
 * Check if index exists
 * @returns {Promise<boolean>}
 */
async function indexExists() {
  try {
    const response = await client.indices.exists({ index: INDEX_NAME });
    return response.body;
  } catch (error) {
    console.error('❌ Index exists check error:', error.message);
    return false;
  }
}

/**
 * Get index stats
 * @returns {Promise<Object>}
 */
async function getIndexStats() {
  try {
    const response = await client.indices.stats({ index: INDEX_NAME });
    const stats = response.body.indices[INDEX_NAME];
    
    return {
      documentCount: stats.total.docs.count,
      storageSize: stats.total.store.size_in_bytes,
      indexName: INDEX_NAME,
    };
  } catch (error) {
    console.error('❌ Get index stats error:', error.message);
    throw error;
  }
}

module.exports = {
  client,
  insertEmbedding,
  searchSimilar,
  deleteEmbedding,
  deleteConversationEmbeddings,
  indexExists,
  getIndexStats,
};

