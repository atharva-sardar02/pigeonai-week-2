/**
 * AI Service for Pigeon AI
 * 
 * Frontend service to call AWS Lambda AI endpoints
 * 
 * Features:
 * - Thread summarization
 * - Action item extraction
 * - Semantic search
 * - Priority detection
 * - Decision tracking
 * - Meeting scheduling
 */

import axios from 'axios';

const API_BASE_URL = 'https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com';

/**
 * Summarize conversation thread
 * @param {string} conversationId - Conversation ID
 * @param {number} messageCount - Number of messages to summarize
 * @returns {Promise<Object>} - Summary data
 */
export async function summarizeConversation(conversationId: string, messageCount: number = 50) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/summarize`, {
      conversationId,
      messageCount,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Summarize error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Extract action items from conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} messageCount - Number of messages to analyze
 * @returns {Promise<Object>} - Action items data
 */
export async function extractActionItems(conversationId: string, messageCount: number = 50) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/extract-action-items`, {
      conversationId,
      messageCount,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Extract action items error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Semantic search across messages
 * @param {string} query - Search query
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of results (default: 5)
 * @param {number} minScore - Minimum relevance score (0.0-1.0, default: 0.7)
 * @returns {Promise<Object>} - Search results
 */
export async function searchMessages(
  query: string, 
  conversationId: string,
  limit: number = 5,
  minScore: number = 0.7
) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/search`, {
      query,
      conversationId,
      limit,
      minScore,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Search error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Detect priority for a single message
 * @param {string} conversationId - Conversation ID
 * @param {string} messageContent - Message content to analyze
 * @param {string} messageId - Message ID (optional)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Priority detection result
 */
export async function detectMessagePriority(
  conversationId: string,
  messageContent: string,
  messageId?: string,
  options?: {
    senderName?: string;
    conversationType?: 'dm' | 'group';
    includeContext?: boolean;
  }
) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/detect-priority`, {
      conversationId,
      messageContent,
      messageId,
      ...options,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Detect message priority error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Batch detect priority for multiple messages
 * @param {Array} messages - Array of messages to analyze
 * @returns {Promise<Object>} - Batch priority detection result
 */
export async function batchDetectPriority(messages: Array<{
  id: string;
  conversationId: string;
  content: string;
  senderName?: string;
  conversationType?: 'dm' | 'group';
}>) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/batch-detect-priority`, {
      messages,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Batch detect priority error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Legacy function - kept for compatibility
 * @deprecated Use detectMessagePriority instead
 */
export async function detectPriority(conversationId: string) {
  console.warn('detectPriority is deprecated, use detectMessagePriority instead');
  return detectMessagePriority(conversationId, '');
}

/**
 * Track decisions made in conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} messageCount - Number of messages to analyze
 * @returns {Promise<Object>} - Decisions data
 */
export async function trackDecisions(conversationId: string, messageCount: number = 50) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/track-decisions`, {
      conversationId,
      messageCount,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Track decisions error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Schedule meeting using AI agent
 * @param {string} conversationId - Conversation ID
 * @param {Array<string>} participants - Participant user IDs
 * @param {Object} constraints - Scheduling constraints
 * @returns {Promise<Object>} - Meeting schedule data
 */
export async function scheduleMeeting(
  conversationId: string,
  participants: string[],
  constraints?: {
    startDate?: string;
    endDate?: string;
    duration?: number;
    timeZone?: string;
  }
) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/schedule-meeting`, {
      conversationId,
      participants,
      constraints,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Schedule meeting error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Generate embedding for a message (background job)
 * @param {string} messageId - Message ID
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 * @param {string} senderId - Sender user ID
 * @returns {Promise<Object>} - Generation result
 */
export async function generateEmbedding(
  messageId: string,
  conversationId: string,
  content: string,
  senderId: string
) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/generate-embedding`, {
      messageId,
      conversationId,
      content,
      senderId,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Generate embedding error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Batch generate embeddings for existing messages (backfill tool)
 * @param {string} conversationId - Conversation ID
 * @param {number} messageLimit - Number of messages to process
 * @returns {Promise<Object>} - Batch result
 */
export async function batchGenerateEmbeddings(
  conversationId: string,
  messageLimit: number = 100
) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/batch-generate-embeddings`, {
      conversationId,
      messageLimit,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Batch generate embeddings error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Generic AI request handler
 * @param {string} endpoint - API endpoint
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} - Response data
 */
async function makeAIRequest(endpoint: string, payload: any) {
  try {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    return {
      success: true,
      data: response.data.data,
      cached: response.data.cached || false,
      duration: response.data.duration,
    };
  } catch (error: any) {
    console.error(`❌ AI request error (${endpoint}):`, error.message);
    
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      statusCode: error.response?.status,
    };
  }
}

export const AIService = {
  summarizeConversation,
  extractActionItems,
  searchMessages,
  detectMessagePriority,
  batchDetectPriority,
  detectPriority, // deprecated
  trackDecisions,
  scheduleMeeting,
  generateEmbedding,
  batchGenerateEmbeddings,
};

export default AIService;

