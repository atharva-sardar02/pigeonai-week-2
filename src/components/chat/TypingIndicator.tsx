import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../utils/constants';
import { useUserDisplayName } from '../../hooks/useUserProfile';

interface TypingIndicatorProps {
  typingUserIds: string[]; // Array of user IDs who are typing
}

/**
 * Typing Indicator Component
 * 
 * Displays animated dots and "User is typing..." text
 * when one or more users are typing in the conversation.
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUserIds }) => {
  // Animation values for the three dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Get display name of first typing user
  const firstTypingUserId = typingUserIds[0] || null;
  const firstTypingUserName = useUserDisplayName(firstTypingUserId);

  /**
   * Animate the dots in sequence
   */
  useEffect(() => {
    if (typingUserIds.length === 0) return;

    const animateDot = (dotValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ]);

    animation.start();

    return () => {
      animation.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [typingUserIds.length, dot1, dot2, dot3]);

  if (typingUserIds.length === 0) {
    return null;
  }

  /**
   * Get typing text based on number of users
   */
  const getTypingText = (): string => {
    if (typingUserIds.length === 1) {
      return `${firstTypingUserName} is typing`;
    } else if (typingUserIds.length === 2) {
      return '2 people are typing';
    } else {
      return 'Several people are typing';
    }
  };

  /**
   * Get animated opacity for a dot
   */
  const getDotOpacity = (dotValue: Animated.Value) => {
    return dotValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { opacity: getDotOpacity(dot1) },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { opacity: getDotOpacity(dot2) },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { opacity: getDotOpacity(dot3) },
            ]}
          />
        </View>
      </View>
      
      {/* Typing text */}
      <Text style={styles.typingText}>{getTypingText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bubble: {
    backgroundColor: COLORS.receivedBubble,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: SPACING.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  typingText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

