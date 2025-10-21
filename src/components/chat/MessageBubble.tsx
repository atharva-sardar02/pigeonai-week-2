import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../../types';
import { COLORS, SIZES } from '../../utils/constants';
import * as MessageModel from '../../models/Message';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
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
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const bubbleStyle = isOwnMessage ? styles.sentBubble : styles.receivedBubble;
  const textStyle = isOwnMessage ? styles.sentText : styles.receivedText;
  const containerStyle = isOwnMessage ? styles.sentContainer : styles.receivedContainer;

  // Format timestamp
  const timestamp = MessageModel.formatTimestamp(message.timestamp);

  // Get status indicator
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (MessageModel.isRead(message)) {
      return <Text style={styles.statusIcon}>✓✓</Text>; // Double check (read)
    } else if (MessageModel.isDelivered(message)) {
      return <Text style={styles.statusIcon}>✓✓</Text>; // Double check (delivered)
    } else if (MessageModel.isSent(message)) {
      return <Text style={styles.statusIcon}>✓</Text>; // Single check (sent)
    } else if (MessageModel.isSending(message)) {
      return <Text style={styles.statusIconPending}>○</Text>; // Clock (sending)
    } else if (MessageModel.isFailed(message)) {
      return <Text style={styles.statusIconFailed}>!</Text>; // Exclamation (failed)
    }
    return null;
  };

  return (
    <View style={containerStyle}>
      <View style={[styles.bubble, bubbleStyle]}>
        {/* Message Content */}
        {message.type === 'text' && (
          <Text style={[styles.messageText, textStyle]}>
            {message.content}
          </Text>
        )}

        {/* TODO: Add image support in future task */}
        {message.type === 'image' && message.imageUrl && (
          <Text style={[styles.messageText, textStyle]}>
            [Image] {message.content}
          </Text>
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
    color: 'rgba(255, 255, 255, 0.8)',
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
});

