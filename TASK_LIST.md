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

- [x] **Task 2.1: Create User Model**
  - **Files Created**:
    - `src/models/User.ts` ✅
  - **Content**: User interface (id, email, displayName, photoURL, bio, createdAt, lastSeen, isOnline)
  - **Helper Functions**:
    - `createUser()` - Create new user with defaults
    - `fromFirestore()` - Convert Firestore doc to User
    - `toFirestore()` - Convert User to Firestore doc
    - `updateOnlineStatus()` - Update online/offline status
    - `updateProfile()` - Update profile information
    - `isValidUser()` - Validate user object
    - `getDisplayName()` - Get display name with fallback
    - `getUserInitials()` - Get initials for avatar
    - `formatLastSeen()` - Format last seen time (e.g., "2 minutes ago")
    - `isProfileComplete()` - Check if profile is complete
    - `toUserSummary()` - Create minimal user representation

- [x] **Task 2.2: Implement Firebase Auth Service**
  - **Files Modified**:
    - `src/services/firebase/authService.ts` ✅
  - **Core Functions**:
    - `signUp(email, password, displayName)` - Creates Firebase Auth user + Firestore document
    - `signIn(email, password)` - Authenticates user + updates online status
    - `signOut()` - Signs out user + sets offline status
    - `getCurrentUser()` - Returns current Firebase user
    - `getUserProfile(uid)` - Fetches complete user profile from Firestore
    - `updateUserProfile(displayName, photoURL)` - Updates both Auth and Firestore
    - `updateUserBio(bio)` - Updates user bio in Firestore
    - `resetPassword(email)` - Sends password reset email
  - **Presence Management**:
    - `setUserOnlineStatus(uid, isOnline)` - Updates online/offline status
    - `setupPresence(uid)` - Sets up presence system
  - **Utility Functions**:
    - `onAuthStateChange(callback)` - Subscribes to auth state changes
    - `isAuthenticated()` - Checks if user is logged in
    - `reloadUser()` - Reloads user data from Firebase
    - `getAuthErrorMessage(error)` - Converts Firebase errors to user-friendly messages
  - **Features**:
    - ✅ User-friendly error messages for all Firebase Auth errors
    - ✅ Automatic Firestore user document creation on signup
    - ✅ Online/offline presence tracking
    - ✅ Last seen timestamp updates
    - ✅ Profile sync between Firebase Auth and Firestore
  - **Dependencies**: firebase (Firebase JS SDK - firebase/auth, firebase/firestore)

- [x] **Task 2.3: Create Auth Context**
  - **Files Created**:
    - `src/store/context/AuthContext.tsx` ✅
  - **Components**:
    - `AuthProvider` - Context provider component
    - `useAuth()` - Custom hook for accessing auth state
  - **State Management**:
    - `user` - Current user profile (User | null)
    - `loading` - Loading state for auth operations
    - `error` - Error messages from auth operations
  - **Auth Functions**:
    - `signUp(email, password, displayName)` - Register new user
    - `signIn(email, password)` - Sign in existing user
    - `signOut()` - Sign out current user
    - `resetPassword(email)` - Send password reset email
  - **Advanced Features**:
    - ✅ Auth state listener (onAuthStateChanged)
    - ✅ Automatic user profile fetching from Firestore
    - ✅ App lifecycle management (foreground/background)
    - ✅ Automatic presence updates (online/offline)
    - ✅ Cleanup on unmount (sets user offline)
    - ✅ Error handling with user-friendly messages
    - ✅ Loading states for all operations

- [x] **Task 2.4: Create Login Screen UI**
  - **Files Created**:
    - `src/screens/auth/LoginScreen.tsx` ✅
    - `src/components/auth/LoginForm.tsx` ✅
    - `src/utils/validators.ts` ✅ (validation utilities)
  - **UI Elements**:
    - ✅ Email input with validation
    - ✅ Password input with validation
    - ✅ Login button with loading state
    - ✅ "Forgot Password?" link
    - ✅ "Sign Up" navigation link
  - **Features**:
    - 🌑 **Dark Mode Design** - Beautiful dark theme UI
    - ✅ Real-time field validation
    - ✅ Error messages (per field + global)
    - ✅ Loading states with spinner
    - ✅ Keyboard handling (KeyboardAvoidingView)
    - ✅ Touch feedback and disabled states
    - ✅ Responsive layout with ScrollView
    - ✅ Integration with AuthContext

- [x] **Task 2.5: Create Signup Screen UI**
  - **Files Created**:
    - `src/screens/auth/SignupScreen.tsx` ✅
    - `src/components/auth/SignupForm.tsx` ✅
  - **UI Elements**:
    - ✅ Display name input with validation
    - ✅ Email input with validation
    - ✅ Password input with validation
    - ✅ Confirm password input with match validation
    - ✅ Sign up button with loading state
    - ✅ "Sign In" navigation link
    - ✅ Terms of Service notice
  - **Features**:
    - 🌑 **Dark Mode Design** - Consistent dark theme
    - ✅ Real-time field validation (4 fields)
    - ✅ Password confirmation matching
    - ✅ Error messages (per field + global)
    - ✅ Loading states with spinner
    - ✅ Keyboard handling (KeyboardAvoidingView)
    - ✅ Touch feedback and disabled states
    - ✅ Responsive layout with ScrollView
    - ✅ Integration with AuthContext

- [x] **Task 2.6: Create Splash Screen**
  - **Files Created**:
    - `src/screens/auth/SplashScreen.tsx` ✅
  - **Content**: 
    - 🌑 **Dark Mode Design** - Consistent dark theme
    - ✅ App branding (logo, name, tagline)
    - ✅ Loading spinner with "Loading..." text
    - ✅ Version number footer
    - ✅ Centered layout
    - ✅ Status bar styling

- [x] **Task 2.7: Set Up Auth Navigation**
  - **Files Created**:
    - `src/navigation/AuthNavigator.tsx` ✅
    - `src/navigation/AppNavigator.tsx` ✅
  - **Files Modified**:
    - `App.tsx` ✅ (integrated AuthProvider and AppNavigator)
  - **Navigation Flow**:
    - ✅ Splash screen (while checking auth state)
    - ✅ Auth screens (Login ↔ Signup) - if not logged in
    - ✅ Main screens (placeholder) - if logged in
  - **Features**:
    - 🌑 **Dark Mode Theme** - Applied to NavigationContainer
    - ✅ Conditional rendering based on auth state
    - ✅ Automatic navigation on auth state change
    - ✅ Smooth screen transitions
    - ✅ No headers on auth screens
    - ✅ Placeholder main screen with sign out button
  - **Integration**:
    - ✅ AuthProvider wraps entire app
    - ✅ useAuth hook available everywhere
    - ✅ Navigation state synced with auth state
  - **Dependencies**: @react-navigation/native, @react-navigation/native-stack

- [x] **Task 2.8: Create Validators**
  - **Files Created**:
    - `src/utils/validators.ts` ✅ (completed in Task 2.4)
  - **Functions**: 
    - ✅ validateEmail (format, length)
    - ✅ validatePassword (minimum length)
    - ✅ validateDisplayName (length)
    - ✅ validatePasswordConfirmation (matching)
    - ✅ validateGroupName (length)

- [x] **Task 2.9: Implement User Profile Creation in Firestore**
  - **Files Modified**:
    - `src/services/firebase/authService.ts` ✅ (completed in Task 2.2)
  - **Action**: On signup, create user doc in Firestore `/users/{userId}` ✅
  - **Fields**: displayName, email, photoURL, bio, createdAt, lastSeen, isOnline ✅
  - **Implementation**: signUp() function creates Firestore document automatically

- [ ] **Task 2.10: Write Unit Tests for Auth Service** ⚠️ DEFERRED (Post-MVP)
  - **Note**: Tests deferred to post-MVP to focus on core functionality
  - **Planned Tests**:
    - `signUp()` creates user in Firebase Auth
    - `signUp()` creates user profile in Firestore
    - `signIn()` returns user on valid credentials
    - `signIn()` throws error on invalid credentials
    - `signOut()` clears current user
    - `updateProfile()` updates user data

- [ ] **Task 2.11: Write Unit Tests for Validators** ⚠️ DEFERRED (Post-MVP)
  - **Note**: Tests deferred to post-MVP to focus on core functionality
  - **Planned Tests**:
    - `validateEmail()` accepts valid emails
    - `validateEmail()` rejects invalid emails
    - `validatePassword()` enforces minimum length
    - `validateDisplayName()` rejects empty names

- [ ] **Task 2.12: Write Integration Test for Auth Flow** ⚠️ DEFERRED (Post-MVP)
  - **Note**: Tests deferred to post-MVP to focus on core functionality
  - **Planned Test Flow**:
    1. Sign up new user → verify user created in Firebase Auth & Firestore
    2. Log out → verify redirected to login
    3. Log in → verify redirected to main app
    4. Invalid credentials → verify error shown

**PR Description**: "✅ COMPLETE - Implement complete authentication system with signup, login, logout, and user profile creation in Firestore. Includes dark mode UI, auth context, form validation, navigation flow, and user presence tracking. Tests deferred to post-MVP."

---

## PR #3: Core Messaging Infrastructure - Data Layer

**Goal**: Set up message and conversation data models, Firestore service, local database  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/messaging-data-layer`

### Tasks

- [x] **Task 3.1: Create Message Model**
  - **Files Created**:
    - `src/models/Message.ts` ✅
  - **Message Interface**: id, senderId, conversationId, content, timestamp, status, type, imageUrl, readBy
  - **Helper Functions**:
    - `createMessage()` - Create new message with defaults
    - `fromFirestore()` - Convert Firestore doc to Message
    - `toFirestore()` - Convert Message to Firestore doc
    - `updateStatus()` - Update message status
    - `markAsRead()` - Mark message as read by user
    - `isReadBy()` - Check if read by specific user
    - `isRead()`, `isDelivered()`, `isSent()`, `isSending()`, `isFailed()` - Status checks
    - `getReadByCount()` - Count users who read the message
    - `isImageMessage()`, `isTextMessage()` - Type checks
    - `formatTimestamp()` - Format timestamp (e.g., "2:30 PM", "Yesterday")
    - `getMessagePreview()` - Get truncated preview for conversation list
    - `isOwnMessage()` - Check if message is from current user
    - `isValidMessage()` - Validate message object
    - `sortMessagesByTimestamp()` - Sort messages by time
    - `groupMessagesByDate()` - Group messages by date

- [x] **Task 3.2: Create Conversation Model**
  - **Files Created**:
    - `src/models/Conversation.ts` ✅
  - **Conversation Interface**: id, type, participants, lastMessage, lastMessageTime, unreadCount, createdAt, updatedAt, groupName, groupIcon, adminIds
  - **Helper Functions**:
    - `createConversation()` - Create new conversation with defaults
    - `fromFirestore()` - Convert Firestore doc to Conversation
    - `toFirestore()` - Convert Conversation to Firestore doc
    - `updateLastMessage()` - Update last message info
    - `incrementUnreadCount()` - Increment unread count for user
    - `resetUnreadCount()` - Reset unread count for user
    - `addParticipant()`, `removeParticipant()` - Manage participants
    - `isGroup()`, `isDM()` - Type checks
    - `getUnreadCount()` - Get unread count for user
    - `hasUnreadMessages()` - Check if has unread messages
    - `getParticipantCount()` - Get participant count
    - `getOtherParticipantId()` - Get other participant in DM
    - `isParticipant()`, `isAdmin()` - Check user roles
    - `formatLastMessageTime()` - Format time (e.g., "2:30 PM", "Yesterday")
    - `getDisplayName()` - Get conversation display name
    - `isValidConversation()` - Validate conversation object
    - `sortConversationsByTime()` - Sort conversations by time
    - `filterByType()`, `filterUnread()` - Filter conversations
    - `getTotalUnreadCount()` - Get total unread count across all conversations

- [x] **Task 3.3: Implement Firestore Service**
  - **Files Created**:
    - `src/services/firebase/firestoreService.ts` ✅
  - **Conversation Functions**:
    - `createConversation(participantIds, type, groupName, groupIcon, adminIds)` - Create new conversation
    - `getConversation(conversationId)` - Get single conversation by ID
    - `getConversations(userId)` - Get all conversations for user
    - `listenToConversations(userId, callback, onError)` - Real-time listener for conversations
    - `findOrCreateDMConversation(userId1, userId2)` - Find or create DM between two users
    - `updateConversationLastMessage(conversationId, lastMessage, lastMessageTime)` - Update last message
    - `incrementUnreadCount(conversationId, userId)` - Increment unread count
    - `resetUnreadCount(conversationId, userId)` - Reset unread count to 0
  - **Message Functions**:
    - `sendMessage(conversationId, senderId, content, type, imageUrl)` - Send message
    - `getMessages(conversationId, limit)` - Get messages with pagination
    - `listenToMessages(conversationId, callback, onError)` - Real-time listener for messages
    - `updateMessageStatus(conversationId, messageId, status)` - Update message status
    - `markMessageAsRead(conversationId, messageId, userId)` - Mark single message as read
    - `markAllMessagesAsRead(conversationId, userId)` - Mark all messages as read
    - `deleteMessage(conversationId, messageId)` - Soft delete message
  - **Typing Indicators**:
    - `setTypingIndicator(conversationId, userId, isTyping)` - Set typing status
    - `listenToTypingIndicators(conversationId, callback, onError)` - Listen to typing status
  - **Utility Functions**:
    - `conversationExists(conversationId)` - Check if conversation exists
    - `getParticipantCount(conversationId)` - Get participant count
  - **Features**:
    - ✅ Full integration with Message and Conversation models
    - ✅ Firestore timestamp conversion handled automatically
    - ✅ Real-time listeners with error handling
    - ✅ Batch operations for marking multiple messages as read
    - ✅ Typing indicator support
    - ✅ Unsubscribe functions returned for cleanup
    - ✅ Comprehensive error handling with user-friendly messages

- [x] **Task 3.4: Set Up Local Database (SQLite)**
  - **Files Created**:
    - `src/services/database/sqliteService.ts` ✅
    - `src/services/database/localDatabase.ts` ✅
  - **SQLite Service (Low-Level Operations)**:
    - `openDatabase()` - Open or create database
    - `closeDatabase()` - Close database connection
    - `executeQuery(sql, params)` - Execute SQL query
    - `executeQueryAll(sql, params)` - Execute query and return all rows
    - `executeQueryFirst(sql, params)` - Execute query and return first row
    - `executeTransaction(operations)` - Execute multiple operations in transaction
    - `dropAllTables()` - Drop all tables (dev/testing)
    - `getDatabaseStats()` - Get database statistics
  - **Message Operations**:
    - `insertMessage(message, synced)` - Insert message into local DB
    - `updateMessage(messageId, updates)` - Update message fields
    - `getMessages(conversationId, limit, offset)` - Get messages with pagination
    - `getMessage(messageId)` - Get single message by ID
    - `deleteMessage(messageId)` - Delete message from local DB
    - `getUnsyncedMessages()` - Get messages not yet synced to Firestore
    - `markMessageAsSynced(messageId)` - Mark message as synced
    - `deleteOldMessages(daysToKeep)` - Cleanup old messages (default 30 days)
  - **Conversation Operations**:
    - `insertConversation(conversation)` - Insert conversation into local DB
    - `updateConversation(conversationId, updates)` - Update conversation fields
    - `getConversations()` - Get all conversations sorted by update time
    - `getConversation(conversationId)` - Get single conversation by ID
    - `deleteConversation(conversationId)` - Delete conversation and its messages
  - **Offline Queue Operations**:
    - `enqueueOperation(operation)` - Add operation to offline queue
    - `getQueuedOperations()` - Get all queued operations
    - `dequeueOperation(operationId)` - Remove operation from queue
    - `incrementRetryCount(operationId)` - Increment retry count
    - `clearQueue()` - Clear all queued operations
  - **Utility Functions**:
    - `clearAllData()` - Clear all data from local database
    - `getDatabaseStats()` - Get message, conversation, and queue counts
  - **Database Tables**:
    - `messages` - id (PK), senderId, conversationId, content, timestamp, status, type, imageUrl, readBy (JSON), synced, createdAt
    - `conversations` - id (PK), type, participants (JSON), lastMessage, lastMessageTime, unreadCount (JSON), createdAt, updatedAt, groupName, groupIcon, adminIds (JSON)
    - `offline_queue` - id (PK auto), operationType, data (JSON), createdAt, retryCount
  - **Database Indexes**:
    - `idx_messages_conversation` - On (conversationId, timestamp DESC) for fast message retrieval
    - `idx_conversations_updated` - On (updatedAt DESC) for fast conversation list
  - **Features**:
    - ✅ Full SQLite integration with expo-sqlite
    - ✅ Transaction support for atomic operations
    - ✅ Offline queue for pending operations
    - ✅ Message sync tracking (synced flag)
    - ✅ Automatic cleanup of old messages
    - ✅ JSON serialization for complex fields (readBy, participants, unreadCount)
    - ✅ Comprehensive error handling with logging
    - ✅ Pagination support for messages
    - ✅ Database statistics and monitoring

- [x] **Task 3.5: Create Chat Context**
  - **Files Created**:
    - `src/store/context/ChatContext.tsx` ✅
  - **State Management**:
    - `conversations` - List of all conversations
    - `activeConversation` - Currently selected conversation
    - `messages` - Messages for active conversation
    - `loading` - Loading state
    - `error` - Error messages
    - `isOnline` - Network connectivity status
  - **Core Functions**:
    - `loadConversations()` - Load conversations with real-time updates
    - `selectConversation(conversationId)` - Select and load conversation
    - `sendMessage(content, type)` - Send message with optimistic updates
    - `loadMessages(conversationId)` - Load messages with real-time listener
    - `createConversation(participantIds, type)` - Create new DM or group
    - `syncOfflineQueue()` - Sync queued operations when online
  - **Features**:
    - ✅ Real-time Firestore listeners for conversations and messages
    - ✅ Optimistic UI updates for sent messages
    - ✅ Offline queue management with auto-sync
    - ✅ Local database caching for offline access
    - ✅ Network monitoring with NetInfo
    - ✅ Automatic cleanup of listeners on unmount
    - ✅ Mark messages as read automatically
    - ✅ Error handling with user-friendly messages
    - ✅ Database initialization on mount

- [x] **Task 3.6: Create useMessages Hook**
  - **Files Created**:
    - `src/hooks/useMessages.ts` ✅
  - **Hook Signature**: `useMessages(conversationId: string | null)`
  - **Returns**:
    - `messages: Message[]` - Array of messages for the conversation
    - `loading: boolean` - Loading state
    - `error: string | null` - Error message if any
    - `sendMessage(content, type, imageUrl)` - Send a message
    - `refreshMessages()` - Force reload messages
    - `markAsRead(messageId)` - Mark message as read
  - **Features**:
    - ✅ Real-time message updates via Firestore listener
    - ✅ Optimistic UI updates for sent messages
    - ✅ Offline support with local cache
    - ✅ Automatic message caching to local database
    - ✅ Network connectivity monitoring
    - ✅ Failed message handling and retry queue
    - ✅ Automatic listener cleanup on unmount
    - ✅ Temporary IDs for optimistic updates

- [x] **Task 3.7: Create useConversations Hook**
  - **Files Created**:
    - `src/hooks/useConversations.ts` ✅
  - **Hook Signature**: `useConversations()`
  - **Returns**:
    - `conversations: Conversation[]` - Array of all conversations
    - `loading: boolean` - Loading state
    - `error: string | null` - Error message if any
    - `createConversation(participantIds, type, groupName)` - Create new conversation
    - `findOrCreateDM(otherUserId)` - Find existing DM or create new
    - `refreshConversations()` - Force reload conversations
    - `deleteConversation(conversationId)` - Delete conversation locally
  - **Features**:
    - ✅ Real-time conversation updates via Firestore listener
    - ✅ Offline support with local cache
    - ✅ Automatic conversation caching to local database
    - ✅ Network connectivity monitoring
    - ✅ DM de-duplication (find existing before creating)
    - ✅ Automatic listener cleanup on unmount
    - ✅ Group conversation support with custom names

- [x] **Task 3.8: Write Firestore Security Rules**
  - **Files Created**:
    - `firebase/firestore.rules` ✅
  - **Helper Functions**:
    - `isAuthenticated()` - Check if user is logged in
    - `isOwner(userId)` - Check if user owns resource
    - `isParticipant(participants)` - Check if user is in participant list
    - `isAdmin(adminIds)` - Check if user is admin
    - `hasRequiredFields(fields)` - Validate required fields exist
  - **User Profile Rules**:
    - ✅ Anyone authenticated can read any user profile (for displaying names/avatars)
    - ✅ Users can only create/update their own profile
    - ✅ Users can delete their own profile
    - ✅ Required fields enforced: uid, email, displayName, createdAt, isOnline
  - **Conversation Rules**:
    - ✅ Users can only read conversations they are part of
    - ✅ Users can create conversations if they're in participants list
    - ✅ Minimum 2 participants required
    - ✅ Users can update conversations they're part of (for lastMessage, unreadCount)
    - ✅ DM deletion: Either participant can delete
    - ✅ Group deletion: Only admins can delete
    - ✅ Required fields enforced: type, participants, unreadCount, createdAt, updatedAt
  - **Message Rules (subcollection)**:
    - ✅ Users can only read messages in their conversations
    - ✅ Users can only send messages as themselves (senderId validation)
    - ✅ Users must be conversation participants to create messages
    - ✅ Users can update messages to mark as read or update status
    - ✅ Users can only delete their own messages
    - ✅ Required fields enforced: senderId, content, timestamp, status, type
  - **Typing Indicator Rules (subcollection)**:
    - ✅ Users can read typing indicators in their conversations
    - ✅ Users can only write their own typing indicator
  - **Group Rules (future)**:
    - ✅ Users can read groups they are members of
    - ✅ Only creators start as admins
    - ✅ Only admins can update/delete groups
    - ✅ Required fields enforced: name, adminIds, memberIds, createdAt, createdBy
  - **Security Features**:
    - ✅ Default deny all (explicit allow rules only)
    - ✅ Authentication required for all operations
    - ✅ Participant verification for conversations/messages
    - ✅ SenderId spoofing prevention
    - ✅ Required field validation
    - ✅ Admin role enforcement for group operations

- [x] **Task 3.9: Deploy Firestore Rules** ✅ DEPLOYED
  - **Files Created**:
    - `firebase.json` ✅ - Firebase project configuration
    - `.firebaserc` ✅ - Firebase project alias (pigeonai-dev)
    - `firebase/firestore.indexes.json` ✅ - Firestore indexes for query optimization
  - **Configuration**:
    - Project: pigeonai-dev
    - Rules file: firebase/firestore.rules
    - Indexes: Optimized for conversations (participants + updatedAt) and messages (conversationId + timestamp)
  - **Deployment Steps** (Manual):
    1. ✅ Install Firebase CLI: `npm install -g firebase-tools`
    2. ✅ Login to Firebase: `firebase login`
    3. ✅ Verify project: `firebase projects:list`
    4. ✅ Deploy rules: `firebase deploy --only firestore:rules`
    5. ✅ Deploy indexes: `firebase deploy --only firestore:indexes`
  - **Deployment Status**:
    - ✅ Rules deployed successfully to cloud.firestore
    - ✅ Indexes deployed successfully
    - ⚠️ Minor warnings (unused functions) - safe to ignore

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

- [x] **Task 4.1: Create Message Bubble Component**
  - **Files Created**:
    - `src/components/chat/MessageBubble.tsx`
  - **Props**: message, isOwnMessage
  - **UI**: Different styling for sent vs received, timestamp, status indicators (checkmarks)

- [x] **Task 4.2: Create Message List Component**
  - **Files Created**:
    - `src/components/chat/MessageList.tsx`
  - **Implementation**: FlatList with virtualization, inverted list, pull-to-load-more
  - **Props**: messages, onLoadMore

- [x] **Task 4.3: Create Message Input Component**
  - **Files Created**:
    - `src/components/chat/MessageInput.tsx`
  - **UI**: TextInput, send button, image picker button
  - **Props**: onSend, onImagePick

- [x] **Task 4.4: Create Chat Header Component**
  - **Files Created**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: Recipient name, online status, back button, tappable to view user details
  - **Props**: conversation, onBack, onTitlePress

- [x] **Task 4.5: Create Chat Screen**
  - **Files Created**:
    - `src/screens/main/ChatScreen.tsx`
  - **Components Used**: ChatHeader, MessageList, MessageInput
  - **Functionality**: Load messages, send messages, real-time updates, navigate to user details

- [x] **Task 4.6: Implement Optimistic UI Updates**
  - **Files Modified**:
    - `src/store/context/ChatContext.tsx`
    - `src/hooks/useMessages.ts`
  - **Flow**:
    1. User sends message → add to local state immediately with status "sending"
    2. Save to local DB
    3. Send to Firestore
    4. On success → update status to "sent"
    5. On failure → update status to "failed", show retry

- [x] **Task 4.7: Implement Real-Time Message Listeners**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Action**: Set up Firestore onSnapshot listener with cache-first loading
  - **Cleanup**: Unsubscribe on unmount

- [x] **Task 4.8: Create Conversation List Item Component**
  - **Files Created**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: Avatar, real user name (cached), last message preview, timestamp, unread badge

- [x] **Task 4.9: Create Conversation List Screen**
  - **Files Created**:
    - `src/screens/main/ConversationListScreen.tsx`
  - **Components Used**: ConversationList (FlatList of ConversationListItem)
  - **Functionality**: Navigate to chat on tap, cache-first loading, pull-to-refresh

- [x] **Task 4.10: Create New Chat Screen**
  - **Files Created**:
    - `src/screens/main/NewChatScreen.tsx`
  - **UI**: Search users, select user, start conversation, avatar display
  - **Functionality**: Search Firestore users, create new conversation or find existing DM

- [x] **Task 4.11: Set Up Main Navigation**
  - **Files Created**:
    - `src/navigation/MainNavigator.tsx`
  - **Files Modified**:
    - `src/navigation/AppNavigator.tsx`
  - **Screens**: ConversationList, Chat, NewChat, Profile, UserDetails
  - **Type**: Stack navigator

- [x] **Task 4.12: Cache Management & ProfileScreen Enhancement**
  - **Files Modified**:
    - `src/screens/main/ProfileScreen.tsx`
    - `src/services/database/localDatabase.ts`
  - **Features Added**:
    - Display cache statistics (message count, conversation count)
    - Clear cache button with confirmation dialog
    - Persistent cache across user sessions
    - Cache survives logout/login cycles
  - **Functions**: `clearAllData()`, `getDatabaseStats()`

- [x] **Task 4.13: Implement Message Timestamps**
  - **Files Created**:
    - `src/utils/dateFormatter.ts`
  - **Functions**: formatTimestamp, formatMessageTime, formatFullTimestamp
  - **Formats**: "Just now", "5m ago", "Yesterday", "Jan 15", etc.

- [x] **Task 4.14: Create Avatar Component**
  - **Files Created**:
    - `src/components/common/Avatar.tsx`
    - `src/components/common/index.ts`
    - `src/screens/main/UserDetailsScreen.tsx`
    - `src/hooks/useUserProfile.ts`
  - **Props**: imageUrl, displayName (for initials fallback), size (small, medium, large, xlarge), showOnlineStatus, isOnline
  - **UI**: Circle with image or initials, optional online status indicator
  - **Integrated**: ConversationListItem, ProfileScreen, NewChatScreen, UserDetailsScreen
  - **Features**: 
    - Tappable chat header to view user details
    - User details screen with profile info and common groups placeholder
    - User profile caching hook for performance
    - Display real user names in conversations and chat headers

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

- [x] **Task 5.1: Implement Presence System**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `updatePresence(userId, isOnline)`
    - `listenToPresence(userId, callback)`
    - `getPresence(userId)`
  - **Logic**:
    - On app foreground → set isOnline = true
    - On app background → set isOnline = false, update lastSeen
    - Updates user document in Firestore

- [x] **Task 5.2: Create usePresence Hook**
  - **Files Created**:
    - `src/hooks/usePresence.ts`
  - **Function**: usePresence(userId)
  - **Returns**: isOnline, lastSeen, loading, error

- [x] **Task 5.3: Integrate Presence with App State**
  - **Files Created**:
    - `src/store/context/PresenceContext.tsx`
  - **Logic**: Listen to AppState, update presence on change
  - **Dependencies**: react-native AppState
  - **Integration**: Wrapped in App.tsx

- [x] **Task 5.4: Display Online Status in Chat Header**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: Green dot if online, "last seen X ago" if offline
  - **Added**: Typing indicator with animated dots

- [x] **Task 5.5: Display Online Status in Conversation List**
  - **Files Modified**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: Green dot badge on avatar if online

- [x] **Task 5.6: Implement Typing Indicators - Backend**
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `setTypingStatus(conversationId, userId, isTyping)`
    - `listenToTyping(conversationId, callback)`
  - **Implementation**: Uses Firestore subcollection `/conversations/{id}/typing/{userId}`

- [x] **Task 5.7: Create useTypingIndicator Hook**
  - **Files Created**:
    - `src/hooks/useTypingIndicator.ts`
  - **Functions**: useTypingIndicator(conversationId)
  - **Returns**: typingUsers array, setTyping function
  - **Logic**: No timeouts, managed by MessageInput lifecycle

- [x] **Task 5.8: Create Typing Indicator Component**
  - **Files Created**:
    - `src/components/chat/TypingIndicator.tsx`
  - **UI**: Animated dots component (created but integrated in header instead)
  - **Props**: typingUsers

- [x] **Task 5.9: Integrate Typing in Message Input**
  - **Files Modified**:
    - `src/components/chat/MessageInput.tsx`
  - **Logic**: 
    - Typing active while text exists in input
    - Clears on keyboard dismiss
    - Clears on message send

- [x] **Task 5.10: Display Typing Indicator in Chat**
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: Shows "typing • • •" with animated dots in header (replaces online status)

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

- [x] **Task 5.13: Manual Test Presence & Typing**
  - **Actions**:
    1. User goes online → status updates in other device ✅
    2. User goes offline → "last seen" updates ✅
    3. User types → "typing..." appears in other device ✅
    4. Close keyboard → "typing" clears, shows "Online" ✅
    5. Reopen keyboard with text → "typing..." reappears ✅

- [ ] **Task 5.14: Debug Typing Indicator Inconsistency** 🐛 IN PROGRESS
  - **Issue**: On one device, word "typing" missing from indicator (only shows names and dots)
  - **Changes Made**:
    - Added console logging to ChatHeader getStatusText() function
    - Logs: "🔤 Group typing (1 user): John is typing", etc.
  - **Status**: Debugging - waiting for console logs from both devices
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`

**PR Description**: "Implement presence system (online/offline, last seen) and typing indicators with real-time updates. Typing indicator shows in chat header with animated dots. Presence integrated into chat header and conversation list. Currently debugging typing indicator inconsistency on one device."

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

- [x] **Task 9.1: Create Group Model**
  - **Files Created**:
    - `src/models/Group.ts`
  - **Fields**: id, name, description, iconUrl, adminIds, memberIds, createdAt, createdBy

- [x] **Task 9.2: Update Conversation Model for Groups** ✅ COMPLETE
  - **Files Modified**:
    - `src/models/Conversation.ts`
  - **Fields**: groupId?, groupName?, groupIcon?

- [x] **Task 9.3: Implement Group Firestore Functions** ✅ COMPLETE
  - **Files Modified**:
    - `src/services/firebase/firestoreService.ts`
  - **Functions**:
    - `createGroup(name, memberIds, adminIds, iconUrl)`
    - `getGroup(groupId)`
    - `updateGroup(groupId, updates)`
    - `addGroupMember(groupId, userId)`
    - `removeGroupMember(groupId, userId)`
    - `leaveGroup(groupId, userId)`

- [x] **Task 9.4: Create Group Creation Screen** ✅ COMPLETE
  - **Files Created**:
    - `src/screens/group/CreateGroupScreen.tsx`
    - `src/components/group/GroupCreationModal.tsx`
  - **UI**: 
    - Group name input
    - Member selection (multi-select list)
    - Create button
  - **Flow**: Select members → enter name → create

- [x] **Task 9.5: Create User Selection Component** ✅ COMPLETE
  - **Files Created**:
    - `src/components/group/UserSelectionList.tsx`
  - **UI**: Searchable list with checkboxes
  - **Function**: Fetch users from Firestore

- [x] **Task 9.6: Update Chat Screen for Groups** ✅ COMPLETE
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
  - **Changes**: Detect if group conversation, adjust UI accordingly

- [x] **Task 9.7: Update Message Bubble for Groups** ✅ COMPLETE
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**: Show sender name above message (for group messages)

- [x] **Task 9.8: Create Group Info Screen** ✅ COMPLETE
  - **Files Created**:
    - `src/screens/group/GroupDetailsScreen.tsx`
    - `src/components/group/GroupMemberList.tsx`
  - **UI**: 
    - Group name, icon
    - Members list
    - Add members button (if admin)
    - Leave group button
  - **Navigation**: Tap header in group chat

- [x] **Task 9.9: Implement Group Message Sending** ✅ COMPLETE
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**: 
    - Send message to conversation
    - Firestore delivers to all group members
    - Update lastMessage for group conversation

- [x] **Task 9.10: Update Read Receipts for Groups** ✅ COMPLETE
  - **Files Modified**:
    - `src/utils/messageHelpers.ts`
  - **Logic**: 
    - Track readBy per member
    - Display "Read by 3/5" or individual names

- [x] **Task 9.11: Update Typing Indicators for Groups** ✅ COMPLETE
  - **Files Modified**:
    - `src/hooks/useTypingIndicator.ts`
  - **UI**: "John and Sarah are typing..." or "3 people typing..."

- [x] **Task 9.12: Update Conversation List for Groups** ✅ COMPLETE
  - **Files Modified**:
    - `src/components/conversation/ConversationListItem.tsx`
  - **UI**: 
    - Group icon (or initials)
    - Group name
    - Last message with sender name

- [x] **Task 9.13: Implement Leave Group** ✅ COMPLETE
  - **Files Created**:
    - Leave group function in firestoreService
  - **Logic**: Remove user from memberIds, update conversation participants

- [x] **Task 9.14: Update Security Rules for Groups** ✅ COMPLETE
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

- [x] **Task 9.16: Manual Test Group Chat** ✅ COMPLETE
  - **Actions**:
    1. Create group with 3+ users
    2. Send message in group → all members receive
    3. Member names display correctly
    4. Typing indicator shows multiple users
    5. Leave group → conversation removed
    6. Add member → they see message history

**PR Description**: "Implement full group chat functionality with group creation, member management, group messages with sender names, and group-specific typing indicators and read receipts. Includes integration test for group messaging flow."

---

## PR #10: Push Notifications ✅ COMPLETE + Production APK Deployed

**Goal**: Push notifications for new messages (all states: foreground, background, closed)  
**Estimated Time**: 2-3 hours (Actual: 9 hours including AWS Lambda + APK build)  
**Branch**: `feature/push-notifications`  
**Status**: ✅ Complete - Hybrid system (local for Expo Go, AWS Lambda + FCM for production APK)

### Tasks

- [x] **Task 10.1: Configure Firebase Cloud Messaging**
  - **Action**: Set up FCM in Firebase Console
  - **Steps**:
    1. iOS: Upload APNs certificate or key
    2. Android: FCM auto-configured
  - **Files Modified**:
    - `app.config.js` (add FCM plugin config - already configured)
    - `eas.json` (created with FCM config)
  - **Files Created**:
    - `docs/FCM_SETUP_GUIDE.md` (comprehensive setup guide)
    - `docs/FCM_QUICKSTART.md` (5-minute quick start)
    - `docs/FCM_CHECKLIST.md` (step-by-step checklist)
    - `android/app/README.md` (Android FCM file placement)
    - `ios/README.md` (iOS FCM file placement)
  - **Directories Created**:
    - `android/app/` (for google-services.json)
    - `ios/` (for GoogleService-Info.plist)
  - **Status**: ✅ Complete - Documentation and setup ready, awaiting user to download FCM config files from Firebase Console

- [x] **Task 10.2: Implement Notification Service** ✅ COMPLETE
  - **Files Created**:
    - `src/services/notifications/notificationService.ts`
  - **Functions**:
    - `requestPermissions()`
    - `getDeviceToken()`
    - `registerForPushNotifications()`
    - `handleNotification(notification)`
    - `scheduleNotification(title, body, data)`
  - **Dependencies**: expo-notifications (Expo Push Service for FCM integration)

- [x] **Task 10.3: Request Notification Permissions** ✅ COMPLETE
  - **Files Modified**:
    - `src/store/context/AuthContext.tsx`
  - **Logic**: After successful login, request notification permissions

- [x] **Task 10.4: Save Device Token to Firestore** ✅ COMPLETE
  - **Files Modified**:
    - `src/services/firebase/authService.ts`
  - **Action**: Update user document with FCM token
  - **Field**: `fcmTokens: string[]` (array for multiple devices)

- [x] **Task 10.5: Handle Foreground Notifications** ✅ COMPLETE
  - **Files Modified**:
    - `App.tsx`
  - **Logic**: 
    - Listen to notifications while app is in foreground
    - Show in-app notification banner
  - **Dependencies**: expo-notifications

- [x] **Task 10.6: Create Notification Banner Component** ✅ COMPLETE
  - **Files Created**:
    - `src/components/common/NotificationBanner.tsx`
  - **UI**: Slide-in banner at top with sender, message preview, tap to open chat
  - **Animation**: Slide in from top, auto-dismiss after 3 seconds

- [x] **Task 10.7: Handle Notification Tap (Navigation)** ✅ COMPLETE
  - **Files Modified**:
    - `App.tsx`
  - **Logic**: When notification tapped → navigate to specific chat
  - **Data**: notification.data.conversationId

- [x] **Task 10.8: Implement Cloud Function for Notifications** (Optional but Recommended) ✅ COMPLETE (Hybrid System)
  - **Note**: Using hybrid system - local notifications in Expo Go, client-side remote push in EAS Build
  - **Alternative**: Use Firestore triggers or send from client (less secure)
  - **For MVP**: Hybrid approach implemented with global notification listener

- [x] **Task 10.9: Send Notification on Message Sent** (Client-side MVP approach) ✅ COMPLETE
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
    - `src/hooks/useGlobalNotifications.ts` (Global notification listener)
  - **Logic**:
    1. After message saved to Firestore
    2. Get recipient FCM tokens from Firestore
    3. Send notification via FCM API (using Expo push service)
  - **Note**: Global listener handles notifications app-wide

- [x] **Task 10.10: Handle Background Notifications** (Nice-to-Have) ✅ COMPLETE
  - **Files Modified**:
    - `app.config.js` (configure background fetch)
  - **Logic**: OS handles background notifications automatically
  - **Note**: Expo handles this automatically via FCM

- [x] **Task 10.11: Update Firestore Rules for FCM Tokens**
  - **Files Modified**:
    - `firebase/firestore.rules`
  - **Rule**: Only user can write their own FCM tokens
  - **Security Measures**:
    - ✅ Field whitelisting (only allow updating safe fields)
    - ✅ Type validation (fcmTokens must be an array)
    - ✅ Ownership validation (users can only update their own profile)
    - ✅ Protection against privilege escalation
  - **Files Created**:
    - `docs/FIRESTORE_SECURITY_RULES.md` (security documentation)
  - **Status**: ✅ Complete - Rules deployed to Firebase

- [ ] **Task 10.12: Write Unit Tests for Notification Service**
  - **Files Created**:
    - `__tests__/services/notificationService.test.ts`
  - **Tests**:
    - ✅ `requestPermissions()` requests notification permissions
    - ✅ `getDeviceToken()` returns valid FCM token
    - ✅ `registerForPushNotifications()` saves token to Firestore
    - ✅ `handleNotification()` extracts conversationId from data
  - **Note**: Full notification flow is difficult to test in unit tests

- [x] **Task 10.13: Manual Test Notifications** ✅ COMPLETE
  - **Actions**:
    1. User A sends message to User B ✅
    2. User B app in foreground → system notification appears ✅
    3. User B app in background → system notification appears ✅
    4. User B app closed → system notification appears ✅
    5. Tap notification → opens chat with User A ✅
    6. Notification shows correct sender and message preview ✅
    7. Group notifications show "Group Name - User Name" ✅

- [x] **Task 10.14: Production APK Build (Android Studio)** ✅ COMPLETE
  - **Files Created**:
    - `android/gradle.properties` - Gradle configuration (`hermesEnabled=true`, increased JVM memory)
    - `android/local.properties` - SDK path for local builds
    - `aws-lambda/index.js` - Lambda function for server-side push notifications
    - `aws-lambda/package.json` - Lambda dependencies
    - `aws-lambda/function.zip` - Deployment package
    - `src/services/notifications/lambdaNotificationService.ts` - Client-side Lambda caller
    - `docs/AWS_LAMBDA_SETUP.md` - AWS Lambda setup guide
  - **Files Modified**:
    - `app.config.js` - Moved `google-services.json` to root for EAS
    - `google-services.json` - Moved from `android/app/` to root
    - `src/services/notifications/notificationService.ts` - FCM token + Expo token fallback
    - `src/store/context/AuthContext.tsx` - Removed popup alerts, silent token registration
    - `App.tsx` - Removed in-app notification banner
    - `package.json` - Added `expo-device` for reliable device detection
    - `src/hooks/useMessages.ts` - Calls Lambda after sending message
    - `src/store/context/PresenceContext.tsx` - Refactored with `isOnlineRef` for reliability
  - **Configuration**:
    - ✅ Android Studio Gradle build configured
    - ✅ Hermes engine enabled (`hermesEnabled=true`)
    - ✅ JVM memory increased (`-Xmx4096m -XX:MaxMetaspaceSize=1024m`)
    - ✅ Firebase config in root for EAS Build compatibility
    - ✅ FCM tokens working in production APK
    - ✅ `expo-device` for reliable physical device detection
  - **Build Commands**:
    ```powershell
    cd android
    .\gradlew assembleRelease
    adb install -r app/build/outputs/apk/release/app-release.apk
    ```
  - **Status**: ✅ APK built successfully and tested on physical devices

- [x] **Task 10.15: AWS Lambda Push Notification System** ✅ COMPLETE
  - **AWS Lambda Function**:
    - Runtime: Node.js 22.x
    - Function: `pigeonai-push-notifications`
    - Deployment: `function.zip` with `node_modules` included
  - **Features Implemented**:
    - ✅ Firebase Admin SDK integration
    - ✅ FCM token support (native push)
    - ✅ Expo Push Token support (fallback)
    - ✅ Automatic invalid token cleanup
    - ✅ Group notification format: "Group Name - User Name: message"
    - ✅ DM notification format: "User Name: message"
    - ✅ Works in foreground, background, and closed states
    - ✅ Message truncation (100 characters max)
  - **API Gateway**:
    - Type: HTTP API
    - Route: `POST /send-notification`
    - Integration: Lambda function
    - URL: `https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com`
  - **Environment Variables**:
    - `FIREBASE_PROJECT_ID` - Firebase project ID
    - `FIREBASE_PRIVATE_KEY` - Service account private key
    - `FIREBASE_CLIENT_EMAIL` - Service account email
    - `FIREBASE_DATABASE_URL` - Firestore database URL
  - **Security**:
    - Service account key in Lambda environment variables (not in code)
    - `serviceAccountKey.json` added to `.gitignore`
    - Token validation in Lambda
    - Firestore security rules enforce access control
  - **Status**: ✅ Lambda deployed and tested, notifications working in all app states

- [x] **Task 10.16: Notification System Improvements** ✅ COMPLETE
  - **Changes Made**:
    - ✅ Removed in-app notification banner (only system notifications now)
    - ✅ Fixed notification handler: `shouldShowAlert: true` for OS-level notifications
    - ✅ Removed popup alerts on token registration (silent background operation)
    - ✅ Fixed group detection: `conversation?.type === 'group'` instead of `isGroup`
    - ✅ Added debug logging to Lambda for troubleshooting
  - **Files Modified**:
    - `App.tsx` - Removed `NotificationBanner` component and related state
    - `src/services/notifications/notificationService.ts` - Set `shouldShowAlert: true`
    - `aws-lambda/index.js` - Fixed group detection logic, added extensive logging

- [x] **Task 10.17: Presence System Enhancements** ✅ COMPLETE
  - **Changes Made**:
    - ✅ Refactored presence detection with `isOnlineRef` for reliable state tracking
    - ✅ Fixed home button/power button detection (AppState changes)
    - ✅ Added `Promise.race` with timeout for offline updates before app suspension
    - ✅ Improved AppState listener logic to prevent duplicate updates
  - **Files Modified**:
    - `src/store/context/PresenceContext.tsx` - Added `isOnlineRef`, improved state management

**PR Description**: "✅ COMPLETE - Implement complete push notification system with AWS Lambda server-side architecture, FCM integration, production APK build via Android Studio, and comprehensive notification handling. Includes hybrid system (local for Expo Go, remote for production), group notification formatting, presence system enhancements, and removal of in-app banner. All bugs fixed, tested on physical devices."

---

## PR #11: UI Polish & Error Handling 🟡 PARTIALLY COMPLETE

**Goal**: Loading states, error handling, UI polish, smooth animations  
**Estimated Time**: 2-3 hours (Actual: 2 hours)
**Branch**: `feature/ui-polish`  
**Status**: 🟡 Partially Complete - Keyboard handling and FlatList optimizations done, other tasks pending

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

- [x] **Task 11.8: Implement Keyboard Handling** ✅ COMPLETE
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
    - `src/screens/group/CreateGroupScreen.tsx`
    - `src/screens/auth/LoginScreen.tsx`
    - `src/screens/auth/SignupScreen.tsx`
  - **Logic**: 
    - KeyboardAvoidingView for iOS
    - android:windowSoftInputMode="adjustResize" for Android
    - Platform-specific behavior and offset

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

- [x] **Task 11.11: Optimize FlatList Performance** ✅ COMPLETE
  - **Files Modified**:
    - `src/components/chat/MessageList.tsx`
    - `src/components/conversation/ConversationList.tsx`
  - **Optimizations**:
    - getItemLayout for fixed heights
    - keyExtractor
    - removeClippedSubviews
    - maxToRenderPerBatch
    - windowSize
    - Inverted FlatList for natural chat scrolling

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

## PR #12: Testing, Bug Fixes & Documentation 🟡 PARTIALLY COMPLETE

**Goal**: End-to-end testing, fix bugs, complete documentation  
**Estimated Time**: 2-3 hours (Actual: 6 hours ongoing)  
**Branch**: `feature/testing-documentation`  
**Status**: 🟡 Partially Complete - All manual testing done, comprehensive README written, bugs fixed

### Tasks

- [x] **Task 12.1: Manual Testing - Real-Time Messaging** ✅ COMPLETE
  - **Test**: Two devices send messages back and forth
  - **Verify**: Messages appear within 1 second
  - **Devices**: iOS and Android

- [x] **Task 12.2: Manual Testing - Offline Scenario** ✅ COMPLETE
  - **Test**: 
    1. Device A goes offline (airplane mode)
    2. Device B sends message
    3. Device A comes online
    4. Verify message delivers
  - **Verify**: Message queues and syncs correctly

- [x] **Task 12.3: Manual Testing - App Lifecycle** ✅ COMPLETE
  - **Test**: 
    1. Send message
    2. Force quit app
    3. Reopen app
  - **Verify**: Message was sent, chat history persists

- [x] **Task 12.4: Manual Testing - Poor Network** ✅ COMPLETE
  - **Test**: Enable network throttling (3G speed)
  - **Verify**: Messages still deliver, just slower

- [x] **Task 12.5: Manual Testing - Rapid Messages** ✅ COMPLETE
  - **Test**: Send 20 messages quickly
  - **Verify**: All appear in correct order

- [x] **Task 12.6: Manual Testing - Group Chat** ✅ COMPLETE
  - **Test**: Create group with 3 users, send messages
  - **Verify**: All members receive, sender names display

- [x] **Task 12.7: Manual Testing - Push Notifications** ✅ COMPLETE
  - **Test**: 
    1. User A sends message
    2. User B app in foreground
    3. User B app in background
  - **Verify**: Notifications trigger correctly (local in Expo Go, remote in EAS Build)

- [x] **Task 12.9: Manual Testing - Presence & Typing** ✅ COMPLETE
  - **Test**: 
    1. User goes online/offline
    2. User types in chat
  - **Verify**: Indicators update in real-time

- [x] **Task 12.10: Manual Testing - Read Receipts** ✅ COMPLETE
  - **Test**: Send message, recipient opens chat
  - **Verify**: Double checkmark updates in real-time
  - **Verify**: Checkmarks update from sent → delivered → read

- [x] **Task 12.11: Fix Identified Bugs** ✅ COMPLETE
  - **Action**: Create bug list, fix each one
  - **Files Modified**: Various (depends on bugs found)
  - **Log**: 18 bugs fixed (see memory-bank/activeContext.md for full list)

- [x] **Task 12.12: Write Comprehensive README** ✅ COMPLETE
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

1. ✅ **PR #1: Project Setup & Configuration** (1 hour) - **COMPLETE**
2. ✅ **PR #2: Authentication System** (2-3 hours) - **COMPLETE**
3. ✅ **PR #3: Core Messaging Infrastructure - Data Layer** (2-3 hours) - **COMPLETE**
4. ✅ **PR #4: Chat UI & Real-Time Sync** (3-4 hours) - **COMPLETE**
5. ✅ **PR #5: Presence & Typing Indicators** (2 hours) - **COMPLETE**
6. 🟡 **PR #6: Read Receipts & Message States** (2 hours) - **PARTIALLY COMPLETE** (real-time updates working)
7. 🟡 **PR #7: Image Sharing** (2-3 hours) - **NOT STARTED** (backend ready)
8. 🟡 **PR #8: Offline Support & Queue System** (2-3 hours) - **PARTIALLY COMPLETE** (queue working, UI indicator pending)
9. ✅ **PR #9: Group Chat** (3-4 hours) - **COMPLETE**
10. ✅ **PR #10: Push Notifications + Production APK** (2-3 hours, actual 9 hours) - **COMPLETE**
11. 🟡 **PR #11: UI Polish & Error Handling** (2-3 hours) - **PARTIALLY COMPLETE** (keyboard + FlatList done)
12. 🟡 **PR #12: Testing, Bug Fixes & Documentation** (2-3 hours) - **PARTIALLY COMPLETE** (testing + README done)

**Total Estimated Time**: 24-32 hours  
**Actual Time Spent**: ~34 hours  
**MVP Status**: ✅ Core features complete + Production APK deployed

**Completed**: 7 PRs fully complete  
**Partially Complete**: 5 PRs (functional but missing polish/tests)  
**Not Started**: 0 PRs (all have at least partial implementation)

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

## Success Criteria Checklist - ✅ MVP COMPLETE

After completing all 12 PRs, verify:

- [x] Two devices can exchange messages in real-time (<2 seconds) ✅
- [x] Messages persist through app restart ✅
- [x] Offline scenario works (queue → reconnect → deliver) ✅
- [x] Group chat with 3+ users functional ✅
- [x] Read receipts update correctly ✅
- [x] Typing indicators show/hide ✅
- [x] Push notifications work (AWS Lambda + FCM, all states) ✅
- [ ] Images send and display (backend ready, UI pending) 🟡
- [x] User authentication complete (signup, login, logout) ✅
- [x] App runs on both iOS and Android via Expo Go ✅
- [x] Code on GitHub with comprehensive README ✅
- [x] Firebase backend deployed and accessible ✅
- [x] All 10+ MVP requirements met ✅
- [x] **BONUS**: Production APK built and tested on physical devices ✅

---

**MVP Complete!** 🎉

**Status**: ✅ Core MVP requirements met + Production APK deployed  
**Next**: Awaiting rubric for Phase 2 planning (AI features, persona selection)

**PHASE 2 BEGINS**: AI Features & Rubric Compliance (Target Score: 95+/100)

Post-MVP Options:
- Complete remaining tasks (image sharing UI, error boundaries, unit tests)
- Choose persona and implement AI features (5 required + 1 advanced)
- Polish UI/UX with advanced animations and loading states

---

## PR #13: Persona Selection & Brainlift Document

**Goal**: Choose persona and create required brainlift document  
**Estimated Time**: 2 hours  
**Branch**: `feature/persona-brainlift`  
**Rubric Target**: Section 6 - Persona Brainlift (Pass/Fail, -10 penalty if missing) + Section 3 - Persona Fit (5 points)

###Tasks

- [ ] **Task 13.1: Research Persona Options**
  - **Options**:
    1. Remote Team Professional
    2. International Communicator
    3. Busy Parent/Caregiver
    4. Content Creator/Influencer
  - **Recommendation**: **Remote Team Professional**
  - **Rationale**: 
    - Best alignment with current features (group chat, real-time messaging)
    - AI features are highly practical and testable
    - Pain points are clear and well-defined
    - Thread summarization and action items are directly applicable

- [ ] **Task 13.2: Define Persona Pain Points**
  - **For Remote Team Professional**:
    1. **Information Overload**: Too many messages, hard to catch up
    2. **Missed Action Items**: Tasks buried in long threads
    3. **Meeting Chaos**: Hard to find when/where meetings were scheduled
    4. **Decision Tracking**: Losing track of what was agreed upon
    5. **Priority Confusion**: Urgent messages lost in noise
  - **Document**: Create persona profile with:
    - Demographics (age, role, company size)
    - Daily workflow challenges
    - Current tools and frustrations
    - Goals and success metrics

- [ ] **Task 13.3: Map AI Features to Pain Points**
  - **Feature 1 - Thread Summarization** → Solves Information Overload
    - "Summarize last 50 messages" catches user up in seconds
    - Identifies key points without reading everything
  - **Feature 2 - Action Item Extraction** → Solves Missed Action Items
    - "Extract action items" finds all tasks and assignments
    - Shows who needs to do what by when
  - **Feature 3 - Smart Semantic Search** → Solves Finding Information
    - "Search for deployment discussion" finds relevant messages
    - Natural language queries vs keyword matching
  - **Feature 4 - Priority Detection** → Solves Priority Confusion
    - Auto-flags urgent messages with badges
    - "Show high priority messages" filter
  - **Feature 5 - Decision Tracking** → Solves Decision Tracking
    - "Track decisions" surfaces agreed-upon items
    - Creates audit trail of important choices

- [ ] **Task 13.4: Create 1-Page Brainlift Document**
  - **Files Created**:
    - `docs/PERSONA_BRAINLIFT.md`
  - **Required Sections** (per rubric):
    1. **Chosen Persona**: Remote Team Professional
    2. **Justification**: Why this persona makes sense
    3. **Specific Pain Points**: 5 detailed pain points
    4. **Feature-Pain Point Mapping**: How each AI feature solves a problem
    5. **Key Technical Decisions**:
       - Why GPT-4 over GPT-3.5 (accuracy requirements)
       - Why Firebase Cloud Functions (serverless, integrated)
       - Why RAG for search (semantic understanding)
       - Why structured outputs for action items (reliability)
  - **Format**: Markdown, 1 page (~500 words)

- [ ] **Task 13.5: Document User Stories for AI Features**
  - **Files Modified**:
    - `docs/PERSONA_BRAINLIFT.md`
  - **User Stories**:
    - "As a remote team lead, I want to summarize long threads so I can catch up quickly after meetings"
    - "As a project manager, I want to extract action items so nothing falls through the cracks"
    - "As a team member, I want semantic search so I can find past decisions easily"
    - "As a manager, I want priority detection so urgent requests don't get missed"
    - "As a team lead, I want decision tracking so I can reference what we agreed to"

- [ ] **Task 13.6: Define Success Metrics**
  - **For Each AI Feature**:
    - Accuracy target: >90%
    - Response time: <2s for simple, <15s for agent
    - User satisfaction: Qualitative feedback
    - Usage frequency: Track how often features are used
  - **Document in brainlift**

**PR Description**: "Complete persona selection and create brainlift document for Remote Team Professional. Document includes persona profile, pain points, feature-pain point mapping, technical decisions, and success metrics. Required for rubric Pass/Fail requirement."

---

## PR #14: Image Sharing UI

**Goal**: Complete image sharing feature (backend already configured)  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/image-sharing-ui`  
**Rubric Target**: Complete MVP + Bonus Points

### Tasks

- [ ] **Task 14.1: Implement Image Picker**
  - **Files Modified**:
    - `src/components/chat/MessageInput.tsx`
  - **Dependencies**: `expo-image-picker`
  - **Features**:
    - Camera button in message input
    - Launch camera or gallery picker
    - Handle permissions (camera, gallery)

- [ ] **Task 14.2: Image Compression**
  - **Files Modified**:
    - `src/utils/imageCompression.ts` (new)
  - **Logic**:
    - Compress to 0.7 quality
    - Max size: 1MB
    - Resize if > 1920x1920px
    - Maintain aspect ratio

- [ ] **Task 14.3: Firebase Storage Upload**
  - **Files Modified**:
    - `src/services/firebase/storageService.ts` (new)
  - **Functions**:
    - `uploadImage(uri, conversationId)` → Returns download URL
    - Show upload progress (0-100%)
    - Handle upload failures with retry

- [ ] **Task 14.4: Send Image Message**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Flow**:
    1. User selects image
    2. Compress image
    3. Upload to Firebase Storage
    4. Get download URL
    5. Send message with type: 'image', imageUrl: url

- [ ] **Task 14.5: Display Images in Chat**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**:
    - Show image thumbnail (200x200px)
    - Tap to open full-screen viewer
    - Loading placeholder while image loads
    - Error state if image fails to load

- [ ] **Task 14.6: Full-Screen Image Viewer**
  - **Files Created**:
    - `src/components/chat/ImageViewer.tsx`
  - **Features**:
    - Modal with full-screen image
    - Pinch to zoom
    - Swipe to close
    - Download button

- [ ] **Task 14.7: Progressive Image Loading**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **Implementation**:
    - Show low-res placeholder
    - Load full-res in background
    - Smooth transition

- [ ] **Task 14.8: Error Handling**
  - **Scenarios**:
    - Permission denied
    - Upload failure
    - Network error
    - Image too large
  - **UI**: User-friendly error messages

- [ ] **Task 14.9: Manual Testing**
  - Test on physical devices
  - Test camera and gallery
  - Test upload progress
  - Test image display
  - Test full-screen viewer

**PR Description**: "Complete image sharing UI. Users can send images from camera or gallery. Includes compression (0.7 quality, max 1MB), Firebase Storage upload with progress, thumbnail display, and full-screen viewer. Backend already configured."

---

## PR #15: AWS Infrastructure Setup for AI Features

**Goal**: Set up AWS Lambda, OpenSearch, ElastiCache, and API Gateway for all AI processing  
**Estimated Time**: 2-3 hours  
**Branch**: `feature/aws-ai-infrastructure`  
**Rubric Target**: Architecture Foundation for AI Features

**Note**: Using AWS instead of Firebase Cloud Functions due to:
- Firebase requires Blaze plan (paid)
- AWS unlimited plan = zero cost, better performance
- Push notifications already working on AWS Lambda

### Tasks

- [ ] **Task 15.1: Set Up AWS OpenSearch Cluster**
  - **Service**: AWS OpenSearch (for vector embeddings)
  - **Configuration**:
    - Instance: t3.small.search (2 vCPU, 4GB RAM)
    - Nodes: 1 (single-node for MVP)
    - Storage: 10GB EBS
    - Engine: OpenSearch 2.x
  - **Index Setup**:
    - Index name: `message_embeddings`
    - Mapping: `embedding` field with type `knn_vector` (dimension 1536)
    - k-NN algorithm: HNSW
    - Distance metric: Cosine similarity
  - **Access**: VPC endpoint or public with IAM authentication

- [ ] **Task 15.2: Set Up AWS ElastiCache Redis**
  - **Service**: AWS ElastiCache (for response caching)
  - **Configuration**:
    - Instance: cache.t3.micro (0.5GB RAM)
    - Engine: Redis 7.x
    - Replicas: None (single instance for MVP)
  - **TTL Strategy**:
    - Summaries: 1 hour
    - Action items: 2 hours
    - Search results: 30 minutes
    - Decisions: 2 hours
  - **Access**: VPC endpoint with security group

- [ ] **Task 15.3: Create API Gateway REST API**
  - **Service**: AWS API Gateway
  - **Endpoints**:
    - `POST /send-notification` (already exists ✅)
    - `POST /ai/summarize`
    - `POST /ai/extract-action-items`
    - `POST /ai/search`
    - `POST /ai/detect-priority`
    - `POST /ai/track-decisions`
    - `POST /ai/schedule-meeting`
  - **Configuration**:
    - CORS enabled for React Native
    - Rate limiting: 1000 req/min per user
    - Request/response caching (optional)
    - API key authentication

- [ ] **Task 15.4: Configure IAM Roles for Lambda**
  - **Permissions**:
    - OpenSearch: Read/write access
    - ElastiCache: Read/write access
    - Firestore: Read access (via Firebase Admin SDK)
    - CloudWatch: Logs and metrics
  - **Role**: `PigeonAI-Lambda-Execution-Role`

- [ ] **Task 15.5: Install Lambda Dependencies**
  - **Files Modified**:
    - `aws-lambda/package.json`
  - **Dependencies**:
    - `openai` - OpenAI SDK
    - `@opensearch-project/opensearch` - OpenSearch client
    - `redis` - Redis client
    - `firebase-admin` - Firestore access (already installed ✅)
    - `langchain` - For multi-step agent (PR #21)
    - `@langchain/openai` - OpenAI integration for LangChain
  - **Command**: `cd aws-lambda && npm install`

- [ ] **Task 15.6: Create Base Lambda Function Template**
  - **Files Created**:
    - `aws-lambda/ai/base.js` (shared utilities)
  - **Utilities**:
    - `authenticateUser(event)` - Validate Firebase JWT
    - `fetchMessages(conversationId, limit)` - Get messages from Firestore
    - `checkRateLimit(userId)` - API Gateway rate limiting
    - `cacheResponse(key, data, ttl)` - Redis caching
    - `getCachedResponse(key)` - Redis retrieval
    - `logMetrics(functionName, duration, success)` - CloudWatch

- [ ] **Task 15.7: Configure Environment Variables**
  - **Lambda Environment Variables**:
    - `OPENAI_API_KEY` - OpenAI API key
    - `FIREBASE_PROJECT_ID` - Firebase project ID
    - `FIREBASE_CLIENT_EMAIL` - Service account email
    - `FIREBASE_PRIVATE_KEY` - Service account private key
    - `OPENSEARCH_ENDPOINT` - OpenSearch cluster endpoint
    - `REDIS_ENDPOINT` - ElastiCache Redis endpoint
    - `REDIS_PORT` - Redis port (6379)
  - **Secure Storage**: AWS Systems Manager Parameter Store (encrypted)

- [ ] **Task 15.8: Test with Existing Push Notification Lambda**
  - **Verify**:
    - Existing push notification Lambda still works
    - API Gateway routes correctly
    - Firebase Admin SDK connects
  - **Integration Test**: Send test message, verify notification delivered

- [ ] **Task 15.9: Create React Native AI Service**
  - **Files Created**:
    - `src/services/ai/aiService.ts`
  - **Functions**:
    - `summarizeConversation(conversationId, messageLimit)`
    - `extractActionItems(conversationId)`
    - `searchMessages(query, conversationId)`
    - `trackDecisions(conversationId)`
    - `scheduleMeeting(conversationId, triggerMessageId)`
  - **Common Logic**:
    - Get Firebase JWT token
    - Call API Gateway endpoint
    - Handle errors (timeout, rate limit, API failure)
    - Loading states
    - Retry logic

- [ ] **Task 15.10: Document AWS Infrastructure**
  - **Files Updated**:
    - `docs/AWS_INFRASTRUCTURE.md` (already created ✅)
  - **Add**:
    - Deployment commands
    - Environment variable setup
    - Troubleshooting guide
  - **Document**:
    - OpenSearch index creation
    - Redis connection string
    - API Gateway endpoint URLs

**PR Description**: "Set up AWS infrastructure for all AI features. Includes AWS Lambda for compute, OpenSearch for vector embeddings (RAG), ElastiCache Redis for caching, and API Gateway for endpoints. Hybrid Firebase + AWS architecture: Firebase handles data (Auth, Firestore, FCM, Storage), AWS handles AI processing. Zero cost with unlimited AWS plan."

---

## PR #16: AI Feature 1 - Thread Summarization

**Goal**: Implement thread summarization for distributed teams (Remote Team Professional persona)  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/ai-thread-summarization`  
**Rubric Target**: Section 3 - Required AI Features (3/15 points)

**Infrastructure**: AWS Lambda + OpenAI GPT-4 + Redis caching

### Tasks

- [ ] **Task 16.1: Create Summarization Lambda Function**
  - **Files Created**:
    - `aws-lambda/ai/summarize.js`
  - **Function**: `summarizeConversation`
  - **Logic**:
    1. Authenticate user (validate Firebase JWT)
    2. Rate limit check (API Gateway)
    3. Check Redis cache: `summary:{conversationId}:{messageCount}`
    4. If cached: Return immediately (<100ms)
    5. If not cached:
       - Fetch last 50-200 messages from Firestore
       - Build prompt with persona-specific template
       - Call OpenAI GPT-4
       - Parse response
       - Cache in Redis (1 hour TTL)
    6. Return summary

- [ ] **Task 16.2: Create Persona-Specific Prompt**
  - **Files Created**:
    - `aws-lambda/ai/prompts/summarization.js`
  - **Prompt Template** (for Remote Team Professional):
    ```
    You are an AI assistant helping a distributed software engineering team.
    
    Analyze the following conversation and provide a concise summary focusing on:
    1. KEY DECISIONS: Technical choices, approach selected
    2. ACTION ITEMS: Who needs to do what by when?
    3. BLOCKERS: Issues preventing progress
    4. TECHNICAL DETAILS: Architecture, tools, constraints
    5. NEXT STEPS: What happens next?
    
    CONVERSATION:
    {messages}
    
    Return summary in this format:
    📋 Thread Summary (Last {count} messages)
    
    KEY DECISIONS:
    - (list decisions or "None")
    
    ACTION ITEMS:
    - @Person: Task (deadline)
    
    BLOCKERS:
    - (list or "None identified")
    
    TECHNICAL DETAILS:
    - (key technical points)
    
    NEXT STEPS:
    - (chronological order)
    ```

- [ ] **Task 16.3: Add API Gateway Endpoint**
  - **Endpoint**: `POST /ai/summarize`
  - **Request**:
    ```json
    {
      "conversationId": "conv_123",
      "messageLimit": 100
    }
    ```
  - **Response**:
    ```json
    {
      "summary": "📋 Thread Summary...",
      "messageCount": 100,
      "generatedAt": "2025-10-22T10:30:00Z",
      "cached": false
    }
    ```

- [ ] **Task 16.4: Create Frontend "Summarize" Button**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**:
    - Sparkles (✨) icon button
    - Tap to trigger summarization
    - Loading state: "Summarizing..."

- [ ] **Task 16.5: Create Summary Modal Component**
  - **Files Created**:
    - `src/components/ai/SummaryModal.tsx`
  - **UI**:
    - Full-screen modal
    - Formatted summary (markdown rendering)
    - Copy button (copy to clipboard)
    - Share button (send as message)
    - Close button

- [ ] **Task 16.6: Integrate Frontend with API**
  - **Files Modified**:
    - `src/services/ai/aiService.ts`
  - **Function**: `summarizeConversation(conversationId, messageLimit = 100)`
  - **Features**:
    - Get Firebase JWT token
    - Call API Gateway
    - Handle errors (timeout, rate limit)
    - Loading state
    - Retry on failure (up to 3 attempts)

- [ ] **Task 16.7: Add Redis Caching Logic**
  - **Files Modified**:
    - `aws-lambda/ai/summarize.js`
  - **Cache Key**: `summary:{conversationId}:{messageCount}`
  - **TTL**: 1 hour (3600 seconds)
  - **Invalidation**: When new messages are sent (optional for MVP)

- [ ] **Task 16.8: Deploy Lambda Function**
  - **Commands**:
    ```bash
    cd aws-lambda
    zip -r function.zip . -x "*.git*" -x "node_modules/.cache/*"
    aws lambda update-function-code --function-name pigeon-ai-summarize --zip-file fileb://function.zip
    ```
  - **Verify**: Test with Postman or curl

- [ ] **Task 16.9: Test Summarization Accuracy**
  - **Manual Testing**:
    1. Create 100-message technical discussion (database migration)
    2. Include decisions, action items, blockers
    3. Run summarization
    4. Verify summary captures:
       - All decisions (>90% accuracy)
       - All action items with assignees
       - All blockers mentioned
       - Key technical details
  - **Metrics**: Precision and recall

- [ ] **Task 16.10: Optimize for Performance**
  - **Optimizations**:
    - Use GPT-4 for accuracy (3-4s response time acceptable)
    - Redis caching reduces repeat calls to <100ms
    - Limit to 200 messages max (to stay under token limits)
  - **Target**: <3s for uncached, <100ms for cached

**PR Description**: "Implement thread summarization for Remote Team Professional persona. Users tap 'Summarize' to get 2-minute summary of last 100 messages focusing on decisions, action items, blockers, and technical details. Uses AWS Lambda + OpenAI GPT-4 + Redis caching. Achieves <3s response time uncached, <100ms cached. Targets 90%+ accuracy."

---

## PR #17: AI Feature 2 - Action Item Extraction

**Goal**: Implement automatic action item extraction for Remote Team Professional persona  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/ai-action-items`  
**Rubric Target**: Section 3 - Required AI Features (3/15 points)

**Infrastructure**: AWS Lambda + OpenAI GPT-4 (structured output) + Redis caching

### Tasks

- [ ] **Task 17.1: Create Action Item Extraction Lambda Function**
  - **Files Created**:
    - `aws-lambda/ai/actionItems.js`
  - **Function**: `extractActionItems`
  - **Logic**:
    1. Authenticate user (validate Firebase JWT)
    2. Rate limit check (API Gateway)
    3. Check Redis cache: `action-items:{conversationId}:{messageCount}`
    4. If cached: Return immediately
    5. If not cached:
       - Fetch last 100 messages from Firestore
       - Call OpenAI GPT-4 with structured output (JSON mode)
       - Parse action items
       - Cache in Redis (2 hour TTL)
    6. Return array of action items
  - **Prompt**:
    ```
    Extract all action items from this conversation.
    
    For each action item, provide:
    - task: Brief description of the task
    - assignee: Person assigned (if mentioned, else "Unassigned")
    - deadline: Deadline if mentioned (ISO date or "No deadline")
    - priority: "High", "Medium", or "Low"
    - messageId: ID of the message where it was mentioned
    
    Return as JSON array.
    ```

- [ ] **Task 17.2: Add API Gateway Endpoint**
  - **Endpoint**: `POST /ai/extract-action-items`
  - **Request**:
    ```json
    {
      "conversationId": "conv_123",
      "messageLimit": 100
    }
    ```
  - **Response**:
    ```json
    {
      "actionItems": [
        {
          "task": "Deploy to production",
          "assignee": "Mike",
          "deadline": "2025-10-25T17:00:00Z",
          "priority": "high",
          "messageId": "msg_456"
        }
      ],
      "cached": false
    }
    ```

- [ ] **Task 17.3: Define Action Item Type**
  - **Files Created**:
    - `src/models/ActionItem.ts`
  - **Interface**:
    ```typescript
    interface ActionItem {
      id: string;
      task: string;
      assignee: string | null;
      deadline: Date | null;
      priority: 'high' | 'medium' | 'low';
      messageId: string;
      conversationId: string;
      completed: boolean;
      createdAt: Date;
    }
    ```

- [ ] **Task 17.4: Add Frontend "Extract Action Items" Button**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: 
    - "Action Items" button (icon: checkbox or list)
    - Dropdown menu with "Extract Action Items"
    - Loading state while processing

- [ ] **Task 17.5: Create Action Items Display Component**
  - **Files Created**:
    - `src/components/ai/ActionItemsList.tsx`
  - **UI**:
    - List of action items with:
      - Task description
      - Assignee badge
      - Deadline (relative time)
      - Priority indicator (color-coded)
      - Link to source message
    - Checkbox to mark as complete
    - Filter by: All / Assigned to me / Completed
  - **Design**: Card-based layout, professional

- [ ] **Task 17.6: Integrate AI Service Call**
  - **Files Modified**:
    - `src/services/ai/aiService.ts`
  - **Function**: `extractActionItems(conversationId)`
  - **Features**:
    - Loading state
    - Error handling
    - Timeout: 10 seconds
    - Return ActionItem[]

- [ ] **Task 17.7: Add Navigation to Source Message**
  - **Files Modified**:
    - `src/components/ai/ActionItemsList.tsx`
  - **Feature**: Tap action item → scroll to source message in chat
  - **Implementation**: 
    - Store message IDs in action items
    - Use FlatList `scrollToIndex` or `scrollToItem`
    - Highlight message briefly

- [ ] **Task 17.8: Implement Action Item Storage**
  - **Files Created**:
    - `src/services/database/actionItemService.ts`
  - **Functions**:
    - `saveActionItems(items)`
    - `getActionItems(conversationId)`
    - `updateActionItem(id, updates)`
    - `markComplete(id)`
  - **Storage**: Local SQLite + Firestore sync

- [ ] **Task 17.9: Add Mark as Complete Feature**
  - **Files Modified**:
    - `src/components/ai/ActionItemsList.tsx`
  - **Feature**: Checkbox to mark action items complete
  - **UI**: Strike-through completed items
  - **Persistence**: Save to local DB and Firestore

- [ ] **Task 17.10: Test Extraction Accuracy**
  - **Manual Testing**:
    1. Create messages with clear action items
      - "Can you send the report by Friday?"
      - "@John please review the PR"
      - "We need to deploy by EOD"
    2. Extract action items
    3. Verify accuracy >90%
    4. Test edge cases (ambiguous, multiple in one message)
  - **Metrics**: Precision and recall

- [ ] **Task 17.11: Optimize for Performance**
  - **Optimizations**:
    - Use structured outputs (JSON mode)
    - Cache results for 1 hour
    - Limit to last 100 messages
  - **Target**: <2s response time

**PR Description**: "Implement action item extraction for Remote Team Professional persona. Automatically identifies tasks, assignments, and deadlines from technical discussions. Uses AWS Lambda + OpenAI GPT-4 with structured JSON output + Redis caching. Includes professional UI with filtering, mark-as-complete, and navigation to source messages. Achieves >90% extraction accuracy. Required for rubric Section 3 (3/15 points)."

---

## PR #18: AI Feature 3 - Smart Semantic Search (RAG Pipeline)

**Goal**: Implement RAG-based semantic search for distributed teams  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/ai-semantic-search`  
**Rubric Target**: Section 3 - Required AI Features (3/15 points) + Section 4 - RAG Pipeline (1 point)

**Infrastructure**: AWS Lambda + OpenAI Embeddings + AWS OpenSearch (vector database) + Redis caching

**Persona Context**: Remote teams need to find past technical decisions ("Where did we discuss the database choice?") without scrolling through thousands of messages.

### Tasks

- [ ] **Task 18.1: Set Up AWS OpenSearch Index for Vectors**
  - **Service**: AWS OpenSearch (already provisioned in PR #15)
  - **Index**: `message_embeddings`
  - **Mapping**:
    ```json
    {
      "mappings": {
        "properties": {
          "messageId": { "type": "keyword" },
          "conversationId": { "type": "keyword" },
          "content": { "type": "text" },
          "embedding": {
            "type": "knn_vector",
            "dimension": 1536,
            "method": {
              "name": "hnsw",
              "space_type": "cosinesimil",
              "engine": "nmslib"
            }
          },
          "timestamp": { "type": "date" },
          "senderId": { "type": "keyword" }
        }
      }
    }
    ```
  - **Test**: Insert sample vector, verify k-NN search works

- [ ] **Task 18.2: Create Background Embedding Generation Lambda**
  - **Files Created**:
    - `aws-lambda/ai/generateEmbedding.js`
  - **Trigger**: Firestore message creation (via webhook or polling)
  - **Logic**:
    1. New message created in Firestore
    2. Lambda receives event (via API Gateway webhook)
    3. Call OpenAI embeddings API: `text-embedding-3-small`
    4. Get 1536-dimensional vector
    5. Store in OpenSearch: `message_embeddings` index
  - **Async**: Doesn't block message delivery
  - **Batch**: Process 10 messages at once for efficiency

- [ ] **Task 18.3: Create Semantic Search Lambda Function**
  - **Files Created**:
    - `aws-lambda/ai/search.js`
  - **Function**: `semanticSearch`
  - **Logic**:
    1. Authenticate user
    2. Check Redis cache: `search:{conversationId}:{queryHash}`
    3. If cached: Return results
    4. If not cached:
       - Generate query embedding (OpenAI)
       - Query OpenSearch with k-NN search
       - Filter by conversationId
       - Return top 5 most similar messages
       - Cache results (30 min TTL)
  - **OpenSearch Query**:
    ```json
    {
      "size": 5,
      "query": {
        "bool": {
          "must": [
            {
              "knn": {
                "embedding": {
                  "vector": [0.123, -0.456, ...],
                  "k": 5
                }
              }
            },
            {
              "term": { "conversationId": "conv_123" }
            }
          ]
        }
      }
    }
    ```

- [ ] **Task 18.4: Add API Gateway Endpoint**
  - **Endpoint**: `POST /ai/search`
  - **Request**:
    ```json
    {
      "query": "database migration discussion",
      "conversationId": "conv_123",
      "limit": 5
    }
    ```
  - **Response**:
    ```json
    {
      "results": [
        {
          "messageId": "msg_1",
          "content": "Let's use PostgreSQL for migration",
          "similarity": 0.92,
          "timestamp": "2025-10-15T10:30:00Z",
          "senderId": "user_abc"
        }
      ],
      "cached": false
    }
    ```

- [ ] **Task 18.5: Add Search Bar to UI**
  - **Files Modified**:
    - `src/screens/main/ConversationListScreen.tsx`
    - OR create new `src/screens/main/SearchScreen.tsx`
  - **UI**:
    - Search bar in header
    - "Smart Search" placeholder text
    - Natural language input
    - Search icon

- [ ] **Task 18.6: Create Search Results Component**
  - **Files Created**:
    - `src/components/ai/SearchResults.tsx`
  - **UI**:
    - List of matching messages
    - Snippet of message content
    - Relevance score (visual indicator)
    - Sender and timestamp
    - Tap to navigate to message in conversation
  - **Highlighting**: Bold matching keywords

- [ ] **Task 18.7: Integrate Search Service**
  - **Files Modified**:
    - `src/services/ai/aiService.ts`
  - **Function**: `searchMessages(query, conversationId?)`
  - **Features**:
    - Debounce search (500ms)
    - Loading state
    - Error handling
    - Cancel previous requests

- [ ] **Task 18.8: Add Navigation to Search Results**
  - **Files Modified**:
    - `src/components/ai/SearchResults.tsx`
  - **Feature**: Tap result → open conversation → scroll to message
  - **Implementation**:
    - Navigate to ChatScreen with messageId param
    - Scroll to message
    - Highlight briefly

- [ ] **Task 18.9: Integrate Embedding Generation with Message Send**
  - **Files Modified**:
    - `src/hooks/useMessages.ts`
  - **Logic**:
    1. User sends message
    2. Save to Firestore (existing flow)
    3. Call API Gateway webhook: `POST /ai/generate-embedding`
    4. Lambda generates embedding + stores in OpenSearch
  - **Async**: Webhook call doesn't block UI (fire-and-forget)
  - **Alternative**: Poll Firestore for new messages every 10 seconds

- [ ] **Task 18.10: Test Search Accuracy**
  - **Manual Testing**:
    1. Create diverse messages (topics, keywords)
    2. Search with natural language queries:
       - "deployment discussion"
       - "meeting schedule"
       - "bug report"
    3. Verify results are relevant (>90%)
    4. Compare to keyword search
  - **Metrics**: Precision@5, NDCG

- [ ] **Task 18.11: Optimize for Performance**
  - **Optimizations**:
    - Cache query embeddings
    - Limit search to recent messages (last 1000)
    - Use batch embedding generation
    - Consider Pinecone for large scale
  - **Target**: <2s response time

**PR Description**: "Implement RAG-based semantic search for Remote Team Professional persona. Users search with natural language ('database migration decision') to find relevant technical discussions. Uses AWS Lambda + OpenAI embeddings (text-embedding-3-small) + AWS OpenSearch (k-NN vector search) + Redis caching. Background embedding generation on message send. Achieves >90% relevance for technical queries, <2s response time. Required for rubric Section 3 (3/15 points) + Section 4 RAG Pipeline (1 point)."

---

## PR #19: AI Feature 4 - Priority Message Detection

**Goal**: Automatically detect and flag urgent/high-priority messages for distributed teams  
**Estimated Time**: 3 hours  
**Branch**: `feature/ai-priority-detection`  
**Rubric Target**: Section 3 - Required AI Features (3/15 points)

**Infrastructure**: AWS Lambda + OpenAI GPT-3.5-turbo (for speed) + Redis caching

**Persona Context**: Production incidents and urgent blockers need immediate attention. Auto-flagging prevents critical messages from getting buried in casual chat.

### Tasks

- [ ] **Task 19.1: Create Priority Detection Lambda Function**
  - **Files Created**:
    - `aws-lambda/ai/priorityDetection.js`
  - **Function**: `detectMessagePriority`
  - **Logic**:
    1. Authenticate user
    2. Fetch message content from request
    3. Call OpenAI GPT-3.5-turbo to classify priority (high/medium/low)
    4. Return priority level
    5. No caching (real-time classification)
  - **Prompt**:
    ```
    Analyze this message and classify its urgency/priority for a remote team professional.
    
    Priority levels:
    - high: Urgent, needs immediate attention (deadlines, blockers, escalations)
    - medium: Important but not urgent (decisions needed, questions)
    - low: General discussion, updates, non-actionable
    
    Message: {content}
    
    Return only the priority level: high, medium, or low
    ```

- [ ] **Task 19.2: Add Priority Field to Message Model**
  - **Files Modified**:
    - `src/models/Message.ts`
  - **Field**: `priority?: 'high' | 'medium' | 'low'`
  - **Default**: `low` (or null if not analyzed)

- [ ] **Task 19.3: Implement Automatic Priority Detection**
  - **Files Modified**:
    - `functions/src/index.ts` (Firestore trigger)
  - **Trigger**: `onMessageCreated`
  - **Logic**:
    1. New message added
    2. Analyze priority asynchronously
    3. Update message with priority field
  - **Background**: Don't block message delivery

- [ ] **Task 19.4: Add Priority Badges to Message Bubbles**
  - **Files Modified**:
    - `src/components/chat/MessageBubble.tsx`
  - **UI**:
    - High priority: Red "!" badge or flag icon
    - Medium priority: Yellow dot (subtle)
    - Low priority: No indicator
  - **Position**: Top-right corner of message bubble

- [ ] **Task 19.5: Add Priority Filter to Chat**
  - **Files Modified**:
    - `src/screens/main/ChatScreen.tsx`
  - **UI**: 
    - Filter button in header
    - Options: All / High Priority / Medium & High
    - Show count of high priority messages
  - **Implementation**: Filter messages array by priority

- [ ] **Task 19.6: Create Priority Message List Screen**
  - **Files Created**:
    - `src/screens/main/PriorityMessagesScreen.tsx`
  - **UI**:
    - List of all high-priority messages across conversations
    - Group by conversation
    - Tap to navigate to message
  - **Navigation**: Add to main stack

- [ ] **Task 19.7: Add Push Notifications for High Priority**
  - **Files Modified**:
    - `aws-lambda/index.js`
  - **Logic**:
    - Check message priority before sending notification
    - If high priority: Use high-priority notification channel
    - Add "⚠️ URGENT" prefix to notification title
  - **Optional**: Sound/vibration pattern for urgent

- [ ] **Task 19.8: Implement Priority Analytics**
  - **Files Created**:
    - `src/components/ai/PriorityInsights.tsx`
  - **Metrics**:
    - Count of high/medium/low messages per day
    - Most urgent conversations
    - Response time to urgent messages
  - **UI**: Simple dashboard in ProfileScreen

- [ ] **Task 19.9: Test Priority Detection Accuracy**
  - **Manual Testing**:
    1. Send messages with clear urgency signals:
       - "URGENT: Production is down!"
       - "Can you review this PR when you have time?"
       - "Hey, how was your weekend?"
    2. Verify classification accuracy >90%
    3. Test edge cases (sarcasm, all caps)
  - **Metrics**: Precision and recall for each level

- [ ] **Task 19.10: Optimize for Performance**
  - **Optimizations**:
    - Batch process messages (analyze 10 at once)
    - Cache priority for 24 hours
    - Use GPT-3.5-turbo for speed
  - **Target**: <1s per message

**PR Description**: "Implement automatic priority/urgency detection for messages. Classifies as high/medium/low using GPT-4 analysis. Includes priority badges on message bubbles, filtering by priority, dedicated high-priority messages screen, and enhanced push notifications for urgent messages. Achieves >90% classification accuracy. Required for rubric Section 3 (3/15 points)."

---

## PR #20: AI Feature 5 - Decision Tracking

**Goal**: Automatically identify and track agreed-upon technical decisions for distributed teams  
**Estimated Time**: 3-4 hours  
**Branch**: `feature/ai-decision-tracking`  
**Rubric Target**: Section 3 - Required AI Features (3/15 points)

**Infrastructure**: AWS Lambda + OpenAI GPT-4 + Redis caching

**Persona Context**: Remote teams make architectural/technical decisions in chat. Two weeks later: "Did we decide on PostgreSQL or MongoDB?" Requires scrolling through hundreds of messages. Decision tracking creates an audit trail.

### Tasks

- [ ] **Task 20.1: Create Decision Tracking Lambda Function**
  - **Files Created**:
    - `aws-lambda/ai/decisionTracking.js`
  - **Function**: `extractDecisions`
  - **Logic**:
    1. Authenticate user
    2. Check Redis cache: `decisions:{conversationId}:{messageCount}`
    3. If cached: Return immediately
    4. If not cached:
       - Fetch messages (last 100) from Firestore
       - Call OpenAI GPT-4 to identify finalized decisions
       - Parse decisions with context
       - Cache in Redis (2 hour TTL)
    5. Return array of decisions
  - **Prompt**:
    ```
    Analyze this conversation and identify all decisions that were made or agreed upon.
    
    For each decision, provide:
    - decision: What was decided (concise)
    - context: Brief background or reasoning
    - participants: Who agreed or was involved
    - timestamp: When it was decided (message timestamp)
    - messageIds: IDs of relevant messages
    - confidence: "high", "medium", or "low"
    
    Only include clear, actionable decisions. Exclude:
    - General discussion without conclusion
    - Questions without answers
    - Possibilities being explored
    
    Return as JSON array.
    ```

- [ ] **Task 20.2: Define Decision Model**
  - **Files Created**:
    - `src/models/Decision.ts`
  - **Interface**:
    ```typescript
    interface Decision {
      id: string;
      decision: string;
      context: string;
      participants: string[];
      timestamp: Date;
      conversationId: string;
      messageIds: string[];
      confidence: 'high' | 'medium' | 'low';
      createdAt: Date;
    }
    ```

- [ ] **Task 20.3: Add "Track Decisions" Button**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
  - **UI**: 
    - "Decisions" button (icon: check-circle or clipboard)
    - Dropdown menu with "Track Decisions"
    - Loading state while processing

- [ ] **Task 20.4: Create Decisions Display Component**
  - **Files Created**:
    - `src/components/ai/DecisionTimeline.tsx`
  - **UI**:
    - Timeline view of decisions (chronological)
    - Each decision card shows:
      - Decision text (bold)
      - Context (subtext)
      - Participants (avatars)
      - Timestamp (relative)
      - Confidence indicator
      - "View Context" button (links to messages)
  - **Design**: Card-based, professional timeline

- [ ] **Task 20.5: Integrate AI Service Call**
  - **Files Modified**:
    - `src/services/ai/aiService.ts`
  - **Function**: `trackDecisions(conversationId)`
  - **Features**:
    - Loading state
    - Error handling
    - Timeout: 10 seconds
    - Return Decision[]

- [ ] **Task 20.6: Implement Decision Storage**
  - **Files Created**:
    - `src/services/database/decisionService.ts`
  - **Functions**:
    - `saveDecisions(decisions)`
    - `getDecisions(conversationId)`
    - `searchDecisions(query)`
    - `deleteDecision(id)`
  - **Storage**: Local SQLite + Firestore sync

- [ ] **Task 20.7: Add Navigation to Source Messages**
  - **Files Modified**:
    - `src/components/ai/DecisionTimeline.tsx`
  - **Feature**: Tap "View Context" → scroll to decision in conversation
  - **Implementation**: 
    - Link to first messageId
    - Highlight multiple messages if needed
    - Show snippet in modal

- [ ] **Task 20.8: Create Decision Search Screen**
  - **Files Created**:
    - `src/screens/main/DecisionSearchScreen.tsx`
  - **UI**:
    - Search bar for all decisions
    - Filter by conversation
    - Sort by date or relevance
    - Tap to navigate to source
  - **Navigation**: Add to main stack

- [ ] **Task 20.9: Test Decision Detection Accuracy**
  - **Manual Testing**:
    1. Create messages with clear decisions:
       - "Let's go with Option B for deployment"
       - "We've decided to use AWS Lambda"
       - "The team agreed to meet at 2pm daily"
    2. Extract decisions
    3. Verify accuracy >90%
    4. Test edge cases (tentative, sarcastic)
  - **Metrics**: Precision and recall

- [ ] **Task 20.10: Optimize for Performance**
  - **Optimizations**:
    - Use GPT-4 for accuracy
    - Cache results for 2 hours
    - Limit to last 100 messages
    - Structured outputs for reliability
  - **Target**: <2s response time

**PR Description**: "Implement decision tracking AI feature. Automatically identifies and surfaces agreed-upon decisions from conversations. Uses GPT-4 with structured output to extract decision, context, participants, and confidence level. Includes timeline view, search functionality, and navigation to source messages. Achieves >90% extraction accuracy for clear decisions. Required for rubric Section 3 (3/15 points)."

---

## PR #21: Advanced AI - Proactive Scheduling Assistant (Multi-Step Agent)

**Goal**: Implement multi-step AI agent for proactive meeting scheduling across timezones  
**Estimated Time**: 5-6 hours  
**Branch**: `feature/ai-scheduling-agent`  
**Rubric Target**: Section 3 - Advanced AI Capability (10 points)

**Infrastructure**: AWS Lambda + LangChain + OpenAI GPT-4

**Persona Context**: Scheduling meetings across PST, GMT, and IST requires 15-30 minutes of back-and-forth. Agent reduces this to 2 minutes by proactively extracting details, suggesting optimal times, and generating calendar invites.

### Tasks

- [ ] **Task 21.1: Set Up LangChain Agent Framework in Lambda**
  - **Files Modified**:
    - `aws-lambda/package.json`
  - **Dependencies**: 
    - `langchain` - Agent orchestration
    - `@langchain/openai` - OpenAI integration for LangChain
    - (Already installed in PR #15)
  - **Files Created**:
    - `aws-lambda/ai/agent/schedulingAgent.js`
  - **Agent Type**: Multi-step function calling agent with GPT-4

- [ ] **Task 21.2: Define 5 Agent Tools/Functions**
  - **Files Created**:
    - `aws-lambda/ai/agent/tools.js`
  - **Tools**:
    1. `extractSchedulingDetails(messages)` - Extract meeting info (topic, participants, duration, timeframe)
    2. `findConflicts(participants, proposedTimes)` - Check availability (simulated for MVP)
    3. `suggestAlternativeTimes(participants, constraints)` - Propose 3 times across timezones
    4. `generateMeetingProposal(details)` - Create formatted proposal with calendar link
    5. `confirmMeeting(details)` - Finalize meeting (optional)
  - **Schema**: Define input/output for each tool with TypeScript/Zod validation

- [ ] **Task 21.3: Implement Step 1 - Monitor for Scheduling Mentions**
  - **Files Modified**:
    - `functions/src/ai/agent/schedulingAgent.ts`
  - **Logic**:
    - Detect keywords: "meeting", "schedule", "let's meet", etc.
    - Use LLM to classify if scheduling intent exists
    - Trigger agent workflow
  - **Threshold**: Confidence >80%

- [ ] **Task 21.4: Implement Step 2 - Extract Meeting Details**
  - **Tool**: `extractSchedulingDetails`
  - **Extracts**:
    - Participants (from mentions or conversation)
    - Purpose/topic
    - Preferred date/time (if mentioned)
    - Duration (default: 30 min)
    - Location (physical or virtual)
  - **Output**: Structured JSON

- [ ] **Task 21.5: Implement Step 3 - Check Availability**
  - **Tool**: `findConflicts`
  - **Logic**:
    - Check if participants are available
    - For MVP: Simulate availability check
    - Future: Integrate with Google Calendar API
  - **Output**: List of conflicts or "Available"

- [ ] **Task 21.6: Implement Step 4 - Suggest Optimal Times**
  - **Tool**: `suggestAlternativeTimes`
  - **Logic**:
    - If conflicts exist, propose 3 alternative times
    - Consider time zones (assume same for MVP)
    - Avoid non-working hours (9am-5pm default)
  - **Output**: Array of TimeSlot objects

- [ ] **Task 21.7: Implement Step 5 - Generate Meeting Proposal**
  - **Tool**: `generateMeetingProposal`
  - **Logic**:
    - Format meeting details professionally
    - Include: Title, Date/Time, Duration, Participants, Purpose
    - Add calendar invite link (Google Calendar)
  - **Output**: Formatted text + calendar URL

- [ ] **Task 21.8: Implement Agent Orchestration**
  - **Files Modified**:
    - `functions/src/ai/agent/schedulingAgent.ts`
  - **Agent Flow**:
    1. Detect scheduling intent
    2. Call extractSchedulingDetails tool
    3. Call findConflicts tool
    4. If conflicts, call suggestAlternativeTimes tool
    5. Call generateMeetingProposal tool
    6. Return proposal to user
  - **Context**: Maintain state across 5+ steps
  - **Error Handling**: Retry failed steps, fallback gracefully

- [ ] **Task 21.9: Add Frontend Proactive Suggestions**
  - **Files Modified**:
    - `src/components/ai/ProactiveSuggestion.tsx` (new)
    - `src/screens/main/ChatScreen.tsx`
  - **UI**:
    - Banner appears when scheduling detected
    - Shows: "I can help schedule this meeting"
    - Button: "Schedule with AI"
    - Dismissible
  - **Position**: Above message input

- [ ] **Task 21.10: Create Scheduling Interface**
  - **Files Created**:
    - `src/components/ai/SchedulingModal.tsx`
  - **UI**:
    - Modal with agent progress steps
    - Show extracted details (editable)
    - Display suggested times (selectable)
    - Loading states for each step
    - "Confirm" button
  - **Flow**: User reviews and confirms/edits

- [ ] **Task 21.11: Integrate Agent with Cloud Function**
  - **Files Created**:
    - `functions/src/ai/scheduleAssistant.ts`
  - **Function**: `runSchedulingAgent`
  - **Parameters**: conversationId, triggerMessageId
  - **Response**: Meeting proposal or error
  - **Timeout**: 30 seconds (agent can take time)

- [ ] **Task 21.12: Add Calendar Integration (Optional)**
  - **Files Modified**:
    - `functions/src/utils/calendar.ts` (new)
  - **Integration**: Google Calendar API
  - **Function**: `createCalendarEvent(details)`
  - **Features**:
    - Generate .ics file for download
    - Or: Direct integration (OAuth required)
  - **MVP**: Generate Google Calendar URL

- [ ] **Task 21.13: Test Agent Workflow**
  - **Manual Testing**:
    1. Send: "Let's have a meeting to discuss the project tomorrow at 2pm"
    2. Verify agent detects intent
    3. Verify details extracted correctly
    4. Verify proposal generated
    5. Test edge cases (ambiguous times, multiple participants)
  - **Accuracy**: >85% for clear requests

- [ ] **Task 21.14: Optimize Agent Performance**
  - **Optimizations**:
    - Use GPT-4 for reasoning
    - Cache intermediate results
    - Parallel tool calls where possible
    - Stream progress updates to frontend
  - **Target**: <15s for complete workflow

**PR Description**: "Implement advanced multi-step scheduling agent using LangChain. Proactively detects scheduling mentions, extracts meeting details, checks availability, suggests optimal times, and generates meeting proposals. Maintains context across 5+ steps with function calling. Includes professional UI with progress indicators and editable details. Achieves >85% accuracy for clear scheduling requests. Required for rubric Section 3 - Advanced AI Capability (10 points)."

---

## PR #22: RAG Pipeline & Technical Documentation

**Goal**: Document RAG pipeline and complete technical documentation  
**Estimated Time**: 2-3 hours  
**Branch**: `docs/rag-pipeline`  
**Rubric Target**: Section 4 - RAG Pipeline Documentation (1 point) + Section 5 - Code Quality (2 points)

### Tasks

- [ ] **Task 22.1: Create RAG Pipeline Documentation**
  - **Files Created**:
    - `docs/RAG_PIPELINE.md`
  - **Content**:
    - Architecture diagram (data flow)
    - Embedding generation process
    - Storage strategy (Firestore)
    - Retrieval algorithm (cosine similarity)
    - Context building for LLM
    - Performance characteristics
    - Limitations and future improvements

- [ ] **Task 22.2: Document Vector Embedding Strategy**
  - **Files Modified**:
    - `docs/RAG_PIPELINE.md`
  - **Details**:
    - Model: `text-embedding-3-small` (1536 dimensions)
    - Chunking: Per-message (no splitting)
    - Storage: Firestore `/messageEmbeddings/` collection
    - Indexing: On message creation (background)
    - Caching: None (generate once, store forever)

- [ ] **Task 22.3: Document Retrieval Strategy**
  - **Files Modified**:
    - `docs/RAG_PIPELINE.md`
  - **Details**:
    - Algorithm: Cosine similarity
    - Top-K: 5 results
    - Filtering: By conversation ID
    - Re-ranking: None (ordered by similarity)
    - Context window: Last 1000 messages max

- [ ] **Task 22.4: Add Code Comments to AI Services**
  - **Files Modified**:
    - `functions/src/ai/search.ts`
    - `functions/src/utils/rag.ts`
    - `functions/src/ai/summarization.ts`
    - `functions/src/ai/actionItems.ts`
    - `functions/src/ai/priorityDetection.ts`
    - `functions/src/ai/decisionTracking.ts`
  - **Standards**:
    - Function-level JSDoc comments
    - Explain algorithm choices
    - Note performance considerations
    - Document error handling

- [ ] **Task 22.5: Add README for Functions Directory**
  - **Files Created**:
    - `functions/README.md`
  - **Content**:
    - Overview of Cloud Functions
    - List of all functions with descriptions
    - Environment variables required
    - Deployment instructions
    - Testing guidelines
    - Rate limits and quotas

- [ ] **Task 22.6: Update Main README**
  - **Files Modified**:
    - `README.md`
  - **Additions**:
    - Section on AI features
    - Link to RAG pipeline documentation
    - Architecture diagram (frontend + backend + AI)
    - Performance benchmarks
    - Known limitations

- [ ] **Task 22.7: Create API Documentation**
  - **Files Created**:
    - `docs/API.md`
  - **Content**:
    - Cloud Functions endpoints
    - Request/response schemas
    - Authentication requirements
    - Rate limits
    - Error codes
    - Example requests

- [ ] **Task 22.8: Add Inline Code Comments**
  - **Files Modified**:
    - All AI-related service files
  - **Focus**:
    - Complex algorithms
    - Non-obvious logic
    - Performance optimizations
    - Error handling strategies
  - **Standard**: JSDoc format

- [ ] **Task 22.9: Create Developer Onboarding Guide**
  - **Files Created**:
    - `docs/DEVELOPER_GUIDE.md`
  - **Content**:
    - Project structure overview
    - Setup instructions (OpenAI API key, Firebase)
    - Development workflow
    - Testing guidelines
    - Deployment process
    - Troubleshooting common issues

- [ ] **Task 22.10: Review and Polish Documentation**
  - **All Docs**: README.md, PRD.md, TASK_LIST.md, memory-bank/
  - **Checks**:
    - Consistent formatting
    - No outdated information
    - Clear and concise
    - Links work
    - Grammar and spelling

**PR Description**: "Complete technical documentation for RAG pipeline and AI features. Includes detailed RAG architecture docs, API documentation, developer onboarding guide, and comprehensive code comments. Meets rubric requirements for Section 4 (RAG Pipeline - 1 point) and Section 5 (Code Quality & Documentation - 2 points)."

---

## PR #23: Testing & Quality Assurance

**Goal**: Comprehensive testing of all AI features and core functionality  
**Estimated Time**: 4-5 hours  
**Branch**: `test/ai-features`  
**Rubric Target**: Section 5 - Testing & Quality (3 points)

### Tasks

- [ ] **Task 23.1: Unit Tests for AI Utilities**
  - **Files Created**:
    - `functions/src/ai/__tests__/rag.test.ts`
    - `functions/src/ai/__tests__/prompts.test.ts`
  - **Tests**:
    - Embedding generation
    - Cosine similarity calculation
    - Prompt formatting
    - Context building

- [ ] **Task 23.2: Integration Tests for Cloud Functions**
  - **Files Created**:
    - `functions/src/__tests__/ai.integration.test.ts`
  - **Tests**:
    - Summarization function end-to-end
    - Action item extraction end-to-end
    - Search function end-to-end
    - Priority detection end-to-end
    - Decision tracking end-to-end
  - **Setup**: Use Firebase Emulator

- [ ] **Task 23.3: Frontend Component Tests**
  - **Files Created**:
    - `src/components/ai/__tests__/SummarizeModal.test.tsx`
    - `src/components/ai/__tests__/ActionItemsList.test.tsx`
    - `src/components/ai/__tests__/SearchResults.test.tsx`
  - **Framework**: Jest + React Native Testing Library
  - **Tests**:
    - Rendering
    - User interactions
    - Loading states
    - Error states

- [ ] **Task 23.4: End-to-End Testing**
  - **Manual Testing Script**:
    - Create test conversation with diverse messages
    - Test all AI features in sequence
    - Verify accuracy and performance
    - Test error handling (offline, API failures)
    - Test edge cases
  - **Document Results**: Test report in `docs/TESTING_REPORT.md`

- [ ] **Task 23.5: Accuracy Evaluation**
  - **Create Test Dataset**:
    - 50 messages with known action items
    - 50 messages with known priorities
    - 20 conversations with known decisions
  - **Run AI Features**:
    - Extract action items, priorities, decisions
    - Compare to ground truth
    - Calculate precision, recall, F1 score
  - **Target**: >90% accuracy for each feature

- [ ] **Task 23.6: Performance Benchmarking**
  - **Metrics**:
    - Summarization response time (target: <2s)
    - Action item extraction time (target: <2s)
    - Search response time (target: <2s)
    - Priority detection time (target: <1s)
    - Decision tracking time (target: <2s)
    - Agent workflow time (target: <15s)
  - **Document**: In `docs/PERFORMANCE.md`

- [ ] **Task 23.7: Error Handling Tests**
  - **Scenarios**:
    - OpenAI API rate limit
    - OpenAI API timeout
    - Invalid input
    - Empty conversations
    - Firestore read failures
  - **Verify**: Graceful degradation, user-friendly errors

- [ ] **Task 23.8: Security Testing**
  - **Check**:
    - Authentication required for all Cloud Functions
    - Rate limiting works
    - Input validation prevents injection
    - API keys not exposed in frontend
    - Firestore rules enforce permissions

- [ ] **Task 23.9: Accessibility Testing**
  - **Check**:
    - All AI features accessible via screen reader
    - Proper ARIA labels
    - Keyboard navigation works
    - Color contrast meets WCAG AA
    - Loading states announced

- [ ] **Task 23.10: Create Testing Documentation**
  - **Files Created**:
    - `docs/TESTING_REPORT.md`
  - **Content**:
    - Test coverage summary
    - Accuracy evaluation results
    - Performance benchmarks
    - Known issues and limitations
    - Future testing improvements

**PR Description**: "Comprehensive testing suite for all AI features. Includes unit tests, integration tests, end-to-end tests, accuracy evaluation (>90%), performance benchmarking, error handling, security, and accessibility testing. Meets rubric requirements for Section 5 (Testing & Quality - 3 points)."

---

## PR #24: UI Polish & Professional Design

**Goal**: Polish UI/UX for all AI features to professional standards  
**Estimated Time**: 3-4 hours  
**Branch**: `ui/ai-polish`  
**Rubric Target**: Section 5 - Code Quality & Polish (2 points)

### Tasks

- [ ] **Task 24.1: Design Consistent AI Feature Icons**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
    - All AI feature components
  - **Icons**:
    - Summarize: Lightning bolt or sparkles
    - Action Items: Checkbox or list
    - Search: Magnifying glass with sparkle
    - Priority: Flag or exclamation
    - Decisions: Lightbulb or check-circle
    - Scheduling: Calendar or clock
  - **Style**: Use Ionicons, consistent size (24px)

- [ ] **Task 24.2: Standardize Loading States**
  - **Files Modified**:
    - All AI feature components
  - **Pattern**:
    - Skeleton loaders (not spinners)
    - Pulse animation
    - Maintain layout (no jumps)
    - Show progress for multi-step (agent)

- [ ] **Task 24.3: Improve Error Messages**
  - **Files Modified**:
    - `src/services/ai/aiService.ts`
    - All AI feature components
  - **Messages**:
    - User-friendly language
    - Actionable guidance (e.g., "Try again" button)
    - Avoid technical jargon
    - Distinguish between user errors and system errors

- [ ] **Task 24.4: Add Empty States**
  - **Files Modified**:
    - `src/components/ai/ActionItemsList.tsx`
    - `src/components/ai/DecisionTimeline.tsx`
    - `src/components/ai/SearchResults.tsx`
  - **Design**:
    - Illustration or icon
    - Helpful message
    - Call-to-action button
    - Encourage exploration

- [ ] **Task 24.5: Implement Smooth Animations**
  - **Files Modified**:
    - All AI feature components
  - **Animations**:
    - Fade-in for results
    - Slide-up for modals
    - Bounce for proactive suggestions
    - Stagger for list items
  - **Library**: React Native Reanimated (if not causing issues)

- [ ] **Task 24.6: Add Tooltips and Hints**
  - **Files Modified**:
    - `src/components/chat/ChatHeader.tsx`
    - AI feature buttons
  - **Tooltips**:
    - Explain what each AI feature does
    - Show on long-press
    - Dismiss on tap outside
    - First-time user hints

- [ ] **Task 24.7: Ensure Dark Mode Support**
  - **Files Modified**:
    - All AI feature components
  - **Check**:
    - All colors from theme
    - No hardcoded colors
    - Sufficient contrast in both modes
    - Icons adapt to theme

- [ ] **Task 24.8: Responsive Design for Large Screens**
  - **Files Modified**:
    - All AI feature modals and screens
  - **Features**:
    - Max width on tablets
    - Multi-column layouts where appropriate
    - Optimized for landscape
    - Keyboard shortcuts (if applicable)

- [ ] **Task 24.9: Add Micro-Interactions**
  - **Examples**:
    - Button press feedback (scale down)
    - Haptic feedback on actions
    - Success checkmark animation
    - Error shake animation
  - **Library**: Expo Haptics

- [ ] **Task 24.10: Final UI/UX Review**
  - **Checklist**:
    - Consistent spacing and padding
    - Typography hierarchy clear
    - Colors match brand
    - All interactions feel snappy (<100ms)
    - No visual bugs or glitches

**PR Description**: "Polish UI/UX for all AI features to professional standards. Includes consistent icons, skeleton loaders, user-friendly error messages, empty states, smooth animations, tooltips, dark mode support, responsive design, and micro-interactions. Meets rubric requirements for Section 5 (Code Quality & Polish - 2 points)."

---

## PR #25: Final Integration, Deployment & Video Demo

**Goal**: Final integration testing, production deployment, and demo video  
**Estimated Time**: 3-4 hours  
**Branch**: `main` (merge all feature branches)  
**Rubric Target**: Section 1 (Project Basics - 5 points) + Section 2 (Demo Video - 10 points)

### Tasks

- [ ] **Task 25.1: Merge All Feature Branches**
  - **Process**:
    1. Ensure all feature branches pass CI/CD
    2. Resolve any merge conflicts
    3. Test integration locally
    4. Merge into `main` branch
  - **Branches**: PR #14 through PR #24

- [ ] **Task 25.2: Final Integration Testing**
  - **Test Scenarios**:
    1. Complete user workflow: Sign up → Create conversation → Send messages → Use all 5 AI features → Scheduling agent
    2. Test with multiple users (presence, notifications)
    3. Test offline/online sync
    4. Test push notifications (foreground, background, closed)
    5. Stress test (100+ messages, 10+ conversations)
  - **Verify**: No critical bugs

- [ ] **Task 25.3: Build Production APK**
  - **Command**: `eas build --platform android --profile production`
  - **Verify**:
    - APK installs successfully
    - All features work
    - No crashes
    - Push notifications work
    - Presence detection works
    - All AI features functional

- [ ] **Task 25.4: Deploy Cloud Functions**
  - **Command**: `firebase deploy --only functions`
  - **Verify**:
    - All functions deployed successfully
    - Functions respond correctly
    - No errors in logs
    - Rate limiting works

- [ ] **Task 25.5: Update Environment Variables**
  - **EAS Secrets**: Ensure all required secrets set
  - **Firebase Functions**: Ensure all env vars configured
  - **Documentation**: Update `.env.example` with all required vars

- [ ] **Task 25.6: Create Demo Script**
  - **Files Created**:
    - `docs/DEMO_SCRIPT.md`
  - **Script** (5 minutes):
    1. **Intro** (30s): What is Pigeon AI, problem it solves
    2. **Core Features** (1m): Sign up, chat, groups, presence, notifications
    3. **AI Feature 1** (30s): Thread summarization
    4. **AI Feature 2** (30s): Action item extraction
    5. **AI Feature 3** (30s): Semantic search
    6. **AI Feature 4** (30s): Priority detection
    7. **AI Feature 5** (30s): Decision tracking
    8. **Advanced AI** (1m): Scheduling agent (multi-step)
    9. **Wrap-up** (30s): Benefits, impact, future improvements

- [ ] **Task 25.7: Record Demo Video**
  - **Tools**: OBS Studio or QuickTime (screen recording)
  - **Format**: MP4, 1080p, <5 minutes
  - **Quality**:
    - Clear audio (external mic recommended)
    - No background noise
    - Professional tone
    - Show features clearly (zoom in if needed)
    - Smooth transitions
  - **Editing**: Cut mistakes, add captions if helpful

- [ ] **Task 25.8: Upload Demo Video**
  - **Platform**: YouTube (unlisted) or Loom
  - **Add**: Link to `README.md` and submission form
  - **Verify**: Video plays correctly, all features visible

- [ ] **Task 25.9: Prepare Submission Package**
  - **Files**:
    - `README.md` (updated with video link)
    - `PRD.md` (final version)
    - `TASK_LIST.md` (all tasks checked)
    - `docs/BRAINLIFT.md` (persona + features)
    - `docs/RAG_PIPELINE.md`
    - `docs/TESTING_REPORT.md`
    - `docs/API.md`
    - Production APK (link or file)
    - Demo video link
  - **Checklist**: Verify all required files present

- [ ] **Task 25.10: Final Code Review & Cleanup**
  - **Remove**:
    - Debug console.logs
    - Commented-out code
    - Unused files
    - TODO comments (or move to issues)
  - **Check**:
    - No linter errors
    - No TypeScript errors
    - All imports used
    - Code formatted consistently

**PR Description**: "Final integration and production deployment. Merges all feature branches, performs comprehensive integration testing, builds production APK, deploys Cloud Functions, and records professional demo video. Includes demo script, submission package preparation, and code cleanup. Completes all rubric requirements for submission."

---

## Success Criteria Checklist

This checklist maps all rubric requirements to our PRs:

### Section 1: Project Basics (5 points)
- [x] **Completed MVP**: All core features working (PRs #1-#12)
- [x] **Production APK**: Built and tested (PR #10, #25)
- [ ] **Code Quality**: Clean, well-documented code (PR #22, #24, #25)
- [ ] **GitHub Repository**: Complete with README (PR #22, #25)
- [ ] **Demo Video**: 5 minutes, professional (PR #25)

### Section 2: Demo Video Quality (10 points)
- [ ] **Clear Presentation**: Professional audio/video (PR #25)
- [ ] **Feature Showcase**: All features demonstrated (PR #25)
- [ ] **Technical Depth**: Explain architecture and design choices (PR #25)
- [ ] **Impact**: Articulate value and use cases (PR #25)
- [ ] **Polish**: Editing, pacing, visual quality (PR #25)

### Section 3: AI Features & Sophistication (40 points total)
- [ ] **Persona Selection & Brainlift**: Remote Team Professional (PR #13) - 0/0 points (Pass/Fail)
- [ ] **AI Feature 1**: Thread Summarization (PR #16) - 0/3 points
- [ ] **AI Feature 2**: Action Item Extraction (PR #17) - 0/3 points
- [ ] **AI Feature 3**: Semantic Search (PR #18) - 0/3 points
- [ ] **AI Feature 4**: Priority Detection (PR #19) - 0/3 points
- [ ] **AI Feature 5**: Decision Tracking (PR #20) - 0/3 points
- [ ] **Advanced AI**: Multi-step Scheduling Agent (PR #21) - 0/10 points
- [ ] **Feature Relevance**: Well-aligned to persona (PR #13, #14) - 0/5 points
- [ ] **User Experience**: Intuitive, polished UI (PR #24) - 0/5 points
- [ ] **Performance**: <2s for simple, <15s for agent (PR #23) - 0/5 points

### Section 4: RAG Pipeline (1 point)
- [ ] **RAG Implementation**: Semantic search with embeddings (PR #18)
- [ ] **RAG Documentation**: Architecture and process explained (PR #22)

### Section 5: Code Quality, Testing & Documentation (10 points)
- [x] **Project Structure**: Organized and logical (PRs #1-#12)
- [ ] **Documentation**: Comprehensive README, API docs, comments (PR #22) - 0/2 points
- [ ] **Testing**: Unit, integration, accuracy tests (PR #23) - 0/3 points
- [ ] **Code Quality**: Clean, maintainable, consistent (PR #24, #25) - 0/2 points
- [ ] **Error Handling**: Graceful failures, user-friendly errors (PR #23, #24) - 0/1 point
- [ ] **Performance**: Optimized, meets targets (PR #23) - 0/1 point
- [ ] **Accessibility**: Screen reader support, WCAG compliance (PR #23) - 0/1 point

### Section 6: Pass/Fail Requirements
- [ ] **Firebase Integration**: Core chat features work (DONE: PRs #1-#12) ✅
- [ ] **OpenAI Integration**: At least 3 AI features (PR #16-#20) ⏳
- [ ] **Persona & Brainlift**: Document submitted (PR #13) ⏳
- [ ] **Demo Video**: Submitted (PR #25) ⏳
- [ ] **No Plagiarism**: Original work ✅
- [ ] **Meets Deadline**: On-time submission ⏳

---

## Estimated Timeline

**Total Estimated Time**: 45-55 hours

**Phase 1: Persona & Planning** (PR #13-#15)
- Time: 4-6 hours
- Status: Not started

**Phase 2: Core AI Features** (PR #16-#20)
- Time: 15-20 hours (3-4 hours each × 5 features)
- Status: Not started

**Phase 3: Advanced AI** (PR #21)
- Time: 5-6 hours
- Status: Not started

**Phase 4: Documentation & Testing** (PR #22-#23)
- Time: 6-8 hours
- Status: Not started

**Phase 5: Polish & Deployment** (PR #24-#25)
- Time: 6-8 hours
- Status: Not started

**Suggested Approach**: Complete one PR at a time, test thoroughly, then move to next. Prioritize core AI features (PR #16-#20) to ensure at least 5 features are implemented before tackling the advanced agent (PR #21).

---

**END OF TASK LIST**

