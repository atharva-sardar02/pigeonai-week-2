# Active Context: Pigeon AI

**Last Updated**: October 21, 2025 - Multiple PRs Complete ✅  
**Current Phase**: Development - Push Notifications & UI Enhancements Complete  
**Status**: ✅ Auth Complete, ✅ Data Layer Complete, ✅ Chat UI Complete, ✅ Presence Complete, ✅ Group Chat Complete, ✅ Push Notifications Complete, ✅ UI Enhancements Complete

---

## Current Focus

### Completed Today (October 21, 2025)

#### **Push Notifications (PR #10 - COMPLETE ✅)**
- ✅ Task 10.1: FCM Configuration complete
- ✅ Task 10.2-10.10: Notification service implementation
- ✅ Task 10.11: Firestore security rules updated for FCM tokens
- ✅ Hybrid notification system (local for Expo Go, remote for builds)
- ✅ Global notification listener for all conversations
- ✅ Missed message notifications when coming online
- ✅ Clean console output (removed debugging logs)
- ✅ EAS Build configuration complete

#### **UI Enhancements (Today)**
- ✅ Inverted FlatList for natural chat scrolling (newest at bottom)
- ✅ Read receipts update in real-time (not just on reload)
- ✅ Fixed notification spam on first login
- ✅ Logo added to ConversationListScreen header
- ✅ Expandable FAB menu (New Chat / New Group buttons)
- ✅ KeyboardAvoidingView for all input screens
- ✅ Group Details Screen with member list
- ✅ Clickable members in Group Details (navigate to profiles)
- ✅ "(You)" indicator beside current user's name
- ✅ Message timestamps show date AND time (e.g., "Yesterday 2:30 PM")

### All PRs Complete

- ✅ **PR #1 COMPLETE**: Project Setup & Configuration
- ✅ **PR #2 COMPLETE**: Authentication System
- ✅ **PR #3 COMPLETE**: Core Messaging Infrastructure (Data Layer)
- ✅ **PR #4 COMPLETE**: Chat UI & Real-Time Sync
- ✅ **PR #5 COMPLETE**: Presence & Typing Indicators
- ✅ **PR #9 COMPLETE**: Group Chat (Tasks 9.1-9.16)
- ✅ **PR #10 COMPLETE**: Push Notifications (Tasks 10.1-10.11, Hybrid System)
- ✅ **UI Enhancements COMPLETE**: Logo, FAB menu, Group Details, Keyboard handling, Timestamp improvements

### Next Steps

- Tasks 5.11-5.12: Unit Tests (deferred)
- Task 10.12: Unit Tests for Notification Service (deferred)
- Task 10.13: Manual Test Notifications in EAS Build
- PR #6: Read Receipts & Message States (partially implemented)
- PR #7: Image Sharing (future)
- PR #8: Offline Support (partially implemented with local DB and queue)
- PR #11: UI Polish & Error Handling (partially done)
- PR #12: Testing, Bug Fixes & Documentation

---

## Major Accomplishments

### Presence System (PR #5)
- Real-time online/offline status with AppState integration
- Last seen timestamps ("Last seen 5m ago")
- Green online indicators on avatars
- Chat header shows: typing (animated) → Online → Last seen → Offline
- Typing indicator: "messaging • • •" with animated dots in header
- Keyboard-driven typing lifecycle (persists while keyboard is up)
- No duplicate listeners, optimized for performance

### Group Chat (PR #9)
- Create groups with 3+ members
- Group conversations with real-time messaging
- Admin management system
- Member management (add/remove)
- Leave group functionality
- Group avatars and names
- Proper sender name display in group messages
- Typing indicators showing multiple users
- Group Details screen with:
  - Group info (name, description, icon, member count)
  - Member list with avatars
  - Admin badges
  - Clickable members (navigate to profiles/settings)
  - "(You)" indicator
  - Leave Group button

### Push Notifications (PR #10)
- **Hybrid System**:
  - Local notifications in Expo Go for development
  - Remote push notifications in EAS Build for production
  - Environment detection (`Constants.appOwnership`)
- **Global Notification Listener**:
  - Single listener for all conversations
  - Tracks last seen message per conversation
  - Only notifies for new messages from others
  - Works anywhere in the app (not just in chat)
- **Missed Message Notifications**:
  - Checks for messages received while offline
  - Notifies when user comes online
  - Prevents spam on first login/reload
- **FCM Integration**:
  - Firebase Cloud Messaging configured
  - Device token registration
  - Firestore security rules for FCM tokens
  - Clean error handling (silent in Expo Go)
- **Documentation**:
  - Comprehensive guides for FCM setup
  - Hybrid notification system explained
  - Testing without build instructions
  - Migration path to direct FCM documented

### Performance Optimizations
- **Zero Duplicate Messages**: Advanced deduplication with `useRef` tracking
- **Zero Message Jitter**: Inverted FlatList with proper scroll handling
- **Cache-First Loading**: Instant display from SQLite, background sync
- **User Profile Caching**: Global cache prevents "Unknown User" flashes
- **Thread-Safe SQLite**: Operation queue prevents concurrency errors
- **Real-Time Updates**: Read receipts, typing indicators, presence all update live
- **Optimized Scrolling**: Empty state mirroring fixed for inverted lists
- **Clean Console**: Removed debug logs, only essential production logs remain

### UI/UX Enhancements
- **Logo in Header**: App icon displayed beside "Pigeon" in ConversationListScreen
- **Expandable FAB Menu**: 
  - Main FAB with `+` icon
  - Expands to show "New Chat" and "New Group" buttons
  - Icons and labels for clarity
  - Semi-transparent overlay when open
- **Group Details Screen**:
  - Tappable header in group chats
  - Shows group info and member list
  - Admin badges for group admins
  - Clickable members (others → User Details, self → Settings)
  - "(You)" beside current user's name
  - Leave Group button
- **Keyboard Handling**:
  - `KeyboardAvoidingView` on ChatScreen, CreateGroupScreen, LoginScreen, SignupScreen
  - Proper offset for iOS/Android
  - Smooth keyboard interactions
- **Message Timestamps**:
  - Now show date AND time
  - "Yesterday 2:30 PM" instead of just "Yesterday"
  - "Jan 15 2:30 PM" for older messages
  - Consistent time display across all messages

---

## Technical Learnings from Recent Work

### Push Notifications
1. **Expo Go Limitations (SDK 53+)**: Remote push notifications don't work in Expo Go
   - Requires EAS Build or Expo Dev Client for full push notification testing
   - Solution: Hybrid system with local notifications for development
2. **Global vs. Per-Conversation Listeners**: 
   - Initially had notification logic in `useMessages` (per-conversation)
   - Moved to global `useGlobalNotifications` hook for app-wide coverage
   - Prevents duplicate listeners, ensures notifications work anywhere
3. **Preventing Notification Spam**:
   - Must mark existing messages as "seen" on initialization
   - Use `processedMessageIds` ref to track notified messages
   - Timestamp-based filtering for "missed messages"
   - Flag to prevent checks on initial app load
4. **Firebase Message Limit**: Default `getMessages` limit is 50
   - Can cause notification spam if user has >50 messages
   - Solution: Fetch all messages (`limit: 9999`) during initialization
5. **Silent Error Handling**: Expo Go shows errors for unavailable features
   - Must silently catch and ignore errors for better UX
   - `LogBox.ignoreLogs()` for in-app yellow warnings
   - Custom console filters for terminal output

### Group Chat
1. **Group Creation Validation**: Ensure at least 3 total members (creator + 2 others)
2. **Admin Management**: First creator is admin, can add/remove members
3. **Typing in Groups**: Show names of who's typing, with smart formatting
   - 1 user: "John is messaging"
   - 2 users: "John and Sarah are messaging"
   - 3+ users: "3 people are messaging"
4. **Group Details Navigation**: Tappable headers provide access to group/user info
5. **User Profile Access**: Different navigation based on user (self → Settings, others → User Details)

### Scrolling and Message Display
1. **Inverted FlatList**: Standard pattern for chat apps
   - Newest messages at bottom (natural)
   - Oldest at top (scroll up to see more)
   - Requires reversing array and mirroring empty state
2. **Empty State Mirroring**: Must apply both `scaleY: -1` and `scaleX: -1` to prevent horizontal flip
3. **Scroll to End**: Use `scrollToEnd()` with inverted list, not `scrollToOffset(0)`
4. **Optimistic Updates**: Insert at beginning of array for inverted list: `[optimisticMessage, ...prev]`

### Real-Time Updates
1. **Message Update Detection**: Must compare entire `readBy` object and `status` field
   - Not just check for new messages
   - Update existing messages when their fields change
2. **Firestore Listener Efficiency**: Compare before/after state to detect actual changes
3. **useEffect Dependency Arrays**: Stabilize with `useRef` to prevent listener churn

---

## Key Files Modified Today

### Notifications
- `App.tsx`: Added `GlobalNotificationListener`, `LogBox.ignoreLogs()`, console filters
- `src/hooks/useGlobalNotifications.ts`: Global notification listener with missed message handling
- `src/components/GlobalNotificationListener.tsx`: Wrapper component for global notifications
- `src/services/notifications/notificationService.ts`: Complete notification service (cleaned logs)
- `src/services/notifications/localNotificationHelper.ts`: Local notification helpers
- `src/services/firebase/authService.ts`: Device token management
- `src/store/context/AuthContext.tsx`: Silent push registration on login
- `src/components/common/NotificationBanner.tsx`: In-app notification banner
- `app.config.js`: FCM configuration, notification permissions
- `eas.json`: EAS Build configuration
- `firebase/firestore.rules`: Security rules for FCM tokens

### UI Enhancements
- `src/screens/main/ConversationListScreen.tsx`: Logo, expandable FAB menu
- `src/screens/group/GroupDetailsScreen.tsx`: Complete group details screen
- `src/navigation/MainNavigator.tsx`: Added GroupDetails route
- `src/screens/main/ChatScreen.tsx`: Navigation to GroupDetails, KeyboardAvoidingView
- `src/screens/group/CreateGroupScreen.tsx`: KeyboardAvoidingView
- `src/screens/auth/LoginScreen.tsx`: KeyboardAvoidingView
- `src/screens/auth/SignupScreen.tsx`: KeyboardAvoidingView
- `src/models/Message.ts`: Updated `formatTimestamp()` to show date + time
- `src/components/chat/MessageList.tsx`: Inverted FlatList, fixed empty state mirroring
- `src/hooks/useMessages.ts`: Real-time read receipt updates, optimistic insert order

### Documentation
- `docs/PUSH_NOTIFICATIONS.md`: Implementation and migration guide
- `docs/BACKGROUND_NOTIFICATIONS.md`: Background notification handling
- `docs/PR10_PUSH_NOTIFICATIONS_SUMMARY.md`: PR summary
- `docs/EXPO_GO_LIMITATIONS.md`: Expo Go push notification limitations
- `docs/FCM_SETUP_GUIDE.md`: Comprehensive FCM setup guide
- `docs/FCM_QUICKSTART.md`: Quick-start guide
- `docs/FCM_CHECKLIST.md`: Configuration checklist
- `docs/FCM_CONFIGURATION_COMPLETE.md`: Task 10.1 summary
- `docs/GOOGLE_SERVICES_EXPLAINED.md`: Why google-services.json is not a secret
- `docs/FIRESTORE_SECURITY_RULES.md`: Security rules documentation
- `docs/TESTING_NOTIFICATIONS_WITHOUT_BUILD.md`: Local testing guide
- `docs/HYBRID_NOTIFICATIONS.md`: Hybrid system documentation

---

## All Bugs Fixed

1. **Logout Permission Error (FIXED)**: Set user offline BEFORE `auth.signOut()`
2. **SQLite Concurrent Operations Error (FIXED)**: Added operation queue
3. **Message Timestamp Issues (FIXED)**: Handle null timestamps from `serverTimestamp()`
4. **Typing Indicator Bugs (FIXED)**: Keyboard-driven lifecycle, animated dots
5. **Duplicate Messages (FIXED)**: `useRef` deduplication, ref cleanup on unmount
6. **Duplicate Key Errors on Reload (FIXED)**: Clear `messageIdsRef` on logout/conversation change
7. **AppState Listener Churn (FIXED)**: Use `userIdRef` to stabilize dependencies
8. **User Set to Offline When Opening Chat (FIXED)**: Removed duplicate AppState listeners
9. **Typing Indicator Word Missing (FIXED)**: Changed to "messaging" with white color
10. **FirestoreService.getUserProfile Error (FIXED)**: Use `AuthService.getUserProfile`
11. **Notifications for All Messages (FIXED)**: Global listener with timestamp tracking
12. **expo-notifications Errors in Expo Go (FIXED)**: Silent error handling, `LogBox.ignoreLogs()`
13. **Deprecated removeNotificationSubscription (FIXED)**: Use `subscription.remove()`
14. **Notification Delays After Scrolling Changes (FIXED)**: Optimized scroll logic
15. **Incorrect Scrolling (FIXED)**: Reverted to inverted FlatList with proper empty state
16. **Old Message Notification on Reload (FIXED)**: `hasCheckedMissedOnInit` flag
17. **Read Receipts Not Real-Time (FIXED)**: Compare `readBy` and `status` in listener
18. **Notification Spam on First Login (FIXED)**: Fetch all messages during initialization (limit: 9999)

---

## Features Working

### Core Messaging
✅ Real-time one-on-one chat  
✅ Real-time group chat (3+ members)  
✅ Message persistence (SQLite cache)  
✅ Offline support with queue  
✅ Optimistic UI updates  
✅ Zero duplicate messages  
✅ Zero message jitter  
✅ Cache-first loading (instant display)  
✅ Inverted FlatList (natural scrolling)

### Presence & Typing
✅ Real-time online/offline presence tracking  
✅ Last seen timestamps ("Last seen 5m ago")  
✅ App state integration (foreground/background)  
✅ Green online indicators on avatars  
✅ Chat header shows: typing → Online → Last seen → Offline  
✅ Typing indicator: "messaging • • •" with animated dots in header  
✅ Typing persists while keyboard is up with text  
✅ Typing clears on keyboard dismiss  
✅ Typing re-appears on keyboard reopen if text exists

### Group Chat
✅ Create groups with name, description, icon  
✅ Select 3+ members (current user + 2 others minimum)  
✅ Admin management system  
✅ Add/remove group members  
✅ Leave group functionality  
✅ Group conversations with real-time sync  
✅ Sender names displayed in group messages  
✅ Group typing indicators (multiple users)  
✅ Group Details screen with member list  
✅ Clickable members (navigate to profiles)  
✅ Admin badges in member list  
✅ "(You)" indicator beside current user  

### Push Notifications
✅ Local notifications in Expo Go (development)  
✅ Remote push notifications in EAS Build (production)  
✅ Global notification listener (works anywhere in app)  
✅ Notifications for new messages from others  
✅ Missed message notifications when coming online  
✅ No notification spam on first login/reload  
✅ Device token registration and management  
✅ FCM integration complete  
✅ Firestore security rules for tokens  
✅ Clean error handling (silent in Expo Go)  
✅ In-app notification banner (foreground)  
✅ Navigation on notification tap

### UI/UX
✅ Dark mode theme throughout  
✅ Logo in ConversationListScreen header  
✅ Expandable FAB menu (New Chat / New Group)  
✅ Group Details screen  
✅ KeyboardAvoidingView for all input screens  
✅ Message timestamps show date AND time  
✅ Proper scroll handling (inverted FlatList)  
✅ Empty state correctly mirrored  
✅ Read receipts update in real-time  
✅ User profile caching (no "Unknown User" flashes)  
✅ Clean logout (no permission errors)  
✅ Thread-safe SQLite operations

---

## Visual Design

### Header Status Priority (Chat)
1. 🔵 **messaging • • •** ← Animated dots, primary color, italic (when typing)
2. 🟢 **Online** ← Green dot + "Online" text
3. ⏰ **Last seen 5m ago** ← Relative time
4. ⚫ **Offline** ← Default state

### Typing Animation
- 3 dots bouncing in sequence (0ms, 200ms, 400ms delay)
- Opacity: 0.4 → 1.0
- Duration: 400ms per cycle
- Uses `useNativeDriver: true` for 60fps performance

### Group Typing Display
- 1 user: "John is messaging • • •"
- 2 users: "John and Sarah are messaging • • •"
- 3+ users: "3 people are messaging • • •"

### FAB Menu
- Main FAB: Primary color, `+` icon (rotates to `×` when open)
- Secondary FABs: 
  - "New Chat" with chat bubble icon
  - "New Group" with people icon
  - Labels beside icons
- Semi-transparent overlay when open
- Smooth animations for expand/collapse

### Message Timestamps
- **Today**: `2:30 PM` (time only)
- **Yesterday**: `Yesterday 2:30 PM`
- **This year**: `Jan 15 2:30 PM`
- **Other years**: `Jan 15 2023 2:30 PM`

---

## Technical Stack (Final)

### Frontend
- React Native 0.81.4
- Expo SDK 54
- TypeScript 5.9.2
- React Navigation 7.x
- expo-notifications
- expo-sqlite
- expo-image-picker

### Backend
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Messaging
- Firebase Storage (ready for image sharing)
- Firebase Cloud Functions (ready for AI features)

### Tools
- EAS Build
- Expo Go (development)
- Git + GitHub
- VS Code

---

## Known Issues ⚠️

**None currently** - All major bugs have been fixed.

---

## Next Session Priorities 🎯

1. **Image Sharing (PR #7)**: Implement image upload and display
2. **Read Receipts Polish (PR #6)**: Complete read receipt system
3. **UI Polish (PR #11)**: Error handling, loading states, animations
4. **Testing (PR #12)**: Manual testing, bug fixes, documentation
5. **AI Features**: Implement persona-specific AI capabilities (post-MVP)

---

## Notes for Future Sessions

- **Memory Reset Reminder**: After session ends, memory resets completely. Read ALL memory bank files at start of next session.
- **Key Context Files**: This file (activeContext.md) + progress.md are most critical for understanding current state
- **Decision Log**: All major decisions documented here with rationale
- **PRD is Source of Truth**: Refer to PRD.md for detailed requirements, tech stack, and user stories
- **TASK_LIST.md**: Comprehensive task breakdown with file structure and implementation details

---

**Last Updated**: October 21, 2025, 11:00 PM CT
