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
  isGroupChat?: boolean; // New prop for group chat support
}

/**
 * Message List Component
 * 
 * Displays a scrollable list of messages in a conversation.
 * 
 * Features:
 * - FlatList with virtualization for performance
 * - Natural scrolling (new messages at bottom)
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
  isGroupChat = false,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const isInitialMount = useRef(true);

  // Scroll to bottom on initial load (when messages first arrive)
  useEffect(() => {
    if (messages.length > 0 && isInitialMount.current) {
      isInitialMount.current = false;
      // Scroll to end (bottom) after initial render
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  const previousMessageCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > previousMessageCount.current && !isInitialMount.current) {
      // New message arrived - smoothly scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
        isGroupChat={isGroupChat}
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
  // Use useMemo to prevent flickering during re-renders
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set<string>();
    const filtered: Message[] = [];
    
    for (const msg of messages) {
      if (seen.has(msg.id)) {
        console.warn('Duplicate message ID found in MessageList:', msg.id);
        continue;
      }
      seen.add(msg.id);
      filtered.push(msg);
    }
    
    return filtered;
  }, [messages]);

  return (
    <FlatList
      ref={flatListRef}
      data={uniqueMessages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      extraData={uniqueMessages.length} // Force re-render only when count changes
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
      removeClippedSubviews={true} // Improve performance and reduce flicker
      maxToRenderPerBatch={10} // Render fewer items per batch
      updateCellsBatchingPeriod={50} // Batch updates
      windowSize={21} // Keep reasonable number of items in memory
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingVertical: SIZES.paddingSmall,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge * 2,
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

