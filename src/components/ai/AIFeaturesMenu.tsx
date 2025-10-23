import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/constants';

interface AIFeaturesMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectFeature: (feature: string) => void;
  position: { x: number; y: number };
}

const AI_FEATURES = [
  {
    id: 'summarize',
    icon: 'sparkles-outline',
    label: 'Thread Summarization',
    description: 'Get key points from conversation',
    color: COLORS.primary,
  },
  {
    id: 'actionItems',
    icon: 'checkbox-outline',
    label: 'Action Items',
    description: 'Extract tasks and deadlines',
    color: COLORS.success,
  },
  {
    id: 'search',
    icon: 'search-outline',
    label: 'Semantic Search',
    description: 'Find messages by meaning',
    color: COLORS.info,
  },
  {
    id: 'priority',
    icon: 'filter-outline',
    label: 'Priority Detection',
    description: 'Filter urgent messages',
    color: COLORS.warning,
  },
  {
    id: 'decisions',
    icon: 'bulb-outline',
    label: 'Decision Tracking',
    description: 'View decisions timeline',
    color: COLORS.secondary,
  },
  {
    id: 'scheduling',
    icon: 'calendar-outline',
    label: 'Schedule Meeting',
    description: 'AI-powered scheduling',
    color: COLORS.primaryDark,
  },
];

export default function AIFeaturesMenu({
  visible,
  onClose,
  onSelectFeature,
  position,
}: AIFeaturesMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.menuContainer, { top: position.y, right: 16 }]}>
          <View style={styles.menu}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="sparkles" size={20} color={COLORS.primary} />
              <Text style={styles.headerText}>AI Features</Text>
            </View>

            {/* Features List */}
            {AI_FEATURES.map((feature, index) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.menuItem,
                  index === AI_FEATURES.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => {
                  onSelectFeature(feature.id);
                  onClose();
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  menuContainer: {
    position: 'absolute',
    width: 280,
  },
  menu: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundTertiary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  featureLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

