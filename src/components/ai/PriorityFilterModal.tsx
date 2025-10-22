import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Message, MessagePriority } from '../../types';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../utils/constants';
import * as MessageModel from '../../models/Message';

interface PriorityFilterModalProps {
  visible: boolean;
  messages: Message[];
  onClose: () => void;
  onNavigateToMessage?: (messageId: string) => void;
}

type FilterType = 'all' | 'high' | 'medium-high' | 'urgent-only';

/**
 * Priority Filter Modal Component (PR #19)
 * 
 * Features:
 * - Filter messages by priority (All / High / Medium & High / Urgent Only)
 * - Display priority stats (high/medium/low count)
 * - Navigate to message in conversation
 * - Visual priority indicators with color coding
 */
export const PriorityFilterModal: React.FC<PriorityFilterModalProps> = ({
  visible,
  messages,
  onClose,
  onNavigateToMessage,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Get priority stats
  const stats = MessageModel.getPriorityStats(messages);

  // Filter messages based on active filter
  const getFilteredMessages = (): Message[] => {
    switch (activeFilter) {
      case 'high':
        return MessageModel.filterByPriority(messages, 'high');
      case 'medium-high':
        return MessageModel.filterHighAndMediumPriority(messages);
      case 'urgent-only':
        return MessageModel.filterByPriority(messages, 'high');
      case 'all':
      default:
        return messages;
    }
  };

  const filteredMessages = getFilteredMessages();
  const sortedMessages = MessageModel.sortByPriorityAndTime(filteredMessages);

  // Get priority color
  const getPriorityColor = (priority?: MessagePriority): string => {
    if (!priority) return COLORS.textTertiary;
    const metadata = MessageModel.getPriorityMetadata(priority);
    return metadata.color;
  };

  // Render message item
  const renderMessageItem = (message: Message) => {
    const priorityColor = getPriorityColor(message.priority);
    const priorityLabel = message.priority 
      ? MessageModel.getPriorityMetadata(message.priority).label
      : 'Normal';

    return (
      <TouchableOpacity
        key={message.id}
        style={styles.messageItem}
        onPress={() => {
          if (onNavigateToMessage) {
            onNavigateToMessage(message.id);
            onClose();
          }
        }}
      >
        {/* Priority Indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}>
          <Text style={styles.priorityIcon}>
            {message.priority === 'high' ? '🔴' : message.priority === 'medium' ? '🟡' : '⚪'}
          </Text>
        </View>

        {/* Message Content */}
        <View style={styles.messageContent}>
          {/* Priority Label */}
          <View style={styles.messageHeader}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {priorityLabel}
            </Text>
            <Text style={styles.timestamp}>
              {MessageModel.formatTimestamp(message.timestamp)}
            </Text>
          </View>

          {/* Message Text */}
          <Text style={styles.messageText} numberOfLines={2}>
            {MessageModel.getMessagePreview(message, 100)}
          </Text>
        </View>

        {/* Navigate Icon */}
        <View style={styles.navigateIcon}>
          <Text style={styles.navigateIconText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Priority Filter</Text>
            <Text style={styles.subtitle}>
              {sortedMessages.length} message{sortedMessages.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.high}</Text>
            <Text style={styles.statLabel}>High</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.medium}</Text>
            <Text style={styles.statLabel}>Medium</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.textTertiary }]}>{stats.low}</Text>
            <Text style={styles.statLabel}>Low</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'high' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('high')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'high' && styles.filterButtonTextActive]}>
              High Priority
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'medium-high' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('medium-high')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'medium-high' && styles.filterButtonTextActive]}>
              Medium & High
            </Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
          {sortedMessages.length > 0 ? (
            sortedMessages.map(message => renderMessageItem(message))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No messages found</Text>
              <Text style={styles.emptySubtext}>
                Try selecting a different filter
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.text,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    gap: SPACING.md,
  },
  priorityIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 20,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  priorityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  navigateIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateIconText: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

