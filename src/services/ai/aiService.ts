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
 * @param {string} conversationId - Optional: limit to specific conversation
 * @returns {Promise<Object>} - Search results
 */
export async function searchMessages(query: string, conversationId?: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/search`, {
      query,
      conversationId,
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
 * Detect priority messages in conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - Priority messages
 */
export async function detectPriority(conversationId: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/detect-priority`, {
      conversationId,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ Detect priority error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
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
  detectPriority,
  trackDecisions,
  scheduleMeeting,
};

export default AIService;

