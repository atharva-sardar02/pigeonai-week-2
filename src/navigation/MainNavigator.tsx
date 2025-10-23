import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { ConversationListScreen } from '../screens/main/ConversationListScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { NewChatScreen } from '../screens/main/NewChatScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { UserDetailsScreen } from '../screens/main/UserDetailsScreen';
import { CreateGroupScreen } from '../screens/group/CreateGroupScreen';
import { GroupDetailsScreen } from '../screens/group/GroupDetailsScreen';
import { ProactiveAssistantScreen } from '../screens/ai/ProactiveAssistantScreen';
import { NotificationTestScreen } from '../screens/test/NotificationTestScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * MainNavigator Component (Task 4.11)
 * 
 * Main navigation for authenticated users:
 * - ConversationList: Home screen with all conversations
 * - Chat: Individual chat screen
 * - NewChat: Search and start new conversations
 * - Profile: User profile and settings
 * - GroupDetails: Group information (future)
 * - CreateGroup: Create new group chat (future)
 */
export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ConversationList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      {/* Conversation List Screen (Home) */}
      <Stack.Screen
        name="ConversationList"
        component={ConversationListScreen}
        options={{
          title: 'Pigeon',
        }}
      />

      {/* Chat Screen */}
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Chat',
          animation: 'slide_from_right',
        }}
      />

      {/* New Chat Screen */}
      <Stack.Screen
        name="NewChat"
        component={NewChatScreen}
        options={{
          title: 'New Chat',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Profile Screen */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          animation: 'slide_from_right',
        }}
      />

      {/* User Details Screen */}
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{
          title: 'User Details',
          animation: 'slide_from_right',
        }}
      />

      {/* Create Group Screen (PR #9) */}
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: 'New Group',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Group Details Screen (PR #9) */}
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{
          title: 'Group Details',
          animation: 'slide_from_right',
        }}
      />

      {/* Proactive Assistant Screen (AI Feature) */}
      <Stack.Screen
        name="ProactiveAssistant"
        component={ProactiveAssistantScreen}
        options={{
          title: 'Proactive Assistant',
          animation: 'slide_from_right',
        }}
      />

      {/* Notification Test Screen (Temporary - for testing without EAS Build) */}
      <Stack.Screen
        name="NotificationTest"
        component={NotificationTestScreen}
        options={{
          title: 'Test Notifications',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

