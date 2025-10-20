# Pigeon AI - Product Requirements Document

**Version**: 2.0  
**Date**: October 20, 2025  
**Project Timeline**: 7 days (MVP due in 24 hours)  
**Project Type**: Cross-Platform Messaging Application with AI Features

---

## Executive Summary

Pigeon AI is a real-time messaging platform built with React Native and Firebase. The MVP focuses exclusively on building rock-solid messaging infrastructure: one-on-one chat, group messaging, real-time sync, offline support, and push notifications. **AI features and persona selection will come AFTER the MVP is complete.**

**Core Value Proposition**: A messaging app that works flawlessly anywhere (online, offline, poor connection). WhatsApp-like reliability with modern React Native architecture.

**MVP Philosophy**: Messaging infrastructure first. AI features second. A simple, reliable messaging app beats any feature-rich app with flaky message delivery.

---

## MVP SCOPE (24 Hours - Tuesday Deadline)

### What's IN Scope for MVP

**Core Messaging Infrastructure ONLY**:
✅ One-on-one chat functionality  
✅ Real-time message delivery between 2+ users  
✅ Message persistence (survives app restarts)  
✅ Optimistic UI updates (messages appear instantly)  
✅ Online/offline status indicators  
✅ Message timestamps  
✅ User authentication (users have accounts/profiles)  
✅ Basic group chat functionality (3+ users)  
✅ Message read receipts  
✅ Push notifications (at least foreground)  
✅ Deployment on Expo Go with deployed Firebase backend  

### What's OUT of Scope for MVP

❌ **AI features** (thread summarization, action items, smart search, etc.)  
❌ **Persona selection** (will choose after MVP)  
❌ **Advanced media** (video, voice messages, files)  
❌ **Message editing/deletion**  
❌ **End-to-end encryption**  
❌ **Voice/video calls**  

**Post-MVP**: Once messaging infrastructure is solid, we'll choose a persona (Remote Team Professional, International Communicator, Busy Parent, or Content Creator) and build AI features tailored to their needs.

---

## MVP User Stories

### Core Messaging Functionality

**As a user**, I want to:
- Send and receive messages instantly so I can have real-time conversations
- See my message history even when offline so I can reference past discussions without connectivity
- Know when other users are online so I can gauge availability
- See when my message has been delivered and read so I know if it was seen
- Send images so I can share photos
- Participate in group conversations with 3+ people
- Receive notifications when someone messages me so I don't miss communications
- Have a smooth, responsive app that works reliably on poor connections

---

## Key Features for MVP (24 Hours)

### 1. Core Messaging Infrastructure

#### 1.1 One-on-One Chat
- Send and receive text messages between two users
- Real-time message delivery (appears instantly for online users)
- Message input field with send button
- Scrollable message history
- Message bubbles with sender indication
- Character limit: 10,000 characters per message

#### 1.2 Message Persistence
- All messages stored locally using SQLite (via expo-sqlite)
- Message history survives app restarts
- Offline message viewing (read past messages without connection)
- Data model: messageId, senderId, recipientId, content, timestamp, status

#### 1.3 Message Delivery States
- **Sending**: Message sent from client, awaiting server confirmation
- **Sent**: Server received and stored the message
- **Delivered**: Message delivered to recipient's device
- **Read**: Recipient opened the conversation and viewed the message
- Visual indicators: single checkmark (sent), double checkmark (delivered), blue double checkmark (read)

#### 1.4 Optimistic UI Updates
- Messages appear instantly in sender's UI when send button is tapped
- Local message ID assigned immediately
- UI updates when server confirms (sync local ID to server ID)
- If send fails, show retry button and error state
- Messages never lost—retry logic persists through app restarts

#### 1.5 Real-Time Sync
- WebSocket connection for instant message delivery
- Messages push to online recipients within 1 second
- Reconnection logic on network changes
- Handle poor network conditions (3G, packet loss, intermittent WiFi)
- Queue messages when offline, sync when connection returns

#### 1.6 Presence Indicators
- Online/offline status for each user
- "Last seen" timestamp for offline users
- Typing indicators ("User is typing...")
- Update presence on app state changes (foreground, background, terminated)

### 2. Group Chat

#### 2.1 Group Functionality
- Create group with 3+ participants
- Group name and optional group icon
- Send messages to group (delivered to all members)
- Show sender name/avatar for each message
- Individual read receipts per member (optional: show "Read by 3/5")
- Typing indicators in groups ("John is typing...")

#### 2.2 Group Management
- Add/remove participants (group admin only)
- Leave group option for members
- Group member list with online status

### 3. User Authentication & Profiles

#### 3.1 Authentication
- Sign up with email/password or phone number
- Login flow with session management
- Password reset capability
- Secure token storage (Keychain/KeyStore)

#### 3.2 User Profiles
- Display name (required)
- Profile picture (optional, default avatar)
- Bio/status message (optional)
- User ID (unique, immutable)

### 4. Media Support

#### 4.1 Image Sharing (MVP)
- Select image from gallery
- Take photo with camera
- Image compression before upload
- Image thumbnails in chat
- Tap to view full-screen image
- Download indicator while loading

#### 4.2 Future Media (Non-MVP)
- Video sharing
- Voice messages
- File sharing (documents, PDFs)
- Location sharing

### 5. Push Notifications

#### 5.1 Notification Requirements (MVP)
- Foreground notifications working (messages received while app is open)
- Basic notification with message preview and sender name
- Tap notification to open relevant chat

#### 5.2 Full Notification Support (Nice-to-Have)
- Background notifications (app closed or backgrounded)
- Notification badges (unread count)
- Notification actions (reply from notification)

### 6. UI/UX Essentials

- Chat list showing all conversations
- Unread message indicators
- Timestamp for each message (smart formatting: "Just now", "2m ago", "Yesterday", "Jan 15")
- Message input field with multi-line support
- Pull-to-refresh message history
- Smooth scrolling performance (60 fps)
- Loading states for async operations
- Error states with retry options
- Offline mode indicator

### 7. Profile Management

#### 7.1 User Profile
- Display name (required)
- Profile picture (optional, can use initials as default)
- Bio/status message (optional)
- Account settings (change password, logout)

#### 7.2 Privacy Settings (Nice-to-Have)
- Read receipt toggle
- Last seen visibility
- Profile photo visibility

---

## Tech Stack

### Mobile Platform: **React Native with Expo**

**Rationale**: 
- Cross-platform from day one (iOS + Android)
- Expo Go enables instant testing without building
- Fast iteration with hot reload
- Strong Firebase SDK support
- Large ecosystem of libraries
- Easier to find React Native developers

**Deployment**: Expo Go (no need for TestFlight/APK during MVP)

### Frontend (React Native) - ✅ INSTALLED (PR #1)

**Core Stack (Latest Versions)**:
- **Expo SDK 54.0.0** - Development platform and tooling
- **React 19.1.0** - UI library
- **React Native 0.81.4** - Cross-platform mobile framework
- **TypeScript 5.9.2** - Type safety
- **Firebase JS SDK 12.4.0** - Firebase web SDK (Expo Go compatible)

**Expo Packages**:
- **Expo Go** - Instant testing via QR code (requires EAS account)
- **React Navigation 7.x** - Navigation (Stack + Tabs)
- **expo-sqlite** - Local persistence
- **expo-notifications** - Push notifications (integrates with FCM via Expo Push Service)
- **expo-image-picker** - Image selection
- **expo-asset** - Asset management (required by SDK 54)
- **expo-font** - Font loading (required by SDK 54)

**Firebase JS SDK Modules**:
- **firebase/auth** - User authentication
- **firebase/firestore** - Real-time database
- **firebase/storage** - Image/media storage
- **firebase/messaging** - Push notifications (via Expo Push Service)

**Utilities**:
- **@react-native-async-storage/async-storage** - Simple key-value storage
- **@react-native-community/netinfo** - Network monitoring
- **react-native-gifted-chat** - Chat UI components
- **React Context** - State management

**Build Tools**:
- **babel-preset-expo** - Babel preset for transpiling
- **@babel/core 7.26.0** - Babel compiler

**Note**: Using Firebase JS SDK (not `@react-native-firebase`) for Expo Go compatibility. All packages upgraded to latest versions compatible with Expo SDK 54.

### Backend - ✅ CONFIGURED (PR #1)

#### Firebase (Implemented for MVP)

**Firebase Project**: `pigeonai-dev`  
**Region**: us-east4 (Northern Virginia - optimized for user location)  
**Configuration**: Web app registered (for Firebase JS SDK compatibility)

**Services Enabled**:
- ✅ **Firebase Authentication** - Email/password enabled
- ✅ **Firebase Firestore** - Test mode enabled for development
  - Collections: users, conversations, messages, groups
  - Real-time listeners for instant updates
  - Offline persistence built-in
- ✅ **Firebase Cloud Messaging (FCM)** - Auto-enabled
  - Integrates with Expo Push Service for notifications
- ✅ **Firebase Storage** - Enabled for image/media storage
- 🔜 **Firebase Cloud Functions** - Deferred to post-MVP (for AI features)
  - Will handle AI API calls (OpenAI/Anthropic)
  - Push notification triggers
  - Message processing pipelines

**Configuration Files**:
- `src/services/firebase/firebaseConfig.ts` - Firebase initialization
- `.env` - Firebase credentials (not committed)
- `env.example` - Environment variable template

**Why Firebase**:
- Real-time sync out of the box
- Handles offline scenarios automatically
- Generous free tier (sufficient for MVP)
- Fast setup (completed in PR #1)
- Excellent Firebase JS SDK support for Expo Go

#### Option 2: Custom Backend (If Time Permits)
- **Node.js** with **Express** or **Fastify**
- **PostgreSQL** with **Supabase** for real-time features
- **Socket.IO** for WebSockets
- **AWS S3** for media storage
- Deployed on **Railway** or **Render**

**Decision**: Firebase for MVP (real-time sync built-in, fast setup, scales easily)

### AI & Agent Infrastructure (POST-MVP)

**Not included in MVP. Will be implemented after messaging infrastructure is solid and persona is chosen.**

Future AI stack will include:
- **LLM Provider**: OpenAI GPT-4 or Anthropic Claude
- **Agent Framework**: AI SDK by Vercel
- **RAG Implementation**: For conversation history retrieval
- **Cloud Functions**: Serverless endpoints for AI features

### Deployment - ✅ SETUP COMPLETE (PR #1)

- **Expo Go** - Instant deployment via QR code (no app store needed for MVP)
  - Requires free EAS account (expo.dev/signup)
  - Computer and phone must be on same WiFi
  - QR code or manual URL entry (`exp://192.168.1.XXX:8081`)
- **Firebase Console** - Backend management
- **Environment Management**: 
  - Development: `pigeonai-dev` (us-east4)
  - Production: `pigeonai-prod` (future)

### Development Tools - ✅ SETUP COMPLETE (PR #1)

- **VS Code** - IDE (with React Native Tools extension)
- **Node.js** 18+ - Required for React Native
- **Git** + **GitHub** - Version control
- **Expo CLI** - Development tooling (`npx expo start`)
- **EAS Account** - Required for Expo Go (free tier, no credit card)
- **Expo Go App** - Mobile testing app (iOS/Android)
- **Firebase Console** - Backend service management
- **Firebase Emulator Suite** - Local backend testing (optional)
- **React Native Debugger** - Debugging (optional)
- **Postman** - API testing (optional, for future Cloud Functions)

**Development Environment**:
- OS: Windows 10
- Package Manager: npm
- Network: Same WiFi for computer and phone
- Ports: 8081 (default), 8082 (backup)

**Key Setup Steps Completed**:
1. ✅ Expo SDK 54 project initialized
2. ✅ All dependencies installed
3. ✅ Firebase project created and configured
4. ✅ EAS account created and logged in
5. ✅ App tested successfully on physical device via Expo Go

---

---

# POST-MVP FEATURES

Everything below this line is **NOT** part of the MVP. These will be added after the core messaging infrastructure is proven reliable.

---

## Phase 2: Persona Selection & AI Features (Post-MVP)

### Persona Options

After MVP is complete, we'll choose **ONE** persona and build AI features for them:

1. **Remote Team Professional** - Thread summarization, action items, decision tracking, smart search, proactive scheduling
2. **International Communicator** - Real-time translation, language detection, cultural context, formality adjustment
3. **Busy Parent/Caregiver** - Calendar extraction, decision summarization, priority highlighting, RSVP tracking
4. **Content Creator/Influencer** - Auto-categorization, response drafting, FAQ auto-responder, sentiment analysis

Each persona requires **5 core AI features + 1 advanced feature** (multi-step agent or context-aware smart replies).

### AI Implementation (Post-MVP)

**Not building this in MVP.** After messaging works perfectly:
1. Choose persona based on team interest and user feedback
2. Design AI features specific to that persona
3. Implement Cloud Functions for AI endpoints
4. Build AI assistant interface (dedicated chat or contextual UI)
5. Integrate OpenAI/Claude with RAG pipeline
6. Test AI features thoroughly

---

## Non-MVP Messaging Features

These features are explicitly **out of scope** for the MVP (24 hours). They may be added in later phases.

### Enhanced Messaging Features
- Message editing (after send)
- Message deletion (delete for me / delete for everyone)
- Voice messages
- Video messages
- File sharing (PDFs, documents)
- Location sharing
- Contact sharing
- Message forwarding
- Message reactions (emoji reactions)
- Message threading (reply to specific message)
- Pinned messages
- Archived conversations
- Mute conversations
- Broadcast lists

### Advanced Group Features
- Group admin roles
- Group permissions (who can send messages, add members)
- Group announcements mode
- Group invite links
- Group description and settings

### Rich Media & Formatting
- Video calls
- Voice calls
- Screen sharing
- Rich text formatting (bold, italic, code blocks)
- Markdown support
- Link previews
- Animated GIFs
- Stickers

### Advanced AI Features (Beyond Basic MVP)
- **Contextual AI Features**: Long-press message to translate, summarize, or extract action items
- **Inline Smart Replies**: AI-suggested responses as user types
- **Proactive Notifications**: "You have 3 unread action items"
- **AI-Powered Insights Dashboard**: Weekly summary of key discussions, decisions, and action items
- **Meeting Coordination Agent**: Fully autonomous multi-step agent that schedules meetings
- **Sentiment Analysis**: Detect tone and urgency in messages
- **Auto-categorization**: Automatically tag conversations (work, personal, urgent)
- **Voice-to-Text with AI Enhancement**: Transcribe voice messages and extract action items

### Security & Privacy Enhancements
- End-to-end encryption (E2EE)
- Message disappearing / auto-delete
- Screenshot detection
- Biometric authentication (Face ID, Touch ID)
- Two-factor authentication (2FA)
- Block/report users
- Privacy settings (who can message me, who can see my profile)

### Platform Expansion
- Web app (React)
- Desktop apps (Electron or Tauri)
- Native apps (iOS Swift, Android Kotlin) - if React Native performance isn't sufficient

### Performance & Scale Optimizations
- Message pagination (load older messages on scroll)
- Virtual scrolling for large chats
- Image lazy loading
- Background sync optimization
- Battery optimization
- Data usage optimization

### Analytics & Monitoring
- Usage analytics
- Crash reporting
- Performance monitoring
- AI feature usage metrics
- Message delivery success rates

---

## Technical Considerations & Potential Pitfalls

### 1. Real-Time Sync Challenges

**Challenge**: Messages must appear instantly (<1 second latency) while handling offline scenarios gracefully.

**Considerations**:
- **Firestore Limitations**: Firestore listeners are excellent for real-time updates, but understand the pricing model (reads/writes/deletes). Each listener snapshot counts as a read.
- **WebSocket Management**: If using custom backend, WebSocket connections can drop. Implement exponential backoff reconnection strategy.
- **Offline Queue**: Messages sent while offline must queue locally and sync when connection returns. Handle partial send failures.
- **Message Ordering**: Ensure messages appear in correct chronological order even with network delays. Use server-side timestamps, not client timestamps.
- **Conflict Resolution**: What happens if two messages are sent simultaneously? Server timestamp should be source of truth.

**Mitigation**:
- Use Firestore's built-in offline persistence
- Implement optimistic UI updates with rollback on failure
- Display clear message status indicators
- Test extensively with airplane mode and network throttling

### 2. Message Delivery Reliability

**Challenge**: Zero message loss—every message must eventually deliver, even through app crashes.

**Considerations**:
- **Optimistic Updates Gone Wrong**: User sends message, app crashes before server confirms. On restart, message must still send.
- **Duplicate Messages**: Network retries could cause duplicate sends. Use idempotency keys or unique message IDs.
- **Delivery Confirmation**: How do we track that a message was delivered to recipient's device vs. stored on server?
- **Read Receipts**: Should read receipts update in real-time? What if user is viewing chat but not focused on latest message?

**Mitigation**:
- Persist messages to local database **before** showing in UI
- Use unique client-generated message IDs
- Implement retry logic with exponential backoff
- Use Firestore transactions for critical writes
- Add "delivery" collection to track which devices have received which messages

### 3. Offline Support Complexity

**Challenge**: App must work smoothly offline, then sync when connectivity returns.

**Considerations**:
- **Offline Writes**: Messages sent offline must persist locally and sync later
- **Stale Data**: User views offline data, goes online—how do we merge remote updates?
- **Storage Limits**: How much chat history do we store locally? What if user has 10,000 messages?
- **Sync Conflicts**: User sends message offline, recipient also sends message offline—how do we merge?

**Mitigation**:
- Use Firestore's offline persistence (handles most of this automatically)
- Implement data pruning strategy (keep last 30 days locally, fetch older messages on demand)
- Clear visual indicators when in offline mode
- Test offline-to-online transition extensively

### 4. Push Notification Challenges

**Challenge**: Notifications must work reliably on iOS, including background and killed states.

**Considerations**:
- **APNs Complexity**: Apple Push Notification service requires proper certificate setup
- **iOS Background Restrictions**: Notification delivery when app is terminated requires FCM or APNs
- **Silent Push**: May want silent push to sync messages in background (iOS limits this)
- **Notification Payload Size**: Limited to 4KB
- **Permission Handling**: User might deny notification permissions

**Mitigation**:
- Use Firebase Cloud Messaging (abstracts APNs complexity)
- Request notification permissions at appropriate time (not on app launch)
- Implement fallback: if user denies notifications, show in-app alert for new messages
- For MVP, focus on foreground notifications first
- Test on physical device (simulator doesn't support real push notifications)

### 5. AI Feature Performance & Latency (POST-MVP)

**Note**: AI features are NOT in MVP. This consideration applies to post-MVP phases.

**Challenge**: AI responses (GPT-4, Claude) can take 2-10 seconds, impacting user experience.

**Considerations**:
- **User Expectations**: Users expect instant messaging. AI features that take 5+ seconds feel slow.
- **Cost**: Each AI API call costs money. A user asking "Summarize my last 100 messages" could cost $0.10-0.50 per request.
- **Rate Limits**: OpenAI API has rate limits. Exceeding them causes failures.
- **Context Length**: GPT-4 has context limits (128K tokens). Summarizing a 500-message thread might exceed this.
- **Prompt Engineering**: Bad prompts = bad results. Needs iteration.

**Mitigation**:
- Show loading indicators for AI operations
- Implement caching: cache summaries for 1 hour, regenerate if new messages arrive
- Use streaming responses where possible (text appears progressively)
- Rate limit users: max 10 AI requests per minute per user
- Implement token counting before API calls to prevent exceeding limits
- Use cheaper models (GPT-3.5) for simple tasks, GPT-4 for complex reasoning
- Add retry logic with exponential backoff for API failures

### 6. RAG Pipeline Complexity (POST-MVP)

**Note**: RAG is NOT in MVP. This consideration applies to post-MVP AI features.

**Challenge**: AI agent needs access to user's conversation history to provide useful answers.

**Considerations**:
- **Data Volume**: User might have thousands of messages. Can't send all to LLM.
- **Embeddings**: Need to generate embeddings for messages, store in vector database, perform similarity search.
- **Latency**: Retrieval adds latency (search DB, fetch messages, send to LLM).
- **Accuracy**: Semantic search might not return the most relevant messages.
- **Privacy**: Sending messages to OpenAI might concern users (data privacy).

**Mitigation**:
- For MVP, use simple time-based retrieval (last N messages) instead of full vector search
- Limit context to 1000 messages (recent conversations)
- Implement basic keyword search first, add vector search later
- Be transparent about data privacy (include in terms of service)
- Consider running local LLMs (Llama 3, etc.) if privacy is critical (much harder, not for MVP)

### 7. Group Chat Complexity

**Challenge**: Group chats have N-to-N message delivery, increasing complexity.

**Considerations**:
- **Delivery Tracking**: With 5 group members, one message = 5 delivery receipts to track
- **Read Receipts**: Show "Read by 3/5" or individual checkmarks?
- **Typing Indicators**: If 3 people are typing, how do we display that?
- **Push Notifications**: Should every group message trigger a push? Can get spammy.
- **Message Ordering**: Even more critical in groups (multiple senders)

**Mitigation**:
- Simplify read receipts for MVP (just show if delivered, not per-person read status)
- Limit typing indicators to "Someone is typing..."
- Implement notification muting per conversation
- Use server-side timestamps for message ordering
- Test with 3-5 users in a group first, then scale

### 8. iOS-Specific Challenges

**Challenge**: iOS app lifecycle, memory management, and platform constraints.

**Considerations**:
- **React Native Bridge**: JavaScript <-> Native bridge can be slow for heavy operations
- **Expo Limitations**: Some native modules aren't available in Expo Go (require custom dev client)
- **App State Management**: Apps can be killed by OS, need to handle gracefully
- **Memory Management**: Large lists can cause performance issues without optimization
- **Platform Differences**: iOS and Android behave differently (notifications, permissions, storage)
- **Debugging Challenges**: Errors can be cryptic, especially with native modules

**Mitigation**:
- Use FlatList with virtualization for message lists (render only visible items)
- Implement AppState listeners to detect when app goes to background/foreground
- Use React Native Performance Monitor to identify bottlenecks
- Test on both iOS and Android physical devices early
- Use Expo Dev Client if need native modules not in Expo Go
- Keep most logic in JavaScript (minimize bridge calls)
- Use Hermes engine for better performance

### 9. Data Modeling & Database Schema

**Challenge**: Poor data model makes features hard to add later.

**Considerations**:
- **Message Model**: What fields? (id, senderId, recipientId, content, timestamp, status, type)
- **Group Messages**: How to model? Separate collection or same as DM?
- **Read Receipts**: Store per-user read status or just last read timestamp?
- **Conversation List**: How to efficiently query "all conversations for user X" with last message preview?
- **Deleted Messages**: Hard delete or soft delete (mark as deleted)?

**Mitigation**:
- Design Firestore schema upfront (see suggested schema below)
- Use subcollections for scalability
- Index strategically for common queries
- Plan for soft deletes (add `deleted: true` field)

**Suggested Firestore Schema**:
```
/users/{userId}
  - displayName, profilePictureUrl, bio, createdAt, lastSeen, isOnline

/conversations/{conversationId}
  - type: "dm" | "group"
  - participants: [userId1, userId2, ...]
  - lastMessage: {senderId, content, timestamp}
  - createdAt, updatedAt

/conversations/{conversationId}/messages/{messageId}
  - senderId, content, timestamp, type: "text" | "image"
  - status: "sending" | "sent" | "delivered" | "read"
  - readBy: {userId: timestamp, ...}

/groups/{groupId}
  - name, iconUrl, adminIds, memberIds, createdAt
```

### 10. Security Vulnerabilities

**Challenge**: Messaging apps are prime targets for security issues.

**Considerations**:
- **Authentication**: Weak auth = account takeover
- **Message Spoofing**: Can user A send a message claiming to be from user B?
- **API Keys**: Exposing OpenAI API key in client = unlimited spending
- **XSS/Injection**: If displaying user content, risk of script injection
- **IDOR**: Can user A read user B's private messages by guessing conversation IDs?

**Mitigation**:
- Use Firebase Auth (battle-tested)
- Validate sender on backend (use auth token)
- **Never** put API keys in mobile app—use Cloud Functions
- Sanitize all user input before display
- Use Firestore Security Rules to enforce access control
- Never trust client-side data—validate on server

**Sample Firestore Security Rules**:
```javascript
match /conversations/{conversationId}/messages/{messageId} {
  allow read: if request.auth.uid in resource.data.participants;
  allow create: if request.auth.uid == request.resource.data.senderId;
}
```

### 11. Testing Scenarios (Critical for MVP)

**Challenge**: Messaging apps have complex state management. Need systematic testing.

**Testing Checklist**:
1. ✅ Two devices chatting in real-time (messages appear within 1 second)
2. ✅ User A sends message, User B is offline, User B comes online → message delivers
3. ✅ Send message, force quit app, reopen → message sent
4. ✅ Send 20 messages rapidly → all deliver in order
5. ✅ Airplane mode → message queues → exit airplane mode → message sends
6. ✅ Poor network (throttled to 3G) → messages still deliver (just slower)
7. ✅ Group chat with 3 users → messages deliver to all
8. ✅ Background app → receive message → push notification appears
9. ✅ AI command "Summarize conversation" → returns summary within 10 seconds
10. ✅ Restart app → chat history loads correctly

**Mitigation**:
- Test on two physical iPhones if possible
- Use network throttling tools (Chrome DevTools, React Native Debugger) to simulate poor networks
- Test in simulator for rapid iteration, then validate on device
- Create test accounts: alice@test.com, bob@test.com

### 12. Cost Management

**Challenge**: Firebase, OpenAI, and other services can get expensive if not monitored.

**Considerations**:
- **Firestore**: Reads/writes are billed. Real-time listeners can rack up reads quickly.
- **OpenAI API**: GPT-4 is $0.03/1K input tokens, $0.06/1K output tokens. Heavy usage = high costs.
- **Firebase Storage**: Image uploads consume storage and bandwidth.
- **Cloud Functions**: Billed per invocation and compute time.

**Mitigation**:
- Set up Firebase budget alerts ($50, $100)
- Cache AI responses aggressively
- Limit AI requests per user (10/minute, 100/day)
- Use GPT-3.5 Turbo instead of GPT-4 where possible (10x cheaper)
- Optimize Firestore queries (don't listen to entire collections)
- Implement pagination (don't load all messages at once)
- Monitor costs daily during development

---

## Success Metrics (How We Know MVP is Working)

### Functional Requirements
- ✅ Two users can exchange messages in real-time (<2 second latency)
- ✅ Messages persist through app restart
- ✅ Offline scenario: messages queue and deliver when online
- ✅ Group chat with 3+ users works
- ✅ Read receipts update correctly
- ✅ Typing indicators show
- ✅ Push notifications trigger (at least foreground)
- ✅ Images can be sent and received
- ✅ User authentication works (signup, login, logout)
- ✅ App runs on Expo Go (both iOS and Android)

### Performance Benchmarks
- Message delivery latency: <1 second (online)
- App launch time: <3 seconds on Expo Go
- Message list scrolling: 60 fps (smooth with FlatList)
- Offline-to-online sync: <5 seconds for 100 messages
- Image loading: Progressive (show thumbnails immediately)

### User Experience Goals
- Intuitive UI (new user can send a message within 30 seconds)
- No message loss (100% delivery rate for sent messages)
- Graceful error handling (network errors show retry options)
- Smooth animations and transitions

---

## Timeline & Milestones

### MVP Phase (0-24 hours) - Tuesday Deadline
**Goal**: Functional messaging app with rock-solid infrastructure (NO AI features)

**Hour 0-4: Foundation**
- [ ] React Native + Expo project setup
- [ ] Firebase project setup (Auth, Firestore, Storage, Cloud Messaging)
- [ ] Firebase Auth integration (signup, login, logout)
- [ ] User profile model and basic profile screen
- [ ] Navigation setup (Expo Router or React Navigation)
- [ ] Basic UI structure (AuthStack, MainStack)

**Hour 4-10: Core Messaging**
- [ ] Message data models (local + Firestore)
- [ ] Chat list screen (showing all conversations)
- [ ] Chat screen (one-on-one messaging)
- [ ] Send/receive messages
- [ ] Message persistence (SQLite or AsyncStorage)
- [ ] Real-time sync (Firestore onSnapshot listeners)
- [ ] Optimistic UI updates (show message immediately, confirm later)
- [ ] Message bubbles (sent vs received styling)
- [ ] Timestamps (smart formatting)

**Hour 10-16: Essential Features**
- [ ] Online/offline indicators (presence system)
- [ ] Typing indicators ("User is typing...")
- [ ] Read receipts (checkmarks: sent, delivered, read)
- [ ] Image sending (ImagePicker + Firebase Storage)
- [ ] Offline support (queue messages when offline, sync when online)
- [ ] Network state detection (NetInfo)
- [ ] Message delivery states (sending → sent → delivered → read)

**Hour 16-22: Group Chat & Polish**
- [ ] Group chat creation (select multiple participants)
- [ ] Group messaging (send to all members)
- [ ] Group info screen (members list, group name)
- [ ] Push notifications (Expo Notifications - foreground minimum)
- [ ] UI polish (loading states, error handling, smooth scrolling)
- [ ] App state handling (background/foreground transitions)

**Hour 22-24: Testing & Deployment**
- [ ] End-to-end testing (all 7 test scenarios)
- [ ] Bug fixes
- [ ] Deploy to Expo Go (publish update)
- [ ] Test on physical devices (iOS + Android)
- [ ] README with setup instructions
- [ ] Share Expo Go link

### Post-MVP (Days 2-4) - Early Submission
**After messaging infrastructure is solid:**
- [ ] Choose persona (Remote Team, International Communicator, Busy Parent, or Content Creator)
- [ ] Design AI features for chosen persona
- [ ] Implement Cloud Functions for AI
- [ ] Build AI assistant interface
- [ ] Implement 5 required AI features
- [ ] Background push notifications
- [ ] Message search (keyword-based)
- [ ] UI polish and animations
- [ ] Performance optimizations

### Final Phase (Days 5-7) - Final Submission
- [ ] Implement 1 advanced AI feature (multi-step agent or proactive assistant)
- [ ] Enhanced media support (video, voice messages)
- [ ] Message editing/deletion
- [ ] Additional polish based on testing feedback
- [ ] Demo video creation (5-7 minutes)
- [ ] Persona brainlift document
- [ ] Social post
- [ ] Final documentation

---

## Open Questions & Decisions Needed

1. ✅ **Platform**: React Native + Expo (CONFIRMED)
2. ✅ **Persona**: NOT choosing yet - will decide after MVP (CONFIRMED)
3. ✅ **AI Features**: NOT in MVP - will add post-MVP (CONFIRMED)
4. **Read Receipts Privacy**: Always show read receipts or make it optional? (Recommended: Always show for MVP)
5. **Group Size Limits**: Max users per group? (Recommended: 20 for MVP, 50 later)
6. **Message History Limits**: How many messages to load initially? (Recommended: last 50, load more on scroll)
7. **Image Compression**: What quality/size limits? (Recommended: 0.7 quality, max 1MB)

---

## Definition of Done (MVP)

The MVP is complete and ready for submission when:

1. ✅ All 10 MVP requirements are implemented and tested:
   - One-on-one chat functionality
   - Real-time message delivery between 2+ users
   - Message persistence (survives app restarts)
   - Optimistic UI updates
   - Online/offline status indicators
   - Message timestamps
   - User authentication (users have accounts/profiles)
   - Basic group chat functionality (3+ users)
   - Message read receipts
   - Push notifications working (at least foreground)

2. ✅ Two devices can exchange messages in real-time (<2 second latency)
3. ✅ Offline test scenario passes (go offline, receive messages, come online)
4. ✅ Group chat with 3+ users works reliably
5. ✅ App survives force quit and restarts (message persistence works)
6. ✅ Push notifications work (foreground minimum, background nice-to-have)
7. ✅ Images can be sent and received
8. ✅ Code is on GitHub with comprehensive README
9. ✅ Deployed to Expo Go (QR code shareable for testing)
10. ✅ Firebase backend is deployed and accessible
11. ✅ App runs on both iOS and Android via Expo Go

---

## Appendix: Setup Checklists

### Firebase Setup Checklist

- [ ] Create Firebase project (pigeonai-dev for MVP)
- [ ] Enable Firebase Authentication (email/password)
- [ ] Create Firestore database (start in test mode, add security rules later)
- [ ] Set up Firestore security rules
- [ ] Enable Firebase Storage (for images)
- [ ] Configure Firebase Cloud Messaging (optional for MVP)
- [ ] Register **Web app** in Firebase Console (🌐 icon)
- [ ] Copy Firebase web config object (apiKey, authDomain, projectId, etc.)
- [ ] Install Firebase JS SDK: `npm install firebase`
- [ ] Create `src/services/firebase/firebaseConfig.ts` with initialization
- [ ] Store sensitive keys in `.env` file
- [ ] Test authentication, Firestore reads/writes

### React Native + Expo Setup Checklist

- [ ] Install Node.js 18+ and npm/yarn
- [ ] Create Expo project: `npx create-expo-app pigeonai-week-2 --template blank-typescript`
- [ ] Install dependencies:
  - [ ] `firebase` (Firebase JS SDK - Expo Go compatible)
  - [ ] `npx expo install expo-image-picker`
  - [ ] `npx expo install expo-notifications`
  - [ ] `npx expo install expo-sqlite`
  - [ ] `npx expo install expo-status-bar`
  - [ ] `npm install @react-native-async-storage/async-storage`
  - [ ] `npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs`
  - [ ] `npx expo install react-native-safe-area-context react-native-screens`
  - [ ] `npm install @react-native-community/netinfo`
  - [ ] `npm install react-native-gifted-chat` (optional, for chat UI)
- [ ] Create Firebase project and register **Web app** (not iOS/Android)
- [ ] Copy Firebase web config (apiKey, authDomain, projectId, etc.)
- [ ] Create `src/services/firebase/firebaseConfig.ts` with Firebase initialization
- [ ] Set up navigation structure
- [ ] Run on Expo Go: `npx expo start`
- [ ] Test on physical device (scan QR code)

---

## Appendix: Key Resources

**Documentation**:
- Firebase JS SDK: https://firebase.google.com/docs/web/setup (PRIMARY)
- Firebase Auth: https://firebase.google.com/docs/auth/web/start
- Firestore: https://firebase.google.com/docs/firestore/quickstart
- Firebase Storage: https://firebase.google.com/docs/storage/web/start
- Expo Documentation: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/docs/getting-started
- Firestore Data Modeling: https://firebase.google.com/docs/firestore/data-model

**UI Libraries** (Optional):
- React Native Gifted Chat: https://github.com/FaridSafi/react-native-gifted-chat
- React Native Paper: Material Design components
- React Native Elements: Cross-platform UI toolkit

**Design Inspiration**:
- WhatsApp
- Telegram
- Signal
- Discord

**Testing Tools**:
- Expo Go App (iOS + Android)
- React Native Debugger
- Firebase Console
- Network throttling in Chrome DevTools (for testing React Native web)

---

**Document Status**: Ready for Review  
**Next Step**: Review PRD with team, confirm persona and platform decisions, then begin implementation.

