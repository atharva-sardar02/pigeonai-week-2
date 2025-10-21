import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import { useAuth } from '../../store/context/AuthContext';
import * as LocalDatabase from '../../services/database/localDatabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Profile'
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

/**
 * ProfileScreen Component
 * 
 * User profile and settings screen
 * Features:
 * - User information display
 * - Sign out button
 * - Settings (future)
 * - Account management (future)
 */
export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, signOut } = useAuth();
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [clearing, setClearing] = useState(false);

  // Load cache statistics
  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      const stats = await LocalDatabase.getDatabaseStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will delete all cached messages and conversations. They will be reloaded from the server when needed.\n\nAre you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              await LocalDatabase.clearAllData();
              await loadCacheStats();
              Alert.alert(
                'Success',
                'Cache cleared successfully! Data will be reloaded from the server.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert(
                'Error',
                'Failed to clear cache. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Format cache size for display
  const formatCacheInfo = () => {
    if (!cacheStats) return 'Loading...';
    const messageCount = cacheStats.messages || 0;
    const conversationCount = cacheStats.conversations || 0;
    return `${messageCount} messages, ${conversationCount} conversations`;
  };

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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <Avatar
            imageUrl={user?.photoURL}
            displayName={user?.displayName || 'User'}
            size="xlarge"
          />

          {/* User Info */}
          <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {/* Test Notifications (Temporary - Dev Only) */}
          <TouchableOpacity
            style={[styles.menuItem, styles.testMenuItem]}
            onPress={() => navigation.navigate('NotificationTest')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flask-outline"
              size={24}
              color={COLORS.primary}
            />
            <Text style={[styles.menuItemText, styles.testMenuItemText]}>
              🧪 Test Notifications
            </Text>
            <Text style={styles.testBadge}>DEV</Text>
          </TouchableOpacity>

          {/* Account Settings (Future) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {}}
            disabled={true}
            activeOpacity={0.7}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={COLORS.textTertiary}
            />
            <Text style={[styles.menuItemText, styles.menuItemDisabled]}>
              Account Settings
            </Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </TouchableOpacity>

          {/* Privacy Settings (Future) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {}}
            disabled={true}
            activeOpacity={0.7}
          >
            <Ionicons
              name="shield-outline"
              size={24}
              color={COLORS.textTertiary}
            />
            <Text style={[styles.menuItemText, styles.menuItemDisabled]}>
              Privacy & Security
            </Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </TouchableOpacity>

          {/* Notifications (Future) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {}}
            disabled={true}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.textTertiary}
            />
            <Text style={[styles.menuItemText, styles.menuItemDisabled]}>
              Notifications
            </Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </TouchableOpacity>

          {/* Help & Support (Future) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {}}
            disabled={true}
            activeOpacity={0.7}
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={COLORS.textTertiary}
            />
            <Text style={[styles.menuItemText, styles.menuItemDisabled]}>
              Help & Support
            </Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {/* Storage Section */}
        <View style={styles.storageSection}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          {/* Cache Info */}
          <View style={styles.cacheInfoCard}>
            <View style={styles.cacheInfoRow}>
              <Ionicons name="file-tray-full-outline" size={24} color={COLORS.primary} />
              <View style={styles.cacheInfoText}>
                <Text style={styles.cacheInfoTitle}>Local Cache</Text>
                <Text style={styles.cacheInfoSubtitle}>
                  {formatCacheInfo()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.clearCacheButton, clearing && styles.buttonDisabled]}
              onPress={handleClearCache}
              disabled={clearing}
              activeOpacity={0.7}
            >
              {clearing ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color={COLORS.text} />
                  <Text style={styles.clearCacheText}>Clear Cache</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.storageNote}>
            💡 Clearing cache frees up storage space. Data will be reloaded from the server when needed.
          </Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Pigeon AI v1.0.0 (MVP)</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  backButton: {
    padding: SPACING.xs,
  } as ViewStyle,

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  headerSpacer: {
    width: 40,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: SPACING.xl,
  } as ViewStyle,

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
  } as TextStyle,

  menuSection: {
    marginTop: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  } as ViewStyle,

  menuItemText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  } as TextStyle,

  menuItemDisabled: {
    color: COLORS.textTertiary,
  } as TextStyle,

  comingSoon: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  } as TextStyle,

  testMenuItem: {
    backgroundColor: COLORS.primary + '10',
  } as ViewStyle,

  testMenuItemText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
  } as TextStyle,

  testBadge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.background,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  } as TextStyle,

  storageSection: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
  } as ViewStyle,

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  } as TextStyle,

  cacheInfoCard: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  cacheInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  } as ViewStyle,

  cacheInfoText: {
    flex: 1,
    marginLeft: SPACING.md,
  } as ViewStyle,

  cacheInfoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  cacheInfoSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  } as TextStyle,

  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,

  clearCacheText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as TextStyle['fontWeight'],
    color: COLORS.text,
    marginLeft: SPACING.xs,
  } as TextStyle,

  storageNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    lineHeight: 16,
  } as TextStyle,

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundTertiary,
    borderWidth: 1,
    borderColor: COLORS.error,
  } as ViewStyle,

  signOutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.error,
    marginLeft: SPACING.sm,
  } as TextStyle,

  versionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  } as TextStyle,
});

