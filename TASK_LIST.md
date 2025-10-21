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

