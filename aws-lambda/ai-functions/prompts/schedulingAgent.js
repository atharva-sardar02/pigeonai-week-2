/**
 * Scheduling Agent Prompts (PR #21)
 * Persona: Remote Team Professional
 * 
 * Multi-step prompts for:
 * - Detecting scheduling intent
 * - Extracting meeting details
 * - Suggesting optimal times
 */

/**
 * Intent Detection Prompt
 * Determines if conversation contains scheduling intent
 */
function getIntentDetectionPrompt(conversationText) {
  return `You are an AI assistant helping a distributed software engineering team coordinate meetings.

Analyze the following conversation and determine if there is a clear SCHEDULING INTENT.

SCHEDULING INTENT means someone is trying to:
- Schedule a meeting, call, or sync
- Find a time to meet or talk
- Coordinate calendars
- Set up a discussion or video call

CONVERSATION:
${conversationText}

Does this conversation contain scheduling intent?

Reply with ONLY:
- "YES" if scheduling intent is detected
- "NO" if no scheduling intent

Your response:`;
}

/**
 * Meeting Details Extraction Prompt
 * Extracts structured meeting information
 */
function getExtractionPrompt(conversationText, triggerMessage) {
  return `You are an AI assistant helping a distributed software engineering team schedule meetings.

Extract meeting details from the following conversation. Focus on the most recent messages and the trigger message.

TRIGGER MESSAGE (most important):
${triggerMessage}

FULL CONVERSATION CONTEXT:
${conversationText}

Extract the following details:
1. **topic**: Main subject of the meeting (short, 3-5 words)
2. **purpose**: Why they're meeting (1 sentence)
3. **duration**: How long (in minutes, default 30 if not mentioned)
4. **preferredDate**: Specific date mentioned (YYYY-MM-DD format) or null
5. **preferredTime**: Specific time mentioned (24-hour format) or null
6. **timeframe**: When they want to meet ("today", "tomorrow", "next week", "this week", "next month")
7. **location**: Physical location or "Virtual" (default)
8. **priority**: "urgent", "normal", or "low" (based on language used)

EXTRACTION RULES FOR REMOTE TEAM PROFESSIONAL:
- **Topic**: Technical terms are common (e.g., "Database migration", "API review", "Sprint planning")
- **Duration**: Meetings range from 15 minutes (quick sync) to 2 hours (deep dive)
- **Timeframe**: Be flexible with natural language ("early next week", "sometime this week")
- **Location**: Default to "Virtual" unless physical location is mentioned
- **Priority**:
  - URGENT: Words like "ASAP", "urgent", "immediately", "today", "emergency"
  - LOW: Words like "whenever", "no rush", "when you get a chance"
  - NORMAL: Everything else

EXAMPLES:

Example 1:
Input: "Hey team, we need to sync about the database migration strategy. Can we schedule something for next week? Probably need an hour."
Output: {
  "topic": "Database migration strategy",
  "purpose": "Discuss and align on database migration approach",
  "duration": 60,
  "preferredDate": null,
  "preferredTime": null,
  "timeframe": "next week",
  "location": "Virtual",
  "priority": "normal"
}

Example 2:
Input: "Let's do a quick 15-min standup tomorrow morning around 9am to unblock John."
Output: {
  "topic": "Standup to unblock John",
  "purpose": "Quick sync to resolve John's blocker",
  "duration": 15,
  "preferredDate": null,
  "preferredTime": "09:00",
  "timeframe": "tomorrow",
  "location": "Virtual",
  "priority": "urgent"
}

Example 3:
Input: "Can we find some time this week to review the new API docs? Maybe 30-45 minutes?"
Output: {
  "topic": "API documentation review",
  "purpose": "Review and provide feedback on new API documentation",
  "duration": 45,
  "preferredDate": null,
  "preferredTime": null,
  "timeframe": "this week",
  "location": "Virtual",
  "priority": "normal"
}

Return ONLY valid JSON matching this structure. Do not include any other text or explanation.

Your JSON response:`;
}

/**
 * Time Suggestion Refinement Prompt (optional, for future enhancement)
 * Refines suggested times based on participant feedback
 */
function getRefinementPrompt(meetingDetails, previousSuggestions, feedback) {
  return `You are an AI assistant helping schedule a meeting for a distributed team.

MEETING DETAILS:
- Topic: ${meetingDetails.topic}
- Duration: ${meetingDetails.duration} minutes
- Participants: ${meetingDetails.participants.map(p => `${p.name} (${p.timezone})`).join(', ')}

PREVIOUS SUGGESTIONS:
${previousSuggestions.map((s, i) => `Option ${i + 1}: ${s.date} at ${s.timePST}`).join('\n')}

USER FEEDBACK:
${feedback}

Based on the feedback, suggest 3 NEW alternative times that address the concerns.

Consider:
- Avoid times that were rejected
- Respect timezone constraints (working hours 9 AM - 5 PM for each timezone)
- Suggest times with good overlap for all participants
- If feedback mentions "too early" → suggest later times
- If feedback mentions "too late" → suggest earlier times
- If feedback mentions specific days → prioritize those days

Return suggestions in JSON format:
{
  "suggestions": [
    {
      "date": "YYYY-MM-DD",
      "timePST": "HH:MM AM/PM",
      "reason": "Why this time is better"
    }
  ]
}

Your JSON response:`;
}

module.exports = {
  getIntentDetectionPrompt,
  getExtractionPrompt,
  getRefinementPrompt
};

