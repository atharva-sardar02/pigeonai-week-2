/**
 * Meeting Proposal Model (PR #21)
 * TypeScript interfaces and helper functions for scheduling agent
 */

export interface TimeSlot {
  id: string;
  dateTime: string; // ISO 8601 format
  dayOfWeek: string; // e.g., "Tuesday"
  date: string; // e.g., "Oct 29, 2025"
  timePST: string; // e.g., "9:00 AM"
  duration: number; // minutes
  timezones: { [key: string]: { time: string; date: string } };
  quality: 'best' | 'good' | 'acceptable';
  qualityLabel: string; // e.g., "⭐ Best overlap"
  warnings: string[];
  calendarUrl?: string;
}

export interface Participant {
  id: string;
  name: string;
  timezone: string; // e.g., "PST", "GMT", "IST"
  availability?: 'available' | 'busy' | 'tentative';
}

export interface MeetingDetails {
  topic: string;
  purpose: string;
  duration: number; // minutes
  preferredDate?: string | null;
  preferredTime?: string | null;
  timeframe: string; // e.g., "next week", "tomorrow"
  participants: Participant[];
  location: string; // "Virtual" or physical location
  priority: 'urgent' | 'normal' | 'low';
}

export interface MeetingProposal {
  title: string;
  purpose: string;
  duration: string; // e.g., "30 minutes"
  participants: number;
  participantNames: string;
  location: string;
  suggestedTimes: TimeSlot[];
  createdAt: string; // ISO timestamp
}

export interface SchedulingAgentResponse {
  hasSchedulingIntent: boolean;
  confidence: number; // 0-1
  triggerMessage?: string;
  meetingDetails?: MeetingDetails;
  suggestedTimes?: TimeSlot[];
  proposal?: MeetingProposal;
  participants?: Participant[];
  duration: number; // ms
  cached?: boolean;
  message?: string;
}

// ================== HELPER FUNCTIONS ==================

/**
 * Format time slot for display
 * @param timeSlot - Time slot object
 * @param timezone - Timezone to display (default: PST)
 * @returns Formatted string
 */
export function formatTimeSlot(timeSlot: TimeSlot, timezone: string = 'PST'): string {
  const tzData = timeSlot.timezones[timezone];
  if (!tzData) {
    return `${timeSlot.dayOfWeek}, ${timeSlot.date} at ${timeSlot.timePST} PST`;
  }
  return `${timeSlot.dayOfWeek}, ${timeSlot.date} at ${tzData.time} ${timezone}`;
}

/**
 * Get quality badge for time slot
 * @param quality - Quality level
 * @returns { icon: string, label: string, color: string }
 */
export function getQualityBadge(quality: 'best' | 'good' | 'acceptable'): {
  icon: string;
  label: string;
  color: string;
} {
  switch (quality) {
    case 'best':
      return { icon: '⭐', label: 'Best overlap', color: '#10B981' }; // green
    case 'good':
      return { icon: '✓', label: 'Good time', color: '#3B82F6' }; // blue
    case 'acceptable':
      return { icon: '◌', label: 'Acceptable', color: '#F59E0B' }; // amber
    default:
      return { icon: '', label: '', color: '#6B7280' }; // gray
  }
}

/**
 * Format all timezones for a time slot
 * @param timeSlot - Time slot object
 * @returns Array of formatted timezone strings
 */
export function formatAllTimezones(timeSlot: TimeSlot): string[] {
  return Object.entries(timeSlot.timezones).map(([tz, data]) => {
    return `${data.time} ${tz}`;
  });
}

/**
 * Get participants by timezone
 * @param participants - Array of participants
 * @returns Grouped by timezone
 */
export function groupParticipantsByTimezone(participants: Participant[]): { [timezone: string]: Participant[] } {
  const grouped: { [timezone: string]: Participant[] } = {};
  participants.forEach(p => {
    const tz = p.timezone || 'PST';
    if (!grouped[tz]) {
      grouped[tz] = [];
    }
    grouped[tz].push(p);
  });
  return grouped;
}

/**
 * Check if time slot is in working hours for all participants
 * @param timeSlot - Time slot object
 * @param workingHours - { start: number, end: number } in 24-hour format
 * @returns { isValid: boolean, warnings: string[] }
 */
export function validateWorkingHours(
  timeSlot: TimeSlot,
  workingHours: { start: number; end: number } = { start: 9, end: 17 }
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // For MVP, just check if the time is reasonable
  const time = new Date(timeSlot.dateTime);
  const hour = time.getHours();
  
  if (hour < workingHours.start) {
    warnings.push(`Time is before ${workingHours.start}:00 AM`);
  }
  if (hour >= workingHours.end) {
    warnings.push(`Time is after ${workingHours.end}:00 PM`);
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Format duration in human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "30 min", "1 hour", "1.5 hours")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes === 60) {
    return '1 hour';
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hours`;
    } else {
      return `${hours}h ${mins}min`;
    }
  }
}

/**
 * Calculate end time for a time slot
 * @param timeSlot - Time slot object
 * @returns End time in ISO format
 */
export function calculateEndTime(timeSlot: TimeSlot): string {
  const startTime = new Date(timeSlot.dateTime);
  const endTime = new Date(startTime.getTime() + timeSlot.duration * 60 * 1000);
  return endTime.toISOString();
}

/**
 * Format time slot with all timezone conversions
 * @param timeSlot - Time slot object
 * @returns Multi-line formatted string
 */
export function formatTimeSlotDetailed(timeSlot: TimeSlot): string {
  const badge = getQualityBadge(timeSlot.quality);
  const timezones = formatAllTimezones(timeSlot);
  
  return `${badge.icon} ${timeSlot.dayOfWeek}, ${timeSlot.date}
${timezones.join(' / ')}
Duration: ${formatDuration(timeSlot.duration)}
${badge.label}`;
}

/**
 * Generate iCal file content for a meeting
 * @param proposal - Meeting proposal
 * @param selectedSlot - Selected time slot
 * @returns iCal file content
 */
export function generateICalFile(proposal: MeetingProposal, selectedSlot: TimeSlot): string {
  const startTime = new Date(selectedSlot.dateTime);
  const endTime = new Date(startTime.getTime() + selectedSlot.duration * 60 * 1000);
  
  const formatICalDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pigeon AI//Scheduling Agent//EN
BEGIN:VEVENT
UID:${selectedSlot.id}@pigeonai.app
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startTime)}
DTEND:${formatICalDate(endTime)}
SUMMARY:${proposal.title}
DESCRIPTION:${proposal.purpose}\\n\\nParticipants: ${proposal.participantNames}
LOCATION:${proposal.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

/**
 * Get priority metadata
 * @param priority - Priority level
 * @returns { label: string, color: string, icon: string }
 */
export function getPriorityMetadata(priority: 'urgent' | 'normal' | 'low'): {
  label: string;
  color: string;
  icon: string;
} {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', color: '#EF4444', icon: '🔴' }; // red
    case 'normal':
      return { label: 'Normal', color: '#3B82F6', icon: '🔵' }; // blue
    case 'low':
      return { label: 'Low', color: '#6B7280', icon: '⚪' }; // gray
    default:
      return { label: 'Normal', color: '#3B82F6', icon: '🔵' };
  }
}

/**
 * Sort time slots by quality (best first)
 * @param slots - Array of time slots
 * @returns Sorted array
 */
export function sortTimeSlotsByQuality(slots: TimeSlot[]): TimeSlot[] {
  const qualityOrder = { best: 0, good: 1, acceptable: 2 };
  return [...slots].sort((a, b) => qualityOrder[a.quality] - qualityOrder[b.quality]);
}

/**
 * Filter time slots by quality
 * @param slots - Array of time slots
 * @param minQuality - Minimum quality ('best', 'good', 'acceptable')
 * @returns Filtered array
 */
export function filterTimeSlotsByQuality(
  slots: TimeSlot[],
  minQuality: 'best' | 'good' | 'acceptable'
): TimeSlot[] {
  const qualityOrder = { best: 0, good: 1, acceptable: 2 };
  const threshold = qualityOrder[minQuality];
  
  return slots.filter(slot => qualityOrder[slot.quality] <= threshold);
}

