/**
 * Decision Model
 * 
 * Represents a finalized decision extracted from conversations
 * for Remote Team Professional persona.
 * 
 * Use case: Track technical/architectural decisions made asynchronously
 * in distributed team conversations.
 */

/**
 * Alternative option that was considered and rejected
 */
export interface DecisionAlternative {
  option: string;
  reason_rejected: string;
}

/**
 * Decision confidence level
 */
export type DecisionConfidence = 'high' | 'medium' | 'low';

/**
 * Main Decision interface
 */
export interface Decision {
  id: string;
  decision: string;
  context: string;
  participants: string[];
  timestamp: Date | string;
  conversationId: string;
  messageIds: string[];
  confidence: DecisionConfidence;
  alternatives?: DecisionAlternative[];
  createdAt: Date | string;
}

/**
 * API response from decision tracking endpoint
 */
export interface DecisionTrackingResponse {
  decisions: Decision[];
  cached: boolean;
  messageCount: number;
  duration: number;
}

/**
 * Metadata for decision confidence display
 */
export interface DecisionConfidenceMetadata {
  label: string;
  color: string;
  icon: string;
  description: string;
}

/**
 * Get metadata for decision confidence level
 * 
 * @param confidence - Decision confidence level
 * @returns Metadata object with label, color, icon, description
 */
export function getConfidenceMetadata(confidence: DecisionConfidence): DecisionConfidenceMetadata {
  switch (confidence) {
    case 'high':
      return {
        label: 'High Confidence',
        color: '#10B981', // Green
        icon: 'checkmark-circle',
        description: 'Unanimous agreement',
      };
    case 'medium':
      return {
        label: 'Medium Confidence',
        color: '#F59E0B', // Amber
        icon: 'checkmark-circle-outline',
        description: 'Majority agreed',
      };
    case 'low':
      return {
        label: 'Low Confidence',
        color: '#6B7280', // Gray
        icon: 'help-circle-outline',
        description: 'Unclear consensus',
      };
    default:
      return {
        label: 'Unknown',
        color: '#6B7280',
        icon: 'help-circle',
        description: 'Unknown confidence',
      };
  }
}

/**
 * Convert ISO string to Date object
 * 
 * @param decision - Decision object
 * @returns Decision with Date objects
 */
export function parseDecisionDates(decision: Decision): Decision {
  return {
    ...decision,
    timestamp: typeof decision.timestamp === 'string' 
      ? new Date(decision.timestamp) 
      : decision.timestamp,
    createdAt: typeof decision.createdAt === 'string'
      ? new Date(decision.createdAt)
      : decision.createdAt,
  };
}

/**
 * Format decision timestamp for display
 * 
 * @param decision - Decision object
 * @returns Formatted timestamp string (e.g., "2 days ago", "Just now")
 */
export function formatDecisionTimestamp(decision: Decision): string {
  const date = typeof decision.timestamp === 'string' 
    ? new Date(decision.timestamp)
    : decision.timestamp;

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  
  // For older dates, show formatted date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get participant initials for avatar display
 * 
 * @param name - Participant name
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export function getParticipantInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Format participants list for display
 * 
 * @param participants - Array of participant names
 * @param maxDisplay - Maximum number of names to display before "and X more"
 * @returns Formatted string (e.g., "John, Sarah, and 2 more")
 */
export function formatParticipants(participants: string[], maxDisplay: number = 3): string {
  if (participants.length === 0) return 'No participants';
  if (participants.length === 1) return participants[0];
  if (participants.length === 2) return `${participants[0]} and ${participants[1]}`;
  
  if (participants.length <= maxDisplay) {
    const last = participants[participants.length - 1];
    const rest = participants.slice(0, -1).join(', ');
    return `${rest}, and ${last}`;
  }
  
  const displayed = participants.slice(0, maxDisplay).join(', ');
  const remaining = participants.length - maxDisplay;
  return `${displayed}, and ${remaining} more`;
}

/**
 * Sort decisions by timestamp (newest first)
 * 
 * @param decisions - Array of decisions
 * @returns Sorted array (newest first)
 */
export function sortDecisionsByTime(decisions: Decision[]): Decision[] {
  return [...decisions].sort((a, b) => {
    const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
    const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Filter decisions by confidence level
 * 
 * @param decisions - Array of decisions
 * @param minConfidence - Minimum confidence level ('high', 'medium', 'low')
 * @returns Filtered array
 */
export function filterDecisionsByConfidence(
  decisions: Decision[], 
  minConfidence: DecisionConfidence
): Decision[] {
  const confidenceLevels: DecisionConfidence[] = ['high', 'medium', 'low'];
  const minIndex = confidenceLevels.indexOf(minConfidence);
  
  return decisions.filter(decision => {
    const decisionIndex = confidenceLevels.indexOf(decision.confidence);
    return decisionIndex <= minIndex;
  });
}

/**
 * Filter decisions by participant
 * 
 * @param decisions - Array of decisions
 * @param participantName - Participant name to filter by
 * @returns Filtered array
 */
export function filterDecisionsByParticipant(
  decisions: Decision[], 
  participantName: string
): Decision[] {
  return decisions.filter(decision => 
    decision.participants.some(p => 
      p.toLowerCase().includes(participantName.toLowerCase())
    )
  );
}

/**
 * Search decisions by keyword
 * 
 * @param decisions - Array of decisions
 * @param query - Search query
 * @returns Filtered array
 */
export function searchDecisions(decisions: Decision[], query: string): Decision[] {
  const lowerQuery = query.toLowerCase();
  return decisions.filter(decision => 
    decision.decision.toLowerCase().includes(lowerQuery) ||
    decision.context.toLowerCase().includes(lowerQuery) ||
    decision.participants.some(p => p.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Group decisions by date
 * 
 * @param decisions - Array of decisions
 * @returns Object with date keys and decision arrays
 */
export function groupDecisionsByDate(decisions: Decision[]): Record<string, Decision[]> {
  const groups: Record<string, Decision[]> = {};
  
  decisions.forEach(decision => {
    const date = typeof decision.timestamp === 'string'
      ? new Date(decision.timestamp)
      : decision.timestamp;
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    let key: string;
    if (days === 0) key = 'Today';
    else if (days === 1) key = 'Yesterday';
    else if (days < 7) key = 'This Week';
    else if (days < 30) key = 'This Month';
    else key = 'Older';
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(decision);
  });
  
  return groups;
}

/**
 * Check if decision is high confidence
 * 
 * @param decision - Decision object
 * @returns True if high confidence
 */
export function isHighConfidence(decision: Decision): boolean {
  return decision.confidence === 'high';
}

/**
 * Get decision summary for display
 * 
 * @param decision - Decision object
 * @param maxLength - Maximum length of decision text
 * @returns Truncated decision text
 */
export function getDecisionSummary(decision: Decision, maxLength: number = 100): string {
  if (decision.decision.length <= maxLength) {
    return decision.decision;
  }
  return decision.decision.substring(0, maxLength - 3) + '...';
}

/**
 * Validate decision object
 * 
 * @param decision - Decision object
 * @returns True if valid
 */
export function validateDecision(decision: Decision): boolean {
  return !!(
    decision.id &&
    decision.decision &&
    decision.context &&
    Array.isArray(decision.participants) &&
    decision.participants.length > 0 &&
    decision.timestamp &&
    decision.conversationId &&
    decision.confidence &&
    ['high', 'medium', 'low'].includes(decision.confidence)
  );
}

