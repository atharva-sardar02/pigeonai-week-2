# Pigeon AI - MVP Task List

**Project Structure**: React Native + Expo + Firebase  
**Total PRs**: 12 (covering complete MVP in 24 hours)  
**Strategy**: Each PR is a deployable increment that adds value

---

## Project File Structure

```
pigeonai-week-2/
├── .gitignore
├── package.json
├── app.json / app.config.js
├── babel.config.js
├── metro.config.js
├── README.md
├── TASK_LIST.md
├── PRD.md
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── ChatHeader.tsx
│   │   ├── conversation/
│   │   │   ├── ConversationListItem.tsx
│   │   │   └── ConversationList.tsx
│   │   ├── group/
│   │   │   ├── GroupCreationModal.tsx
│   │   │   ├── GroupMemberList.tsx
│   │   │   └── GroupInfoScreen.tsx
│   │   └── common/
│   │       ├── Avatar.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── OfflineIndicator.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── main/
│   │   │   ├── ConversationListScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── NewChatScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── group/
│   │       ├── CreateGroupScreen.tsx
│   │       └── GroupDetailsScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   │
│   ├── services/
│   │   ├── firebase/
│   │   │   ├── firebaseConfig.ts
│   │   │   ├── authService.ts
│   │   │   ├── firestoreService.ts
│   │   │   ├── storageService.ts
│   │   │   └── messagingService.ts
│   │   ├── database/
│   │   │   ├── localDatabase.ts
│   │   │   └── sqliteService.ts
│   │   ├── network/
│   │   │   └── networkMonitor.ts
│   │   └── notifications/
│   │       └── notificationService.ts
│   │
│   ├── store/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ChatContext.tsx
│   │   │   └── NetworkContext.tsx
│   │   └── offlineQueue/
│   │       └── offlineQueueManager.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Message.ts
│   │   ├── Conversation.ts
│   │   └── Group.ts
│   │
│   ├── utils/
│   │   ├── dateFormatter.ts
│   │   ├── imageCompression.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMessages.ts
│   │   ├── useConversations.ts
│   │   ├── usePresence.ts
│   │   ├── useTypingIndicator.ts
│   │   └── useNetworkStatus.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── assets/
│       ├── images/
│       └── fonts/
│
├── firebase/
│   ├── firestore.rules
│   └── storage.rules
│
└── __tests__/
    ├── services/
    ├── components/
    └── utils/
```

---

## PR #1: Project Setup & Configuration ✅ COMPLETE

**Goal**: Initialize React Native + Expo project with Firebase configuration  
**Estimated Time**: 1 hour (Actual: ~2 hours with SDK 54 upgrade)  
**Branch**: `feature/project-setup`  
**Status**: ✅ Complete - App running on Expo Go

### Tasks

- [x] **Task 1.1: Initialize Expo Project**
  - **Action**: Run `npx create-expo-app PigeonAI --template blank-typescript`
  - **Files Created**:
    - `package.json`
    - `app.json`
    - `babel.config.js`
    - `tsconfig.json`
    - `App.tsx`
    - `.gitignore`

- [x] **Task 1.2: Install Core Dependencies**
  - **Action**: Install required packages
  - **Command**:
    ```bash
    # Firebase JS SDK (compatible with Expo Go)
    npm install firebase
    
    # Navigation
    npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
    
    # Expo managed packages (use npx expo install)
    npx expo install expo-image-picker expo-notifications expo-sqlite expo-status-bar
    
    # Storage and utilities
    npm install @react-native-async-storage/async-storage
    
    # Chat UI library (optional)
    npm install react-native-gifted-chat
    
    # Network monitoring
    npm install @react-native-community/netinfo
    
    # Navigation dependencies
    npx expo install react-native-safe-area-context react-native-screens
    ```
  - **Files Modified**:
    - `package.json`
  - **Note**: Using Firebase JS SDK instead of `@react-native-firebase` for Expo Go compatibility

- [x] **Task 1.3: Create Firebase Project**
  - **Action**: Set up Firebase project via Firebase Console
  - **Steps**:
    1. Create project: `pigeonai-dev`
    2. Enable Authentication (email/password)
    3. Create Firestore database (test mode)
    4. Enable Storage
    5. Enable Cloud Messaging (optional for MVP)
    6. Register Web app (🌐 icon) - **NOT iOS/Android**
    7. Copy the `firebaseConfig` object with API keys
  - **Config to Copy**:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "pigeonai-dev.firebaseapp.com",
      projectId: "pigeonai-dev",
      storageBucket: "pigeonai-dev.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abc123"
    };
    ```
  - **Note**: Using web configuration for Firebase JS SDK (Expo Go compatible)

- [x] **Task 1.4: Configure Firebase in Project**
  - **Action**: Create Firebase configuration file with web config
  - **Files Created**:
    - `src/services/firebase/firebaseConfig.ts` - Initialize Firebase with web config
    - `.env` - Store Firebase credentials (DO NOT COMMIT)
    - `app.config.js` - Expo configuration (replace app.json if needed)
  - **Files Modified**:
    - `.gitignore` - Add `.env` to prevent committing secrets
  - **Note**: 
    - Firebase config uses web SDK initialization
    - No native config files (google-services.json/GoogleService-Info.plist) needed
    - Store sensitive keys in .env file

- [x] **Task 1.5: Create Base Directory Structure**
  - **Action**: Create folder structure
  - **Folders Created**:
    - `src/components/`
    - `src/screens/`
    - `src/navigation/`
    - `src/services/`
    - `src/store/`
    - `src/models/`
    - `src/utils/`
    - `src/hooks/`
    - `src/types/`
    - `src/assets/`

- [x] **Task 1.6: Set Up TypeScript Types**
  - **Action**: Define base TypeScript interfaces
  - **Files Created**:
    - `src/types/index.ts`
  - **Content**: User, Message, Conversation, MessageStatus types

- [x] **Task 1.7: Create Constants File**
  - **Action**: Define app-wide constants
  - **Files Created**:
    - `src/utils/constants.ts`
  - **Content**: Colors, sizes, Firebase collection names

- [x] **Task 1.8: Update README**
  - **Action**: Document setup instructions
  - **Files Modified**:
    - `README.md`
  - **Content**: Installation, Firebase setup, running app

- [x] **Task 1.9: Test App Runs**
  - **Action**: `npx expo start`, scan QR code, verify app loads
  - **Verify**: ✅ App loads successfully on Expo Go

### Additional Steps Completed

- [x] **Upgraded to Expo SDK 54**
  - User's Expo Go app had SDK 54, so upgraded from SDK 52
  - Commands: `npx expo install expo@latest` then `npm install --force`
  - Updated TypeScript to 5.9.2 (required by SDK 54)
  
- [x] **Created EAS Account**
  - Required for Expo Go connection (even for local dev)
  - Free tier, no credit card needed
  - Logged in: `npx expo login`
  
- [x] **Resolved Dependencies**
  - Installed `babel-preset-expo` (required for SDK 54)
  - Fixed React/React Native peer dependency conflicts
  - Cleared Metro cache: `npm start --clear`

- [x] **Network Configuration**
  - Both devices on same WiFi network (192.168.1.XXX)
  - Port 8081 used (8082 as backup)
  - Manual URL entry as fallback to QR scan

### Actual Tech Stack Installed
- Expo SDK: 54.0.0
- React: 19.1.0
- React Native: 0.81.4
- TypeScript: 5.9.2
- Firebase JS SDK: 12.4.0
- React Navigation: 7.x

### Firebase Setup (us-east4 region)
- ✅ Authentication enabled (Email/Password)
- ✅ Firestore created (Test mode)
- ✅ Cloud Messaging enabled
- ✅ Web app registered (for Firebase JS SDK)

**PR Description**: "Initialize React Native + Expo project with TypeScript, install core dependencies, configure Firebase (web SDK for Expo Go), upgrade to SDK 54, set up EAS account, and verify app runs successfully on physical device."

---

## PR #2: Authentication System

**Goal**: Complete user authentication (signup, login, logout)  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/authentication`

### Tasks

- [ ] **Task 2.1: Create User Model**
  - **Files Created**:
    - `src/models/User.ts`
  - **Content**: User interface (id, email, displayName, photoURL, bio, createdAt, lastSeen, isOnline)

- [ ] **Task 2.2: Implement Firebase Auth Service**
  - **Files Created**:
    - `src/services/firebase/authService.ts`
  - **Functions**:
    - `signUp(email, password, displayName)`
    - `signIn(email, password)`
    - `signOut()`
    - `getCurrentUser()`
    - `updateProfile(displayName, photoURL)`
    - `resetPassword(email)`
  - **Dependencies**: firebase (Firebase JS SDK - firebase/auth)

- [ ] **Task 2.3: Create Auth Context**
  - **Files Created**:
    - `src/store/context/AuthContext.tsx`
  - **Content**: AuthProvider, useAuth hook, auth state management
  - **State**: currentUser, loading, error

- [ ] **Task 2.4: Create Login Screen UI**
  - **Files Created**:
    - `src/screens/auth/LoginScreen.tsx`
    - `src/components/auth/LoginForm.tsx`
  - **UI Elements**: Email input, password input, login button, "Forgot Password?" link, "Sign Up" navigation

- [ ] **Task 2.5: Create Signup Screen UI**
  - **Files Created**:
    - `src/screens/auth/SignupScreen.tsx`
    - `src/components/auth/SignupForm.tsx`
  - **UI Elements**: Display name input, email input, password input, confirm password input, signup button

- [ ] **Task 2.6: Create Splash Screen**
  - **Files Created**:
    - `src/screens/auth/SplashScreen.tsx`
  - **Content**: Loading spinner while checking auth state

- [ ] **Task 2.7: Set Up Auth Navigation**
  - **Files Created**:
    - `src/navigation/AuthNavigator.tsx`
  - **Screens**: Splash → Login → Signup
  - **Dependencies**: @react-navigation/native-stack

- [ ] **Task 2.8: Create Validators**
  - **Files Created**:
    - `src/utils/validators.ts`
  - **Functions**: validateEmail, validatePassword, validateDisplayName

- [ ] **Task 2.9: Implement User Profile Creation in Firestore**
  - **Files Modified**:
    - `src/services/firebase/authService.ts`
  - **Action**: On signup, create user doc in Firestore `/users/{userId}`
  - **Fields**: displayName, email, photoURL, bio, createdAt, lastSeen, isOnline

- [ ] **Task 2.10: Write Unit Tests for Auth Service**
  - **Files Created**:
    - `__tests__/services/authService.test.ts`
  - **Tests**:
    - ✅ `signUp()` creates user in Firebase Auth
    - ✅ `signUp()` creates user profile in Firestore
    - ✅ `signIn()` returns user on valid credentials
    - ✅ `signIn()` throws error on invalid credentials
    - ✅ `signOut()` clears current user
    - ✅ `updateProfile()` updates user data
  - **Dependencies**: `@testing-library/react-native`, `jest`

- [ ] **Task 2.11: Write Unit Tests for Validators**
  - **Files Created**:
    - `__tests__/utils/validators.test.ts`
  - **Tests**:
    - ✅ `validateEmail()` accepts valid emails
    - ✅ `validateEmail()` rejects invalid emails
    - ✅ `validatePassword()` enforces minimum length
    - ✅ `validateDisplayName()` rejects empty names

- [ ] **Task 2.12: Write Integration Test for Auth Flow**
  - **Files Created**:
    - `__tests__/integration/authFlow.test.ts`
  - **Test Flow**:
    1. Sign up new user → verify user created in Firebase Auth & Firestore
    2. Log out → verify redirected to login
    3. Log in → verify redirected to main app
    4. Invalid credentials → verify error shown
  - **Purpose**: Verify complete authentication flow end-to-end

**PR Description**: "Implement complete authentication system with signup, login, logout, and user profile creation in Firestore. Includes auth context, form validation, navigation flow, and comprehensive unit/integration tests."

---

## PR #3: Core Messaging Infrastructure - Data Layer

**Goal**: Set up message and conversation data models, Firestore service, local database  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/messaging-data-layer`

### Tasks

- [ ] **Task 3.1: Create Message Model**
  - **Files Created**:
    - `src/models/Message.ts`
  - **Content**: Message interface
    - id, senderId, conversationId, content, timestamp, status (sending/sent/delivered/read), type (text/image), imageUrl, readBy

- [ ] **Task 3.2: Create Conversation Model**
  - **Files Created**:
    - `src/models/Conversation.ts`
  - **Content**: Conversation interface
    - id, type (dm/group), participants, lastMessage, lastMessageTime, unreadCount, createdAt, updatedAt

- [ ] **Task 3.3: Implement Firestore Service**
  - **Files Created**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `createConversation(participantIds, type)`
    - `getConversations(userId)`
    - `getConversation(conversationId)`
    - `sendMessage(conversationId, message)`
    - `getMessages(conversationId, limit)`
    - `listenToMessages(conversationId, callback)`
    - `listenToConversations(userId, callback)`
    - `updateMessageStatus(messageId, status)`
    - `markMessageAsRead(messageId, userId)`

- [ ] **Task 3.4: Set Up Local Database (SQLite)**
  - **Files Created**:
    - `src/services/database/sqliteService.ts`
    - `src/services/database/localDatabase.ts`
  - **Functions**:
    - `initDatabase()`
    - `insertMessage(message)`
    - `updateMessage(messageId, updates)`
    - `getMessages(conversationId, limit, offset)`
    - `deleteMessage(messageId)`
    - `insertConversation(conversation)`
    - `updateConversation(conversationId, updates)`
    - `getConversations()`
  - **Tables**:
    - `messages` (id, senderId, conversationId, content, timestamp, status, type, imageUrl, synced)
    - `conversations` (id, type, participants, lastMessage, lastMessageTime, unreadCount, updatedAt)

- [ ] **Task 3.5: Create Chat Context**
  - **Files Created**:
    - `src/store/context/ChatContext.tsx`
  - **State**: conversations, activeConversation, messages, loading, error
  - **Functions**: loadConversations, selectConversation, sendMessage, loadMessages

- [ ] **Task 3.6: Create useMessages Hook**
  - **Files Created**:
    - `src/hooks/useMessages.ts`
  - **Functions**: useMessages(conversationId)
  - **Returns**: messages array, sendMessage, loading

- [ ] **Task 3.7: Create useConversations Hook**
  - **Files Created**:
    - `src/hooks/useConversations.ts`
  - **Functions**: useConversations()
  - **Returns**: conversations array, createConversation, loading

- [ ] **Task 3.8: Write Firestore Security Rules**
  - **Files Created**:
    - `firebase/firestore.rules`
  - **Rules**:
    - Users can read/write their own profile
    - Users can only read conversations they're part of
    - Users can only read messages in their conversations
    - Users can only send messages as themselves

- [ ] **Task 3.9: Deploy Firestore Rules**
  - **Action**: `firebase deploy --only firestore:rules`

- [ ] **Task 3.10: Write Unit Tests for Firestore Service**
  - **Files Created**:
    - `__tests__/services/firestoreService.test.ts`
  - **Tests**:
    - ✅ `createConversation()` creates conversation in Firestore
    - ✅ `sendMessage()` saves message with correct fields
    - ✅ `getMessages()` retrieves messages in correct order
    - ✅ `updateMessageStatus()` updates status correctly
    - ✅ `markMessageAsRead()` adds user to readBy map
  - **Mocking**: Mock Firebase Firestore SDK

- [ ] **Task 3.11: Write Unit Tests for Local Database**
  - **Files Created**:
    - `__tests__/services/localDatabase.test.ts`
  - **Tests**:
    - ✅ `insertMessage()` saves message to SQLite
    - ✅ `getMessages()` retrieves messages by conversationId
    - ✅ `updateMessage()` modifies existing message
    - ✅ `getConversations()` returns all conversations
  - **Purpose**: Verify local persistence works correctly

- [ ] **Task 3.12: Write Integration Test for Message Flow**
  - **Files Created**:
    - `__tests__/integration/messageFlow.test.ts`
  - **Test Flow**:
    1. Create conversation → verify in Firestore
    2. Send message → verify in Firestore & local DB
    3. Fetch messages → verify retrieved correctly
    4. Update message status → verify reflected in both DBs
  - **Purpose**: Verify data flows correctly between Firestore and local DB

**PR Description**: "Implement core messaging data layer with Message and Conversation models, Firestore service, local SQLite database, and security rules. Includes hooks for messages and conversations. Comprehensive unit tests for services and integration test for message flow."

---

## PR #4: Chat UI & Real-Time Sync

**Goal**: Build chat UI with message list, input, and real-time sync  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/chat-ui`

### Tasks

- [ ] **Task 4.1: Create Message Bubble Component**
  - **Files Created**:
    - `src/components/chat/MessageBubble.tsx`
  - **Props**: message, isOwnMessage
  - **UI**: Different styling for sent vs received, timestamp, status indicators (checkmarks)

- [ ] **Task 4.2: Create Message List Component**
  - **Files Created**:
    - `src/components/chat/MessageList.tsx`
  - **Implementation**: FlatList with virtualization, inverted list, pull-to-load-more
  - **Props**: messages, onLoadMore

- [ ] **Task 4.3: Create Message Input Component**
  - **Files Created**:
    - `src/components/chat/MessageInput.tsx`
  - **UI**: TextInput, send button, image picker button
  - **Props**: onSend, onImagePick

- [ ] **Task 4.4: Create Chat Header Component**
  - **Files Created**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: Recipient name, online status, back button
  - **Props**: conversation, onBack

- [ ] **Task 4.5: Create Chat Screen**
  - **Files Created**:
    - `src/screens/main/ChatScreen.tsx`
  - **Components Used**: ChatHeader, MessageList, MessageInput
  - **Functionality**: Load messages, send messages, real-time updates

- [ ] **Task 4.6: Implement Optimistic UI Updates**
  - **Files Modified**:
    - `src/store/context/ChatContext.tsx`
    - `src/hooks/useMessages.ts`
  - **Flow**:
    1. User sends message → add to local state immediately with status "sending"
    2. Save to local DB
    3. Send to Firestore
    4. On success → update status to "sent"
    5. On failure → update status to "failed", show retry

- [ ] **Task 4.7: Implement Real-Time Message Listeners**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Action**: Set up Firestore onSnapshot listener
  - **Cleanup**: Unsubscribe on unmount

- [ ] **Task 4.8: Create Conversation List Item Component**
  - **Files Created**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: Avatar, name, last message preview, timestamp, unread badge

- [ ] **Task 4.9: Create Conversation List Screen**
  - **Files Created**:
    - `src/screens/main/ConversationListScreen.tsx`
  - **Components Used**: ConversationList (FlatList of ConversationListItem)
  - **Functionality**: Navigate to chat on tap

- [ ] **Task 4.10: Create New Chat Screen**
  - **Files Created**:
    - `src/screens/main/NewChatScreen.tsx`
  - **UI**: Search users, select user, start conversation
  - **Functionality**: Search Firestore users, create new conversation

- [ ] **Task 4.11: Set Up Main Navigation**
  - **Files Created**:
    - `src/navigation/MainNavigator.tsx`
  - **Screens**: ConversationList, Chat, NewChat, Profile
  - **Type**: Stack navigator

- [ ] **Task 4.12: Create App Navigator (Root)**
  - **Files Created**:
    - `src/navigation/AppNavigator.tsx`
  - **Logic**: If authenticated → MainNavigator, else → AuthNavigator
  - **Files Modified**:
    - `App.tsx` (wrap with AuthProvider, NavigationContainer)

- [ ] **Task 4.13: Implement Message Timestamps**
  - **Files Created**:
    - `src/utils/dateFormatter.ts`
  - **Functions**: formatMessageTime (e.g., "Just now", "5m ago", "Yesterday", "Jan 15")

- [ ] **Task 4.14: Create Avatar Component**
  - **Files Created**:
    - `src/components/common/Avatar.tsx`
  - **Props**: imageUrl, displayName (for initials fallback), size
  - **UI**: Circle with image or initials

- [ ] **Task 4.15: Write Unit Tests for Date Formatter**
  - **Files Created**:
    - `__tests__/utils/dateFormatter.test.ts`
  - **Tests**:
    - ✅ `formatMessageTime()` returns "Just now" for recent messages
    - ✅ `formatMessageTime()` returns "5m ago" for minutes
    - ✅ `formatMessageTime()` returns "Yesterday" for previous day
    - ✅ `formatMessageTime()` returns "Jan 15" for older dates

- [ ] **Task 4.16: Write Integration Test for Real-Time Messaging**
  - **Files Created**:
    - `__tests__/integration/realtimeMessaging.test.ts`
  - **Test Flow**:
    1. User A sends message → message saved to Firestore
    2. User B listener receives update → message appears in UI
    3. Verify message appears within acceptable time (<2 seconds)
    4. Verify optimistic update (message appears immediately for sender)
  - **Purpose**: Verify real-time sync and optimistic updates work correctly

- [ ] **Task 4.17: Manual Test Chat Flow**
  - **Actions**:
    1. Send message → appears in both devices in real-time
    2. Receive message → appears instantly
    3. Message timestamps display correctly
    4. Optimistic update works (message appears before server confirms)

**PR Description**: "Build complete chat UI with message bubbles, message list (FlatList), input, and real-time Firestore sync. Implements optimistic UI updates, conversation list, and navigation. Includes unit tests for utilities and integration test for real-time messaging."

---

## PR #5: Presence & Typing Indicators

**Goal**: Online/offline status, last seen, typing indicators  
**Estimated Time**: 2 hours  
**Branch**: `feature/presence-typing`

### Tasks

- [ ] **Task 5.1: Implement Presence System**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `updatePresence(userId, isOnline)`
    - `listenToPresence(userId, callback)`
  - **Logic**:
    - On app foreground → set isOnline = true
    - On app background → set isOnline = false, update lastSeen
    - Use Firestore onDisconnect() for cleanup

- [ ] **Task 5.2: Create usePresence Hook**
  - **Files Created**:
    - `src/hooks/usePresence.ts`
  - **Function**: usePresence(userId)
  - **Returns**: isOnline, lastSeen

- [ ] **Task 5.3: Integrate Presence with App State**
  - **Files Created**:
    - `src/store/context/PresenceContext.tsx`
  - **Logic**: Listen to AppState, update presence on change
  - **Dependencies**: react-native AppState

- [ ] **Task 5.4: Display Online Status in Chat Header**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: Green dot if online, "last seen X ago" if offline

- [ ] **Task 5.5: Display Online Status in Conversation List**
  - **Files Modified**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: Green dot badge on avatar if online

- [ ] **Task 5.6: Implement Typing Indicators - Backend**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `setTypingStatus(conversationId, userId, isTyping)`
    - `listenToTyping(conversationId, callback)`
  - **Implementation**: Use Firestore subcollection `/conversations/{id}/typing/{userId}` with TTL

- [ ] **Task 5.7: Create useTypingIndicator Hook**
  - **Files Created**:
    - `src/hooks/useTypingIndicator.ts`
  - **Functions**: useTypingIndicator(conversationId)
  - **Returns**: typingUsers array, setTyping function

- [ ] **Task 5.8: Create Typing Indicator Component**
  - **Files Created**:
    - `src/components/chat/TypingIndicator.tsx`
  - **UI**: Animated dots, "User is typing..." text
  - **Props**: typingUsers

- [ ] **Task 5.9: Integrate Typing in Message Input**
  - **Files Modified**:
    - `src/components/chat/MessageInput.tsx`
  - **Logic**: On text change → setTyping(true), clear after 3 seconds

- [ ] **Task 5.10: Display Typing Indicator in Chat**
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
  - **UI**: Show TypingIndicator component below messages

- [ ] **Task 5.11: Write Unit Tests for Presence Logic**
  - **Files Created**:
    - `__tests__/hooks/usePresence.test.ts`
  - **Tests**:
    - ✅ `updatePresence()` sets isOnline to true on foreground
    - ✅ `updatePresence()` sets isOnline to false on background
    - ✅ `updatePresence()` updates lastSeen timestamp
    - ✅ Presence listener receives updates correctly

- [ ] **Task 5.12: Write Unit Tests for Typing Indicator**
  - **Files Created**:
    - `__tests__/hooks/useTypingIndicator.test.ts`
  - **Tests**:
    - ✅ `setTyping(true)` updates typing status in Firestore
    - ✅ `setTyping(false)` clears typing status
    - ✅ Typing status auto-clears after 3 seconds
    - ✅ Multiple users typing returns correct array

- [ ] **Task 5.13: Manual Test Presence & Typing**
  - **Actions**:
    1. User goes online → status updates in other device
    2. User goes offline → "last seen" updates
    3. User types → "typing..." appears in other device
    4. Stop typing → indicator disappears after 3 seconds

**PR Description**: "Implement presence system (online/offline, last seen) and typing indicators with real-time updates. Integrated into chat header and conversation list. Includes unit tests for presence and typing logic."

---

## PR #6: Read Receipts & Message States

**Goal**: Message delivery states (sending, sent, delivered, read) with checkmarks  
**Estimated Time**: 2 hours  
**Branch**: `feature/read-receipts`

### Tasks

- [ ] **Task 6.1: Update Message Model with ReadBy Field**
  - **Files Modified**:
    - `src/models/Message.ts`
  - **Field**: readBy: { [userId: string]: timestamp }

- [ ] **Task 6.2: Implement Mark as Read Function**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Function**: `markMessagesAsRead(conversationId, userId)`
  - **Logic**: Update all unread messages in conversation, add userId to readBy map

- [ ] **Task 6.3: Auto Mark as Read When Chat Opened**
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
  - **Logic**: On screen mount, call markMessagesAsRead

- [ ] **Task 6.4: Create Message Status Icons**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**: 
    - Sending: Single gray checkmark (loading)
    - Sent: Single gray checkmark
    - Delivered: Double gray checkmarks
    - Read: Double blue checkmarks
  - **Icons**: Use Ionicons or create custom

- [ ] **Task 6.5: Calculate Message Status**
  - **Files Created**:
    - `src/utils/messageHelpers.ts`
  - **Function**: getMessageStatus(message, conversationParticipants)
  - **Logic**:
    - If all participants in readBy → "read"
    - If message exists in Firestore but not all delivered → "delivered"
    - If confirmed by server → "sent"
    - Else → "sending"

- [ ] **Task 6.6: Update Unread Count in Conversations**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Logic**: Maintain unread count per conversation per user
  - **Update**: Increment on new message, reset when marked as read

- [ ] **Task 6.7: Display Unread Count Badge**
  - **Files Modified**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: Red badge with unread count

- [ ] **Task 6.8: Listen to Read Receipts Updates**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**: Real-time listener updates message status when others read

- [ ] **Task 6.9: Update Local Database Schema**
  - **Files Modified**:
    - `src/services/database/sqliteService.ts`
  - **Action**: Add readBy field to messages table (store as JSON string)

- [ ] **Task 6.10: Write Unit Tests for Message Status Logic**
  - **Files Created**:
    - `__tests__/utils/messageHelpers.test.ts`
  - **Tests**:
    - ✅ `getMessageStatus()` returns "sending" for unsent message
    - ✅ `getMessageStatus()` returns "sent" when confirmed by server
    - ✅ `getMessageStatus()` returns "delivered" when received by recipient
    - ✅ `getMessageStatus()` returns "read" when all participants read
    - ✅ Group message status calculates correctly (read by 3/5)

- [ ] **Task 6.11: Manual Test Read Receipts**
  - **Actions**:
    1. Send message → single checkmark appears
    2. Message delivered → double gray checkmarks
    3. Recipient opens chat → double blue checkmarks
    4. Unread badge shows correct count
    5. Opening chat clears unread count

**PR Description**: "Implement complete read receipt system with message delivery states (sending, sent, delivered, read). Includes visual checkmarks, unread count badges, and unit tests for status logic."

---

## PR #7: Image Sharing

**Goal**: Send and receive images with compression and Firebase Storage  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/image-sharing`

### Tasks

- [ ] **Task 7.1: Implement Image Compression Utility**
  - **Files Created**:
    - `src/utils/imageCompression.ts`
  - **Function**: compressImage(uri, quality, maxWidth)
  - **Logic**: Resize and compress to max 1MB, 0.7 quality
  - **Dependencies**: expo-image-manipulator

- [ ] **Task 7.2: Implement Firebase Storage Service**
  - **Files Created**:
    - `src/services/firebase/storageService.ts`
  - **Functions**:
    - `uploadImage(uri, path)`
    - `getImageUrl(path)`
    - `deleteImage(path)`
  - **Path structure**: `/images/{userId}/{timestamp}_{filename}`

- [ ] **Task 7.3: Update Message Model for Images**
  - **Files Modified**:
    - `src/models/Message.ts`
  - **Fields**: type: 'text' | 'image', imageUrl?: string, imagePath?: string

- [ ] **Task 7.4: Add Image Picker to Message Input**
  - **Files Modified**:
    - `src/components/chat/MessageInput.tsx`
  - **UI**: Camera icon button
  - **Functionality**: Open ImagePicker (camera or gallery)
  - **Dependencies**: expo-image-picker

- [ ] **Task 7.5: Implement Image Upload Flow**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Flow**:
    1. User picks image
    2. Compress image
    3. Create message with local URI (optimistic update)
    4. Upload to Firebase Storage
    5. Get download URL
    6. Update message in Firestore with imageUrl
    7. Update local message

- [ ] **Task 7.6: Display Images in Message Bubbles**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**: 
    - Thumbnail in chat (200x200)
    - Loading indicator while uploading
    - Tap to view full screen
  - **Dependencies**: expo-image for better performance

- [ ] **Task 7.7: Create Full-Screen Image Viewer**
  - **Files Created**:
    - `src/components/chat/ImageViewer.tsx`
  - **UI**: Modal with full-screen image, pinch-to-zoom, close button
  - **Dependencies**: react-native-image-zoom-viewer (optional)

- [ ] **Task 7.8: Request Camera & Gallery Permissions**
  - **Files Modified**:
    - `app.config.js`
  - **Permissions**: Camera, Media Library
  - **Runtime**: Request permissions before opening picker

- [ ] **Task 7.9: Handle Image Loading States**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **States**: Loading (skeleton), Error (retry button), Loaded

- [ ] **Task 7.10: Update Local Database for Images**
  - **Files Modified**:
    - `src/services/database/sqliteService.ts`
  - **Action**: Store image messages, cache local URI until uploaded

- [ ] **Task 7.11: Write Storage Security Rules**
  - **Files Created**:
    - `firebase/storage.rules`
  - **Rules**: Users can only upload to their own directory, can read images they have access to

- [ ] **Task 7.12: Write Unit Tests for Image Compression**
  - **Files Created**:
    - `__tests__/utils/imageCompression.test.ts`
  - **Tests**:
    - ✅ `compressImage()` reduces image size to < 1MB
    - ✅ `compressImage()` maintains aspect ratio
    - ✅ `compressImage()` applies correct quality setting (0.7)
    - ✅ `compressImage()` handles invalid URIs gracefully

- [ ] **Task 7.13: Write Integration Test for Image Upload Flow**
  - **Files Created**:
    - `__tests__/integration/imageUpload.test.ts`
  - **Test Flow**:
    1. Mock image picker returns URI
    2. Image compression called with correct params
    3. Compressed image uploaded to Firebase Storage
    4. Download URL returned
    5. Message saved with imageUrl
  - **Purpose**: Verify complete image upload pipeline

- [ ] **Task 7.14: Manual Test Image Sharing**
  - **Actions**:
    1. Pick image from gallery → compresses and uploads
    2. Take photo with camera → compresses and uploads
    3. Image appears in both devices
    4. Tap image → opens full screen
    5. Image persists offline (cached)

**PR Description**: "Implement image sharing with compression, Firebase Storage upload, thumbnail display, and full-screen viewer. Includes loading states, permission handling, and comprehensive tests for compression and upload flow."

---

## PR #8: Offline Support & Queue System

**Goal**: Message queueing when offline, sync when back online, network status indicator  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/offline-support`

### Tasks

- [ ] **Task 8.1: Implement Network Monitor**
  - **Files Created**:
    - `src/services/network/networkMonitor.ts`
  - **Function**: Monitor network connectivity state
  - **Dependencies**: @react-native-community/netinfo
  - **Events**: onConnect, onDisconnect

- [ ] **Task 8.2: Create Network Context**
  - **Files Created**:
    - `src/store/context/NetworkContext.tsx`
  - **State**: isConnected, networkType
  - **Hook**: useNetworkStatus()

- [ ] **Task 8.3: Create Offline Queue Manager**
  - **Files Created**:
    - `src/store/offlineQueue/offlineQueueManager.ts`
  - **Functions**:
    - `enqueue(operation)` - Add to queue
    - `processQueue()` - Process all queued operations
    - `clearQueue()` - Clear after successful sync
  - **Storage**: AsyncStorage for persistence
  - **Operations**: sendMessage, uploadImage, updateReadReceipt

- [ ] **Task 8.4: Integrate Queue with Send Message**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**:
    - If online → send immediately
    - If offline → add to queue, save locally with status "pending"
    - When back online → process queue

- [ ] **Task 8.5: Create Offline Indicator Component**
  - **Files Created**:
    - `src/components/common/OfflineIndicator.tsx`
  - **UI**: Banner at top of screen "You're offline. Messages will send when reconnected."
  - **Display**: Only when offline

- [ ] **Task 8.6: Add Offline Indicator to App**
  - **Files Modified**:
    - `App.tsx` or `src/navigation/AppNavigator.tsx`
  - **Position**: Top of screen, above all content

- [ ] **Task 8.7: Handle Queue Processing on Reconnect**
  - **Files Modified**:
    - `src/store/context/NetworkContext.tsx`
  - **Logic**: On connection restored → trigger processQueue()

- [ ] **Task 8.8: Update Message Status for Offline Messages**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**: Show "pending" status for queued messages
  - **Icon**: Clock icon or "Waiting to send"

- [ ] **Task 8.9: Implement Retry Logic**
  - **Files Modified**:
    - `src/store/offlineQueue/offlineQueueManager.ts`
  - **Logic**: Exponential backoff for failed operations
  - **Max retries**: 3 attempts per operation

- [ ] **Task 8.10: Cache Messages for Offline Viewing**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**: Load from local DB first, then sync with Firestore
  - **Benefit**: View message history offline

- [ ] **Task 8.11: Write Unit Tests for Offline Queue Manager**
  - **Files Created**:
    - `__tests__/store/offlineQueueManager.test.ts`
  - **Tests**:
    - ✅ `enqueue()` adds operation to queue
    - ✅ `enqueue()` persists queue to AsyncStorage
    - ✅ `processQueue()` executes operations in order
    - ✅ `processQueue()` removes successful operations
    - ✅ `processQueue()` retries failed operations
    - ✅ Failed operations retry with exponential backoff
    - ✅ Max retry limit (3) enforced
  - **Purpose**: Critical for offline reliability - must be thoroughly tested

- [ ] **Task 8.12: Write Unit Tests for Network Monitor**
  - **Files Created**:
    - `__tests__/services/networkMonitor.test.ts`
  - **Tests**:
    - ✅ Network monitor detects online state
    - ✅ Network monitor detects offline state
    - ✅ `onConnect` callback fires when connection restored
    - ✅ `onDisconnect` callback fires when connection lost

- [ ] **Task 8.13: Write Integration Test for Offline Flow**
  - **Files Created**:
    - `__tests__/integration/offlineFlow.test.ts`
  - **Test Flow**:
    1. Simulate offline state
    2. Send message → verify added to queue
    3. Verify message saved locally with "pending" status
    4. Simulate online state
    5. Verify queue processes automatically
    6. Verify message sent to Firestore
    7. Verify status updates to "sent"
  - **Purpose**: Verify complete offline queueing and sync flow

- [ ] **Task 8.14: Manual Test Offline Scenarios**
  - **Actions**:
    1. Turn on airplane mode
    2. Send message → queued, shows "pending"
    3. Turn off airplane mode
    4. Message automatically sends
    5. Status updates to "sent"
    6. Offline indicator appears/disappears correctly

**PR Description**: "Implement offline support with message queueing, automatic sync on reconnect, network status monitoring, and offline indicator. Messages persist and send when connection restored. Comprehensive unit tests for queue manager and integration test for offline flow."

---

## PR #9: Group Chat

**Goal**: Create groups, send group messages, group management  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/group-chat`

### Tasks

- [ ] **Task 9.1: Create Group Model**
  - **Files Created**:
    - `src/models/Group.ts`
  - **Fields**: id, name, description, iconUrl, adminIds, memberIds, createdAt, createdBy

- [ ] **Task 9.2: Update Conversation Model for Groups**
  - **Files Modified**:
    - `src/models/Conversation.ts`
  - **Fields**: groupId?, groupName?, groupIcon?

- [ ] **Task 9.3: Implement Group Firestore Functions**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `createGroup(name, memberIds, adminIds, iconUrl)`
    - `getGroup(groupId)`
    - `updateGroup(groupId, updates)`
    - `addGroupMember(groupId, userId)`
    - `removeGroupMember(groupId, userId)`
    - `leaveGroup(groupId, userId)`

- [ ] **Task 9.4: Create Group Creation Screen**
  - **Files Created**:
    - `src/screens/group/CreateGroupScreen.tsx`
    - `src/components/group/GroupCreationModal.tsx`
  - **UI**: 
    - Group name input
    - Member selection (multi-select list)
    - Create button
  - **Flow**: Select members → enter name → create

- [ ] **Task 9.5: Create User Selection Component**
  - **Files Created**:
    - `src/components/group/UserSelectionList.tsx`
  - **UI**: Searchable list with checkboxes
  - **Function**: Fetch users from Firestore

- [ ] **Task 9.6: Update Chat Screen for Groups**
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
  - **Changes**: Detect if group conversation, adjust UI accordingly

- [ ] **Task 9.7: Update Message Bubble for Groups**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**: Show sender name above message (for group messages)

- [ ] **Task 9.8: Create Group Info Screen**
  - **Files Created**:
    - `src/screens/group/GroupDetailsScreen.tsx`
    - `src/components/group/GroupMemberList.tsx`
  - **UI**: 
    - Group name, icon
    - Members list
    - Add members button (if admin)
    - Leave group button
  - **Navigation**: Tap header in group chat

- [ ] **Task 9.9: Implement Group Message Sending**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**: 
    - Send message to conversation
    - Firestore delivers to all group members
    - Update lastMessage for group conversation

- [ ] **Task 9.10: Update Read Receipts for Groups**
  - **Files Modified**:
    - `src/utils/messageHelpers.ts`
  - **Logic**: 
    - Track readBy per member
    - Display "Read by 3/5" or individual names

- [ ] **Task 9.11: Update Typing Indicators for Groups**
  - **Files Modified**:
    - `src/hooks/useTypingIndicator.ts`
  - **UI**: "John and Sarah are typing..." or "3 people typing..."

- [ ] **Task 9.12: Update Conversation List for Groups**
  - **Files Modified**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: 
    - Group icon (or initials)
    - Group name
    - Last message with sender name

- [ ] **Task 9.13: Implement Leave Group**
  - **Files Created**:
    - Leave group function in firestoreService
  - **Logic**: Remove user from memberIds, update conversation participants

- [ ] **Task 9.14: Update Security Rules for Groups**
  - **Files Modified**:
    - `firebase/firestore.rules`
  - **Rules**: Only group members can read/write group messages

- [ ] **Task 9.15: Write Integration Test for Group Messaging**
  - **Files Created**:
    - `__tests__/integration/groupMessaging.test.ts`
  - **Test Flow**:
    1. Create group with 3 users → verify in Firestore
    2. User A sends message → verify message delivered to all members
    3. Verify message has correct senderId
    4. User B reads message → verify readBy updated
    5. Calculate group read status → verify "read by 2/3"
  - **Purpose**: Verify group message delivery to multiple participants

- [ ] **Task 9.16: Manual Test Group Chat**
  - **Actions**:
    1. Create group with 3+ users
    2. Send message in group → all members receive
    3. Member names display correctly
    4. Typing indicator shows multiple users
    5. Leave group → conversation removed
    6. Add member → they see message history

**PR Description**: "Implement full group chat functionality with group creation, member management, group messages with sender names, and group-specific typing indicators and read receipts. Includes integration test for group messaging flow."

---

## PR #10: Push Notifications

**Goal**: Push notifications for new messages (foreground minimum)  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/push-notifications`

### Tasks

- [ ] **Task 10.1: Configure Firebase Cloud Messaging**
  - **Action**: Set up FCM in Firebase Console
  - **Steps**:
    1. iOS: Upload APNs certificate or key
    2. Android: FCM auto-configured
  - **Files Modified**:
    - `app.config.js` (add FCM plugin config)

- [ ] **Task 10.2: Implement Notification Service**
  - **Files Created**:
    - `src/services/notifications/notificationService.ts`
  - **Functions**:
    - `requestPermissions()`
    - `getDeviceToken()`
    - `registerForPushNotifications()`
    - `handleNotification(notification)`
    - `scheduleNotification(title, body, data)`
  - **Dependencies**: expo-notifications (Expo Push Service for FCM integration)

- [ ] **Task 10.3: Request Notification Permissions**
  - **Files Modified**:
    - `src/store/context/AuthContext.tsx`
  - **Logic**: After successful login, request notification permissions

- [ ] **Task 10.4: Save Device Token to Firestore**
  - **Files Modified**:
    - `src/services/firebase/authService.ts`
  - **Action**: Update user document with FCM token
  - **Field**: `fcmTokens: string[]` (array for multiple devices)

- [ ] **Task 10.5: Handle Foreground Notifications**
  - **Files Modified**:
    - `App.tsx`
  - **Logic**: 
    - Listen to notifications while app is in foreground
    - Show in-app notification banner
  - **Dependencies**: expo-notifications

- [ ] **Task 10.6: Create Notification Banner Component**
  - **Files Created**:
    - `src/components/common/NotificationBanner.tsx`
  - **UI**: Slide-in banner at top with sender, message preview, tap to open chat
  - **Animation**: Slide in from top, auto-dismiss after 3 seconds

- [ ] **Task 10.7: Handle Notification Tap (Navigation)**
  - **Files Modified**:
    - `App.tsx`
  - **Logic**: When notification tapped → navigate to specific chat
  - **Data**: notification.data.conversationId

- [ ] **Task 10.8: Implement Cloud Function for Notifications** (Optional but Recommended)
  - **Note**: This requires Cloud Functions setup (not in MVP scope)
  - **Alternative**: Use Firestore triggers or send from client (less secure)
  - **For MVP**: Send notification from client when message sent (simple approach)

- [ ] **Task 10.9: Send Notification on Message Sent** (Client-side MVP approach)
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**:
    1. After message saved to Firestore
    2. Get recipient FCM tokens from Firestore
    3. Send notification via FCM API (using Expo push service)
  - **Note**: This approach exposes tokens; for production, use Cloud Functions

- [ ] **Task 10.10: Handle Background Notifications** (Nice-to-Have)
  - **Files Modified**:
    - `app.config.js` (configure background fetch)
  - **Logic**: OS handles background notifications automatically
  - **Note**: May not work reliably on all devices

- [ ] **Task 10.11: Update Firestore Rules for FCM Tokens**
  - **Files Modified**:
    - `firebase/firestore.rules`
  - **Rule**: Only user can write their own FCM tokens

- [ ] **Task 10.12: Write Unit Tests for Notification Service**
  - **Files Created**:
    - `__tests__/services/notificationService.test.ts`
  - **Tests**:
    - ✅ `requestPermissions()` requests notification permissions
    - ✅ `getDeviceToken()` returns valid FCM token
    - ✅ `registerForPushNotifications()` saves token to Firestore
    - ✅ `handleNotification()` extracts conversationId from data
  - **Note**: Full notification flow is difficult to test in unit tests

- [ ] **Task 10.13: Manual Test Notifications**
  - **Actions**:
    1. User A sends message to User B
    2. User B app in foreground → banner notification appears
    3. User B app in background → system notification appears
    4. Tap notification → opens chat with User A
    5. Notification shows correct sender and message preview

**PR Description**: "Implement push notifications using Firebase Cloud Messaging and Expo Notifications. Includes foreground notification banner, background notifications, navigation on tap, and unit tests for notification service."

---

## PR #11: UI Polish & Error Handling

**Goal**: Loading states, error handling, UI polish, smooth animations  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/ui-polish`

### Tasks

- [ ] **Task 11.1: Create Loading Spinner Component**
  - **Files Created**:
    - `src/components/common/LoadingSpinner.tsx`
  - **Props**: size, color
  - **UI**: Centered spinner with optional message

- [ ] **Task 11.2: Add Loading States to Screens**
  - **Files Modified**:
    - `src/screens/main/ConversationListScreen.tsx`
    - `src/screens/main/ChatScreen.tsx`
  - **UI**: Show LoadingSpinner while fetching data

- [ ] **Task 11.3: Create Error Boundary Component**
  - **Files Created**:
    - `src/components/common/ErrorBoundary.tsx`
  - **Functionality**: Catch React errors, show fallback UI
  - **UI**: Error message with "Reload App" button

- [ ] **Task 11.4: Create Error Message Component**
  - **Files Created**:
    - `src/components/common/ErrorMessage.tsx`
  - **Props**: message, onRetry
  - **UI**: Error icon, message text, retry button

- [ ] **Task 11.5: Add Error Handling to Data Fetching**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
    - `src/hooks/useConversations.ts`
  - **Logic**: Try-catch blocks, set error state, show ErrorMessage

- [ ] **Task 11.6: Implement Retry Logic in UI**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**: Failed messages show retry button
  - **Logic**: Tap retry → re-send message

- [ ] **Task 11.7: Add Pull-to-Refresh**
  - **Files Modified**:
    - `src/screens/main/ConversationListScreen.tsx`
    - `src/screens/main/ChatScreen.tsx`
  - **Functionality**: Pull down to refresh data
  - **Component**: RefreshControl in FlatList

- [ ] **Task 11.8: Implement Keyboard Handling**
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
  - **Logic**: 
    - KeyboardAvoidingView for iOS
    - android:windowSoftInputMode="adjustResize" for Android
    - Scroll to bottom when keyboard appears

- [ ] **Task 11.9: Add Empty States**
  - **Files Created**:
    - `src/components/common/EmptyState.tsx`
  - **Props**: icon, message, actionText, onAction
  - **Use Cases**:
    - No conversations yet
    - No messages in chat
    - No search results

- [ ] **Task 11.10: Add Smooth Animations**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx` (fade in animation)
    - `src/components/conversation/ConversationListItem.tsx` (swipe gestures)
  - **Dependencies**: react-native-reanimated

- [ ] **Task 11.11: Optimize FlatList Performance**
  - **Files Modified**:
    - `src/components/chat/MessageList.tsx`
    - `src/components/conversation/ConversationList.tsx`
  - **Optimizations**:
    - getItemLayout for fixed heights
    - keyExtractor
    - removeClippedSubviews
    - maxToRenderPerBatch
    - windowSize

- [ ] **Task 11.12: Add Haptic Feedback** (Nice-to-Have)
  - **Dependencies**: expo-haptics
  - **Usage**: On button press, message sent, error

- [ ] **Task 11.13: Implement Toast Notifications**
  - **Files Created**:
    - `src/components/common/Toast.tsx`
  - **Use Cases**: Success ("Message sent"), error ("Failed to upload image")

- [ ] **Task 11.14: Add Message Long-Press Actions** (Nice-to-Have)
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **Actions**: Copy text, delete (future), react (future)

- [ ] **Task 11.15: Polish Input Styling**
  - **Files Modified**:
    - `src/components/chat/MessageInput.tsx`
  - **UI**: Rounded corners, proper padding, disabled state when empty

**PR Description**: "Add comprehensive UI polish including loading states, error handling with retry, pull-to-refresh, keyboard handling, empty states, smooth animations, and FlatList performance optimizations."

---

## PR #12: Testing, Bug Fixes & Documentation

**Goal**: End-to-end testing, fix bugs, complete documentation  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/testing-documentation`

### Tasks

- [ ] **Task 12.1: Manual Testing - Real-Time Messaging**
  - **Test**: Two devices send messages back and forth
  - **Verify**: Messages appear within 1 second
  - **Devices**: iOS and Android

- [ ] **Task 12.2: Manual Testing - Offline Scenario**
  - **Test**: 
    1. Device A goes offline (airplane mode)
    2. Device B sends message
    3. Device A comes online
    4. Verify message delivers
  - **Verify**: Message queues and syncs correctly

- [ ] **Task 12.3: Manual Testing - App Lifecycle**
  - **Test**: 
    1. Send message
    2. Force quit app
    3. Reopen app
  - **Verify**: Message was sent, chat history persists

- [ ] **Task 12.4: Manual Testing - Poor Network**
  - **Test**: Enable network throttling (3G speed)
  - **Verify**: Messages still deliver, just slower

- [ ] **Task 12.5: Manual Testing - Rapid Messages**
  - **Test**: Send 20 messages quickly
  - **Verify**: All appear in correct order

- [ ] **Task 12.6: Manual Testing - Group Chat**
  - **Test**: Create group with 3 users, send messages
  - **Verify**: All members receive, sender names display

- [ ] **Task 12.7: Manual Testing - Push Notifications**
  - **Test**: 
    1. User A sends message
    2. User B app in foreground
    3. User B app in background
  - **Verify**: Notifications trigger correctly

- [ ] **Task 12.8: Manual Testing - Image Sharing**
  - **Test**: Send image in chat
  - **Verify**: Compresses, uploads, displays correctly

- [ ] **Task 12.9: Manual Testing - Presence & Typing**
  - **Test**: 
    1. User goes online/offline
    2. User types in chat
  - **Verify**: Indicators update in real-time

- [ ] **Task 12.10: Manual Testing - Read Receipts**
  - **Test**: Send message, recipient opens chat
  - **Verify**: Checkmarks update from sent → delivered → read

- [ ] **Task 12.11: Fix Identified Bugs**
  - **Action**: Create bug list, fix each one
  - **Files Modified**: Various (depends on bugs found)
  - **Log**: Document each bug and fix in PR description

- [ ] **Task 12.12: Write Comprehensive README**
  - **Files Modified**:
    - `README.md`
  - **Sections**:
    - Project overview
    - Features list
    - Tech stack
    - Prerequisites
    - Installation steps
    - Firebase setup instructions
    - Running the app
    - Environment variables
    - Testing instructions
    - Known limitations
    - Future roadmap

- [ ] **Task 12.13: Document Project Structure**
  - **Files Modified**:
    - `README.md` or create `ARCHITECTURE.md`
  - **Content**: Explain folder structure, key patterns used

- [ ] **Task 12.14: Create .env.example**
  - **Files Created**:
    - `.env.example`
  - **Content**: Template for environment variables (API keys placeholders)

- [ ] **Task 12.15: Update .gitignore**
  - **Files Modified**:
    - `.gitignore`
  - **Add**: 
    - `.env` (Firebase credentials)
    - `node_modules/`
    - `.expo/`
    - `dist/`
    - `npm-debug.*`
    - `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` (certificates)
  - **Note**: No native config files needed with Firebase JS SDK

- [ ] **Task 12.16: Add Code Comments**
  - **Files Modified**: Complex functions across the codebase
  - **Action**: Add JSDoc comments to key functions

- [ ] **Task 12.17: Create TESTING.md**
  - **Files Created**:
    - `TESTING.md`
  - **Content**: Testing scenarios, expected results, how to test

- [ ] **Task 12.18: Performance Audit**
  - **Action**: Use React Native Debugger, check for:
    - Memory leaks
    - Unnecessary re-renders
    - Slow queries
  - **Fix**: Optimize as needed

- [ ] **Task 12.19: Publish to Expo**
  - **Action**: `eas build` or `expo publish`
  - **Result**: Generate QR code for Expo Go testing

- [ ] **Task 12.20: Create Demo Video Script** (Optional, for Final Submission)
  - **Files Created**:
    - `DEMO_SCRIPT.md`
  - **Content**: 
    - Real-time messaging demo
    - Offline scenario
    - Group chat
    - All features showcase

**PR Description**: "Complete comprehensive testing across all features (10 test scenarios), fix identified bugs, add detailed documentation (README, ARCHITECTURE, TESTING), optimize performance, and publish to Expo."

---

## PR Checklist Summary

### Quick Reference: All 12 PRs

1. ✅ **PR #1: Project Setup & Configuration** (1 hour)
2. ✅ **PR #2: Authentication System** (2-3 hours)
3. ✅ **PR #3: Core Messaging Infrastructure - Data Layer** (2-3 hours)
4. ✅ **PR #4: Chat UI & Real-Time Sync** (3-4 hours)
5. ✅ **PR #5: Presence & Typing Indicators** (2 hours)
6. ✅ **PR #6: Read Receipts & Message States** (2 hours)
7. ✅ **PR #7: Image Sharing** (2-3 hours)
8. ✅ **PR #8: Offline Support & Queue System** (2-3 hours)
9. ✅ **PR #9: Group Chat** (3-4 hours)
10. ✅ **PR #10: Push Notifications** (2-3 hours)
11. ✅ **PR #11: UI Polish & Error Handling** (2-3 hours)
12. ✅ **PR #12: Testing, Bug Fixes & Documentation** (2-3 hours)

**Total Estimated Time**: 24-32 hours (aligns with MVP sprint)

---

## Git Workflow

### Creating Each PR

```bash
# Start new feature
git checkout -b feature/project-setup

# Make changes, commit frequently
git add .
git commit -m "Setup Expo project with TypeScript"

# Push to GitHub
git push origin feature/project-setup

# Create PR on GitHub
# After review/approval, merge to main

# Start next feature
git checkout main
git pull origin main
git checkout -b feature/authentication
```

### Commit Message Convention

```
type(scope): description

Examples:
feat(auth): implement Firebase authentication
fix(chat): resolve message duplication issue
docs(readme): add Firebase setup instructions
refactor(hooks): optimize useMessages performance
test(chat): add offline scenario tests
```

---

## Notes

- **Dependencies Between PRs**: Some PRs depend on previous ones. Follow the order.
- **Parallel Work**: PR #5, #6, #7 can be worked on in parallel after PR #4
- **Testing**: Test after each PR before moving to next
- **Deployment**: After each PR, test on Expo Go to catch issues early
- **Documentation**: Update README as you go, not just at the end

---

## Success Criteria Checklist

After completing all 12 PRs, verify:

- [ ] Two devices can exchange messages in real-time (<2 seconds)
- [ ] Messages persist through app restart
- [ ] Offline scenario works (queue → reconnect → deliver)
- [ ] Group chat with 3+ users functional
- [ ] Read receipts update correctly
- [ ] Typing indicators show/hide
- [ ] Push notifications work (foreground minimum)
- [ ] Images send and display
- [ ] User authentication complete (signup, login, logout)
- [ ] App runs on both iOS and Android via Expo Go
- [ ] Code on GitHub with comprehensive README
- [ ] Firebase backend deployed and accessible
- [ ] All 10 MVP requirements met

---

**MVP Complete!** 🎉

Post-MVP: Choose persona, implement AI features (5 required + 1 advanced).

