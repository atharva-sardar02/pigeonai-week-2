import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

/**
 * NotificationBanner Component
 * 
 * Shows a slide-in banner at the top when notifications are received in foreground
 * Auto-dismisses after 4 seconds
 * Tappable to navigate to the conversation
 */

interface NotificationBannerProps {
  visible: boolean;
  title: string;
  message: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = 80;

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  title,
  message,
  onPress,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const dismissTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();

      // Auto-dismiss after 4 seconds
      dismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, 4000);
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -BANNER_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [visible]);

  const handleDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handlePress = () => {
    handleDismiss();
    if (onPress) {
      onPress();
    }
  };

  if (!visible && slideAnim.__getValue() === -BANNER_HEIGHT) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Notification Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>💬</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SIZES.padding,
    paddingTop: 45, // Account for status bar
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    marginRight: SIZES.padding,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  message: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
});

