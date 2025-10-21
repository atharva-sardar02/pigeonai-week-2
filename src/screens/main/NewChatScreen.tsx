import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, UserProfile } from '../../types';
import { useAuth } from '../../store/context/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import * as FirestoreService from '../../services/firebase/firestoreService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';

type NewChatScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'NewChat'
>;

interface NewChatScreenProps {
  navigation: NewChatScreenNavigationProp;
}

/**
 * NewChatScreen Component (Task 4.10)
 * 
 * Allows users to:
 * - Search for other users by display name or email
 * - View search results
 * - Select a user to start a conversation
 * - Automatically creates a DM conversation (or finds existing one)
 * - Navigates to the chat screen
 */
export function NewChatScreen({ navigation }: NewChatScreenProps) {
  const { user } = useAuth();
  const { findOrCreateDM } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search for users by display name or email
   */
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      // Search users in Firestore
      const results = await FirestoreService.searchUsers(query);

      // Filter out current user
      const filteredResults = results.filter((u) => u.uid !== user.uid);

      setSearchResults(filteredResults);
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError(err.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [user]);

  /**
   * Debounced search on text change
   */
  const handleSearchTextChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Simple debounce: wait for user to stop typing
    const timeoutId = setTimeout(() => {
      handleSearch(text);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  /**
   * Handle user selection - create/find DM and navigate to chat
   */
  const handleUserSelect = async (selectedUser: UserProfile) => {
    if (!user) return;

    try {
      setCreating(true);
      setError(null);

      // Find existing DM or create new one
      const conversationId = await findOrCreateDM(selectedUser.uid);

      if (conversationId) {
        // Navigate to chat screen with just the ID
        // ChatScreen will fetch the conversation details
        navigation.replace('Chat', {
          conversationId,
        });
      } else {
        setError('Failed to create conversation');
      }
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message || 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  /**
   * Render user item in search results
   */
  const renderUserItem = ({ item }: { item: UserProfile }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserSelect(item)}
        disabled={creating}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            imageUrl={item.photoURL}
            displayName={item.displayName}
            size="medium"
          />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        {/* Arrow Icon */}
        <Ionicons
          name="chevron-forward"
          size={24}
          color={COLORS.textTertiary}
        />
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (searching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (searchQuery.trim() && searchResults.length === 0 && !searching) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={COLORS.textTertiary}
          />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Try searching by name or email
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="people-outline"
          size={64}
          color={COLORS.textTertiary}
        />
        <Text style={styles.emptyText}>Search for users</Text>
        <Text style={styles.emptySubtext}>
          Enter a name or email to find people
        </Text>
      </View>
    );
  };

  /**
   * Item key extractor
   */
  const keyExtractor = (item: UserProfile) => item.uid;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={COLORS.inputPlaceholder}
            value={searchQuery}
            onChangeText={handleSearchTextChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search Results */}
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={
            searchResults.length === 0 ? styles.emptyListContainer : undefined
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Loading Overlay */}
        {creating && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Creating conversation...</Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,

  keyboardView: {
    flex: 1,
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  } as ViewStyle,

  searchIcon: {
    marginRight: SPACING.sm,
  } as ViewStyle,

  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.inputText,
    paddingVertical: SPACING.md,
  } as TextStyle,

  clearButton: {
    padding: SPACING.xs,
  } as ViewStyle,

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundTertiary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  } as ViewStyle,

  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  } as TextStyle,

  emptyListContainer: {
    flex: 1,
  } as ViewStyle,

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  } as ViewStyle,

  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  } as TextStyle,

  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  } as TextStyle,

  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  avatarContainer: {
    marginRight: SPACING.md,
  } as ViewStyle,

  userInfo: {
    flex: 1,
  } as ViewStyle,

  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.xs,
  } as TextStyle,

  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  } as TextStyle,

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  loadingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
  } as ViewStyle,

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginTop: SPACING.md,
  } as TextStyle,
});

