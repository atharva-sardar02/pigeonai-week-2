/**
 * Scheduling Modal Component (PR #21)
 * Multi-step interface for AI-powered meeting scheduling
 * 
 * Steps:
 * 1. Show extracted meeting details (editable)
 * 2. Display suggested times (selectable)
 * 3. Generate calendar invite
 * 
 * Features:
 * - Full-screen modal
 * - Step progress indicator
 * - Loading states for each step
 * - Error handling
 * - Edit meeting details
 * - Select time slot
 * - Add to calendar
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import {
  MeetingProposal,
  TimeSlot,
  MeetingDetails,
  formatTimeSlot,
  getQualityBadge,
  formatDuration,
  formatAllTimezones
} from '../../models/MeetingProposal';

interface SchedulingModalProps {
  visible: boolean;
  loading: boolean;
  proposal: MeetingProposal | null;
  meetingDetails: MeetingDetails | null;
  onClose: () => void;
  onSelectTime: (timeSlot: TimeSlot) => void;
  onAddToCalendar: (timeSlot: TimeSlot) => void;
  onEditDetails?: (details: MeetingDetails) => void;
}

export const SchedulingModal: React.FC<SchedulingModalProps> = ({
  visible,
  loading,
  proposal,
  meetingDetails,
  onClose,
  onSelectTime,
  onAddToCalendar,
  onEditDetails
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSelectTime(slot);
  };

  const handleConfirmMeeting = () => {
    if (!selectedSlot) return;

    console.log('✅ Meeting confirmed:', {
      time: selectedSlot.startTime,
      date: selectedSlot.date,
      duration: selectedSlot.duration
    });

    // Just call the callback - no external calendar
    onAddToCalendar(selectedSlot);
    
    Alert.alert('Success', 'Meeting time confirmed!');
  };

  const handleShareMeeting = async () => {
    if (!selectedSlot || !proposal) return;

    const meetingText = `📅 Meeting: ${proposal.title || 'Team Meeting'}
    
📆 Date: ${selectedSlot.dayOfWeek}, ${selectedSlot.date}
⏰ Time: ${selectedSlot.startTime} - ${selectedSlot.endTime}
⏱️ Duration: ${formatDuration(selectedSlot.duration)}

Let me know if this works for you!`;

    try {
      await Share.share({
        message: meetingText,
        title: 'Meeting Invitation'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>AI is analyzing your conversation...</Text>
      <Text style={styles.loadingSubtext}>
        Extracting meeting details and suggesting optimal times
      </Text>
    </View>
  );

  const renderMeetingDetails = () => {
    if (!meetingDetails) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Meeting Details</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow icon="briefcase-outline" label="Topic" value={meetingDetails.topic} />
          <DetailRow icon="information-circle-outline" label="Purpose" value={meetingDetails.purpose} />
          <DetailRow icon="time-outline" label="Duration" value={formatDuration(meetingDetails.duration)} />
          <DetailRow icon="people-outline" label="Participants" value={`${meetingDetails.participants.length} people`} />
          <DetailRow icon="location-outline" label="Location" value={meetingDetails.location} />
        </View>
      </View>
    );
  };

  const renderTimeSlots = () => {
    if (!proposal || !proposal.suggestedTimes || proposal.suggestedTimes.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Suggested Times</Text>
        </View>

        <Text style={styles.helpText}>
          Select a time that works best for everyone:
        </Text>

        {proposal.suggestedTimes.map((slot, index) => (
          <TimeSlotCard
            key={slot.id}
            slot={slot}
            isSelected={selectedSlot?.id === slot.id}
            onSelect={() => handleSelectSlot(slot)}
            index={index}
          />
        ))}
      </View>
    );
  };

  const renderConfirmActions = () => {
    if (!selectedSlot) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
          <Text style={styles.sectionTitle}>Confirm Meeting</Text>
        </View>

        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>
            📅 {proposal?.title || 'Team Meeting'}
          </Text>
          <Text style={styles.confirmDate}>
            {selectedSlot.dayOfWeek}, {selectedSlot.date}
          </Text>
          <Text style={styles.confirmTime}>
            {selectedSlot.startTime} - {selectedSlot.endTime}
          </Text>
          <Text style={styles.confirmDuration}>
            Duration: {formatDuration(selectedSlot.duration)}
          </Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.confirmButton, styles.confirmButtonMain]}
            onPress={handleConfirmMeeting}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.buttonPrimaryText} />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, styles.shareButton]}
            onPress={handleShareMeeting}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={20} color={COLORS.buttonPrimaryText} />
            <Text style={styles.confirmButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.confirmHint}>
          Confirm to save, or share with participants
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>✨ Proactive Assistant</Text>
            <Text style={styles.headerSubtitle}>
              Find the perfect time for your meeting
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            renderLoading()
          ) : (
            <>
              {renderMeetingDetails()}
        {renderTimeSlots()}
        {renderConfirmActions()}
            </>
          )}

          {/* Empty State */}
          {!loading && !proposal && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyStateText}>No scheduling data available</Text>
              <Text style={styles.emptyStateSubtext}>
                Try running the scheduling agent again
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============= SUBCOMPONENTS =============

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

interface TimeSlotCardProps {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ slot, isSelected, onSelect, index }) => {
  const badge = getQualityBadge(slot.quality);

  return (
    <TouchableOpacity
      style={[
        styles.timeSlotCard,
        isSelected && styles.timeSlotCardSelected
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.timeSlotHeader}>
        <View style={styles.timeSlotTitleRow}>
          <Text style={styles.timeSlotOption}>Option {index + 1}</Text>
          <View style={[styles.qualityBadge, { backgroundColor: badge.color + '20' }]}>
            <Text style={[styles.qualityBadgeText, { color: badge.color }]}>
              {badge.icon} {badge.label}
            </Text>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        )}
      </View>

      <View style={styles.timeSlotContent}>
        <Text style={styles.timeSlotDate}>
          {slot.dayOfWeek}, {slot.date}
        </Text>
        
        <View style={styles.timezonesContainer}>
          {formatAllTimezones(slot).map((tz, idx) => (
            <View key={idx} style={styles.timezoneChip}>
              <Text style={styles.timezoneText}>{tz}</Text>
            </View>
          ))}
        </View>

        {slot.warnings && slot.warnings.length > 0 && (
          <View style={styles.warningsContainer}>
            {slot.warnings.map((warning, idx) => (
              <View key={idx} style={styles.warningRow}>
                <Ionicons name="warning-outline" size={14} color={COLORS.warning} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============= STYLES =============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
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
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  timeSlotCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeSlotCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.backgroundSecondary, // Dark theme
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSlotOption: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  qualityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeSlotContent: {
    gap: 8,
  },
  timeSlotDate: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  timezonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timezoneChip: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timezoneText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  warningsContainer: {
    marginTop: 8,
    gap: 4,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.warning,
  },
  confirmCard: {
    backgroundColor: COLORS.backgroundSecondary, // Dark theme
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  confirmDate: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  confirmTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  confirmDuration: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonMain: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.success,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
  confirmHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
  calendarHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

