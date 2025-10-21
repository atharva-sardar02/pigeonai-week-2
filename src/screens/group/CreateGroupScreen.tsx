import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { UserSelectionList } from '../../components/group/UserSelectionList';
import { useAuth } from '../../store/context/AuthContext';
import * as FirestoreService from '../../services/firebase/firestoreService';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { MainStackParamList } from '../../types';

type CreateGroupScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Create Group Screen
 * 
 * Allows users to create a new group chat by:
 * 1. Searching and selecting members
 * 2. Entering a group name
 * 3. Creating the group and conversation
 */
export function CreateGroupScreen() {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();
  const { user } = useAuth();

  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!user) return;

    // Validation
    if (groupName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (groupName.trim().length > 100) {
      Alert.alert('Error', 'Group name must be 100 characters or less');
      return;
    }

    if (selectedUserIds.length < 2) {
      Alert.alert('Error', 'Please select at least 2 members to create a group');
      return;
    }

    setCreating(true);

    try {
      // Include current user in memberIds (total will be selectedUserIds.length + 1)
      const memberIds = [user.uid, ...selectedUserIds];

      // Create group
      const groupId = await FirestoreService.createGroup(
        groupName.trim(),
        memberIds,
        user.uid
      );

      // Create group conversation
      const conversationId = await FirestoreService.createGroupConversation(
        groupId,
        memberIds,
        groupName.trim(),
        undefined, // iconUrl (optional for now)
        user.uid
      );

      console.log('✅ Group created:', groupId, 'Conversation:', conversationId);

      // Navigate to the new group chat
      navigation.replace('Chat', { conversationId });
    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create group. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const canCreate = groupName.trim().length > 0 && selectedUserIds.length >= 2 && !creating;

  // Debug logging
  console.log('CreateGroup Debug:', {
    groupNameLength: groupName.trim().length,
    selectedCount: selectedUserIds.length,
    creating,
    canCreate,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Group</Text>

          <TouchableOpacity
            style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
            onPress={handleCreateGroup}
            disabled={!canCreate}
          >
            {creating ? (
              <ActivityIndicator size="small" color={COLORS.buttonPrimaryText} />
            ) : (
              <Text style={[styles.createButtonText, !canCreate && styles.createButtonTextDisabled]}>
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Group Name Input */}
        <View style={styles.groupNameSection}>
          <View style={styles.groupIconPlaceholder}>
            <Ionicons name="people" size={32} color={COLORS.primary} />
          </View>

          <View style={styles.groupNameInputContainer}>
            <TextInput
              style={styles.groupNameInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
              placeholderTextColor={COLORS.textPlaceholder}
              maxLength={100}
              autoFocus={false}
            />
            <Text style={styles.characterCount}>{groupName.length}/100</Text>
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.membersHeader}>
          <Text style={styles.membersTitle}>Add Members</Text>
          <Text style={styles.membersSubtitle}>
            {selectedUserIds.length === 0
              ? 'Select at least 2 members to create a group'
              : selectedUserIds.length < 2
              ? `${selectedUserIds.length + 1} member (you + ${selectedUserIds.length}) - select 1 more`
              : `${selectedUserIds.length + 1} members (you + ${selectedUserIds.length})`}
          </Text>
        </View>

        {/* User Selection List */}
        <UserSelectionList
          selectedUserIds={selectedUserIds}
          onToggleUser={handleToggleUser}
          currentUserId={user?.uid || ''}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.buttonPrimaryText,
  },
  createButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
  groupNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  groupIconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupNameInputContainer: {
    flex: 1,
  },
  groupNameInput: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  membersHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  membersTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  membersSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});

