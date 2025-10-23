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

## MVP SCOPE (30+ Hours - COMPLETE ✅)

### What's IN Scope for MVP

**Core Messaging Infrastructure ONLY**:
✅ One-on-one chat functionality **[COMPLETE]**
✅ Real-time message delivery between 2+ users **[COMPLETE]**
✅ Message persistence (survives app restarts) **[COMPLETE]**
✅ Optimistic UI updates (messages appear instantly) **[COMPLETE]**
✅ Online/offline status indicators **[COMPLETE]**
✅ Message timestamps **[COMPLETE]**
✅ User authentication (users have accounts/profiles) **[COMPLETE]**
✅ Basic group chat functionality (3+ users) **[COMPLETE]**
✅ Message read receipts **[COMPLETE]**
✅ Push notifications (AWS Lambda + FCM, works in all states) **[COMPLETE]**
✅ Deployment on Expo Go with deployed Firebase backend **[COMPLETE]**
✅ **BONUS**: Production APK built and tested **[COMPLETE]**  

### What's OUT of Scope for MVP

❌ **AI features** (thread summarization, action items, smart search, etc.)  
❌ **Persona selection** (will choose after MVP)  
❌ **Advanced media** (video, voice messages, files)  
❌ **Message editing/deletion**  
❌ **End-to-end encryption**  
❌ **Voice/video calls**  
✅ **Image Sharing** - Backend ready (Firebase Storage configured), UI pending

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
8. ✅ Background app → receive message → push notification appears (production APK)
9. 🟡 AI command "Summarize conversation" → returns summary within 10 seconds (post-MVP)
10. ✅ Restart app → chat history loads correctly

**Mitigation**:
- ✅ Tested on two physical devices (Android + iOS)
- ✅ Used network throttling tools to simulate poor networks
- ✅ Tested in Expo Go for rapid iteration, then validated on production APK
- ✅ Created test accounts: multiple users for group testing

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

## Success Metrics (How We Know MVP is Working) - ✅ COMPLETE

### Functional Requirements
- ✅ Two users can exchange messages in real-time (<2 second latency)
- ✅ Messages persist through app restart
- ✅ Offline scenario: messages queue and deliver when online
- ✅ Group chat with 3+ users works
- ✅ Read receipts update correctly
- ✅ Typing indicators show
- ✅ Push notifications trigger (foreground, background, closed - production APK)
- 🟡 Images can be sent and received (backend ready, UI pending)
- ✅ User authentication works (signup, login, logout)
- ✅ App runs on Expo Go (both iOS and Android)
- ✅ **BONUS**: Production APK built and tested on physical devices

### Performance Benchmarks
- ✅ Message delivery latency: <1 second (online) - Achieved
- ✅ App launch time: <3 seconds on Expo Go - Achieved
- ✅ Message list scrolling: 60 fps (smooth with FlatList) - Achieved
- ✅ Offline-to-online sync: <5 seconds for 100 messages - Achieved
- 🟡 Image loading: Progressive (show thumbnails immediately) - Backend ready

### User Experience Goals
- ✅ Intuitive UI (new user can send a message within 30 seconds)
- ✅ No message loss (100% delivery rate for sent messages)
- ✅ Graceful error handling (network errors show retry options)
- ✅ Smooth animations and transitions

---

## Timeline & Milestones - ✅ MVP COMPLETE

### MVP Phase (0-34 hours) - ✅ COMPLETE

**Goal**: Functional messaging app with rock-solid infrastructure (NO AI features)

**Hour 0-2: Foundation** ✅
- [x] React Native + Expo project setup
- [x] Firebase project setup (Auth, Firestore, Storage, Cloud Messaging)
- [x] Firebase Auth integration (signup, login, logout)
- [x] User profile model and basic profile screen
- [x] Navigation setup
- [x] Basic UI structure (AuthStack, MainStack)

**Hour 2-12: Core Messaging** ✅
- [x] Message data models (local + Firestore)
- [x] Chat list screen (showing all conversations)
- [x] Chat screen (one-on-one messaging)
- [x] Send/receive messages
- [x] Message persistence (SQLite)
- [x] Real-time sync (Firestore onSnapshot listeners)
- [x] Optimistic UI updates
- [x] Message bubbles
- [x] Timestamps

**Hour 12-22: Essential Features** ✅
- [x] Online/offline indicators (presence system)
- [x] Typing indicators
- [x] Read receipts
- [x] Offline support (queue messages, sync when online)
- [x] Network state detection
- [x] Message delivery states

**Hour 22-30: Group Chat & Polish** ✅
- [x] Group chat creation
- [x] Group messaging
- [x] Group info screen
- [x] Push notifications (AWS Lambda + FCM)
- [x] UI polish (loading states, error handling, smooth scrolling)
- [x] App state handling

**Hour 30-34: Production Deployment & Testing** ✅
- [x] End-to-end testing
- [x] Bug fixes (18 bugs fixed)
- [x] Production APK build (Android Studio)
- [x] AWS Lambda push notification system
- [x] FCM integration
- [x] Physical device testing
- [x] README with setup instructions
- [x] Firebase backend deployed

### Current Status: MVP Complete + Production APK Deployed ✅

---

## PHASE 2: AI Features & Rubric Compliance (Target Score: 95+/100)

**Timeline**: 45-55 hours  
**Goal**: Implement all rubric requirements, choose persona, build 5 AI features + 1 advanced capability

**Current Status**: MVP Complete ✅ | Persona: TBD | AI Features: 0/5

### Phase 2 Roadmap (Based on Rubric)

#### **PR #13: Persona Selection & Brainlift Document** (2 hours)
**Target**: Section 6 - Persona Brainlift (Pass/Fail, -10 penalty if missing)  
**Branch**: `docs/persona-brainlift`

**Tasks:**
- [ ] **Task 13.1**: Choose persona from provided options:
  - Option 1: Remote Team Professional (distributed teams, timezone challenges)
  - Option 2: International Communicator (multilingual, cultural differences)
  - Option 3: Busy Parent (coordinating family schedules, quick updates)
  - Option 4: Content Creator (collaboration, feedback cycles, deadlines)
- [ ] **Task 13.2**: Research persona pain points and daily workflows
- [ ] **Task 13.3**: Map 5 AI features to specific pain points
- [ ] **Task 13.4**: Create 1-page brainlift document (`docs/BRAINLIFT.md`):
  - Chosen persona and justification
  - Specific pain points being addressed
  - How each AI feature solves a real problem
  - User stories for each AI feature
  - Key technical decisions made
  - Success metrics for each feature
- [ ] **Task 13.5**: Document persona user stories in PRD
- [ ] **Task 13.6**: Define AI feature requirements based on persona

**Note**: All AI feature implementations (PR #16-21) will be tailored to the chosen persona.

#### **PR #14: Image Sharing UI** (3-4 hours)
**Target**: Complete remaining MVP feature + Bonus Points (+2 Advanced Features)  
**Branch**: `feature/image-sharing-ui`

**Tasks:**
- [ ] **Task 14.1**: Implement image picker (expo-image-picker)
- [ ] **Task 14.2**: Add camera and gallery options
- [ ] **Task 14.3**: Image compression (0.7 quality, max 1MB)
- [ ] **Task 14.4**: Firebase Storage upload with progress indicator
- [ ] **Task 14.5**: Display image thumbnails in chat bubbles
- [ ] **Task 14.6**: Full-screen image viewer on tap
- [ ] **Task 14.7**: Progressive loading with placeholders
- [ ] **Task 14.8**: Error handling for upload failures
- [ ] **Task 14.9**: Manual testing on physical devices

**Note**: Backend (Firebase Storage) already configured. This PR focuses on UI/UX implementation.

---

#### **PR #15: Cloud Functions Setup for AI** (2-3 hours)
**Target**: Architecture Foundation for AI Features  
**Branch**: `feature/cloud-functions-setup`

**Tasks:**
- [ ] **Task 15.1**: Initialize Firebase Cloud Functions project
- [ ] **Task 15.2**: Install dependencies (OpenAI SDK, rate-limiting)
- [ ] **Task 15.3**: Configure OpenAI API key in environment variables
- [ ] **Task 15.4**: Implement authentication middleware
- [ ] **Task 15.5**: Add rate limiting (per-user quotas)
- [ ] **Task 15.6**: Create utility functions for context retrieval
- [ ] **Task 15.7**: Set up error handling and logging
- [ ] **Task 15.8**: Test functions locally with Firebase emulator
- [ ] **Task 15.9**: Deploy to Firebase (`firebase deploy --only functions`)
- [ ] **Task 15.10**: Document function endpoints and usage

**Note**: This PR sets up the infrastructure. No AI features yet.

---

#### **PR #16: AI Feature 1 - Thread Summarization** (3-4 hours)
**Target**: Section 3 - Required AI Features (3/15 points)  
**Branch**: `feature/ai-thread-summarization`  
**Persona-Specific**: Features will be tailored after persona selection

**Tasks:**
- [ ] **Task 16.1**: Implement backend summarization Cloud Function
- [ ] **Task 16.2**: Fetch last 50-200 messages from conversation
- [ ] **Task 16.3**: Build prompt template (persona-specific)
- [ ] **Task 16.4**: Call OpenAI GPT-4 for summarization
- [ ] **Task 16.5**: Parse and format response
- [ ] **Task 16.6**: Add "Summarize" button to ChatHeader
- [ ] **Task 16.7**: Create SummaryModal component for display
- [ ] **Task 16.8**: Integrate frontend with Cloud Function
- [ ] **Task 16.9**: Add loading states and error handling
- [ ] **Task 16.10**: Implement response caching (1 hour TTL)
- [ ] **Task 16.11**: Manual testing for accuracy (>90% target)
- [ ] **Task 16.12**: Optimize for <2s response time

**Success Criteria**: 90%+ accuracy in capturing key points, decisions, and action items.

---

#### **PR #17: AI Feature 2 - Action Item Extraction** (3-4 hours)
**Target**: Section 3 - Required AI Features (3/15 points)  
**Branch**: `feature/ai-action-items`  
**Persona-Specific**: Features will be tailored after persona selection

**Tasks:**
- [ ] **Task 17.1**: Implement backend action item extraction function
- [ ] **Task 17.2**: Define ActionItem model/interface
- [ ] **Task 17.3**: Use GPT-4 with structured JSON output
- [ ] **Task 17.4**: Add "Extract Action Items" button to ChatHeader
- [ ] **Task 17.5**: Create ActionItemsList component
- [ ] **Task 17.6**: Integrate frontend with Cloud Function
- [ ] **Task 17.7**: Add navigation to source messages
- [ ] **Task 17.8**: Implement action item storage (SQLite + Firestore)
- [ ] **Task 17.9**: Add mark-as-complete functionality
- [ ] **Task 17.10**: Test extraction accuracy (>90% target)

**Success Criteria**: >90% extraction accuracy for clear action items.

---

#### **PR #18: AI Feature 3 - Smart Semantic Search** (3-4 hours)
**Target**: Section 3 - Required AI Features (3/15 points) + Section 4 - RAG (1 point)  
**Branch**: `feature/ai-semantic-search`  
**Persona-Specific**: Features will be tailored after persona selection

**Tasks:**
- [ ] **Task 18.1**: Set up vector embeddings (OpenAI text-embedding-3-small)
- [ ] **Task 18.2**: Implement similarity search algorithm (cosine similarity)
- [ ] **Task 18.3**: Create search Cloud Function
- [ ] **Task 18.4**: Add search bar to UI
- [ ] **Task 18.5**: Create SearchResults component
- [ ] **Task 18.6**: Integrate search service with debouncing
- [ ] **Task 18.7**: Add navigation to search results
- [ ] **Task 18.8**: Implement background embedding generation on message send
- [ ] **Task 18.9**: Test search accuracy (>90% relevance)
- [ ] **Task 18.10**: Optimize for <2s response time

**Success Criteria**: >90% relevance for common queries. Required for RAG pipeline credit.

---

#### **PR #19: AI Feature 4 - Priority Message Detection** (3-4 hours)
**Target**: Section 3 - Required AI Features (3/15 points)  
**Branch**: `feature/ai-priority-detection`  
**Persona-Specific**: Features will be tailored after persona selection

**Tasks:**
- [ ] **Task 19.1**: Implement priority detection Cloud Function
- [ ] **Task 19.2**: Add priority field to Message model
- [ ] **Task 19.3**: Implement automatic priority detection on message send
- [ ] **Task 19.4**: Add priority badges to MessageBubble
- [ ] **Task 19.5**: Add priority filter to ChatScreen
- [ ] **Task 19.6**: Create PriorityMessagesScreen
- [ ] **Task 19.7**: Enhance push notifications for high priority
- [ ] **Task 19.8**: Implement priority analytics dashboard
- [ ] **Task 19.9**: Test classification accuracy (>90% target)
- [ ] **Task 19.10**: Optimize for <1s per message

**Success Criteria**: >90% classification accuracy for high/medium/low priority.

---

#### **PR #20: AI Feature 5 - Decision Tracking** (3-4 hours)
**Target**: Section 3 - Required AI Features (3/15 points)  
**Branch**: `feature/ai-decision-tracking`  
**Persona-Specific**: Features will be tailored after persona selection

**Tasks:**
- [ ] **Task 20.1**: Implement decision detection Cloud Function
- [ ] **Task 20.2**: Define Decision model/interface
- [ ] **Task 20.3**: Add "Track Decisions" button to ChatHeader
- [ ] **Task 20.4**: Create DecisionTimeline component
- [ ] **Task 20.5**: Integrate AI service call
- [ ] **Task 20.6**: Implement decision storage (SQLite + Firestore)
- [ ] **Task 20.7**: Add navigation to source messages
- [ ] **Task 20.8**: Create DecisionSearchScreen
- [ ] **Task 20.9**: Test detection accuracy (>90% target)
- [ ] **Task 20.10**: Optimize for <2s response time

**Success Criteria**: >90% extraction accuracy for clear decisions.

---

#### **PR #21: Advanced AI - Proactive Scheduling Assistant** (5-6 hours)
**Target**: Section 3 - Advanced AI Capability (10 points)  
**Branch**: `feature/ai-scheduling-agent`  
**Persona-Specific**: Features will be tailored after persona selection

**Multi-Step Agent Implementation (5+ steps):**
- [ ] **Task 21.1**: Set up agent framework (LangChain or Vercel AI SDK)
- [ ] **Task 21.2**: Define agent tools/functions (5 tools minimum)
- [ ] **Task 21.3**: Implement Step 1 - Monitor for scheduling mentions
- [ ] **Task 21.4**: Implement Step 2 - Extract meeting details
- [ ] **Task 21.5**: Implement Step 3 - Check availability
- [ ] **Task 21.6**: Implement Step 4 - Suggest optimal times
- [ ] **Task 21.7**: Implement Step 5 - Generate meeting proposal
- [ ] **Task 21.8**: Implement agent orchestration with context maintenance
- [ ] **Task 21.9**: Add frontend proactive suggestions
- [ ] **Task 21.10**: Create SchedulingModal interface
- [ ] **Task 21.11**: Integrate agent with Cloud Function
- [ ] **Task 21.12**: Add calendar integration (optional)
- [ ] **Task 21.13**: Test agent workflow (>85% accuracy)
- [ ] **Task 21.14**: Optimize for <15s complete workflow

**Success Criteria**: Multi-step agent (5+ steps), maintains context, >85% accuracy.

---

#### **PR #22: RAG Pipeline & Technical Documentation** (2-3 hours)
**Target**: Section 4 - RAG Pipeline (1 point) + Section 5 - Code Quality (2 points)  
**Branch**: `docs/rag-pipeline`

**Tasks:**
- [ ] **Task 22.1**: Create RAG Pipeline documentation (`docs/RAG_PIPELINE.md`)
- [ ] **Task 22.2**: Document vector embedding strategy
- [ ] **Task 22.3**: Document retrieval strategy
- [ ] **Task 22.4**: Add JSDoc comments to all AI services
- [ ] **Task 22.5**: Create `functions/README.md`
- [ ] **Task 22.6**: Update main README with AI features section
- [ ] **Task 22.7**: Create API documentation (`docs/API.md`)
- [ ] **Task 22.8**: Add inline code comments to complex algorithms
- [ ] **Task 22.9**: Create developer onboarding guide (`docs/DEVELOPER_GUIDE.md`)
- [ ] **Task 22.10**: Review and polish all documentation

**Success Criteria**: Comprehensive documentation for RAG pipeline and all AI features.

---

#### **PR #23: Testing & Quality Assurance** (4-5 hours)
**Target**: Section 5 - Testing & Quality (3 points)  
**Branch**: `test/ai-features`

**Tasks:**
- [ ] **Task 23.1**: Unit tests for AI utilities (embeddings, similarity)
- [ ] **Task 23.2**: Integration tests for Cloud Functions
- [ ] **Task 23.3**: Frontend component tests (AI features)
- [ ] **Task 23.4**: End-to-end testing (manual script)
- [ ] **Task 23.5**: Accuracy evaluation with test dataset
- [ ] **Task 23.6**: Performance benchmarking (all AI features)
- [ ] **Task 23.7**: Error handling tests (rate limits, timeouts)
- [ ] **Task 23.8**: Security testing (auth, permissions, API keys)
- [ ] **Task 23.9**: Accessibility testing (screen reader, WCAG)
- [ ] **Task 23.10**: Create testing documentation (`docs/TESTING_REPORT.md`)

**Success Criteria**: >90% accuracy for all AI features, <2s for simple features, <15s for agent.

---

#### **PR #24: UI Polish & Professional Design** (3-4 hours)
**Target**: Section 5 - Code Quality & Polish (2 points)  
**Branch**: `ui/ai-polish`

**Tasks:**
- [ ] **Task 24.1**: Design consistent AI feature icons
- [ ] **Task 24.2**: Standardize loading states (skeleton loaders)
- [ ] **Task 24.3**: Improve error messages (user-friendly)
- [ ] **Task 24.4**: Add empty states with illustrations
- [ ] **Task 24.5**: Implement smooth animations (fade, slide)
- [ ] **Task 24.6**: Add tooltips and first-time hints
- [ ] **Task 24.7**: Ensure dark mode support for all AI features
- [ ] **Task 24.8**: Responsive design for tablets/landscape
- [ ] **Task 24.9**: Add micro-interactions (haptic feedback)
- [ ] **Task 24.10**: Final UI/UX review and polish

**Success Criteria**: Professional, polished UI for all AI features with consistent design system.

---

#### **PR #25: Final Integration, Deployment & Demo Video** (3-4 hours)
**Target**: Section 1 (5 points) + Section 2 (10 points) + Deliverables (Pass/Fail)  
**Branch**: `main` (merge all feature branches)

**Tasks:**
- [ ] **Task 25.1**: Merge all feature branches (PR #14-24)
- [ ] **Task 25.2**: Final integration testing (all features)
- [ ] **Task 25.3**: Build production APK with all AI features
- [ ] **Task 25.4**: Deploy all Cloud Functions to production
- [ ] **Task 25.5**: Update environment variables for production
- [ ] **Task 25.6**: Create demo script (5 minutes)
- [ ] **Task 25.7**: Record demo video (professional quality)
- [ ] **Task 25.8**: Upload demo video (YouTube/Loom)
- [ ] **Task 25.9**: Prepare submission package (all deliverables)
- [ ] **Task 25.10**: Final code review and cleanup

**Demo Video Requirements (5 minutes):**
1. Intro (30s): What is Pigeon AI, problem it solves
2. Core Features (1m): Sign up, chat, groups, presence, notifications
3. AI Features (2.5m): Demonstrate all 5 AI features with clear examples
4. Advanced AI (1m): Multi-step scheduling agent
5. Wrap-up (30s): Benefits, impact, future improvements

**Success Criteria**: Professional demo video, all features working, production APK deployed.

---

### Phase 2 Priority Order (Maximize Score)

**CRITICAL - Must Complete (Pass/Fail):**
1. **PR #13**: Persona Brainlift (-10 penalty if missing) ⚠️
2. **PR #25**: Demo Video & Social Post (-15 penalty if missing) ⚠️

**High Priority (Core Points - 40 points):**
3. **PR #15**: Cloud Functions Setup (required for all AI features)
4. **PR #16-20**: 5 Required AI Features (3 points each = 15 points)
5. **PR #21**: Advanced AI Capability (10 points)
6. **PR #18**: Semantic Search (also counts for RAG Pipeline = 1 bonus point)

**Medium Priority (Quality & Documentation - 16 points):**
7. **PR #22**: RAG Pipeline Documentation + Code Quality (3 points)
8. **PR #23**: Testing & Quality Assurance (3 points)
9. **PR #24**: UI Polish & Professional Design (2 points)
10. **PR #14**: Image Sharing UI (Complete MVP + bonus points)

**Recommended Implementation Order:**
1. PR #13 (Persona Selection) - **START HERE** - defines all other features
2. PR #14 (Image Sharing) - Complete MVP while planning AI features
3. PR #15 (Cloud Functions) - Infrastructure for AI
4. PR #16-20 (5 AI Features) - Core implementation, one at a time
5. PR #21 (Advanced Agent) - After basic AI features work
6. PR #22 (Documentation) - Throughout development
7. PR #23 (Testing) - After features are implemented
8. PR #24 (Polish) - Final touches
9. PR #25 (Demo & Deploy) - **FINISH HERE** - submission package

---

### Estimated Phase 2 Timeline

**Total Estimated Time**: 45-55 hours

**Phase 1: Foundation & Planning** (6-10 hours)
- **PR #13**: Persona Selection & Brainlift (2 hours) ← **START HERE**
- **PR #14**: Image Sharing UI (3-4 hours)
- **PR #15**: Cloud Functions Setup (2-3 hours)
- **Deliverable**: Persona chosen, MVP complete, AI infrastructure ready

**Phase 2: Core AI Features** (15-20 hours)
- **PR #16**: Thread Summarization (3-4 hours)
- **PR #17**: Action Item Extraction (3-4 hours)
- **PR #18**: Semantic Search + RAG (3-4 hours)
- **PR #19**: Priority Detection (3-4 hours)
- **PR #20**: Decision Tracking (3-4 hours)
- **Deliverable**: 5 AI features working with >90% accuracy

**Phase 3: Advanced AI** (5-6 hours)
- **PR #21**: Multi-Step Scheduling Agent (5-6 hours)
- **Deliverable**: Advanced agent with 5+ steps, maintains context

**Phase 4: Quality & Documentation** (8-11 hours)
- **PR #22**: RAG Documentation + Code Quality (2-3 hours)
- **PR #23**: Testing & QA (4-5 hours)
- **PR #24**: UI Polish (3-4 hours)
- **Deliverable**: Production-ready code, comprehensive documentation

**Phase 5: Final Deployment** (3-4 hours)
- **PR #25**: Integration, Deployment, Demo Video (3-4 hours)
- **Deliverable**: Production APK, demo video, submission package

**Suggested Weekly Breakdown:**
- **Week 1 (20-25 hours)**: PR #13-15 (foundation) + PR #16-20 (AI features)
- **Week 2 (15-20 hours)**: PR #21 (advanced AI) + PR #22-24 (quality)
- **Week 3 (8-10 hours)**: PR #25 (final polish & demo)

**Target Score: 90-95/100 points**

---

### Post-MVP (Days 2-4) - UPDATED FOR RUBRIC

**After messaging infrastructure is solid:**
- [x] MVP Complete ✅
- [ ] **PR #13**: Choose persona + Brainlift document ← **NEXT STEP**
- [ ] **PR #14**: Complete image sharing UI
- [ ] **PR #15**: Cloud Functions setup
- [ ] **PR #16-20**: Implement 5 required AI features
- [ ] **PR #21**: Advanced AI capability (multi-step agent)
- [ ] **PR #22**: RAG pipeline documentation
- [ ] **PR #23**: Comprehensive testing

### Final Phase (Days 5-7) - UPDATED FOR RUBRIC
- [ ] **PR #24**: UI polish and professional design
- [ ] **PR #25**: Demo video (5 minutes)
- [ ] **PR #25**: Final integration and deployment
- [ ] **PR #25**: Prepare submission package
- [ ] Final testing and bug fixes
- [ ] Submit for grading

---

## Open Questions & Decisions Needed

1. ✅ **Platform**: React Native + Expo (CONFIRMED)
2. ⏳ **Persona**: MUST choose before starting AI features (PR #13) - Options:
   - Remote Team Professional (distributed teams, timezone challenges)
   - International Communicator (multilingual, cultural differences)
   - Busy Parent (coordinating family schedules)
   - Content Creator (collaboration, feedback cycles)
3. ✅ **AI Features**: Will be tailored to chosen persona (CONFIRMED)
4. ✅ **Read Receipts Privacy**: Always show read receipts (CONFIRMED)
5. ✅ **Group Size Limits**: 20 for MVP (CONFIRMED)
6. ✅ **Message History Limits**: Last 50, load more on scroll (CONFIRMED)
7. ✅ **Image Compression**: 0.7 quality, max 1MB (CONFIRMED)

**NEXT DECISION REQUIRED**: Choose persona for PR #13 before proceeding with AI feature implementation.

---

## Definition of Done (MVP) - ✅ COMPLETE

The MVP is complete and ready for submission when:

1. ✅ All 10+ MVP requirements are implemented and tested:
   - ✅ One-on-one chat functionality
   - ✅ Real-time message delivery between 2+ users
   - ✅ Message persistence (survives app restarts)
   - ✅ Optimistic UI updates
   - ✅ Online/offline status indicators
   - ✅ Message timestamps
   - ✅ User authentication (users have accounts/profiles)
   - ✅ Basic group chat functionality (3+ users)
   - ✅ Message read receipts
   - ✅ Push notifications working (foreground, background, closed - AWS Lambda + FCM)
   - ✅ **BONUS**: Production APK built and deployed

2. ✅ Two devices can exchange messages in real-time (<2 second latency)
3. ✅ Offline test scenario passes (go offline, receive messages, come online)
4. ✅ Group chat with 3+ users works reliably
5. ✅ App survives force quit and restarts (message persistence works)
6. ✅ Push notifications work (AWS Lambda with FCM in production APK)
7. 🟡 Images can be sent and received (backend ready, UI pending)
8. ✅ Code is on GitHub with comprehensive README
9. ✅ Deployed to Expo Go (QR code shareable for testing)
10. ✅ Firebase backend is deployed and accessible
11. ✅ App runs on both iOS and Android via Expo Go
12. ✅ **BONUS**: Production APK built with Android Studio and tested on physical devices

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

