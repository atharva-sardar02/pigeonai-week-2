import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Conversation } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { formatTimestamp } from '../../utils/dateFormatter';
import { Avatar } from '../common/Avatar';
import { useUserDisplayName } from '../../hooks/useUserProfile';
import { usePresence } from '../../hooks/usePresence';

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: (conversation: Conversation) => void;
}

/**
 * ConversationListItem Component (Task 4.8)
 * 
 * Displays a single conversation in the list with:
 * - Avatar placeholder (or initials)
 * - Conversation name (or recipient name for 1-1 chats)
 * - Last message preview
 * - Timestamp
 * - Unread badge count
 * - Online status indicator (for direct messages)
 */
export function ConversationListItem({
  conversation,
  currentUserId,
  onPress,
}: ConversationListItemProps) {
  // Calculate unread count for current user
  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;
  const hasUnread = unreadCount > 0;

  // Get the other participant's ID for direct messages
  const otherUserId = conversation.type === 'dm' || conversation.type === 'direct'
    ? conversation.participants.find((id) => id !== currentUserId)
    : null;

  // Fetch other user's display name (cached)
  const otherUserName = useUserDisplayName(otherUserId);

  // Get other user's presence status (for DMs only)
  const { isOnline } = usePresence(otherUserId);

  // Get display name (for groups, use name; for 1-1, use other participant's name)
  const displayName = conversation.type === 'group'
    ? conversation.name || 'Group Chat'
    : otherUserName;

  // Format last message preview
  const lastMessagePreview = conversation.lastMessage
    ? conversation.lastMessage.length > 50
      ? `${conversation.lastMessage.substring(0, 50)}...`
      : conversation.lastMessage
    : 'No messages yet';

  // Format timestamp
  const timestamp = conversation.updatedAt
    ? formatTimestamp(conversation.updatedAt)
    : '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      {/* Avatar with online status */}
      <View style={styles.avatarContainer}>
        <Avatar
          displayName={displayName}
          size="large"
          showOnlineStatus={conversation.type === 'direct' || conversation.type === 'dm'}
          isOnline={isOnline}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: Name & Timestamp */}
        <View style={styles.topRow}>
          <Text
            style={[styles.name, hasUnread && styles.nameUnread]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {timestamp && (
            <Text
              style={[styles.timestamp, hasUnread && styles.timestampUnread]}
            >
              {timestamp}
            </Text>
          )}
        </View>

        {/* Bottom row: Last message & Unread badge */}
        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessage,
              hasUnread && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {lastMessagePreview}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  avatarContainer: {
    marginRight: SPACING.md,
  } as ViewStyle,

  content: {
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  } as ViewStyle,

  name: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginRight: SPACING.sm,
  } as TextStyle,

  nameUnread: {
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
  } as TextStyle,

  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  } as TextStyle,

  timestampUnread: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
  } as TextStyle,

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  lastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  } as TextStyle,

  lastMessageUnread: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.medium as TextStyle['fontWeight'],
  } as TextStyle,

  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  } as ViewStyle,

  unreadText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.buttonPrimaryText,
  } as TextStyle,
});

