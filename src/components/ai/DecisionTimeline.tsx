/**
 * Decision Timeline Component
 * 
 * Displays a timeline of finalized decisions from conversations
 * with card-based design, confidence indicators, and navigation to source messages.
 * 
 * Features:
 * - Chronological timeline (newest first)
 * - Decision cards with context, participants, timestamp
 * - Confidence level indicators (high/medium/low)
 * - Alternative options shown
 * - View context button (links to source messages)
 * - Search and filter functionality
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Decision,
  getConfidenceMetadata,
  formatDecisionTimestamp,
  formatParticipants,
  getParticipantInitials,
  sortDecisionsByTime,
  searchDecisions,
  filterDecisionsByConfidence,
  groupDecisionsByDate,
  DecisionConfidence,
} from '../../models/Decision';
import { COLORS } from '../../utils/constants';

interface DecisionTimelineProps {
  visible: boolean;
  onClose: () => void;
  decisions: Decision[];
  loading?: boolean;
  onViewContext?: (decision: Decision) => void;
}

export default function DecisionTimeline({
  visible,
  onClose,
  decisions,
  loading = false,
  onViewContext,
}: DecisionTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConfidence, setFilterConfidence] = useState<DecisionConfidence | 'all'>('all');

  // Filter and sort decisions
  const filteredDecisions = useMemo(() => {
    let filtered = [...decisions];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchDecisions(filtered, searchQuery);
    }

    // Apply confidence filter
    if (filterConfidence !== 'all') {
      filtered = filterDecisionsByConfidence(filtered, filterConfidence);
    }

    // Sort by timestamp (newest first)
    return sortDecisionsByTime(filtered);
  }, [decisions, searchQuery, filterConfidence]);

  // Group by date
  const groupedDecisions = useMemo(() => {
    return groupDecisionsByDate(filteredDecisions);
  }, [filteredDecisions]);

  const dateOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="bulb" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Decision Timeline</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? 's' : ''} tracked
            </Text>
          </View>
          <View style={styles.closeButtonPlaceholder} />
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search decisions..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Confidence Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContainer}
          >
            <FilterChip
              label="All"
              active={filterConfidence === 'all'}
              onPress={() => setFilterConfidence('all')}
              count={decisions.length}
            />
            <FilterChip
              label="High Confidence"
              active={filterConfidence === 'high'}
              onPress={() => setFilterConfidence('high')}
              count={decisions.filter(d => d.confidence === 'high').length}
              color={getConfidenceMetadata('high').color}
            />
            <FilterChip
              label="Medium+"
              active={filterConfidence === 'medium'}
              onPress={() => setFilterConfidence('medium')}
              count={decisions.filter(d => d.confidence === 'high' || d.confidence === 'medium').length}
              color={getConfidenceMetadata('medium').color}
            />
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Tracking decisions...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredDecisions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>
              {decisions.length === 0 ? 'No Decisions Yet' : 'No Results'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {decisions.length === 0
                ? 'Make some decisions in this conversation\nand track them here'
                : 'Try a different search or filter'}
            </Text>
          </View>
        )}

        {/* Decision Timeline */}
        {!loading && filteredDecisions.length > 0 && (
          <FlatList
            data={dateOrder}
            keyExtractor={(item) => item}
            renderItem={({ item: dateKey }) => {
              const decisionsForDate = groupedDecisions[dateKey];
              if (!decisionsForDate || decisionsForDate.length === 0) return null;

              return (
                <View key={dateKey}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>{dateKey}</Text>
                    <View style={styles.dateHeaderLine} />
                  </View>
                  {decisionsForDate.map((decision) => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      onViewContext={() => onViewContext?.(decision)}
                    />
                  ))}
                </View>
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Modal>
  );
}

// Filter chip component
function FilterChip({
  label,
  active,
  onPress,
  count,
  color,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count: number;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
        active && color && { backgroundColor: color + '20', borderColor: color },
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          active && styles.filterChipTextActive,
          active && color && { color },
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );
}

// Decision card component
function DecisionCard({
  decision,
  onViewContext,
}: {
  decision: Decision;
  onViewContext?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const confidenceMetadata = getConfidenceMetadata(decision.confidence);

  return (
    <View style={styles.card}>
      {/* Decision Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.decisionText}>{decision.decision}</Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceMetadata.color + '20' }]}>
          <Ionicons name={confidenceMetadata.icon as any} size={14} color={confidenceMetadata.color} />
        </View>
      </View>

      {/* Context */}
      <Text style={styles.contextText}>{decision.context}</Text>

      {/* Metadata Row */}
      <View style={styles.metadataRow}>
        <View style={styles.metadataItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metadataText}>{formatDecisionTimestamp(decision)}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metadataText}>
            {formatParticipants(decision.participants, 2)}
          </Text>
        </View>
      </View>

      {/* Participants Avatars */}
      <View style={styles.participantsContainer}>
        {decision.participants.slice(0, 4).map((participant, index) => (
          <View
            key={`${participant}-${index}`}
            style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
          >
            <Text style={styles.participantInitials}>
              {getParticipantInitials(participant)}
            </Text>
          </View>
        ))}
        {decision.participants.length > 4 && (
          <View style={[styles.participantAvatar, styles.participantAvatarExtra]}>
            <Text style={styles.participantInitials}>+{decision.participants.length - 4}</Text>
          </View>
        )}
      </View>

      {/* Expand/Collapse */}
      {decision.alternatives && decision.alternatives.length > 0 && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Hide' : 'Show'} Alternatives ({decision.alternatives.length})
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}

      {/* Alternatives (Expanded) */}
      {expanded && decision.alternatives && decision.alternatives.length > 0 && (
        <View style={styles.alternativesContainer}>
          {decision.alternatives.map((alt, index) => (
            <View key={index} style={styles.alternativeItem}>
              <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
              <View style={styles.alternativeContent}>
                <Text style={styles.alternativeOption}>{alt.option}</Text>
                <Text style={styles.alternativeReason}>{alt.reason_rejected}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onViewContext}
        >
          <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>View Context</Text>
        </TouchableOpacity>
        <View style={[styles.confidenceIndicator, { backgroundColor: confidenceMetadata.color + '20' }]}>
          <Text style={[styles.confidenceText, { color: confidenceMetadata.color }]}>
            {confidenceMetadata.label}
          </Text>
        </View>
      </View>
    </View>
  );
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonPlaceholder: {
    width: 36,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  filterScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  listContent: {
    padding: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  decisionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 24,
  },
  confidenceBadge: {
    padding: 6,
    borderRadius: 8,
  },
  contextText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  participantsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  participantAvatarExtra: {
    backgroundColor: COLORS.textSecondary,
  },
  participantInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  alternativesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  alternativeContent: {
    flex: 1,
  },
  alternativeOption: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  alternativeReason: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  confidenceIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

