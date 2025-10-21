import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { useAuth } from '../../store/context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useUserDisplayName } from '../../hooks/useUserProfile';
import * as FirestoreService from '../../services/firebase/firestoreService';
import { COLORS } from '../../utils/constants';
import { MainStackParamList, Conversation } from '../../types';

type ChatScreenRouteProp = RouteProp<MainStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Chat'>;

/**
 * Chat Screen
 * 
 * Main chat interface for one-on-one and group conversations.
 * 
 * Features:
 * - Display conversation header with recipient info
 * - Show message history with real-time updates
 * - Send new messages
 * - Optimistic UI updates
 * - Loading states
 * - Error handling
 */
export const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { user } = useAuth();
  
  const { conversationId, conversation: passedConversation } = route.params;
  
  // Local state for conversation (if not passed via params)
  const [conversation, setConversation] = useState<Conversation | null>(
    passedConversation || null
  );
  const [loadingConversation, setLoadingConversation] = useState(!passedConversation);
  
  // Get messages for this conversation
  const {
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages,
    markAsRead,
  } = useMessages(conversationId);

  const [sending, setSending] = useState(false);

  // Get the other participant's ID for direct messages
  const otherUserId = conversation?.type === 'dm' || conversation?.type === 'direct'
    ? conversation.participants.find((id) => id !== user?.uid)
    : null;

  // Fetch other user's display name (cached)
  const otherUserDisplayName = useUserDisplayName(otherUserId);

  // Fetch conversation if not provided
  useEffect(() => {
    const fetchConversation = async () => {
      if (!passedConversation && conversationId) {
        try {
          setLoadingConversation(true);
          const fetchedConversation = await FirestoreService.getConversation(conversationId);
          if (fetchedConversation) {
            setConversation(fetchedConversation);
          }
        } catch (error) {
          console.error('Error fetching conversation:', error);
        } finally {
          setLoadingConversation(false);
        }
      }
    };

    fetchConversation();
  }, [conversationId, passedConversation]);

  // Mark messages as read when user opens chat
  useEffect(() => {
    if (messages.length > 0 && user) {
      // Mark all unread messages as read
      messages.forEach((message) => {
        if (message.senderId !== user.uid && !message.readBy[user.uid]) {
          markAsRead(message.id);
        }
      });
    }
  }, [messages.length, user]);

  // Handle sending a message
  const handleSend = async (content: string) => {
    if (!user) {
      console.error('Cannot send message: User not authenticated');
      return;
    }

    try {
      setSending(true);
      await sendMessage(content, 'text');
    } catch (err) {
      console.error('Failed to send message:', err);
      // Error is already handled by useMessages hook
    } finally {
      setSending(false);
    }
  };

  // Handle image picker (placeholder for future)
  const handleImagePick = () => {
    console.log('Image picker will be implemented in PR #7');
    // TODO: Implement in Task 7.x (Image Sharing)
  };

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle header tap - navigate to user/group details
  const handleHeaderTap = () => {
    if (!conversation || !user) return;

    if (conversation.type === 'group') {
      // TODO: Navigate to group details (PR #6)
      console.log('Group details - coming in PR #6');
    } else {
      // For direct messages, get the other user's ID
      const otherUserId = conversation.participants.find((id) => id !== user.uid);
      if (otherUserId) {
        navigation.navigate('UserDetails', { userId: otherUserId });
      }
    }
  };

  // Get user display name for header
  const getUserDisplayName = (userId: string): string => {
    if (userId === otherUserId) {
      return otherUserDisplayName;
    }
    return 'User';
  };

  // Show loading state
  if (loadingConversation || !conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatHeader
          conversation={conversation}
          currentUserId={user?.uid || ''}
          onBack={handleBack}
          onTitlePress={handleHeaderTap}
          getUserDisplayName={getUserDisplayName}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load messages</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <ChatHeader
          conversation={conversation}
          currentUserId={user?.uid || ''}
          onBack={handleBack}
          onTitlePress={handleHeaderTap}
          onlineStatus={false} // TODO: Implement in PR #5 (Presence)
          getUserDisplayName={getUserDisplayName}
        />

        {/* Message List */}
        <View style={styles.messagesContainer}>
          <MessageList
            messages={messages}
            currentUserId={user?.uid || ''}
            loading={loading}
            onRefresh={refreshMessages}
            refreshing={loading}
          />
        </View>

        {/* Message Input */}
        <MessageInput
          onSend={handleSend}
          onImagePick={handleImagePick}
          sending={sending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

