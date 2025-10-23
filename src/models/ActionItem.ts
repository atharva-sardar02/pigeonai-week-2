/**
 * Action Item Model
 * 
 * Represents a task extracted from conversations
 */

export interface ActionItem {
  id: string;
  task: string;
  assignee: string | null;
  deadline: Date | null;
  priority: 'high' | 'medium' | 'low';
  messageId: string;
  conversationId: string;
  context?: string;
  dependencies?: string[];
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface ActionItemResponse {
  actionItems: ActionItem[];
  conversationId: string;
  messageCount: number;
  requestedLimit: number;
  extractedAt: string;
  totalItems: number;
  breakdown: {
    high: number;
    medium: number;
    low: number;
    assigned: number;
    unassigned: number;
  };
  cached: boolean;
  duration?: number;
}

/**
 * Priority color mapping
 */
export const PRIORITY_COLORS = {
  high: '#EF4444', // Red
  medium: '#F59E0B', // Amber
  low: '#10B981', // Green
};

/**
 * Priority labels
 */
export const PRIORITY_LABELS = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
};

/**
 * Priority icons (using emoji)
 */
export const PRIORITY_ICONS = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

/**
 * Format deadline for display
 */
export function formatDeadline(deadline: Date | null): string {
  if (!deadline) return 'No deadline';
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Past deadline
  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return 'Overdue (today)';
    if (absDays === 1) return 'Overdue (1 day)';
    return `Overdue (${absDays} days)`;
  }
  
  // Today
  if (diffDays === 0) {
    if (diffHours === 0) return 'Due in < 1 hour';
    if (diffHours === 1) return 'Due in 1 hour';
    return `Due in ${diffHours} hours`;
  }
  
  // Tomorrow
  if (diffDays === 1) return 'Due tomorrow';
  
  // This week
  if (diffDays < 7) return `Due in ${diffDays} days`;
  
  // Format as date
  return deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: deadlineDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get urgency level based on deadline
 */
export function getUrgency(deadline: Date | null): 'overdue' | 'urgent' | 'normal' | 'none' {
  if (!deadline) return 'none';
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMs < 0) return 'overdue';
  if (diffHours < 24) return 'urgent';
  return 'normal';
}

/**
 * Sort action items by priority and deadline
 */
export function sortActionItems(items: ActionItem[]): ActionItem[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return [...items].sort((a, b) => {
    // First by completed status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by deadline (overdue first, then nearest)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    
    // Finally by created date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Filter action items
 */
export function filterActionItems(
  items: ActionItem[],
  filter: 'all' | 'assigned-to-me' | 'completed' | 'incomplete',
  currentUserId?: string
): ActionItem[] {
  switch (filter) {
    case 'assigned-to-me':
      if (!currentUserId) return [];
      return items.filter(item => item.assignee === currentUserId);
    
    case 'completed':
      return items.filter(item => item.completed);
    
    case 'incomplete':
      return items.filter(item => !item.completed);
    
    case 'all':
    default:
      return items;
  }
}

