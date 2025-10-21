import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, Conversation } from '../../types';
import { ConversationListItem } from '../../components/conversation/ConversationListItem';
import { useConversations } from '../../hooks/useConversations';
import { useAuth } from '../../store/context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

type ConversationListScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'ConversationList'
>;

interface ConversationListScreenProps {
  navigation: ConversationListScreenNavigationProp;
}

/**
 * ConversationListScreen Component (Task 4.9)
 * 
 * Main screen showing all user conversations:
 * - List of conversations (FlatList)
 * - Real-time updates via useConversations hook
 * - Pull-to-refresh
 * - Loading states
 * - Empty state
 * - New chat button (FAB)
 * - Navigate to chat on item tap
 */
export function ConversationListScreen({
  navigation,
}: ConversationListScreenProps) {
  const { user } = useAuth();
  const { conversations, loading, error, refreshConversations } =
    useConversations();
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  };

  /**
   * Navigate to chat screen
   */
  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      // Don't pass conversation object to avoid serialization issues
      // ChatScreen will fetch it if needed
    });
  };

  /**
   * Navigate to new chat screen
   */
  const handleNewChat = () => {
    navigation.navigate('NewChat');
  };

  /**
   * Navigate to profile
   */
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading conversations...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>
          Tap the + button to start a new chat
        </Text>
      </View>
    );
  };

  /**
   * Render conversation item
   */
  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationListItem
      conversation={item}
      currentUserId={user?.uid || ''}
      onPress={handleConversationPress}
    />
  );

  /**
   * Item key extractor
   */
  const keyExtractor = (item: Conversation) => item.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pigeon</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfile}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle-outline" size={32} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyListContainer : undefined
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button (New Chat) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewChat}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.buttonPrimaryText} />
      </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  profileButton: {
    padding: SPACING.xs,
  } as ViewStyle,

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

  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.error,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  } as TextStyle,

  retryButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  } as ViewStyle,

  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.buttonPrimaryText,
  } as TextStyle,

  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  } as ViewStyle,
});

