/**
 * Firebase Admin SDK Utility
 * 
 * Initializes Firebase Admin SDK for server-side Firestore access
 * Used by AI functions to fetch conversation messages
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK immediately (singleton pattern)
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    
    console.log('✅ Firebase Admin initialized for project:', serviceAccount.project_id);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 * @returns {admin.firestore.Firestore} Firestore instance
 */
function getFirestore() {
  return admin.firestore();
}

/**
 * Fetch messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Maximum number of messages to fetch
 * @returns {Promise<Array>} Array of message objects
 */
async function fetchMessages(conversationId, limit = 100) {
  try {
    const db = getFirestore();
    const messagesRef = db
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await messagesRef.get();

    if (snapshot.empty) {
      console.log(`📭 No messages found in conversation: ${conversationId}`);
      return [];
    }

    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        type: data.type || 'text',
        status: data.status || 'sent',
        ...data,
      });
    });

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    console.log(`✅ Fetched ${messages.length} messages from conversation: ${conversationId}`);
    return messages;
  } catch (error) {
    console.error('❌ Error fetching messages from Firestore:', error);
    throw error;
  }
}

/**
 * Fetch user display name
 * @param {string} userId - User ID
 * @returns {Promise<string>} User display name
 */
async function getUserDisplayName(userId) {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return 'Unknown User';
    }

    const userData = userDoc.data();
    return userData.displayName || userData.email || 'Unknown User';
  } catch (error) {
    console.error(`❌ Error fetching user ${userId}:`, error);
    return 'Unknown User';
  }
}

module.exports = {
  admin, // Export admin SDK directly
  getFirestore,
  fetchMessages,
  getUserDisplayName,
};

