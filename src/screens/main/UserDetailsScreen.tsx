import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList, UserProfile, Conversation } from '../../types';
import * as AuthService from '../../services/firebase/authService';
import * as FirestoreService from '../../services/firebase/firestoreService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { CommonGroupsList } from '../../components/common/CommonGroupsList';
import { useAuth } from '../../store/context/AuthContext';

type UserDetailsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'UserDetails'
>;

type UserDetailsScreenRouteProp = RouteProp<MainStackParamList, 'UserDetails'>;

interface UserDetailsScreenProps {
  navigation: UserDetailsScreenNavigationProp;
  route: UserDetailsScreenRouteProp;
}

/**
 * UserDetailsScreen
 * 
 * Shows detailed information about a user:
 * - Profile photo / avatar
 * - Display name
 * - Email
 * - Online status (placeholder for PR #5)
 * - Common groups (placeholder for PR #6)
 */
export function UserDetailsScreen({ navigation, route }: UserDetailsScreenProps) {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commonGroups, setCommonGroups] = useState<Conversation[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Fetch user details
  useEffect(() => {
    fetchUserDetails();
    if (currentUser?.uid) {
      fetchCommonGroups();
    }
  }, [userId, currentUser?.uid]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await AuthService.getUserProfile(userId);
      if (userProfile) {
        setUser(userProfile);
      } else {
        setError('User not found');
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommonGroups = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoadingGroups(true);
      const groups = await FirestoreService.getCommonGroups(currentUser.uid, userId);
      setCommonGroups(groups);
    } catch (err: any) {
      console.error('Error fetching common groups:', err);
      // Don't show error for groups, just leave empty
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleGroupPress = (group: Conversation) => {
    // Navigate to group chat
    navigation.navigate('Chat', {
      conversationId: group.id,
      conversation: group,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerContainer}>
          <Ionicons name="person-circle-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserDetails}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success state - show user details
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <Avatar
            imageUrl={user.photoURL}
            displayName={user.displayName}
            size="xlarge"
            showOnlineStatus
            isOnline={user.isOnline}
          />

          {/* User Info */}
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          {/* Online Status Text */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: user.isOnline ? COLORS.online : COLORS.offline },
              ]}
            />
            <Text style={styles.statusText}>
              {user.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Common Groups Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Groups</Text>
          <CommonGroupsList
            groups={commonGroups}
            loading={loadingGroups}
            onGroupPress={handleGroupPress}
          />
        </View>

        {/* Additional Info Section (Future Enhancement) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Member Since</Text>
            </View>
            <Text style={styles.infoValue}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Unknown'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  backButton: {
    padding: SPACING.xs,
  } as ViewStyle,

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  headerRight: {
    width: 40, // Same as back button for centering
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: SPACING.xl,
  } as ViewStyle,

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  } as ViewStyle,

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  } as TextStyle,

  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  } as TextStyle,

  retryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  } as ViewStyle,

  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.buttonPrimaryText,
  } as TextStyle,

  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  displayName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  } as TextStyle,

  email: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  } as TextStyle,

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  } as ViewStyle,

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  } as ViewStyle,

  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  } as TextStyle,

  section: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  } as ViewStyle,

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.md,
  } as TextStyle,

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  } as ViewStyle,

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  } as ViewStyle,

  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  } as TextStyle,

  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginLeft: SPACING.lg + SPACING.xs,
  } as TextStyle,
});

