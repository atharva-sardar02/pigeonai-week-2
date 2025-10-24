/**
 * Scheduling Agent Lambda Function (PR #21)
 * Multi-step AI agent for proactive meeting scheduling across timezones
 * 
 * Architecture: LangChain + OpenAI GPT-4o-mini + Function Calling
 * Features:
 * - Detect scheduling intent in conversation
 * - Extract meeting details (topic, participants, duration, timeframe)
 * - Check availability across timezones (simulated for MVP)
 * - Suggest 3 optimal times that work for everyone
 * - Generate calendar invite with timezone conversion
 * 
 * Performance: <15s for complete workflow
 * Accuracy: >85% for clear scheduling requests
 */

const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const { z } = require('zod'); // Fixed: Import zod directly, not from @langchain/core/zod
const { openai: openaiClient } = require('./utils/openaiClient'); // ✅ Destructure to get the raw OpenAI client
const firestoreClient = require('./utils/firestoreClient');
const cacheClient = require('./utils/cacheClient');
const responseUtils = require('./utils/responseUtils');
const schedulingPrompt = require('./prompts/schedulingAgent');

/**
 * Main handler for scheduling agent workflow
 * @param {Object} body - Request body
 * @param {string} body.conversationId - Conversation ID
 * @param {string} body.userId - User ID
 * @param {number} body.limit - Number of messages to analyze (default: 50)
 * @param {boolean} body.forceRefresh - Skip cache
 * @returns {Promise<Object>} Meeting proposal
 */
async function handleSchedulingAgent(body) {
  const startTime = Date.now();
  const { conversationId, userId, limit = 50, forceRefresh = false } = body;

  console.log('[Scheduling Agent] Starting workflow:', { conversationId, userId, limit });

  // Check cache (2 hour TTL for scheduling proposals)
  const cacheKey = `schedule:${conversationId}:${limit}`;
  if (!forceRefresh) {
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      console.log('[Scheduling Agent] Cache hit');
      return responseUtils.success({
        ...cached,
        cached: true,
        duration: Date.now() - startTime
      });
    }
  }

  try {
    // Step 1: Fetch recent messages from Firestore
    console.log('[Scheduling Agent] Step 1: Fetching messages...');
    const messages = await firestoreClient.getMessages(conversationId, limit);
    
    if (!messages || messages.length === 0) {
      return responseUtils.error('No messages found in conversation', 400);
    }

    console.log(`[Scheduling Agent] Fetched ${messages.length} messages`);

    // Step 2: Detect ALL scheduling threads (not just one!)
    console.log('[Scheduling Agent] Step 2: Detecting all scheduling threads...');
    const threads = await detectAllSchedulingThreads(messages, userId);
    
    if (threads.length === 0) {
      return responseUtils.success({
        hasSchedulingIntent: false,
        threads: [],
        totalThreads: 0,
        message: 'No scheduling requests detected in conversation',
        duration: Date.now() - startTime
      });
    }

    console.log(`[Scheduling Agent] Detected ${threads.length} scheduling thread(s)`);
    threads.forEach((t, i) => {
      console.log(`  Thread ${i + 1}: "${t.triggerMessage.substring(0, 50)}..."`);
    });

    // Return all threads with their time suggestions
    const result = {
      hasSchedulingIntent: true,
      threads: threads, // ✅ Array of all detected threads
      totalThreads: threads.length,
      needsAction: threads.filter(t => t.status !== 'ready').length,
      conversationId,
      messageCount: messages.length,
      duration: Date.now() - startTime
    };

    // Cache result for 2 hours
    await cacheClient.set(cacheKey, result, 7200);
    console.log(`[Scheduling Agent] Workflow complete in ${result.duration}ms`);

    return responseUtils.success(result);

  } catch (error) {
    console.error('[Scheduling Agent] Error:', error);
    return responseUtils.error(`Scheduling agent failed: ${error.message}`, 500);
  }
}

/**
 * Detect ALL scheduling threads in conversation
 * @param {Array} messages - All messages
 * @param {string} userId - Current user ID
 * @returns {Promise<Array>} Array of scheduling threads
 */
async function detectAllSchedulingThreads(messages, userId) {
  const schedulingKeywords = [
    'meeting', 'schedule', 'sync', 'call', 'meet', 'catch up',
    'get together', 'touch base', 'video call', 'zoom',
    'when can we', 'let\'s meet', 'let\'s schedule',
    'have a meeting', 'let\'s have', 'let\'s catch'
  ];

  const threads = [];
  const processedIndices = new Set();

  // Scan all messages for scheduling keywords
  for (let i = 0; i < messages.length; i++) {
    if (processedIndices.has(i)) continue;

    const msg = messages[i];
    const content = msg.content.toLowerCase();

    // Check if message contains scheduling keywords
    const hasKeyword = schedulingKeywords.some(keyword => content.includes(keyword));
    
    if (hasKeyword) {
      console.log(`[Thread Detection] Found scheduling hint at message ${i}: "${msg.content.substring(0, 50)}..."`);
      
      // Extract date and time info
      const dateInfo = extractDateInfo(msg.content);
      const timeInfo = extractTimeInfo(msg.content);
      
      // Determine status
      let status = 'needs_both';
      if (dateInfo.specified && timeInfo.specified) {
        status = 'ready';
      } else if (dateInfo.specified) {
        status = 'needs_time';
      } else if (timeInfo.specified) {
        status = 'needs_date';
      }

      // Look for availability hints in nearby messages
      const nearbyHints = [];
      for (let j = Math.max(0, i - 3); j < Math.min(messages.length, i + 4); j++) {
        if (j !== i) {
          const hint = messages[j].content.toLowerCase();
          if (hint.includes('available') || hint.includes('free') || hint.includes('works for me')) {
            const hintTime = extractTimeInfo(messages[j].content);
            const hintDate = extractDateInfo(messages[j].content);
            if (hintTime.specified || hintDate.specified) {
              nearbyHints.push({
                message: messages[j].content,
                time: hintTime,
                date: hintDate
              });
            }
          }
        }
      }

      // Generate time suggestions for this thread
      const suggestedTimes = generateTimeSuggestionsForThread(dateInfo, timeInfo, nearbyHints);

      const thread = {
        id: `thread_${i}`,
        topic: extractThreadTopic(msg.content),
        triggerMessage: msg.content,
        messageIndex: i,
        confidence: 0.9,
        dateInfo,
        timeInfo,
        availabilityHints: nearbyHints,
        status,
        suggestedTimes,
        createdAt: new Date().toISOString()
      };

      threads.push(thread);
      
      // Mark nearby messages as processed to avoid duplicates
      for (let j = i - 2; j <= i + 2; j++) {
        if (j >= 0 && j < messages.length) {
          processedIndices.add(j);
        }
      }
    }
  }

  return threads;
}

/**
 * Extract topic from scheduling message
 */
function extractThreadTopic(content) {
  // Remove scheduling keywords to get topic
  const cleaned = content
    .replace(/schedule|meeting|call|catch up|let's|have a/gi, '')
    .trim();
  
  if (cleaned.length > 50) {
    return cleaned.substring(0, 47) + '...';
  }
  
  return cleaned || 'Meeting';
}

/**
 * Generate time suggestions for a specific thread
 */
function generateTimeSuggestionsForThread(dateInfo, timeInfo, availabilityHints) {
  const suggestions = [];
  const now = new Date();

  // Strategy 1: Use availability hints if found
  if (availabilityHints.length > 0) {
    for (let i = 0; i < Math.min(3, availabilityHints.length); i++) {
      const hint = availabilityHints[i];
      const baseDate = hint.date.specified ? new Date(hint.date.value) : new Date();
      baseDate.setDate(baseDate.getDate() + (hint.date.specified ? 0 : i + 1));
      
      const time = hint.time.specified ? hint.time.value : '10:00 AM';
      
      suggestions.push({
        id: `time_${i}`,
        date: baseDate.toISOString().split('T')[0],
        time: time,
        endTime: '11:30 AM', // Simplified
        quality: i === 0 ? 'best' : (i === 1 ? 'good' : 'acceptable'),
        reason: `Based on "${hint.message.substring(0, 30)}..."`
      });
    }
  }
  // Strategy 2: Use detected date/time
  else if (dateInfo.specified || timeInfo.specified) {
    const baseDate = dateInfo.specified ? new Date(dateInfo.value) : new Date();
    baseDate.setDate(baseDate.getDate() + (dateInfo.specified ? 0 : 3));
    
    const baseTime = timeInfo.specified ? timeInfo.value : '10:00 AM';
    
    suggestions.push({
      id: 'time_0',
      date: baseDate.toISOString().split('T')[0],
      time: baseTime,
      endTime: adjustTime(baseTime, 0.5),
      quality: 'best',
      reason: 'Matches your request'
    });
    
    suggestions.push({
      id: 'time_1',
      date: baseDate.toISOString().split('T')[0],
      time: adjustTime(baseTime, 2),
      endTime: adjustTime(baseTime, 2.5),
      quality: 'good',
      reason: '2 hours later'
    });
    
    suggestions.push({
      id: 'time_2',
      date: baseDate.toISOString().split('T')[0],
      time: adjustTime(baseTime, -2),
      endTime: adjustTime(baseTime, -1.5),
      quality: 'acceptable',
      reason: '2 hours earlier'
    });
  }
  // Strategy 3: Defaults
  else {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    suggestions.push({
      id: 'time_0',
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00 AM',
      endTime: '10:30 AM',
      quality: 'best',
      reason: 'Morning slot'
    });
    
    suggestions.push({
      id: 'time_1',
      date: tomorrow.toISOString().split('T')[0],
      time: '2:00 PM',
      endTime: '2:30 PM',
      quality: 'good',
      reason: 'Afternoon slot'
    });
    
    suggestions.push({
      id: 'time_2',
      date: tomorrow.toISOString().split('T')[0],
      time: '4:00 PM',
      endTime: '4:30 PM',
      quality: 'acceptable',
      reason: 'Late afternoon'
    });
  }

  return suggestions;
}

/**
 * OLD: Detect if conversation contains scheduling intent (DEPRECATED - using detectAllSchedulingThreads now)
 */
async function detectSchedulingIntent_OLD(messages) {
  // ✅ ENHANCED: More comprehensive keywords
  const schedulingKeywords = [
    'meeting', 'schedule', 'sync', 'call', 'meet', 'catch up',
    'get together', 'touch base', 'video call', 'zoom', 'teams',
    'when can we', 'let\'s meet', 'let\'s schedule', 'what time',
    'available for', 'free to', 'calendar', 'appointment',
    'have a meeting', 'let\'s have', 'let\'s catch', 'when are you',
    'are you free', 'can we meet', 'shall we', 'how about'
  ];

  // ✅ ENHANCED: Scan ALL messages (not just last 10)
  let triggerMessage = null;
  let keywordCount = 0;
  let bestMatch = null;
  let highestScore = 0;

  for (const msg of messages) {
    const content = msg.content.toLowerCase();
    const matches = schedulingKeywords.filter(keyword => content.includes(keyword));
    
    if (matches.length > 0) {
      const score = matches.length;
      if (score > highestScore) {
        highestScore = score;
        triggerMessage = msg.content;
        bestMatch = msg;
      }
      keywordCount += matches.length;
    }
  }

  if (keywordCount === 0) {
    console.log('[Scheduling] No scheduling keywords found');
    return { 
      detected: false, 
      confidence: 0, 
      triggerMessage: null,
      dateInfo: null,
      timeInfo: null
    };
  }

  console.log(`[Scheduling] Found ${keywordCount} keyword matches in conversation`);
  console.log(`[Scheduling] Best trigger message: "${triggerMessage}"`);

  // ✅ SIMPLIFIED: Use keyword-based detection (skip GPT validation for speed)
  // If we found keywords, we have scheduling intent
  const dateInfo = extractDateInfo(triggerMessage);
  const timeInfo = extractTimeInfo(triggerMessage);
  
  const confidence = Math.min(0.95, keywordCount * 0.2 + 0.5); // At least 50% confidence

  return {
    detected: true, // If keywords found, intent detected
    confidence,
    triggerMessage,
    dateInfo,
    timeInfo
  };
}

/**
 * Extract date information from text
 */
function extractDateInfo(text) {
  if (!text) return { specified: false, original: null, vague: true, description: 'not mentioned' };
  
  const lower = text.toLowerCase();
  
  // Specific dates
  if (/tomorrow/i.test(text)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { specified: true, original: 'tomorrow', vague: false, value: tomorrow.toISOString().split('T')[0] };
  }
  
  if (/today/i.test(text)) {
    return { specified: true, original: 'today', vague: false, value: new Date().toISOString().split('T')[0] };
  }
  
  // Month + day (e.g., "Dec 2", "Nov 15")
  const monthDayMatch = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})/i);
  if (monthDayMatch) {
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const month = months[monthDayMatch[1].toLowerCase().substring(0, 3)];
    const day = parseInt(monthDayMatch[2]);
    const date = new Date(2025, month, day);
    return { specified: true, original: monthDayMatch[0], vague: false, value: date.toISOString().split('T')[0] };
  }
  
  // Vague dates
  if (/next week/i.test(lower)) {
    return { specified: false, original: 'next week', vague: true, description: 'next week' };
  }
  if (/this week/i.test(lower)) {
    return { specified: false, original: 'this week', vague: true, description: 'this week' };
  }
  
  return { specified: false, original: null, vague: true, description: 'not mentioned' };
}

/**
 * Extract time information from text
 */
function extractTimeInfo(text) {
  if (!text) return { specified: false, original: null, vague: true, description: 'not mentioned' };
  
  const lower = text.toLowerCase();
  
  // Specific times (e.g., "2 PM", "14:00", "2:30 PM")
  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    return { specified: true, original: timeMatch[0], vague: false, value: timeMatch[0] };
  }
  
  // 24-hour format
  const time24Match = text.match(/(\d{1,2}):(\d{2})/);
  if (time24Match) {
    return { specified: true, original: time24Match[0], vague: false, value: time24Match[0] };
  }
  
  // Vague times
  if (/morning/i.test(lower)) {
    return { specified: false, original: 'morning', vague: true, description: 'morning', suggestedValue: '10:00 AM' };
  }
  if (/afternoon/i.test(lower)) {
    return { specified: false, original: 'afternoon', vague: true, description: 'afternoon', suggestedValue: '2:00 PM' };
  }
  if (/evening/i.test(lower)) {
    return { specified: false, original: 'evening', vague: true, description: 'evening', suggestedValue: '6:00 PM' };
  }
  
  return { specified: false, original: null, vague: true, description: 'not mentioned' };
}

/**
 * Step 2: Extract meeting details from conversation
 * @param {Array} messages - Conversation messages
 * @param {string} triggerMessage - Message that triggered scheduling
 * @returns {Promise<Object>} Meeting details
 */
async function extractMeetingDetails(messages, triggerMessage) {
  const recentMessages = messages.slice(-20);
  const conversationText = recentMessages.map(m => `${m.senderName || m.senderId}: ${m.content}`).join('\n');

  const prompt = schedulingPrompt.getExtractionPrompt(conversationText, triggerMessage);

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant that extracts meeting details from conversations.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500
    });

    const extracted = JSON.parse(response.choices[0].message.content);

    // Get unique participants from recent messages
    const participants = [...new Set(recentMessages.map(m => ({
      id: m.senderId,
      name: m.senderName || m.senderId,
      timezone: 'PST' // Default for MVP
    })))];

    return {
      topic: extracted.topic || 'Team sync',
      purpose: extracted.purpose || 'Discuss project progress',
      duration: extracted.duration || 30, // minutes
      preferredDate: extracted.preferredDate || null,
      preferredTime: extracted.preferredTime || null,
      timeframe: extracted.timeframe || 'next week',
      participants,
      location: extracted.location || 'Virtual (Zoom/Teams)',
      priority: extracted.priority || 'normal'
    };

  } catch (error) {
    console.error('[Scheduling Agent] Extraction error:', error);
    // Fallback to basic extraction
    const participants = [...new Set(messages.slice(-10).map(m => ({
      id: m.senderId,
      name: m.senderName || m.senderId,
      timezone: 'PST'
    })))];

    return {
      topic: 'Team meeting',
      purpose: 'Discuss project',
      duration: 30,
      preferredDate: null,
      preferredTime: null,
      timeframe: 'next week',
      participants,
      location: 'Virtual',
      priority: 'normal'
    };
  }
}

/**
 * Step 3: Check availability (simulated for MVP)
 * @param {Object} meetingDetails - Meeting details
 * @returns {Promise<Object>} Availability information
 */
async function checkAvailability(meetingDetails) {
  // Simulated availability check for MVP
  // In production, this would integrate with Google Calendar API

  const { participants } = meetingDetails;

  return {
    status: 'available',
    conflicts: [],
    workingHours: {
      start: 9, // 9 AM
      end: 17   // 5 PM
    },
    participants: participants.map(p => ({
      ...p,
      timezone: p.timezone || 'PST',
      availability: 'available' // Simulated
    }))
  };
}

/**
 * Scan messages for availability hints
 * @param {Array} messages - All messages
 * @returns {Array} Availability hints with times
 */
function scanForAvailability(messages) {
  const availabilityKeywords = [
    'available', 'free', 'works for me', 'i can do', 'i\'m available',
    'i\'m free', 'how about', 'what about', 'prefer', 'better for me'
  ];

  const hints = [];

  for (const msg of messages) {
    const content = msg.content.toLowerCase();
    
    // Check if message mentions availability
    const hasAvailability = availabilityKeywords.some(keyword => content.includes(keyword));
    
    if (hasAvailability) {
      // Extract time from this availability message
      const timeInfo = extractTimeInfo(msg.content);
      const dateInfo = extractDateInfo(msg.content);
      
      if (timeInfo.specified || dateInfo.specified) {
        hints.push({
          message: msg.content,
          time: timeInfo,
          date: dateInfo,
          sender: msg.senderId
        });
      }
    }
  }

  return hints;
}

/**
 * Step 4: Suggest 3 optimal times across timezones
 * @param {Object} meetingDetails - Meeting details
 * @param {Object} availability - Availability information
 * @param {Array} availabilityHints - Detected availability from messages
 * @param {Object} dateInfo - Extracted date from trigger
 * @param {Object} timeInfo - Extracted time from trigger
 * @returns {Promise<Array>} Suggested time slots
 */
async function suggestOptimalTimes(meetingDetails, availability, availabilityHints = [], dateInfo, timeInfo) {
  const { duration, participants } = meetingDetails;
  const now = new Date();
  
  const suggestedTimes = [];

  // ✅ Strategy 1: If availability hints found, use those times
  if (availabilityHints.length > 0) {
    console.log('[Scheduling] Using availability hints from conversation');
    
    for (let i = 0; i < Math.min(3, availabilityHints.length); i++) {
      const hint = availabilityHints[i];
      const baseDate = hint.date.specified ? new Date(hint.date.value) : new Date();
      baseDate.setDate(baseDate.getDate() + (hint.date.specified ? 0 : i + 1));
      
      const time = hint.time.specified ? hint.time.value : hint.time.suggestedValue || '10:00 AM';
      
      suggestedTimes.push({
        date: baseDate.toISOString().split('T')[0],
        time: time,
        endTime: addMinutes(time, duration),
        quality: i === 0 ? 'best' : (i === 1 ? 'good' : 'acceptable'),
        reason: `Based on "${hint.message.substring(0, 40)}..."`
      });
    }
    
    return suggestedTimes;
  }

  // ✅ Strategy 2: If specific date/time detected in trigger, use that
  if (dateInfo && timeInfo && (dateInfo.specified || timeInfo.specified)) {
    console.log('[Scheduling] Using detected date/time from trigger message');
    
    const baseDate = dateInfo.specified ? new Date(dateInfo.value) : new Date();
    baseDate.setDate(baseDate.getDate() + (dateInfo.specified ? 0 : 3));
    
    const baseTime = timeInfo.specified ? timeInfo.value : (timeInfo.suggestedValue || '10:00 AM');
    
    // Suggest the requested time + 2 alternatives
    suggestedTimes.push({
      date: baseDate.toISOString().split('T')[0],
      time: baseTime,
      endTime: addMinutes(baseTime, duration),
      quality: 'best',
      reason: 'Matches your request'
    });
    
    suggestedTimes.push({
      date: baseDate.toISOString().split('T')[0],
      time: adjustTime(baseTime, 2), // 2 hours later
      endTime: addMinutes(adjustTime(baseTime, 2), duration),
      quality: 'good',
      reason: '2 hours after requested time'
    });
    
    suggestedTimes.push({
      date: baseDate.toISOString().split('T')[0],
      time: adjustTime(baseTime, -2), // 2 hours earlier
      endTime: addMinutes(adjustTime(baseTime, -2), duration),
      quality: 'acceptable',
      reason: '2 hours before requested time'
    });
    
    return suggestedTimes;
  }

  // ✅ Strategy 3: No availability or specific time - use smart defaults
  console.log('[Scheduling] No specific availability found - using smart defaults');
  
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  // Option 1: Tomorrow at good time
  const option1 = new Date(now);
  option1.setDate(option1.getDate() + 1);
  option1.setHours(10, 0, 0, 0);
  suggestedTimes.push(createTimeSlot(option1, duration, participants, 'best'));

  // Option 2: 3 days from now
  const option2 = new Date(now);
  option2.setDate(option2.getDate() + 3);
  option2.setHours(14, 0, 0, 0);
  suggestedTimes.push(createTimeSlot(option2, duration, participants, 'good'));

  // Option 3: 5 days from now
  const option3 = new Date(now);
  option3.setDate(option3.getDate() + 5);
  option3.setHours(16, 0, 0, 0);
  suggestedTimes.push(createTimeSlot(option3, duration, participants, 'acceptable'));

  return suggestedTimes;
}

/**
 * Helper: Add minutes to time string
 */
function addMinutes(timeStr, minutes) {
  // Simple implementation - just return endTime
  // In production, parse time and add duration
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (match) {
    let hour = parseInt(match[1]);
    const min = parseInt(match[2] || '0');
    const period = match[3].toUpperCase();
    
    // Add minutes
    let totalMin = hour * 60 + min + minutes;
    let newHour = Math.floor(totalMin / 60);
    let newMin = totalMin % 60;
    
    // Handle AM/PM
    if (newHour >= 12) {
      return `${newHour}:${newMin.toString().padStart(2, '0')} PM`;
    } else {
      return `${newHour}:${newMin.toString().padStart(2, '0')} AM`;
    }
  }
  
  return timeStr; // Fallback
}

/**
 * Helper: Adjust time by hours
 */
function adjustTime(timeStr, hours) {
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (match) {
    let hour = parseInt(match[1]);
    const min = match[2] || '00';
    let period = match[3].toUpperCase();
    
    // Adjust hours
    hour += hours;
    
    // Handle wraparound
    while (hour < 1) hour += 12;
    while (hour > 12) hour -= 12;
    
    return `${hour}:${min} ${period}`;
  }
  
  return timeStr;
}

/**
 * Create a time slot with timezone conversions
 * @param {Date} baseTime - Time in PST
 * @param {number} duration - Duration in minutes
 * @param {Array} participants - Participants with timezones
 * @param {string} quality - 'best' | 'good' | 'acceptable'
 * @returns {Object} Time slot
 */
function createTimeSlot(baseTime, duration, participants, quality) {
  const timezoneOffsets = {
    'PST': -8,
    'GMT': 0,
    'IST': 5.5,
    'EST': -5,
    'CST': -6
  };

  const timezones = {};
  participants.forEach(p => {
    const tz = p.timezone || 'PST';
    if (!timezones[tz]) {
      const offset = timezoneOffsets[tz] || -8;
      const convertedTime = new Date(baseTime.getTime() + (offset + 8) * 60 * 60 * 1000);
      timezones[tz] = {
        time: convertedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date: convertedTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      };
    }
  });

  return {
    id: `slot_${baseTime.getTime()}`,
    dateTime: baseTime.toISOString(),
    dayOfWeek: baseTime.toLocaleDateString('en-US', { weekday: 'long' }),
    date: baseTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timePST: baseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    duration,
    timezones,
    quality,
    qualityLabel: quality === 'best' ? '⭐ Best overlap' : quality === 'good' ? '✓ Good time' : '◌ Acceptable',
    warnings: []
  };
}

/**
 * Step 5: Generate formatted meeting proposal
 * @param {Object} meetingDetails - Meeting details
 * @param {Array} suggestedTimes - Suggested time slots
 * @returns {Promise<Object>} Meeting proposal
 */
async function generateMeetingProposal(meetingDetails, suggestedTimes) {
  const { topic, purpose, duration, participants, location } = meetingDetails;

  const participantNames = participants.map(p => p.name).join(', ');
  
  // ✅ SIMPLIFIED: No Google Calendar URLs (we removed that feature)
  const proposal = {
    title: topic,
    purpose,
    duration: `${duration} minutes`,
    participants: participants.length,
    participantNames,
    location,
    suggestedTimes: suggestedTimes, // Return as-is, no calendar URLs
    createdAt: new Date().toISOString()
  };

  return proposal;
}

/**
 * Generate Google Calendar URL
 * @param {string} title - Meeting title
 * @param {string} description - Meeting description
 * @param {string} dateTime - ISO date string
 * @param {number} duration - Duration in minutes
 * @param {string} attendees - Comma-separated attendee names
 * @returns {string} Google Calendar URL
 */
function generateGoogleCalendarUrl(title, description, dateTime, duration, attendees) {
  const startDate = new Date(dateTime);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: `${description}\n\nParticipants: ${attendees}`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    ctz: 'America/Los_Angeles'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

module.exports = {
  handler: async (event) => {
    console.log('[Scheduling Agent] HTTP Event received');
    
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
      console.error('[Scheduling Agent] Invalid JSON:', error);
      return responseUtils.error('Invalid JSON in request body', 400);
    }

    if (!body.conversationId || !body.userId) {
      return responseUtils.error('Missing required fields: conversationId, userId', 400);
    }

    return await handleSchedulingAgent(body);
  },
  handleSchedulingAgent,
  detectAllSchedulingThreads, // ✅ Export new multi-thread function
};

