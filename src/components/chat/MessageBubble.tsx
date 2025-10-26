import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Message } from '../../types';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../utils/constants';
import * as MessageModel from '../../models/Message';
import { useUserDisplayName } from '../../hooks/useUserProfile';
import * as ImageCacheService from '../../services/cache/imageCacheService';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isGroupChat?: boolean; // New prop to indicate if this is a group chat
  participantCount?: number; // Total participants in conversation (for group read status)
  onImagePress?: (imageUrl: string) => void; // Callback for image tap
}

/**
 * Message Bubble Component
 * 
 * Displays a single message in the chat with appropriate styling
 * for sent vs. received messages.
 * 
 * Features:
 * - Different colors for sent/received messages
 * - Timestamp display
 * - Status indicators (checkmarks for sent messages)
 * - Support for text and image messages
 * - Sender name display for group chats
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  isGroupChat = false,
  participantCount = 2,
  onImagePress,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
  
  const bubbleStyle = isOwnMessage ? styles.sentBubble : styles.receivedBubble;
  const textStyle = isOwnMessage ? styles.sentText : styles.receivedText;
  const containerStyle = isOwnMessage ? styles.sentContainer : styles.receivedContainer;

  // Cache image when message has an image
  useEffect(() => {
    if (message.type === 'image' && message.imageUrl) {
      setImageLoading(true);
      ImageCacheService.getCachedImage(message.imageUrl)
        .then((uri) => {
          setCachedImageUri(uri);
          setImageLoading(false);
        })
        .catch((error) => {
          console.error('[MessageBubble] Failed to cache image:', error);
          setCachedImageUri(message.imageUrl!); // Fallback to original URL
          setImageLoading(false);
        });
    }
  }, [message.imageUrl, message.type]);

  // Get sender name for group chats (only for received messages)
  const senderDisplayName = useUserDisplayName(message.senderId);
  const showSenderName = isGroupChat && !isOwnMessage;

  // Format timestamp
  const timestamp = MessageModel.formatTimestamp(message.timestamp);

  // Get status indicator
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    // Failed/Offline state
    if (MessageModel.isFailed(message)) {
      return <Text style={styles.statusIconFailed}>!</Text>; // Exclamation mark
    }
    
    // Sending state
    if (MessageModel.isSending(message)) {
      return <Text style={styles.statusIconPending}>○</Text>; // Clock icon
    }

    // Group chat logic
    if (isGroupChat) {
      // Count how many people have read (excluding sender)
      const readByCount = Object.keys(message.readBy || {}).length;
      const readByOthers = readByCount - 1; // Exclude sender
      const otherParticipants = participantCount - 1; // Exclude sender
      
      // All members read → Green double ticks
      if (readByOthers >= otherParticipants && otherParticipants > 0) {
        return <Text style={styles.statusIconRead}>✓✓</Text>;
      }
      
      // Message sent/delivered but not all read → Single tick
      if (MessageModel.isSent(message) || MessageModel.isDelivered(message)) {
        return <Text style={styles.statusIcon}>✓</Text>;
      }
      
      return null;
    }

    // DM logic (1-on-1 chat)
    if (MessageModel.isRead(message)) {
      // Blue double ticks (read)
      return <Text style={styles.statusIconRead}>✓✓</Text>;
    } else if (MessageModel.isDelivered(message)) {
      // Gray double ticks (delivered but not read)
      return <Text style={styles.statusIcon}>✓✓</Text>;
    } else if (MessageModel.isSent(message)) {
      // Single gray tick (sent)
      return <Text style={styles.statusIcon}>✓</Text>;
    }
    
    return null;
  };

  return (
    <View style={containerStyle}>
      <View style={[styles.bubble, bubbleStyle]}>
        {/* Priority Badge (PR #19) */}
        {message.priority && message.priority !== 'low' && (
          <View style={[
            styles.priorityBadge,
            message.priority === 'high' ? styles.priorityHigh : styles.priorityMedium,
            isOwnMessage && styles.priorityBadgeSent
          ]}>
            <Text style={styles.priorityIcon}>
              {message.priority === 'high' ? '🔴' : '🟡'}
            </Text>
            <Text style={styles.priorityLabel}>
              {message.priority === 'high' ? 'Urgent' : 'Important'}
            </Text>
          </View>
        )}

        {/* Sender Name (for group chats, received messages only) */}
        {showSenderName && (
          <Text style={styles.senderName}>
            {senderDisplayName}
          </Text>
        )}

        {/* Message Content */}
        {message.type === 'text' && (
          <Text style={[styles.messageText, textStyle]}>
            {message.content}
          </Text>
        )}

        {/* Image Message */}
        {message.type === 'image' && message.imageUrl && (
          <TouchableOpacity
            onPress={() => onImagePress?.(message.imageUrl!)}
            activeOpacity={0.9}
            disabled={imageError}
          >
            {/* Loading Indicator */}
            {imageLoading && (
              <View style={styles.imageLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}

            {/* Error State */}
            {imageError && (
              <View style={styles.imageError}>
                <Text style={styles.imageErrorText}>Failed to load image</Text>
              </View>
            )}

            {/* Image (using cached URI) */}
            {!imageError && cachedImageUri && !imageLoading && (
              <Image
                source={{ uri: cachedImageUri }}
                style={styles.messageImage}
                resizeMode="cover"
                onError={() => {
                  setImageError(true);
                }}
              />
            )}

            {/* Optional Caption */}
            {message.content && message.content !== '📷 Photo' && (
              <Text style={[styles.imageCaption, textStyle]}>
                {message.content}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Timestamp and Status */}
        <View style={styles.footer}>
          <Text style={[styles.timestamp, isOwnMessage && styles.timestampSent]}>
            {timestamp}
          </Text>
          {getStatusIcon()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sentContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 4,
    marginHorizontal: SIZES.paddingMedium,
    maxWidth: '75%',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 4,
    marginHorizontal: SIZES.paddingMedium,
    maxWidth: '75%',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sentBubble: {
    backgroundColor: COLORS.sentBubble, // #4A9FF5 (pigeon blue)
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: COLORS.receivedBubble, // #1A2533 (dark tertiary)
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  messageText: {
    fontSize: SIZES.fontMedium,
    lineHeight: 20,
  },
  sentText: {
    color: COLORS.sentText, // White
  },
  receivedText: {
    color: COLORS.receivedText, // White
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  timestampSent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)', // Gray ticks (sent/delivered)
  },
  statusIconRead: {
    fontSize: 12,
    color: '#10B981', // Green ticks (read) - emerald-500, high contrast on blue bubble
    fontWeight: 'bold',
  },
  statusIconPending: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statusIconFailed: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  // PR #19: Priority Badge Styles
  priorityBadge: {
    position: 'absolute',
    top: -10,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  priorityBadgeSent: {
    right: 8,
  },
  priorityHigh: {
    backgroundColor: '#EF4444', // red-500
  },
  priorityMedium: {
    backgroundColor: '#F59E0B', // amber-500
  },
  priorityIcon: {
    fontSize: 10,
  },
  priorityLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  // Image Message Styles
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundTertiary,
  },
  imageLoading: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageError: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imageErrorText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  imageCaption: {
    fontSize: SIZES.fontMedium,
    lineHeight: 20,
    marginTop: 8,
  },
});

