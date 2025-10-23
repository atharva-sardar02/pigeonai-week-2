/**
 * Proactive Assistant Screen
 * Full-screen interface for AI-powered meeting scheduling
 * 
 * Features:
 * - Scans entire conversation for scheduling hints
 * - Detects participant availability mentions
 * - Suggests times based on detected availability or defaults
 * - Simple confirm and share workflow
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';
import { scheduleMeeting } from '../../services/ai/aiService';
import { MainStackParamList } from '../../types';

type ProactiveAssistantRouteProp = RouteProp<MainStackParamList, 'ProactiveAssistant'>;
type ProactiveAssistantNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function ProactiveAssistantScreen() {
  const route = useRoute<ProactiveAssistantRouteProp>();
  const navigation = useNavigation<ProactiveAssistantNavigationProp>();
  
  const { conversationId, userId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedulingData();
  }, [conversationId]);

  const loadSchedulingData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await scheduleMeeting(conversationId, userId, 100);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to analyze conversation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (timeSlot: any) => {
    setSelectedTime(timeSlot);
  };

  const handleConfirm = () => {
    if (!selectedTime) return;

    Alert.alert(
      'Meeting Confirmed',
      `Meeting scheduled for ${selectedTime.date} at ${selectedTime.time}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!selectedTime || !data) return;

    const shareText = `📅 Meeting Invitation

📆 Date: ${selectedTime.date}
⏰ Time: ${selectedTime.time} - ${selectedTime.endTime}
⏱️ Duration: 30 min

${data.triggerMessage || 'Meeting request'}

Let me know if this works for you!`;

    try {
      await Share.share({
        message: shareText,
        title: 'Meeting Invitation'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✨ Proactive Assistant</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing conversation...</Text>
          <Text style={styles.loadingSubtext}>Looking for scheduling hints and availability</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data || !data.threads || data.threads.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✨ Proactive Assistant</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>No Scheduling Needed</Text>
          <Text style={styles.emptySubtext}>
            I didn't find any scheduling requests in this conversation
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If a thread is selected, show time suggestions for that thread
  if (selectedThread) {
    return renderThreadDetail();
  }

  // Otherwise, show list of all threads
  return renderThreadList();

  function renderThreadList() {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✨ Proactive Assistant</Text>
          <TouchableOpacity onPress={loadSchedulingData}>
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Header Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Scheduling Requests Found</Text>
            <Text style={styles.helpText}>
              I found {data.threads.length} scheduling {data.threads.length === 1 ? 'request' : 'requests'} in this conversation
            </Text>
          </View>

          {/* Thread List */}
          {data.threads.map((thread: any, index: number) => (
            <TouchableOpacity
              key={thread.id}
              style={styles.threadCard}
              onPress={() => setSelectedThread(thread)}
              activeOpacity={0.7}
            >
              <View style={styles.threadHeader}>
                <Text style={styles.threadNumber}>#{index + 1}</Text>
                <Text style={styles.threadTopic}>{thread.topic}</Text>
              </View>

              <Text style={styles.triggerMessage} numberOfLines={2}>
                "{thread.triggerMessage}"
              </Text>

              <View style={styles.threadInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    {thread.dateInfo.specified ? thread.dateInfo.original : thread.dateInfo.description}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    {thread.timeInfo.specified ? thread.timeInfo.original : thread.timeInfo.description}
                  </Text>
                </View>
              </View>

              {thread.availabilityHints.length > 0 && (
                <View style={styles.hintBadge}>
                  <Text style={styles.hintText}>
                    {thread.availabilityHints.length} availability {thread.availabilityHints.length === 1 ? 'hint' : 'hints'}
                  </Text>
                </View>
              )}

              <View style={styles.threadFooter}>
                <Text style={styles.viewTimesText}>View time suggestions →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  function renderThreadDetail() {
    if (!selectedThread) return null;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedThread(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✨ Proactive Assistant</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Thread Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Request Details</Text>
            <View style={styles.card}>
              <Text style={styles.triggerMessage}>"{selectedThread.triggerMessage}"</Text>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>
                  {selectedThread.dateInfo.specified ? selectedThread.dateInfo.original : selectedThread.dateInfo.description}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoValue}>
                  {selectedThread.timeInfo.specified ? selectedThread.timeInfo.original : selectedThread.timeInfo.description}
                </Text>
              </View>
            </View>
          </View>

          {/* Suggested Times */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Suggested Times</Text>
            <Text style={styles.helpText}>Tap to select a time:</Text>
            
            {selectedThread.suggestedTimes && selectedThread.suggestedTimes.map((slot: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeCard,
                selectedTime === slot && styles.timeCardSelected
              ]}
              onPress={() => handleSelectTime(slot)}
              activeOpacity={0.7}
            >
              <View style={styles.timeHeader}>
                <Text style={styles.timeOption}>Option {index + 1}</Text>
                <View style={[styles.qualityBadge, getQualityStyle(slot.quality)]}>
                  <Text style={styles.qualityText}>{getQualityIcon(slot.quality)} {slot.quality}</Text>
                </View>
              </View>
              
              <Text style={styles.timeDate}>{slot.date}</Text>
              <Text style={styles.timeSlot}>{slot.time} - {slot.endTime}</Text>
              {slot.reason && (
                <Text style={styles.timeReason}>{slot.reason}</Text>
              )}
              
              {selectedTime === slot && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Actions */}
        {selectedTime && (
          <View style={styles.section}>
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>📅 Selected Time</Text>
              <Text style={styles.confirmDetails}>
                {selectedTime.date} at {selectedTime.time}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={20} color={COLORS.buttonPrimaryText} />
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButtonStyle]}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-social" size={20} color={COLORS.buttonPrimaryText} />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    );
  }
}

function getQualityStyle(quality: string) {
  switch (quality) {
    case 'best': return { backgroundColor: '#10B981' };
    case 'good': return { backgroundColor: '#3B82F6' };
    default: return { backgroundColor: '#6B7280' };
  }
}

function getQualityIcon(quality: string) {
  switch (quality) {
    case 'best': return '⭐';
    case 'good': return '✓';
    default: return '◌';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  loadingSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  helpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  triggerMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  timeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.backgroundSecondary,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeOption: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
  },
  qualityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.buttonPrimaryText,
  },
  timeDate: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timeSlot: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timeReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  confirmCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  confirmTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  confirmDetails: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  shareButtonStyle: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.buttonPrimaryText,
  },
  // Thread List Styles
  threadCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  threadNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.primary,
  },
  threadTopic: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    flex: 1,
  },
  threadInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  hintBadge: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  threadFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewTimesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
});

