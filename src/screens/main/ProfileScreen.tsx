import React, { useState } from 'react';
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
  Modal,
  TextInput,
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
  const { user, signOut, updateProfile } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleEditName = () => {
    setNewDisplayName(user?.displayName || '');
    setEditNameModalVisible(true);
  };

  const handleSaveDisplayName = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    try {
      setUpdating(true);
      await updateProfile(newDisplayName.trim());
      setEditNameModalVisible(false);
      Alert.alert('Success', 'Display name updated successfully!');
    } catch (error) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', 'Failed to update display name. Please try again.');
    } finally {
      setUpdating(false);
    }
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
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={handleEditName}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Edit Name Modal */}
        <Modal
          visible={editNameModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditNameModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Display Name</Text>
              
              <TextInput
                style={styles.modalInput}
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textTertiary}
                maxLength={50}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditNameModalVisible(false)}
                  disabled={updating}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, updating && styles.buttonDisabled]}
                  onPress={handleSaveDisplayName}
                  disabled={updating}
                  activeOpacity={0.7}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color={COLORS.buttonPrimaryText} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {/* About AI Features */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AboutAIFeatures')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.menuItemText}>
              About AI Features
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountSettings')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.menuItemText}>
              Account Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          {/* Privacy Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacySecurity')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="shield-outline"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.menuItemText}>
              Privacy & Security
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('NotificationSettings')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.menuItemText}>
              Notifications
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpSupport')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.menuItemText}>
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Storage Section */}
        <View style={styles.storageSection}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          <TouchableOpacity
            style={[styles.clearCacheButton, clearing && styles.buttonDisabled]}
            onPress={handleClearCache}
            disabled={clearing}
            activeOpacity={0.7}
          >
            {clearing ? (
              <ActivityIndicator size="small" color={COLORS.buttonPrimaryText} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={COLORS.buttonPrimaryText} />
                <Text style={styles.clearCacheText}>Clear Cache</Text>
              </>
            )}
          </TouchableOpacity>
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
        <Text style={styles.versionText}>PigeonAi v1.0.0</Text>
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

  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  } as ViewStyle,

  displayName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  editNameButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  } as ViewStyle,

  email: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  } as TextStyle,

  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  } as TextStyle,

  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  } as ViewStyle,

  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  } as ViewStyle,

  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  cancelButton: {
    backgroundColor: COLORS.backgroundTertiary,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  saveButton: {
    backgroundColor: COLORS.buttonPrimary,
  } as ViewStyle,

  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.buttonPrimaryText,
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

  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: 12,
  } as ViewStyle,

  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,

  clearCacheText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.buttonPrimaryText,
    marginLeft: SPACING.xs,
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

