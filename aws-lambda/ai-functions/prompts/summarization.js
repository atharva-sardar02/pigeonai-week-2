/**
 * Summarization Prompt for Remote Team Professional Persona
 * 
 * Generates concise summaries focusing on:
 * - Technical decisions
 * - Action items
 * - Blockers
 * - Next steps
 */

/**
 * Get summarization prompt for Remote Team Professional
 * @param {Array} messages - Array of message objects
 * @param {number} messageCount - Number of messages to summarize
 * @returns {Array} - OpenAI messages array
 */
function getSummarizationPrompt(messages, messageCount) {
  // Format messages for the prompt
  const formattedMessages = messages.map(msg => {
    const timestamp = new Date(msg.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `[${timestamp}] ${msg.senderName || 'Unknown'}: ${msg.content}`;
  }).join('\n');

  const systemPrompt = `You are an AI assistant helping a distributed software engineering team stay synchronized across timezones.

Your role is to analyze conversations and provide concise, actionable summaries that help team members who missed the discussion catch up quickly.

Focus on:
1. KEY DECISIONS: What was decided? What technical choices were made?
2. ACTION ITEMS: Who needs to do what by when?
3. BLOCKERS: What issues are preventing progress?
4. TECHNICAL DETAILS: Important technical context (architecture, tools, constraints)
5. NEXT STEPS: What happens next in chronological order?

Rules:
- Be concise but complete - aim for a 2-minute read
- Extract specific assignees and deadlines when mentioned
- Prioritize information that would help someone catch up quickly
- If a section has no content, write "None" or "None identified"
- Use clear, professional language
- Focus on work-related content (skip casual chat unless it contains important context)`;

  const userPrompt = `Analyze the following conversation between team members and provide a concise summary.

CONVERSATION (Last ${messageCount} messages):
${formattedMessages}

Provide a summary in this EXACT format:

📋 Thread Summary (Last ${messageCount} messages)

KEY DECISIONS:
- (list all decisions made, or "None" if no decisions)

ACTION ITEMS:
- (list as: @Person: Task description (deadline if mentioned))

BLOCKERS:
- (list all blockers preventing progress, or "None identified")

TECHNICAL DETAILS:
- (key technical points discussed)

NEXT STEPS:
- (what happens next in chronological order)`;

  return [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ];
}

/**
 * Get quick summary prompt (shorter version for < 10 messages)
 * @param {Array} messages - Array of message objects
 * @param {number} messageCount - Number of messages
 * @returns {Array} - OpenAI messages array
 */
function getQuickSummaryPrompt(messages, messageCount) {
  const formattedMessages = messages.map(msg => {
    return `${msg.senderName || 'Unknown'}: ${msg.content}`;
  }).join('\n');

  return [
    {
      role: 'system',
      content: 'You are an AI assistant that provides brief conversation summaries for software teams.',
    },
    {
      role: 'user',
      content: `Provide a brief 2-3 sentence summary of this conversation:\n\n${formattedMessages}`,
    },
  ];
}

module.exports = {
  getSummarizationPrompt,
  getQuickSummaryPrompt,
};

