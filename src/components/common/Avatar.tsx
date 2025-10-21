import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../utils/constants';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  imageUrl?: string | null;
  displayName?: string;
  size?: AvatarSize;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Avatar Component (Task 4.14)
 * 
 * Reusable avatar component with:
 * - Image display (if provided)
 * - Initials fallback (from displayName)
 * - Multiple sizes (small, medium, large, xlarge)
 * - Online status indicator (optional)
 * - Custom colors (optional)
 * 
 * Usage:
 * <Avatar 
 *   imageUrl={user.photoURL}
 *   displayName="John Doe"
 *   size="medium"
 *   showOnlineStatus
 *   isOnline={true}
 * />
 */
export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  displayName = '?',
  size = 'medium',
  showOnlineStatus = false,
  isOnline = false,
  backgroundColor = COLORS.primary,
  textColor = COLORS.buttonPrimaryText,
}) => {
  // Calculate size dimensions
  const dimensions = getSizeDimensions(size);

  // Get initials from display name
  const getInitials = (): string => {
    if (!displayName || displayName === '?') return '?';
    
    const words = displayName.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials();

  return (
    <View style={[styles.container, { width: dimensions.size, height: dimensions.size }]}>
      {/* Avatar Circle */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: dimensions.size,
              height: dimensions.size,
              borderRadius: dimensions.size / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: dimensions.size,
              height: dimensions.size,
              borderRadius: dimensions.size / 2,
              backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: dimensions.fontSize,
                color: textColor,
              },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: dimensions.statusSize,
              height: dimensions.statusSize,
              borderRadius: dimensions.statusSize / 2,
              backgroundColor: isOnline ? COLORS.online : COLORS.offline,
              borderWidth: dimensions.statusBorderWidth,
            },
          ]}
        />
      )}
    </View>
  );
};

/**
 * Get dimensions based on avatar size
 */
function getSizeDimensions(size: AvatarSize) {
  switch (size) {
    case 'small':
      return {
        size: 32,
        fontSize: 14,
        statusSize: 10,
        statusBorderWidth: 2,
      };
    case 'medium':
      return {
        size: 48,
        fontSize: 18,
        statusSize: 14,
        statusBorderWidth: 2,
      };
    case 'large':
      return {
        size: 64,
        fontSize: 24,
        statusSize: 16,
        statusBorderWidth: 3,
      };
    case 'xlarge':
      return {
        size: 100,
        fontSize: 36,
        statusSize: 20,
        statusBorderWidth: 3,
      };
    default:
      return {
        size: 48,
        fontSize: 18,
        statusSize: 14,
        statusBorderWidth: 2,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  } as ViewStyle,

  image: {
    resizeMode: 'cover',
  } as ImageStyle,

  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  initials: {
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    textAlign: 'center',
  } as TextStyle,

  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: COLORS.background,
  } as ViewStyle,
});

