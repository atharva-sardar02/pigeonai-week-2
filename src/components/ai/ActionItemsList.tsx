import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ActionItem,
  formatDeadline,
  getUrgency,
  sortActionItems,
  filterActionItems,
  PRIORITY_COLORS,
  PRIORITY_ICONS,
} from '../../models/ActionItem';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';

interface ActionItemsListProps {
  visible: boolean;
  onClose: () => void;
  actionItems: ActionItem[];
  loading?: boolean;
  error?: string | null;
  messageCount?: number;
  cached?: boolean;
  duration?: number;
  currentUserId?: string;
  onToggleComplete?: (item: ActionItem) => void;
  onNavigateToMessage?: (messageId: string) => void;
}

type FilterType = 'all' | 'assigned-to-me' | 'incomplete' | 'completed';

/**
 * Modal to display extracted action items
 * Features:
 * - Priority-based color coding
 * - Deadline display with urgency indicators
 * - Mark as complete
 * - Navigate to source message
 * - Filter by status/assignment
 */
export default function ActionItemsList({
  visible,
  onClose,
  actionItems,
  loading = false,
  error = null,
  messageCount = 0,
  cached = false,
  duration = 0,
  currentUserId,
  onToggleComplete,
  onNavigateToMessage,
}: ActionItemsListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter and sort items
  const filteredItems = filterActionItems(sortActionItems(actionItems), filter, currentUserId);

  const handleToggleComplete = (item: ActionItem) => {
    if (onToggleComplete) {
      onToggleComplete(item);
    }
  };

  const handleNavigateToMessage = (messageId: string) => {
    if (onNavigateToMessage) {
      onNavigateToMessage(messageId);
      onClose(); // Close modal after navigation
    } else {
      Alert.alert('Not Implemented', 'Message navigation will be available soon');
    }
  };

  const renderFilterButtons = () => {
    const filters: { key: FilterType; label: string; icon: string }[] = [
      { key: 'all', label: 'All', icon: 'list' },
      { key: 'incomplete', label: 'Active', icon: 'radio-button-off' },
      { key: 'completed', label: 'Done', icon: 'checkmark-circle' },
    ];

    if (currentUserId) {
      filters.splice(1, 0, {
        key: 'assigned-to-me',
        label: 'Mine',
        icon: 'person',
      });
    }

    return (
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons
              name={f.icon as any}
              size={16}
              color={filter === f.key ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterButtonText,
                filter === f.key && styles.filterButtonTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderActionItem = (item: ActionItem, index: number) => {
    const urgency = getUrgency(item.deadline);
    const priorityColor = PRIORITY_COLORS[item.priority];
    const isOverdue = urgency === 'overdue';
    const isUrgent = urgency === 'urgent';

    return (
      <View key={index} style={styles.itemCard}>
        {/* Priority indicator */}
        <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

        <View style={styles.itemContent}>
          {/* Header row */}
          <View style={styles.itemHeader}>
            {/* Priority icon */}
            <Text style={styles.priorityIcon}>{PRIORITY_ICONS[item.priority]}</Text>

            {/* Assignee */}
            {item.assignee && item.assignee !== 'Unassigned' && (
              <View style={styles.assigneeBadge}>
                <Ionicons name="person" size={12} color={COLORS.primary} />
                <Text style={styles.assigneeText}>{item.assignee}</Text>
              </View>
            )}

            {/* Checkbox */}
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => handleToggleComplete(item)}
              style={styles.checkbox}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {item.completed ? (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              ) : (
                <Ionicons name="radio-button-off" size={24} color={COLORS.border} />
              )}
            </TouchableOpacity>
          </View>

          {/* Task description */}
          <Text
            style={[
              styles.taskText,
              item.completed && styles.taskTextCompleted,
            ]}
          >
            {item.task}
          </Text>

          {/* Deadline and context */}
          <View style={styles.itemFooter}>
            {item.deadline && (
              <View
                style={[
                  styles.deadlineBadge,
                  isOverdue && styles.deadlineBadgeOverdue,
                  isUrgent && styles.deadlineBadgeUrgent,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={isOverdue ? COLORS.error : isUrgent ? COLORS.warning : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.deadlineText,
                    isOverdue && styles.deadlineTextOverdue,
                    isUrgent && styles.deadlineTextUrgent,
                  ]}
                >
                  {formatDeadline(item.deadline)}
                </Text>
              </View>
            )}

            {/* Navigate to message */}
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => handleNavigateToMessage(item.messageId)}
            >
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              <Text style={styles.navigateText}>View</Text>
            </TouchableOpacity>
          </View>

          {/* Context (if available) */}
          {item.context && (
            <Text style={styles.contextText} numberOfLines={2}>
              {item.context}
            </Text>
          )}

          {/* Dependencies (if any) */}
          {item.dependencies && item.dependencies.length > 0 && (
            <View style={styles.dependenciesContainer}>
              <Ionicons name="link" size={12} color={COLORS.textSecondary} />
              <Text style={styles.dependenciesText}>
                Depends on {item.dependencies.length} other task(s)
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Extracting action items...</Text>
          <Text style={styles.loadingSubtext}>Analyzing conversation</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to extract action items</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClose}>
            <Text style={styles.retryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (actionItems.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color={COLORS.success} />
          <Text style={styles.emptyTitle}>No Action Items Found</Text>
          <Text style={styles.emptyText}>
            This conversation doesn't contain any tasks or assignments.
          </Text>
        </View>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="funnel-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Items Match Filter</Text>
          <Text style={styles.emptyText}>Try changing the filter above.</Text>
        </View>
      );
    }

    return (
      <>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{actionItems.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {actionItems.filter(i => i.priority === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {actionItems.filter(i => i.completed).length}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        {/* Items list */}
        <ScrollView
          style={styles.itemsList}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.itemsListContent}
        >
          {filteredItems.map((item, index) => renderActionItem(item, index))}

          {/* Metadata footer */}
          <View style={styles.metadataContainer}>
            <Text style={styles.metadata}>
              {messageCount} messages analyzed
              {cached && ' • From cache'}
              {duration > 0 && ` • ${(duration / 1000).toFixed(1)}s`}
            </Text>
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="checkbox-outline" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Action Items</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {!loading && !error && actionItems.length > 0 && renderFilterButtons()}

        {/* Content */}
        {renderContent()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium as any,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityBar: {
    height: 4,
    width: '100%',
  },
  itemContent: {
    padding: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  priorityIcon: {
    fontSize: FONT_SIZES.lg,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  assigneeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  checkbox: {
    padding: SPACING.xs,
  },
  taskText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  deadlineBadgeOverdue: {
    backgroundColor: COLORS.errorLight,
  },
  deadlineBadgeUrgent: {
    backgroundColor: COLORS.warningLight,
  },
  deadlineText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  deadlineTextOverdue: {
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  deadlineTextUrgent: {
    color: COLORS.warning,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  navigateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  contextText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  dependenciesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  dependenciesText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  loadingSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  errorSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.white,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  metadataContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metadata: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

