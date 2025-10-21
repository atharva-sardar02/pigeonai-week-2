import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Conversation } from '../../types';
import { COLORS, SIZES } from '../../utils/constants';
import { formatMessageTime } from '../../utils/dateFormatter';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
  onTitlePress?: () => void; // New prop for tapping on the header
  isOnline?: boolean;
  lastSeen?: Date | null;
  getUserDisplayName?: (userId: string) => string;
}

/**
 * Chat Header Component
 * 
 * Header bar for chat screen showing conversation details.
 * 
 * Features:
 * - Back button
 * - Conversation/user name
 * - Online status indicator with last seen
 * - Typing indicator (future)
 * - Group info (future)
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUserId,
  onBack,
  onTitlePress,
  isOnline = false,
  lastSeen = null,
  getUserDisplayName,
}) => {
  // Check if it's a group
  const isGroup = conversation.type === 'group';

  // Get display name for conversation
  const getDisplayName = (): string => {
    if (isGroup) {
      return conversation.name || 'Group Chat';
    }
    
    // For direct messages, show the other participant's name
    const otherParticipantId = conversation.participants.find(
      (id) => id !== currentUserId
    );
    
    if (otherParticipantId && getUserDisplayName) {
      return getUserDisplayName(otherParticipantId);
    }
    
    return 'Chat';
  };

  const displayName = getDisplayName();

  // Get participant count for groups
  const participantCount = conversation.participants.length;

  // Format last seen time
  const getStatusText = (): string => {
    if (isOnline) return 'Online';
    if (lastSeen) return `Last seen ${formatMessageTime(lastSeen)}`;
    return 'Offline';
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.backIcon}>
          <View style={styles.backIconTriangle} />
        </View>
      </TouchableOpacity>

      {/* Conversation Info - Tappable */}
      <TouchableOpacity
        style={styles.infoContainer}
        onPress={onTitlePress}
        activeOpacity={onTitlePress ? 0.7 : 1}
        disabled={!onTitlePress}
      >
        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>

        {/* Status/Subtitle */}
        <View style={styles.statusContainer}>
          {isGroup ? (
            <Text style={styles.status}>
              {participantCount} participants
            </Text>
          ) : (
            <>
              {isOnline && (
                <View style={styles.onlineIndicator} />
              )}
              <Text style={styles.status}>
                {getStatusText()}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* More Options Button (Future) */}
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => {
          // TODO: Open conversation settings
          console.log('More options tapped');
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.moreIcon}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingSmall,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.paddingSmall,
  },
  backIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 6,
    borderTopWidth: 6,
    borderRightColor: COLORS.primary,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: SIZES.fontLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  status: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.online,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.paddingSmall,
  },
  moreIcon: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
  },
});

