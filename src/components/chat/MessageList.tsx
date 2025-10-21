import React, { useRef, useEffect } from 'react';
import { 
  FlatList, 
  View, 
  StyleSheet, 
  ActivityIndicator,
  Text,
  RefreshControl 
} from 'react-native';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { COLORS, SIZES } from '../../utils/constants';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

/**
 * Message List Component
 * 
 * Displays a scrollable list of messages in a conversation.
 * 
 * Features:
 * - FlatList with virtualization for performance
 * - Inverted list (new messages at bottom)
 * - Auto-scroll to bottom on new message
 * - Pull-to-refresh for loading more messages
 * - Loading indicators
 * - Empty state
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading = false,
  onLoadMore,
  onRefresh,
  refreshing = false,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const isInitialMount = useRef(true);

  // Scroll to bottom on initial load (when messages first arrive)
  useEffect(() => {
    if (messages.length > 0 && isInitialMount.current) {
      isInitialMount.current = false;
      // For inverted list, offset 0 is the bottom (newest messages)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 100);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  const previousMessageCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > previousMessageCount.current && !isInitialMount.current) {
      // New message arrived - scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 50);
    }
    previousMessageCount.current = messages.length;
  }, [messages.length]);

  // Render individual message
  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;
    
    return (
      <MessageBubble 
        message={item} 
        isOwnMessage={isOwnMessage} 
      />
    );
  };

  // Empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading messages...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>
          Start the conversation by sending a message
        </Text>
      </View>
    );
  };

  // Footer (shows when loading more)
  const renderFooter = () => {
    if (!loading || messages.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  // Key extractor
  const keyExtractor = (item: Message) => item.id;

  // Deduplicate messages (safety check - shouldn't have duplicates but just in case)
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set<string>();
    return messages.filter(msg => {
      if (seen.has(msg.id)) {
        console.warn('Duplicate message ID found in MessageList:', msg.id);
        return false;
      }
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  // Reverse messages for inverted FlatList
  // Firestore returns oldest->newest, inverted list needs newest->oldest
  const reversedMessages = [...uniqueMessages].reverse();

  return (
    <FlatList
      ref={flatListRef}
      data={reversedMessages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      inverted // Keeps keyboard behavior smooth and new messages at bottom
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingVertical: SIZES.paddingSmall,
    // For inverted list with empty state, we need special handling
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge * 2,
    // Flip the empty state back to normal since the FlatList is inverted
    // Rotate 180deg on Z axis to flip without perspective distortion
    transform: [{ rotate: '180deg' }],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.paddingMedium,
  },
  emptyText: {
    fontSize: SIZES.fontLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.paddingSmall,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMedium,
    gap: SIZES.paddingSmall,
  },
  footerText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
  },
});

