# Active Context: Pigeon AI

**Last Updated**: October 21, 2025 - PR #4 In Progress (Avatar & User Details Complete) ✅  
**Current Phase**: Development - Chat UI Implementation  
**Status**: ✅ Auth Complete, ✅ Data Layer Complete, ✅ Avatar & User Profile System Complete, 🟡 Chat UI In Progress

---

## Current Focus

### What We're Doing Right Now
- ✅ **PR #1 COMPLETE**: Project setup finished, app running on Expo Go
- ✅ **PR #2 COMPLETE**: Authentication system fully functional with dark mode UI
- ✅ **PR #3 COMPLETE**: Core Messaging Infrastructure (Data Layer)
  - ✅ All 9 tasks completed (Tasks 3.1-3.9)
  - ✅ Models, services, context, hooks, security rules deployed
  - ✅ Firestore rules and indexes deployed to production
- 🎨 **UI UPDATE COMPLETE**: Color scheme matched to pigeon icon background (`#060C1D`)
- 🟡 **PR #4 IN PROGRESS**: Chat UI & Real-Time Sync
  - ✅ Tasks 4.1-4.13: Complete (Message Bubble, List, Input, Chat Screen, Conversation List, NewChat, Navigation, Date Formatter)
  - ✅ Task 4.14: Avatar Component, UserDetails Screen, User Profile Caching **COMPLETE**
  - ⏸️ Tasks 4.15-4.17: Testing tasks (deferred)

### PR #3 Accomplishments

1. **✅ Models Created** (Tasks 3.1-3.2)
   - Message model with 18 helper functions
   - Conversation model with 21 helper functions
   - Full Firestore timestamp conversion
   - Formatting, validation, and sorting utilities

2. **✅ Services Implemented** (Tasks 3.3-3.4)
   - **Firestore Service**: 19 functions for conversations, messages, typing indicators
   - **SQLite Service**: 8 core functions for local database operations
   - **Local Database Service**: 29 functions with offline queue, caching, sync tracking

3. **✅ State Management** (Tasks 3.5-3.7)
   - **ChatContext**: Complete provider with conversations, messages, offline sync
   - **useMessages Hook**: Real-time message management for conversations
   - **useConversations Hook**: Real-time conversation list management

4. **✅ Security** (Tasks 3.8-3.9)
   - Comprehensive Firestore security rules (authentication, authorization, validation)
   - Firestore indexes for optimized queries
   - **DEPLOYED TO PRODUCTION** (`pigeonai-dev`)

5. **🎨 UI Color Update**
   - Background color matched to icon: `#060C1D`
   - All secondary/tertiary colors adjusted for proper contrast
   - Text colors optimized for dark background readability
   - Splash screen and adaptive icons updated

---

## Key Learnings from PR #3 (Core Messaging Infrastructure)

### Technical Learnings

1. **Model Pattern**: Pure helper functions > classes
   - 18 functions for Message, 21 for Conversation
   - Immutable transforms (return new objects)
   - Easy to test, reusable across codebase
   - TypeScript ensures type safety

2. **Firestore Integration**: Timestamp conversion is critical
   - Firestore uses `Timestamp` type, JavaScript uses `Date`
   - Must convert in both directions (`toFirestore()`, `fromFirestore()`)
   - Helper functions handle this automatically
   - Prevents runtime errors

3. **SQLite for Offline**: expo-sqlite provides local persistence
   - Create tables with indexes for fast queries
   - Transaction support for atomic operations
   - JSON serialization for complex fields (readBy, participants)
   - Offline queue with retry logic

4. **React Context**: Powerful for global state
   - ChatContext manages all messaging state
   - Real-time listeners integrated
   - Network monitoring with NetInfo
   - Automatic cleanup on unmount

5. **Custom Hooks**: Encapsulate complex logic
   - `useMessages(conversationId)` - Single conversation
   - `useConversations()` - All conversations
   - Return loading, error, data, and actions
   - Reusable across components

6. **Security Rules**: Must be comprehensive
   - Default deny all
   - Authenticate + authorize (user must be participant)
   - Validate required fields (type, participants, timestamps)
   - Prevent senderId spoofing

7. **Firestore Indexes**: Required for complex queries
   - Composite index for conversations: `participants` + `updatedAt DESC`
   - Composite index for messages: `conversationId` + `timestamp DESC`
   - Firebase CLI for deployment (`firebase deploy --only firestore:indexes`)

8. **Color Theming**: Exact color match matters
   - Icon background: `#060C1D` (very dark navy)
   - Secondary: `#0F1A28`, Tertiary: `#1A2533`
   - Text colors must have sufficient contrast (WCAG AA)
   - Lighter text for readability: `#B0B3BA` (secondary), `#7A7D84` (tertiary)

9. **User Profile Caching**: Performance optimization critical for good UX
   - Global cache Map for user profiles (avoids repeated Firestore reads)
   - useUserProfile hook with caching layer
   - Display names fetched once and reused across components
   - Cache cleared on logout to prevent stale data

10. **Avatar System**: Reusable components save development time
    - Single Avatar component with multiple sizes (small, medium, large, xlarge)
    - Image display with initials fallback
    - Optional online status indicator
    - Integrated across all screens (conversations, chat, profile, user details)

11. **Navigation Serialization**: React Navigation requires serializable params
    - Don't pass complex objects (Conversation) through navigation
    - Pass only primitive types (strings, numbers, booleans)
    - Fetch complex data on destination screen using IDs
    - Prevents "non-serializable values" warnings

12. **Performance Patterns**: Cache-first loading for instant UI
    - Load from SQLite cache immediately (instant display)
    - Then set up real-time Firestore listener for updates
    - User sees data instantly, updates happen in background
    - Dramatically improves perceived performance

### Files Created (PR #4 - In Progress)
- `src/components/chat/MessageBubble.tsx` (message display)
- `src/components/chat/MessageList.tsx` (FlatList with real-time updates)
- `src/components/chat/MessageInput.tsx` (compose and send)
- `src/components/chat/ChatHeader.tsx` (tappable header)
- `src/screens/main/ChatScreen.tsx` (main chat interface)
- `src/components/conversation/ConversationListItem.tsx` (list item)
- `src/screens/main/ConversationListScreen.tsx` (home screen)
- `src/screens/main/NewChatScreen.tsx` (user search)
- `src/screens/main/ProfileScreen.tsx` (user profile & settings with cache management)
- `src/screens/main/UserDetailsScreen.tsx` (user details from chat header)
- `src/navigation/MainNavigator.tsx` (main app navigation)
- `src/utils/dateFormatter.ts` (timestamp formatting)
- `src/components/common/Avatar.tsx` (reusable avatar component)
- `src/components/common/index.ts` (barrel export)
- `src/hooks/useUserProfile.ts` (user profile caching hook)

### Files Created (PR #3)
- `src/models/Message.ts` (18 functions)
- `src/models/Conversation.ts` (21 functions)
- `src/services/firebase/firestoreService.ts` (19 functions)
- `src/services/database/sqliteService.ts` (8 functions)
- `src/services/database/localDatabase.ts` (29 functions)
- `src/store/context/ChatContext.tsx` (ChatProvider + useChat)
- `src/hooks/useMessages.ts`
- `src/hooks/useConversations.ts`
- `firebase/firestore.rules` (comprehensive security)
- `firebase/firestore.indexes.json` (query optimization)
- `firebase.json` (Firebase config)
- `.firebaserc` (project alias)

### What Worked Well
- Pure function pattern for models (testable, reusable)
- Firestore + SQLite dual-layer (online + offline)
- React Context for state management
- Custom hooks for specific features
- Comprehensive security rules (deployed)

### What to Improve (Post-MVP)
- Add unit tests for models and services
- Add integration tests for message flow
- Optimize Firestore reads (pagination, caching)
- Add retry logic for failed Firestore operations
- Message encryption (end-to-end)

---

## Key Learnings from PR #2 (Authentication System)

### UI/UX Insights
1. **Dark Mode First**: Users expect dark mode in messaging apps
   - Consistent color palette defined in constants
   - All screens designed with dark theme from start
   - Reduces eye strain, modern aesthetic

2. **Form Validation UX**: Real-time validation improves experience
   - Validate on blur, not on every keystroke (less annoying)
   - Show field-level errors clearly
   - Disable submit button when form invalid
   - Show loading states during async operations

3. **SafeAreaView Migration**: Deprecated `react-native` SafeAreaView
   - Use `react-native-safe-area-context` instead
   - Wrap entire app with `SafeAreaProvider`
   - Prevents content from overlapping notches/safe areas

4. **Icon Integration**: Custom branding matters even in MVP
   - Icon used on splash, login, signup screens
   - Color palette extracted from icon for consistency
   - Visual identity established early

5. **Spacing Refinement**: Small spacing tweaks have big impact
   - Reduced gaps between related elements
   - "Forgot password?" close to password field
   - "Sign up" link close to button
   - Improved visual hierarchy

### Technical Learnings
1. **Auth Persistence**: Firebase Auth needs explicit persistence
   - Use `initializeAuth` with `getReactNativePersistence(AsyncStorage)`
   - Without this, users logged out on app restart
   - Critical for mobile apps

2. **Presence Tracking**: Online/offline status requires careful management
   - Set online on app foreground
   - Set offline on app background/unmount
   - Update lastSeen timestamp
   - Use app state listener (`AppState.addEventListener`)

3. **Navigation Theme**: React Navigation needs explicit fonts
   - Must configure `fonts` in `NavigationContainer` theme
   - Use system fonts to avoid font loading issues
   - Set `dark: true` for dark mode

4. **Error Handling**: User-friendly errors are essential
   - Convert Firebase error codes to readable messages
   - "User not found" → "No account found with this email"
   - "wrong-password" → "Incorrect password"
   - Improves user experience significantly

### Files Created (PR #2)
- `src/models/User.ts` (11 functions)
- `src/services/firebase/authService.ts` (13 functions)
- `src/store/context/AuthContext.tsx` (AuthProvider + useAuth)
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/SignupScreen.tsx`
- `src/screens/auth/SplashScreen.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/utils/validators.ts` (5 validation functions)
- `src/navigation/AuthNavigator.tsx`
- `src/navigation/AppNavigator.tsx`

### What Worked Well
- Dark mode design looks professional
- Form validation prevents bad inputs
- Auth flow is smooth and intuitive
- Presence tracking ready for messaging features
- Context pattern makes auth state globally accessible

### What to Improve (Post-MVP)
- Add "Remember me" option
- Add social auth (Google, Apple)
- Add email verification flow
- Add profile picture upload
- Add password strength indicator

---

## Key Learnings from PR #1

### Setup Process Insights
1. **Expo SDK Versioning**: Expo Go app determines SDK version
   - User had SDK 54 on phone, so we upgraded project from SDK 52 to SDK 54
   - Important: Check Expo Go version before initializing project
   - Command: `npx expo install expo@latest` then `npx expo install --fix`

2. **Firebase Configuration**: Use Web SDK for Expo Go
   - Register **Web app** in Firebase Console (not iOS/Android native apps)
   - Use Firebase JS SDK (`firebase` package), not `@react-native-firebase`
   - Store credentials in `.env` with `EXPO_PUBLIC_` prefix
   - No need for `google-services.json` or `GoogleService-Info.plist`

3. **EAS Account Required**: Expo Go now requires EAS login
   - Even for local development, EAS account needed
   - Free tier is sufficient (no credit card)
   - Sign up at expo.dev/signup
   - Login: `npx expo login`

4. **Network Configuration**: Same WiFi Required
   - Computer and phone must be on same WiFi network
   - LAN mode is default (use tunnel mode if firewall blocks)
   - Windows Firewall may need exception for port 8081/8082
   - Manual URL entry more reliable than QR scan sometimes

5. **Package Installation**: Use correct commands
   - Expo managed packages: `npx expo install <package>`
   - NPM packages: `npm install <package>`
   - Force flag needed after major upgrades: `npm install --force`

6. **Cache Issues**: Clear cache after SDK upgrades
   - Metro cache can get corrupted: `npm start --clear`
   - Or delete `node_modules` and reinstall
   - Port conflicts: Use different port with `--port 8082`

7. **Missing Dependencies**: 
   - `babel-preset-expo` needed for SDK 54
   - `expo-asset` and `expo-font` required even if not used
   - Add plugins to `app.config.js`

### Tech Stack Finalized (PR #1)
- **Expo SDK**: 54.0.0 (latest)
- **React**: 19.1.0 (latest)
- **React Native**: 0.81.4 (latest for SDK 54)
- **TypeScript**: 5.9.2 (latest)
- **Firebase JS SDK**: 12.4.0 (latest)
- **React Navigation**: 7.x (latest)
- **Location**: us-east4 (Northern Virginia - closest to user)

---

## Recent Decisions

### Platform Selection: React Native + Expo
**Decided**: October 20, 2025  
**Rationale**:
- Cross-platform from day one (iOS + Android)
- Expo Go enables instant testing without building
- Fast iteration with hot reload
- Strong Firebase SDK support
- Large ecosystem of libraries
- No need for TestFlight/APK during MVP - just share QR code

**Alternative Considered**: iOS native (Swift) - better performance but React Native chosen for cross-platform reach

### Persona Selection: DEFERRED to Post-MVP
**Decided**: October 20, 2025  
**Rationale**: 
- Focus MVP purely on messaging infrastructure
- Choose persona AFTER proving the messaging foundation works
- Allows flexibility based on what works best
- Reduces scope pressure for 24-hour sprint

**Persona Options** (will choose one post-MVP):
1. Remote Team Professional
2. International Communicator
3. Busy Parent/Caregiver
4. Content Creator/Influencer

### Backend Selection: Firebase
**Decided**: October 20, 2025  
**Rationale**:
- Real-time sync built-in (saves weeks of work)
- Offline support handled automatically
- Generous free tier
- Scales to millions of users
- Excellent documentation and iOS SDK
- Fast setup (hours vs. days for custom backend)

**Alternative Considered**: Custom Node.js + PostgreSQL + WebSockets - more control but significantly more setup time

### AI Features: NOT in MVP
**Decided**: October 20, 2025  
**Rationale**:
- MVP must focus 100% on messaging infrastructure reliability
- AI features add complexity that could jeopardize core functionality
- Better to have perfect messaging + no AI than flaky messaging + AI
- AI features will be added in Phase 2 after persona selection

**Post-MVP AI Plan**:
1. Complete and test messaging MVP
2. Choose persona based on team preference
3. Design 5 required AI features + 1 advanced feature for that persona
4. Implement Cloud Functions for AI endpoints
5. Build AI interface (dedicated chat or contextual)
6. Test AI features thoroughly

---

## Open Questions

### 1. Read Receipt Privacy
**Question**: Should read receipts always be shown, or should users be able to disable them?  
**Impact**: Privacy vs. transparency trade-off  
**Decision Needed By**: Before implementing read receipts  
**Recommendation**: Always show for MVP (like WhatsApp default), add privacy toggle post-MVP

### 2. Group Size Limits
**Question**: Maximum users per group chat?  
**Impact**: Performance, UI complexity, Firestore read costs  
**Recommendation**: 50 users max for MVP (WhatsApp allows 256, but 50 is more than sufficient for testing)

### 3. Message History Limits
**Question**: How many messages to load initially? How far back to cache locally?  
**Impact**: Performance, storage, initial load time  
**Recommendation**: 
- Load last 50 messages initially
- Cache last 30 days locally
- Load more on scroll (pagination)

### 4. AI Request Rate Limits
**Question**: How many AI requests per user per hour?  
**Impact**: Cost management, preventing abuse  
**Recommendation**: 20 requests/hour per user for MVP (very generous, can tighten if abused)

### 5. TestFlight Distribution Timeline
**Question**: When to start TestFlight submission process?  
**Impact**: TestFlight review takes 24-48 hours  
**Recommendation**: Submit by hour 18-20 of MVP sprint to allow time for review

---

## Current Blockers

**None** - PRD is complete, awaiting user approval to begin implementation.

---

## What's Working Well

- **PRD Structure**: Comprehensive, covers all key areas
- **Persona Definition**: Clear understanding of target user and pain points
- **Technical Decisions**: Well-reasoned choices with clear rationale
- **Timeline**: Realistic 24-hour MVP breakdown

---

## What Needs Attention

- **User Approval**: Need confirmation on:
  - Persona selection (Remote Team Professional)
  - Platform choice (iOS native)
  - AI feature priorities
  - Any PRD adjustments

---

## Active Considerations

### Time Management
- 24 hours is tight for MVP
- Must prioritize ruthlessly: messaging reliability > feature count
- Plan to skip nice-to-haves if running behind:
  - Background push notifications (foreground only for MVP)
  - Advanced UI polish (basic polish is fine)
  - Complex animations (smooth scrolling is enough)

### Testing Strategy
- Test on physical devices early (don't wait until hour 20)
- Borrow second iPhone for real-time testing if needed
- Use Network Link Conditioner to simulate poor network
- Create test accounts: alice@test.com, bob@test.com, carol@test.com

### Cost Monitoring
- Set up Firebase budget alert at $50
- Monitor OpenAI usage (aim for <$20 during MVP testing)
- Use GPT-3.5 Turbo for development/testing, GPT-4 for final demo

### Fallback Plans
If significantly behind schedule:
1. **Hour 12**: If messaging not working, skip group chat (focus on 1-on-1)
2. **Hour 18**: If AI features not working, implement only 3 core features (summarization, action items, search)
3. **Hour 20**: If TestFlight blocked, prepare local demo with clear setup instructions

---

## Development Environment Status

**Setup Needed**:
- [ ] Node.js 18+ installed
- [ ] Expo project created (`npx create-expo-app pigeonai-week-2 --template blank-typescript`)
- [ ] Firebase project created (pigeonai-dev)
- [ ] Firebase services enabled (Auth, Firestore, Storage)
- [ ] Firebase WEB app registered (not iOS/Android)
- [ ] Firebase web config copied (apiKey, projectId, etc.)
- [ ] Firebase JS SDK installed (`npm install firebase`)
- [ ] Navigation packages installed
- [ ] `firebaseConfig.ts` created with initialization
- [ ] Test app runs on Expo Go (scan QR code)
- [ ] Test accounts created (alice@test.com, bob@test.com, carol@test.com)

---

## Communication & Collaboration

**Demo Strategy**: 
- Record demo video showing all features
- Two-device setup for real-time messaging
- Show offline scenario clearly
- Demonstrate all 6 AI features with clear examples

**Documentation Plan**:
- README with setup instructions
- Architecture diagram
- API documentation for Cloud Functions
- Persona brainlift (1-page document)

---

## Key Metrics to Track During Development

### Functional Metrics
- [ ] Message delivery success rate (target: 100% in testing)
- [ ] Message latency (target: <1 second real-time)
- [ ] Offline-to-online sync time (target: <5 seconds for 100 messages)
- [ ] AI response time (target: <10 seconds)

### Development Velocity
- Hour 6: Authentication + basic UI ✅
- Hour 12: Core messaging working ✅
- Hour 18: All essential features + basic AI ✅
- Hour 24: Polished, tested, documented ✅

---

## Dependencies & Prerequisites

### Required Before Starting
1. Node.js 18+ installed
2. npm or yarn package manager
3. Firebase account (free tier is sufficient)
4. VS Code or preferred code editor
5. Physical device with Expo Go app installed (iOS or Android)
   - Download Expo Go from App Store (iOS) or Play Store (Android)
   - Or use Android emulator / iOS simulator

### Optional But Helpful
- React Native Debugger
- Firebase Emulator Suite for local backend testing
- Postman for API testing (if building Cloud Functions post-MVP)
- Multiple physical devices for real-time testing

---

## Risk Management

### Top Risks

**Risk 1: Firebase setup complexity**  
**Mitigation**: Follow Firebase iOS quickstart guide, allocate 1 hour for setup  
**Contingency**: Use Firebase Emulator locally if deployment issues

**Risk 2: Push notifications don't work**  
**Mitigation**: Start with foreground notifications only (simpler)  
**Contingency**: Skip background notifications for MVP, document as post-MVP feature

**Risk 3: AI features take too long**  
**Mitigation**: Implement simplest version of each feature first  
**Contingency**: Reduce from 6 features to 3 core features if needed

**Risk 4: Real-time sync issues**  
**Mitigation**: Use Firestore's built-in real-time listeners (battle-tested)  
**Contingency**: Add manual refresh button if auto-sync problematic

**Risk 5: Expo Go limitations**  
**Mitigation**: Use only Expo-compatible packages, check compatibility before installing  
**Contingency**: Use Expo Dev Client if need native modules not in Expo Go

---

## Post-MVP Roadmap (If Time Permits)

**Early Submission (4 days)**:
- Background push notifications
- Contextual AI features (long-press to translate/summarize)
- Message search (non-AI, local)
- UI polish and animations
- Enhanced group chat features

**Final Submission (7 days)**:
- Advanced AI: Full multi-step agent
- Voice messages
- Message editing/deletion
- Enhanced media support
- Performance optimizations
- Comprehensive testing

---

## Notes for Future Sessions

- **Memory Reset Reminder**: After session ends, memory resets completely. Read ALL memory bank files at start of next session.
- **Key Context Files**: This file (activeContext.md) + progress.md are most critical for understanding current state
- **Decision Log**: All major decisions documented here with rationale
- **PRD is Source of Truth**: Refer to PRD.md for detailed requirements, tech stack, and user stories

