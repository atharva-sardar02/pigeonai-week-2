import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../../types';
import { Avatar } from '../common/Avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';

interface CommonGroupsListProps {
  groups: Conversation[];
  loading?: boolean;
  onGroupPress?: (group: Conversation) => void;
}

/**
 * CommonGroupsList Component
 * 
 * Displays a list of groups that are common between two users.
 */
export const CommonGroupsList: React.FC<CommonGroupsListProps> = ({
  groups,
  loading = false,
  onGroupPress,
}) => {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={32} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>Loading common groups...</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={32} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>No common groups</Text>
        <Text style={styles.emptySubtext}>
          You don't share any groups with this user yet
        </Text>
      </View>
    );
  }

  const renderGroup = ({ item }: { item: Conversation }) => {
    const participantCount = item.participants?.length || 0;

    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => onGroupPress?.(item)}
        activeOpacity={0.7}
      >
        <Avatar
          imageUrl={item.icon}
          displayName={item.name || 'Group'}
          size="medium"
          isGroup
        />
        
        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name || 'Unnamed Group'}
          </Text>
          <View style={styles.groupMeta}>
            <Ionicons name="people" size={14} color={COLORS.textSecondary} />
            <Text style={styles.participantCount}>
              {participantCount} {participantCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={renderGroup}
      scrollEnabled={false} // Parent ScrollView handles scrolling
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
  } as ViewStyle,

  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  } as TextStyle,

  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  } as TextStyle,

  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  } as ViewStyle,

  groupInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  } as ViewStyle,

  groupName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,

  participantCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  } as TextStyle,

  separator: {
    height: SPACING.xs,
  } as ViewStyle,
});

