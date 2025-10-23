import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { ChatOptionsMenu } from '../../components/chat/ChatOptionsMenu';
import AIFeaturesMenu from '../../components/ai/AIFeaturesMenu';
import SummaryModal from '../../components/ai/SummaryModal';
import ActionItemsList from '../../components/ai/ActionItemsList';
import SearchModal, { SearchResultData } from '../../components/ai/SearchModal';
import { PriorityFilterModal } from '../../components/ai/PriorityFilterModal';
import DecisionTimeline from '../../components/ai/DecisionTimeline';
import { ProactiveSchedulingSuggestion } from '../../components/ai/ProactiveSchedulingSuggestion';
import { SchedulingModal } from '../../components/ai/SchedulingModal';
import { useAuth } from '../../store/context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useUserDisplayName, userProfileCache } from '../../hooks/useUserProfile';
import { usePresence } from '../../hooks/usePresence';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import * as FirestoreService from '../../services/firebase/firestoreService';
import * as NotificationService from '../../services/notifications/notificationService';
import { shouldUseLocalNotifications } from '../../services/notifications/localNotificationHelper';
import { summarizeConversation, extractActionItems, searchMessages, trackDecisions, scheduleMeeting, batchDetectPriority } from '../../services/ai/aiService';
import { ActionItem } from '../../models/ActionItem';
import { Decision } from '../../models/Decision';
import { MeetingProposal, TimeSlot, MeetingDetails, SchedulingAgentResponse } from '../../models/MeetingProposal';
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
 * - Display conversation header with recipient info and online status
 * - Show message history with real-time updates
 * - Send new messages
 * - Optimistic UI updates
 * - Typing indicators
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

  // AI Summarization state
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    summary: string | null;
    loading: boolean;
    error: string | null;
    messageCount?: number;
    cached?: boolean;
    duration?: number;
  }>({
    summary: null,
    loading: false,
    error: null,
  });

  // AI Features Menu state
  const [aiMenuVisible, setAiMenuVisible] = useState(false);
  const [aiMenuPosition, setAiMenuPosition] = useState({ x: 0, y: 60 });

  // Chat Options Menu state (3-dot menu)
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);

  // AI Action Items state
  const [actionItemsModalVisible, setActionItemsModalVisible] = useState(false);
  const [actionItemsData, setActionItemsData] = useState<{
    items: ActionItem[];
    loading: boolean;
    error: string | null;
    messageCount?: number;
    cached?: boolean;
    duration?: number;
  }>({
    items: [],
    loading: false,
    error: null,
  });

  // AI Semantic Search state
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // AI Priority Filter state (PR #19)
  const [priorityFilterVisible, setPriorityFilterVisible] = useState(false);

  // AI Decision Tracking state (PR #20)
  const [decisionTimelineVisible, setDecisionTimelineVisible] = useState(false);
  const [decisionsData, setDecisionsData] = useState<{
    decisions: Decision[];
    loading: boolean;
    error: string | null;
    messageCount?: number;
    cached?: boolean;
    duration?: number;
  }>({
    decisions: [],
    loading: false,
    error: null,
  });

  // AI Priority Detection state (PR #19)
  const [messagesWithPriority, setMessagesWithPriority] = useState<Message[]>([]);
  const [priorityDetectionLoading, setPriorityDetectionLoading] = useState(false);

  // AI Scheduling Agent state (PR #21)
  const [schedulingSuggestionVisible, setSchedulingSuggestionVisible] = useState(false);
  const [schedulingModalVisible, setSchedulingModalVisible] = useState(false);
  const [schedulingData, setSchedulingData] = useState<{
    hasSchedulingIntent: boolean;
    confidence: number;
    triggerMessage?: string;
    proposal: MeetingProposal | null;
    meetingDetails: MeetingDetails | null;
    loading: boolean;
    error: string | null;
    duration?: number;
  }>({
    hasSchedulingIntent: false,
    confidence: 0,
    triggerMessage: undefined,
    proposal: null,
    meetingDetails: null,
    loading: false,
    error: null,
  });

  // Get the other participant's ID for direct messages
  const otherUserId = conversation?.type === 'dm' || conversation?.type === 'direct'
    ? conversation.participants.find((id) => id !== user?.uid)
    : null;

  // Fetch other user's display name (cached)
  const otherUserDisplayName = useUserDisplayName(otherUserId);

  // Get other user's presence status (online/offline & last seen)
  const { isOnline, lastSeen } = usePresence(otherUserId);

  // Get typing indicator status
  const { typingUsers, setTyping } = useTypingIndicator(conversationId);

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
      
      // Send push notifications to other participants
      if (conversation) {
        // Get recipients (all participants except current user)
        const recipients = conversation.participants.filter(p => p !== user.uid);
        
        if (recipients.length > 0) {
          // Get sender's display name
          const senderName = user.displayName || 'Someone';
          
          // Determine notification title based on conversation type
          let notificationTitle = senderName;
          if (conversation.type === 'group' && conversation.name) {
            notificationTitle = conversation.name;
          }
          
          // Truncate message preview to 100 characters
          const messagePreview = content.length > 100 
            ? content.substring(0, 100) + '...' 
            : content;
          
          // Notification body
          const notificationBody = conversation.type === 'group'
            ? `${senderName}: ${messagePreview}`
            : messagePreview;
          
          // Send remote push notification (only in EAS Build)
          // In Expo Go, useMessages hook handles local notifications via Firestore listener
          if (!shouldUseLocalNotifications()) {
            NotificationService.sendPushNotificationToUsers(
              recipients,
              notificationTitle,
              notificationBody,
              {
                screen: 'Chat',
                conversationId: conversation.id,
                senderId: user.uid,
              }
            ).catch(err => {
              // Don't throw - notifications are optional
              console.error('Failed to send push notifications:', err);
            });
          }
        }
      }
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
      // Navigate to group details
      if (conversation.groupId) {
        navigation.navigate('GroupDetails', { groupId: conversation.groupId });
      }
    } else {
      // For direct messages, get the other user's ID
      const otherUserId = conversation.participants.find((id) => id !== user.uid);
      if (otherUserId) {
        navigation.navigate('UserDetails', { userId: otherUserId });
      }
    }
  };

  // Get user display name for header (used for typing indicators in groups)
  const getUserDisplayName = (userId: string): string => {
    // For DMs, use the cached other user display name
    if (userId === otherUserId) {
      return otherUserDisplayName;
    }
    
    // For groups or other users, get from global cache
    const cachedProfile = userProfileCache.get(userId);
    return cachedProfile?.displayName || 'User';
  };

  // Handle AI Features Menu
  const handleAIFeaturesPress = () => {
    setAiMenuVisible(true);
  };

  const handleAIFeatureSelect = (feature: string) => {
    switch (feature) {
      case 'summarize':
        handleSummarize();
        break;
      case 'actionItems':
        handleExtractActionItems();
        break;
      case 'search':
        handleOpenSearch();
        break;
      case 'priority':
        handleDetectPriorities();
        break;
      case 'decisions':
        handleTrackDecisions();
        break;
      case 'scheduling':
        handleScheduleMeeting();
        break;
    }
  };

  // Handle AI Summarization
  const handleSummarize = async () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to summarize in this conversation.');
      return;
    }

    // Open modal and start loading
    setSummaryModalVisible(true);
    setSummaryData({
      summary: null,
      loading: true,
      error: null,
    });

    try {
      // Call AI service to generate summary
      const result = await summarizeConversation(conversationId, 100);

      if (result.success && result.data) {
        setSummaryData({
          summary: result.data.summary,
          loading: false,
          error: null,
          messageCount: result.data.messageCount,
          cached: result.data.cached,
          duration: result.data.duration,
        });
      } else {
        setSummaryData({
          summary: null,
          loading: false,
          error: result.error || 'Failed to generate summary',
        });
      }
    } catch (err: any) {
      console.error('Summarization error:', err);
      setSummaryData({
        summary: null,
        loading: false,
        error: err.message || 'An unexpected error occurred',
      });
    }
  };

  // Handle closing summary modal
  const handleCloseSummary = () => {
    setSummaryModalVisible(false);
    // Reset summary data after modal closes
    setTimeout(() => {
      setSummaryData({
        summary: null,
        loading: false,
        error: null,
      });
    }, 300); // Wait for modal animation
  };

  // Handle AI Action Items Extraction
  const handleExtractActionItems = async () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to analyze in this conversation.');
      return;
    }

    // Open modal and start loading
    setActionItemsModalVisible(true);
    setActionItemsData({
      items: [],
      loading: true,
      error: null,
    });

    try {
      // Call AI service to extract action items
      const result = await extractActionItems(conversationId, 100);

      if (result.success && result.data) {
        // Transform API response to ActionItem format
        const items: ActionItem[] = result.data.actionItems.map((item: any, index: number) => ({
          ...item,
          id: `${conversationId}-${index}`,
          conversationId,
          deadline: item.deadline ? new Date(item.deadline) : null,
          completed: false,
          createdAt: new Date(),
        }));

        setActionItemsData({
          items,
          loading: false,
          error: null,
          messageCount: result.data.messageCount,
          cached: result.data.cached,
          duration: result.data.duration,
        });
      } else {
        setActionItemsData({
          items: [],
          loading: false,
          error: result.error || 'Failed to extract action items',
        });
      }
    } catch (err: any) {
      console.error('Action items extraction error:', err);
      setActionItemsData({
        items: [],
        loading: false,
        error: err.message || 'An unexpected error occurred',
      });
    }
  };

  // Handle closing action items modal
  const handleCloseActionItems = () => {
    setActionItemsModalVisible(false);
    // Reset action items data after modal closes
    setTimeout(() => {
      setActionItemsData({
        items: [],
        loading: false,
        error: null,
      });
    }, 300); // Wait for modal animation
  };

  // Handle toggling action item completion
  const handleToggleActionItemComplete = (item: ActionItem) => {
    // Update the action item's completed status
    setActionItemsData(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === item.id
          ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date() : undefined }
          : i
      ),
    }));
  };

  // Handle navigating to source message (TODO: implement scrolling)
  const handleNavigateToMessage = (messageId: string) => {
    // TODO: Implement message scrolling in MessageList
    // For now, just close the modal
    handleCloseActionItems();
    handleCloseSearch();
    Alert.alert('Navigation', `Would navigate to message: ${messageId}`);
  };

  // Handle opening search modal
  const handleOpenSearch = () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to search in this conversation.');
      return;
    }
    setSearchModalVisible(true);
  };

  // Handle closing search modal
  const handleCloseSearch = () => {
    setSearchModalVisible(false);
  };

  // Handle search query
  const handleSearch = async (query: string): Promise<SearchResultData | null> => {
    try {
      // Call AI service for semantic search
      const result = await searchMessages(query, conversationId, 5, 0.5);

      if (result.success && result.data) {
        return result.data as SearchResultData;
      } else {
        Alert.alert('Search Error', result.error || 'Failed to search messages');
        return null;
      }
    } catch (err: any) {
      console.error('Search error:', err);
      Alert.alert('Search Error', err.message || 'An unexpected error occurred');
      return null;
    }
  };

  // Handle AI Priority Detection (PR #19)
  const handleDetectPriorities = async () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to analyze in this conversation.');
      return;
    }

    console.log('🎯 Detecting priorities for', messages.length, 'messages...');

    // Show loading state
    setPriorityDetectionLoading(true);

    try {
      // Prepare messages for batch priority detection
      const messagesToAnalyze = messages.slice(0, 50).map(msg => ({
        id: msg.id,
        conversationId: conversationId,
        content: msg.content || '',
        senderName: msg.senderName || 'Unknown',
        conversationType: conversation?.type === 'group' ? 'group' as const : 'dm' as const,
      }));

      console.log('🤖 Calling batch priority detection API...');

      // Call AI service to detect priorities
      const result = await batchDetectPriority(messagesToAnalyze);

      if (result.success && result.data) {
        console.log('✅ Priority detection successful:', result.data);

        // Map priorities back to messages
        // Backend returns {results: [{messageId, success, data: {priority}}]}
        const priorityMap = new Map(
          (result.data.results || [])
            .filter((r: any) => r.success && r.data)
            .map((r: any) => [r.messageId, r.data.priority])
        );

        console.log('📊 Priority map:', Array.from(priorityMap.entries()));

        const updatedMessages = messages.map(msg => ({
          ...msg,
          priority: priorityMap.get(msg.id) || 'low',
        }));

        console.log('📝 Updated messages with priorities:', updatedMessages.map(m => ({ id: m.id, priority: m.priority })));

        setMessagesWithPriority(updatedMessages);
        setPriorityDetectionLoading(false);
        setPriorityFilterVisible(true);
      } else {
        console.error('❌ Priority detection failed:', result.error);
        setPriorityDetectionLoading(false);
        Alert.alert('Priority Detection Error', result.error || 'Failed to detect priorities');
      }
    } catch (err: any) {
      console.error('❌ Priority detection error:', err);
      setPriorityDetectionLoading(false);
      Alert.alert('Priority Detection Error', err.message || 'An unexpected error occurred');
    }
  };

  // Handle opening decision tracking (PR #20)
  const handleTrackDecisions = async () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to analyze in this conversation.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Authentication Error', 'You must be logged in to track decisions.');
      return;
    }

    // Open modal and start loading
    setDecisionTimelineVisible(true);
    setDecisionsData({
      decisions: [],
      loading: true,
      error: null,
    });

    try {
      // Call AI service to track decisions
      const result = await trackDecisions(conversationId, user.uid, 100);

      if (result.success && result.data) {
        setDecisionsData({
          decisions: result.data.decisions || [],
          loading: false,
          error: null,
          messageCount: result.data.messageCount,
          cached: result.data.cached,
          duration: result.data.duration,
        });
      } else {
        setDecisionsData({
          decisions: [],
          loading: false,
          error: result.error || 'Failed to track decisions',
        });
      }
    } catch (err: any) {
      console.error('Decision tracking error:', err);
      setDecisionsData({
        decisions: [],
        loading: false,
        error: err.message || 'An unexpected error occurred',
      });
    }
  };

  // Handle closing decision timeline
  const handleCloseDecisionTimeline = () => {
    setDecisionTimelineVisible(false);
  };

  // Handle viewing decision context (navigate to source message)
  const handleViewDecisionContext = (decision: Decision) => {
    // TODO: Implement navigation to source message
    // For now, just close the modal
    console.log('View context for decision:', decision.id);
    Alert.alert(
      'View Context',
      'This feature will navigate to the source messages in the conversation.\n\nComing soon!',
      [{ text: 'OK' }]
    );
  };

  // Handle running scheduling agent (PR #21)
  const handleScheduleMeeting = async () => {
    if (messages.length < 5) {
      Alert.alert('Not Enough Messages', 'Need at least 5 messages to detect scheduling intent.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Authentication Error', 'You must be logged in to use scheduling agent.');
      return;
    }

    // Start loading
    setSchedulingData({
      ...schedulingData,
      loading: true,
      error: null,
    });

    try {
      // Call AI service to run scheduling agent
      const result = await scheduleMeeting(conversationId, user.uid, 50);

      if (result.success && result.data) {
        const data = result.data as SchedulingAgentResponse;
        
        setSchedulingData({
          hasSchedulingIntent: data.hasSchedulingIntent || false,
          confidence: data.confidence || 0,
          triggerMessage: data.triggerMessage,
          proposal: data.proposal || null,
          meetingDetails: data.meetingDetails || null,
          loading: false,
          error: null,
          duration: data.duration,
        });

        // If scheduling intent detected, show suggestion banner
        if (data.hasSchedulingIntent && data.confidence >= 0.75) {
          setSchedulingSuggestionVisible(true);
        } else {
          Alert.alert(
            'No Scheduling Intent',
            'I couldn\'t detect any scheduling intent in this conversation. Try sending a message like "Let\'s schedule a meeting" to trigger the agent.',
            [{ text: 'OK' }]
          );
        }
      } else {
        setSchedulingData({
          ...schedulingData,
          loading: false,
          error: result.error || 'Failed to run scheduling agent',
        });
        Alert.alert('Error', result.error || 'Failed to run scheduling agent');
      }
    } catch (err: any) {
      console.error('Error running scheduling agent:', err);
      setSchedulingData({
        ...schedulingData,
        loading: false,
        error: err.message || 'An unexpected error occurred',
      });
      Alert.alert('Error', err.message || 'An unexpected error occurred');
    }
  };

  // Handle opening scheduling modal
  const handleOpenSchedulingModal = () => {
    setSchedulingSuggestionVisible(false);
    setSchedulingModalVisible(true);
  };

  // Handle dismissing scheduling suggestion
  const handleDismissSchedulingSuggestion = () => {
    setSchedulingSuggestionVisible(false);
  };

  // Handle closing scheduling modal
  const handleCloseSchedulingModal = () => {
    setSchedulingModalVisible(false);
  };

  // Handle selecting a time slot
  const handleSelectTimeSlot = (timeSlot: TimeSlot) => {
    console.log('Selected time slot:', timeSlot);
    // Time slot selection is handled in SchedulingModal
  };

  // Handle adding to calendar
  const handleAddToCalendar = (timeSlot: TimeSlot) => {
    console.log('Add to calendar:', timeSlot);
    Alert.alert(
      'Calendar Link Opened',
      'The Google Calendar link has been opened in your browser. Please confirm the meeting in Google Calendar.',
      [
        { 
          text: 'OK',
          onPress: () => {
            setSchedulingModalVisible(false);
            setSchedulingSuggestionVisible(false);
          }
        }
      ]
    );
  };

  // Handle opening options menu (3-dot menu)
  const handleOptionsMenuPress = () => {
    setOptionsMenuVisible(true);
  };

  // Handle deleting all messages in conversation
  const handleDeleteAllMessages = async () => {
    if (!user?.uid) return;

    Alert.alert(
      'Delete All Messages',
      'Are you sure you want to delete all messages in this conversation? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ Deleting all messages in conversation ${conversationId}`);
              
              // Delete all messages from Firestore
              await FirestoreService.deleteAllMessagesInConversation(conversationId);
              
              // Refresh messages to show empty state
              await refreshMessages();
              
              Alert.alert('Success', 'All messages have been deleted.');
            } catch (error: any) {
              console.error('Error deleting messages:', error);
              Alert.alert('Error', 'Failed to delete messages. Please try again.');
            }
          },
        },
      ]
    );
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
          isOnline={isOnline}
          lastSeen={lastSeen}
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <ChatHeader
          conversation={conversation}
          currentUserId={user?.uid || ''}
          onBack={handleBack}
          onTitlePress={handleHeaderTap}
          onAIFeaturesPress={handleAIFeaturesPress}
          onMorePress={handleOptionsMenuPress}
          isOnline={isOnline}
          lastSeen={lastSeen}
          typingUserIds={typingUsers}
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
            isGroupChat={conversation.type === 'group'}
            participantCount={conversation.participants?.length || 2}
          />
        </View>

        {/* Message Input */}
        <MessageInput
          onSend={handleSend}
          onTypingChange={setTyping}
          onImagePick={handleImagePick}
          sending={sending}
        />

        {/* AI Features Menu */}
        <AIFeaturesMenu
          visible={aiMenuVisible}
          onClose={() => setAiMenuVisible(false)}
          onSelectFeature={handleAIFeatureSelect}
          position={aiMenuPosition}
        />

        {/* AI Summary Modal */}
        <SummaryModal
          visible={summaryModalVisible}
          onClose={handleCloseSummary}
          summary={summaryData.summary}
          loading={summaryData.loading}
          error={summaryData.error}
          messageCount={summaryData.messageCount}
          cached={summaryData.cached}
          duration={summaryData.duration}
        />

        {/* AI Action Items Modal */}
        <ActionItemsList
          visible={actionItemsModalVisible}
          onClose={handleCloseActionItems}
          actionItems={actionItemsData.items}
          loading={actionItemsData.loading}
          error={actionItemsData.error}
          messageCount={actionItemsData.messageCount}
          cached={actionItemsData.cached}
          duration={actionItemsData.duration}
          currentUserId={user?.uid}
          onToggleComplete={handleToggleActionItemComplete}
          onNavigateToMessage={handleNavigateToMessage}
        />

        {/* AI Semantic Search Modal */}
        <SearchModal
          visible={searchModalVisible}
          conversationId={conversationId}
          onClose={handleCloseSearch}
          onSearch={handleSearch}
          onNavigateToMessage={handleNavigateToMessage}
        />

        {/* AI Priority Filter Modal (PR #19) */}
        <PriorityFilterModal
          visible={priorityFilterVisible}
          messages={messagesWithPriority.length > 0 ? messagesWithPriority : messages}
          onClose={() => setPriorityFilterVisible(false)}
          onNavigateToMessage={handleNavigateToMessage}
        />

        {/* AI Decision Timeline Modal (PR #20) */}
        <DecisionTimeline
          visible={decisionTimelineVisible}
          onClose={handleCloseDecisionTimeline}
          decisions={decisionsData.decisions}
          loading={decisionsData.loading}
          onViewContext={handleViewDecisionContext}
        />

        {/* AI Proactive Scheduling Suggestion (PR #21) */}
        {schedulingSuggestionVisible && schedulingData.hasSchedulingIntent && (
          <ProactiveSchedulingSuggestion
            visible={schedulingSuggestionVisible}
            confidence={schedulingData.confidence}
            triggerMessage={schedulingData.triggerMessage || ''}
            onSchedule={handleOpenSchedulingModal}
            onDismiss={handleDismissSchedulingSuggestion}
          />
        )}

        {/* AI Scheduling Modal (PR #21) */}
        <SchedulingModal
          visible={schedulingModalVisible}
          loading={schedulingData.loading}
          proposal={schedulingData.proposal}
          meetingDetails={schedulingData.meetingDetails}
          onClose={handleCloseSchedulingModal}
          onSelectTime={handleSelectTimeSlot}
          onAddToCalendar={handleAddToCalendar}
        />

        {/* Chat Options Menu (3-dot menu) */}
        <ChatOptionsMenu
          visible={optionsMenuVisible}
          onClose={() => setOptionsMenuVisible(false)}
          onDeleteAllMessages={handleDeleteAllMessages}
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

