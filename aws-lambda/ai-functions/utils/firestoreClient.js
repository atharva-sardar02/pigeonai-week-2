/**
 * Firestore Client Utility
 * 
 * Wrapper around Firebase Admin SDK for Firestore operations
 * Used by AI functions to fetch conversation messages
 */

const { getFirestore, fetchMessages, getUserDisplayName } = require('./firebaseAdmin');

/**
 * Get messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Maximum number of messages to fetch
 * @returns {Promise<Array>} Array of message objects
 */
async function getMessages(conversationId, limit = 100) {
  return fetchMessages(conversationId, limit);
}

/**
 * Get Firestore database instance
 * @returns {admin.firestore.Firestore} Firestore instance
 */
function getDb() {
  return getFirestore();
}

/**
 * Get user display name by ID
 * @param {string} userId - User ID
 * @returns {Promise<string>} User display name
 */
async function getDisplayName(userId) {
  return getUserDisplayName(userId);
}

/**
 * Get conversation metadata
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Conversation metadata
 */
async function getConversation(conversationId) {
  try {
    const db = getFirestore();
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    
    if (!conversationDoc.exists) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    return {
      id: conversationDoc.id,
      ...conversationDoc.data(),
    };
  } catch (error) {
    console.error(`❌ Error fetching conversation ${conversationId}:`, error);
    throw error;
  }
}

module.exports = {
  getMessages,
  getDb,
  getDisplayName,
  getConversation,
  getFirestore, // Export for direct access if needed
};

