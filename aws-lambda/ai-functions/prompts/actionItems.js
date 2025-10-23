/**
 * Action Item Extraction Prompts for Remote Team Professional Persona
 * 
 * Extracts structured action items with:
 * - Task descriptions
 * - Assignees (from @mentions or context)
 * - Deadlines (parsed from natural language)
 * - Priority levels (high/medium/low)
 * - Dependencies
 */

/**
 * Get action item extraction prompt
 * @param {Array} messages - Array of message objects
 * @param {string} currentDate - ISO date string for relative date parsing
 * @returns {Array} - OpenAI messages array with JSON mode
 */
function getActionItemPrompt(messages, currentDate) {
  // Format messages for the prompt
  const formattedMessages = messages.map((msg, index) => {
    const timestamp = new Date(msg.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `[${index + 1}] [${timestamp}] ${msg.senderName || 'Unknown'}: ${msg.content}`;
  }).join('\n');

  const systemPrompt = `You are an AI assistant that extracts action items from software engineering team conversations.

Your job is to identify ALL tasks, assignments, and to-dos mentioned in the conversation.

WHAT TO EXTRACT:
- Direct assignments: "@John can you deploy by Friday?"
- Implied tasks: "Someone needs to update the docs"
- Commitments: "I'll review the PR tonight"
- Requests: "Can you check the logs?"
- Decisions that require action: "Let's switch to PostgreSQL" → implies migration task

WHAT NOT TO EXTRACT:
- General discussion without actionable outcomes
- Questions that were answered (unless the answer creates a task)
- Past completed actions: "I already fixed that bug"
- Suggestions without commitment: "We could maybe try X"

FOR EACH ACTION ITEM, IDENTIFY:
1. **task**: Clear, specific description of what needs to be done
2. **assignee**: Person assigned (look for @mentions, "I'll do it", context clues, or "Unassigned")
3. **deadline**: When it's due (convert relative dates like "by Friday" to absolute dates, or null)
4. **priority**: "high" (urgent, blocking, ASAP), "medium" (important, this week), "low" (nice-to-have, no rush)
5. **messageId**: The message number where it was mentioned (from [N] prefix)
6. **context**: Brief explanation or reason (optional)
7. **dependencies**: Array of other task descriptions this depends on (optional)

PRIORITY RULES:
- "urgent", "ASAP", "critical", "blocking", "production down" → high
- "by end of week", "important", "should do" → medium  
- "when you have time", "nice to have", "eventually" → low
- Default to medium if unclear

DEADLINE PARSING:
- "by Friday" → calculate actual date
- "end of day" / "EOD" → today at 5 PM
- "tomorrow" → next day
- "next week" → 7 days from today
- No deadline mentioned → null

Return ONLY valid JSON. No markdown, no explanations.`;

  const userPrompt = `Today's date: ${currentDate}

Analyze this conversation and extract ALL action items:

${formattedMessages}

Return a JSON object with this structure:
{
  "actionItems": [
    {
      "task": "Deploy staging environment for QA testing",
      "assignee": "John",
      "deadline": "2025-10-24T09:00:00Z",
      "priority": "medium",
      "messageId": "12",
      "context": "Needed for QA to start testing",
      "dependencies": []
    }
  ]
}

Rules:
- Include ONLY clear action items (no general discussion)
- If no assignee mentioned, use "Unassigned"
- If no deadline, use null
- Priority must be "high", "medium", or "low"
- messageId is the number from [N] in the conversation
- Empty array if no action items found`;

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

module.exports = {
  getActionItemPrompt,
};

