/**
 * Priority Detection Prompt Template
 * 
 * For Remote Team Professional persona
 * 
 * This prompt classifies message urgency/priority for distributed software teams.
 * Uses GPT-4o-mini for speed and accuracy (real-time classification).
 * 
 * Priority Levels:
 * - high: Urgent, needs immediate attention (deadlines, blockers, production issues, escalations)
 * - medium: Important but not urgent (decisions needed, questions requiring responses, PRs to review)
 * - low: General discussion, updates, non-actionable information, casual chat
 * 
 * Target Accuracy: >90%
 * Response Time: <1 second
 */

/**
 * System prompt for priority detection
 */
const systemPrompt = `You are an AI assistant helping distributed software teams manage communication.
Your task is to analyze messages and classify their urgency/priority level.

Priority classification rules for remote team professionals:

HIGH PRIORITY (urgent, needs immediate attention):
- Production incidents, outages, critical bugs
- Blockers preventing work progress
- Hard deadlines within 24 hours
- Escalations from management or clients
- Security issues
- Direct questions that block someone's work
- Messages with keywords: URGENT, ASAP, CRITICAL, BLOCKER, PRODUCTION DOWN, EMERGENCY

MEDIUM PRIORITY (important but not urgent):
- Technical decisions that need input
- Code review requests
- Questions requiring responses (but not blocking)
- Deadlines within 2-7 days
- Feature discussions requiring consensus
- Bug reports (non-critical)
- Meeting scheduling requests
- Status updates requiring acknowledgment

LOW PRIORITY (general discussion, non-actionable):
- General updates, FYIs
- Casual conversation, greetings
- Sharing articles, resources
- Brainstorming without immediate action
- Past-deadline items
- Completed tasks updates
- Social messages

Guidelines:
- Consider context: "Can you review?" is medium, "Can you review? I'm blocked" is high
- Time sensitivity: "by EOD" = high, "when you have time" = medium
- Keywords matter but aren't absolute (sarcasm, all-caps for emphasis)
- Default to LOW if unclear

Respond with ONLY the priority level: high, medium, or low`;

/**
 * Generate priority detection prompt for a message
 * @param {string} messageContent - The message content to analyze
 * @param {Object} context - Optional context (sender name, conversation type, recent messages)
 * @returns {string} Complete prompt for OpenAI
 */
function generatePriorityPrompt(messageContent, context = {}) {
  const { senderName, conversationType, recentMessages } = context;
  
  // Build context section if available
  let contextSection = '';
  
  if (senderName) {
    contextSection += `Sender: ${senderName}\n`;
  }
  
  if (conversationType) {
    contextSection += `Conversation Type: ${conversationType}\n`;
  }
  
  if (recentMessages && recentMessages.length > 0) {
    contextSection += `\nRecent Context (last 3 messages):\n`;
    recentMessages.slice(-3).forEach((msg, idx) => {
      contextSection += `${idx + 1}. ${msg.senderName || 'Unknown'}: ${msg.content}\n`;
    });
    contextSection += '\n';
  }
  
  // User prompt with message to analyze
  const userPrompt = `${contextSection}Analyze this message and classify its priority:

Message: "${messageContent}"

Respond with ONLY one word: high, medium, or low`;

  return userPrompt;
}

/**
 * Get system prompt for priority detection
 * @returns {string} System prompt
 */
function getSystemPrompt() {
  return systemPrompt;
}

/**
 * Validate priority response
 * @param {string} response - OpenAI response
 * @returns {string} Validated priority (high/medium/low)
 */
function validatePriorityResponse(response) {
  const normalized = response.trim().toLowerCase();
  
  if (['high', 'medium', 'low'].includes(normalized)) {
    return normalized;
  }
  
  // Fuzzy matching for common variations
  if (normalized.includes('high') || normalized.includes('urgent')) {
    return 'high';
  }
  
  if (normalized.includes('medium') || normalized.includes('moderate')) {
    return 'medium';
  }
  
  // Default to low if unclear
  return 'low';
}

/**
 * Get priority metadata (colors, labels, icons)
 * @param {string} priority - Priority level (high/medium/low)
 * @returns {Object} Priority metadata
 */
function getPriorityMetadata(priority) {
  const metadata = {
    high: {
      label: 'High Priority',
      color: '#EF4444', // red-500
      icon: '🔴',
      description: 'Urgent - needs immediate attention',
      notificationImportance: 'high',
    },
    medium: {
      label: 'Medium Priority',
      color: '#F59E0B', // amber-500
      icon: '🟡',
      description: 'Important - respond when possible',
      notificationImportance: 'default',
    },
    low: {
      label: 'Low Priority',
      color: '#6B7280', // gray-500
      icon: '⚪',
      description: 'General discussion',
      notificationImportance: 'low',
    },
  };
  
  return metadata[priority] || metadata.low;
}

module.exports = {
  generatePriorityPrompt,
  getSystemPrompt,
  validatePriorityResponse,
  getPriorityMetadata,
};

