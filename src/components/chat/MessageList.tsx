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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // Small delay to ensure FlatList has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }, 100);
    }
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
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.emptyText}>Loading messages...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyWrapper}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Start the conversation by sending a message
          </Text>
        </View>
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

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      inverted // New messages at bottom
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
      onScrollToIndexFailed={(info) => {
        // Handle scroll failures gracefully
        console.warn('Scroll to index failed:', info);
      }}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingVertical: SIZES.paddingSmall,
  },
  emptyWrapper: {
    flex: 1,
    transform: [{ scaleY: -1 }], // Counter the inverted list
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

