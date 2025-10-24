/**
 * Proactive Scheduling Suggestion Component (PR #21)
 * Banner that appears when AI detects scheduling intent
 * 
 * Features:
 * - Appears above message input
 * - Dismissible
 * - Shows confidence level
 * - One-tap access to scheduling agent
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';

interface ProactiveSchedulingSuggestionProps {
  visible: boolean;
  confidence: number;
  triggerMessage: string;
  onSchedule: () => void;
  onDismiss: () => void;
}

export const ProactiveSchedulingSuggestion: React.FC<ProactiveSchedulingSuggestionProps> = ({
  visible,
  confidence,
  triggerMessage,
  onSchedule,
  onDismiss
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>✨ Proactive Assistant</Text>
          {confidence >= 0.85 && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
            </View>
          )}
        </View>

        <Text style={styles.message}>
          I noticed you're trying to schedule a meeting. Would you like help finding a time that works for everyone?
        </Text>

        {triggerMessage && (
          <View style={styles.triggerMessageContainer}>
            <Ionicons name="chatbox-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.triggerMessage} numberOfLines={1}>
              "{triggerMessage.substring(0, 60)}..."
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onSchedule}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={16} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Yes, help me schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>No, thanks</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary, // Dark theme
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  confidenceBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
  message: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  triggerMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground, // Dark theme
    borderRadius: 6,
    padding: 6,
    marginBottom: 12,
  },
  triggerMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
});

