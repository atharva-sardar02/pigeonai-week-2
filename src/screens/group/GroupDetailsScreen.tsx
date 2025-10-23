import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList, User } from '../../types';
import { COLORS, SIZES, SPACING } from '../../utils/constants';
import { useAuth } from '../../store/context/AuthContext';
import * as FirestoreService from '../../services/firebase/firestoreService';
import * as AuthService from '../../services/firebase/authService';

type GroupDetailsRouteProp = RouteProp<MainStackParamList, 'GroupDetails'>;
type GroupDetailsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'GroupDetails'>;

interface GroupData {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  adminIds: string[];
  memberIds: string[];
  createdAt: Date;
  createdBy: string;
}

/**
 * Group Details Screen
 * Shows group information and member list
 */
export const GroupDetailsScreen: React.FC = () => {
  const route = useRoute<GroupDetailsRouteProp>();
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const { user } = useAuth();
  const { groupId } = route.params;

  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = group && user ? group.adminIds.includes(user.uid) : false;

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch group details
      const groupData = await FirestoreService.getGroup(groupId);
      if (groupData) {
        setGroup(groupData as GroupData);
        
        // Fetch member details using AuthService
        const memberPromises = groupData.memberIds.map(memberId => 
          AuthService.getUserProfile(memberId)
        );
        const memberData = await Promise.all(memberPromises);
        setMembers(memberData.filter(m => m !== null) as User[]);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };


  const handleMemberPress = (memberId: string) => {
    if (memberId === user?.uid) {
      // Navigate to settings/profile if it's the current user
      navigation.navigate('Profile');
    } else {
      // Navigate to user details page
      navigation.navigate('UserDetails', { userId: memberId });
    }
  };

  const renderMember = ({ item }: { item: User }) => {
    const isGroupAdmin = group?.adminIds.includes(item.uid);
    const isCurrentUser = item.uid === user?.uid;
    
    return (
      <TouchableOpacity 
        style={styles.memberItem}
        onPress={() => handleMemberPress(item.uid)}
        activeOpacity={0.7}
      >
        <View style={styles.memberLeft}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.memberAvatar} />
          ) : (
            <View style={[styles.memberAvatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={COLORS.textSecondary} />
            </View>
          )}
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {item.displayName}
              {isCurrentUser && <Text style={styles.youText}> (You)</Text>}
            </Text>
            {isGroupAdmin && (
              <Text style={styles.adminBadge}>Admin</Text>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Group Info Section */}
        <View style={styles.groupInfoSection}>
          {group.iconUrl ? (
            <Image source={{ uri: group.iconUrl }} style={styles.groupIcon} />
          ) : (
            <View style={[styles.groupIcon, styles.groupIconPlaceholder]}>
              <Ionicons name="people" size={48} color={COLORS.textSecondary} />
            </View>
          )}
          
          <Text style={styles.groupName}>{group.name}</Text>
          
          {group.description && (
            <Text style={styles.groupDescription}>{group.description}</Text>
          )}
          
          <Text style={styles.memberCount}>
            {group.memberIds.length} {group.memberIds.length === 1 ? 'member' : 'members'}
          </Text>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.uid}
            scrollEnabled={false}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

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
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.fontLarge,
    color: COLORS.error,
  },
  groupInfoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
  },
  groupIconPlaceholder: {
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupName: {
    fontSize: SIZES.fontXLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  groupDescription: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  memberCount: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textTertiary,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.sm,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.fontMedium,
    fontWeight: '500',
    color: COLORS.text,
  },
  youText: {
    fontSize: SIZES.fontMedium,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  adminBadge: {
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    marginTop: SPACING.xs / 2,
  },
  memberAction: {
    padding: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    marginBottom: SPACING.md,
  },
  actionButtonTextDanger: {
    fontSize: SIZES.fontMedium,
    fontWeight: '500',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
});

