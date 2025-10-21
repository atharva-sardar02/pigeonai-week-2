/**
 * Date Formatter Utilities (Task 4.13)
 * 
 * Functions for formatting timestamps in user-friendly ways:
 * - "Just now" (< 1 minute ago)
 * - "5m ago" (< 1 hour ago)
 * - "2h ago" (< 24 hours ago)
 * - "Yesterday" (yesterday)
 * - "Mon" (this week)
 * - "Jan 15" (this year)
 * - "Jan 15, 2023" (older)
 */

/**
 * Format a timestamp for conversation list
 * Shows relative time for recent messages, absolute date for older ones
 * 
 * Examples:
 * - 30 seconds ago → "Just now"
 * - 5 minutes ago → "5m"
 * - 2 hours ago → "2h"
 * - Yesterday → "Yesterday"
 * - 3 days ago → "Mon"
 * - 2 months ago → "Jan 15"
 * - Last year → "Jan 15, 2023"
 */
export function formatTimestamp(date: Date | string | number): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Less than 1 minute ago
  if (diffMinutes < 1) {
    return 'Just now';
  }

  // Less than 1 hour ago
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  // Less than 24 hours ago
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // Less than 7 days ago (this week)
  if (diffDays < 7) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Same year
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // Different year
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a timestamp for message display
 * Shows time for today, date for older messages
 * 
 * Examples:
 * - Today → "10:30 AM"
 * - Yesterday → "Yesterday 10:30 AM"
 * - This year → "Jan 15, 10:30 AM"
 * - Last year → "Jan 15, 2023"
 */
export function formatMessageTime(date: Date | string | number): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = messageDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Today
  if (diffDays === 0) {
    return timeStr;
  }

  // Yesterday
  if (diffDays === 1) {
    return `Yesterday ${timeStr}`;
  }

  // Same year
  if (messageDate.getFullYear() === now.getFullYear()) {
    const dateStr = messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr}, ${timeStr}`;
  }

  // Different year
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a full timestamp for message details
 * Shows full date and time
 * 
 * Example: "Monday, January 15, 2024 at 10:30 AM"
 */
export function formatFullTimestamp(date: Date | string | number): string {
  const messageDate = new Date(date);
  return messageDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | number): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === yesterday.getDate() &&
    checkDate.getMonth() === yesterday.getMonth() &&
    checkDate.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Get relative time description
 * 
 * Examples:
 * - "a few seconds ago"
 * - "5 minutes ago"
 * - "2 hours ago"
 * - "3 days ago"
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffSeconds < 10) {
    return 'just now';
  } else if (diffSeconds < 60) {
    return 'a few seconds ago';
  } else if (diffMinutes === 1) {
    return '1 minute ago';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours === 1) {
    return '1 hour ago';
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return formatTimestamp(date);
  }
}

