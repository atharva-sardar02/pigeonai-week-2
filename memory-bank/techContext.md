# Technical Context: Pigeon AI

## Technology Stack

### Mobile Platform

**Platform**: React Native with Expo  
**Language**: JavaScript/TypeScript  
**UI Framework**: React Native  
**Deployment**: Expo Go (QR code testing)  
**Target Devices**: iOS and Android (cross-platform)

**Why React Native + Expo**:
- Cross-platform from day one (iOS + Android)
- Expo Go enables instant testing without building
- Fast iteration with hot reload
- Firebase JS SDK works seamlessly
- Large ecosystem of libraries
- No TestFlight/APK needed for MVP - just scan QR code

**Alternative Considered**: iOS native (Swift) was considered initially, but React Native chosen for cross-platform reach and faster iteration.

### Frontend Dependencies (Installed Versions - PR #1)

```bash
# Core (Latest Versions as of PR #1)
- expo@54.0.0 (Expo SDK)
- react@19.1.0 (React library)
- react-native@0.81.4 (React Native framework)
- typescript@5.9.2 (TypeScript compiler)

# Firebase JS SDK (Expo Go compatible)
- firebase@12.4.0 (Auth, Firestore, Storage, Messaging)

# Navigation
- @react-navigation/native@7.x
- @react-navigation/native-stack@7.x
- @react-navigation/bottom-tabs@7.x

# Expo managed packages
- expo-image-picker (Image selection)
- expo-notifications (Push notifications via Expo Push Service)
- expo-sqlite (Local persistence)
- expo-status-bar
- expo-asset (Required by SDK 54)
- expo-font (Required by SDK 54)

# Build Tools
- babel-preset-expo (Required by SDK 54)
- @babel/core@7.26.0

# Utilities
- @react-native-async-storage/async-storage (Key-value storage)
- @react-native-community/netinfo (Network monitoring)
- react-native-gifted-chat (Chat UI library)
- react-native-safe-area-context
- react-native-screens
```

**Key Technologies**:
- `React Native 0.81.4` - Cross-platform mobile framework
- `Expo SDK 54` - Development platform and tooling (latest)
- `React 19.1.0` - UI library (latest)
- `Firebase JS SDK 12.4.0` - Web SDK (works with Expo Go)
- `TypeScript 5.9.2` - Type safety (latest)
- `React Hooks` - State management
- `AsyncStorage` - Local data persistence

### Backend Infrastructure

**Backend-as-a-Service**: Firebase (Spark Plan - Free)  
**Serverless Compute**: AWS Lambda (Unlimited Plan)  
**API Gateway**: AWS API Gateway

**Infrastructure Split Strategy**:
- **Firebase (Free Tier)**: Authentication, Firestore Database, Cloud Messaging, Storage
- **AWS (Unlimited)**: All AI processing, Vector storage, Caching, Rate limiting

**Firebase Services Used**:

1. **Firebase Authentication**
   - Email/password authentication
   - Secure token management
   - Session handling
   - User profile storage

2. **Cloud Firestore**
   - Real-time NoSQL database
   - Offline persistence built-in
   - Real-time listeners (WebSocket under the hood)
   - Horizontal scalability
   - Collections: `users`, `conversations`, `messages`, `groups`
   - Used for: Message storage, user data, conversation metadata

3. **Firebase Cloud Messaging (FCM)**
   - Push notifications
   - Abstracts Apple Push Notification service (APNs)
   - Background message handling
   - Integrated with AWS Lambda (server-side push)

4. **Firebase Storage**
   - Image and media file storage
   - CDN for fast global access
   - Secure upload/download with auth

**AWS Services Used**:

1. **AWS Lambda**
   - Serverless compute for all AI processing
   - Push notification delivery (already implemented)
   - Thread summarization, action items, priority detection
   - Decision tracking, semantic search
   - Multi-step scheduling agent
   - No cold starts with provisioned concurrency

2. **AWS API Gateway**
   - REST API endpoints for all AI features
   - Built-in rate limiting and throttling
   - Request/response caching
   - CORS configuration
   - Custom domain support

3. **AWS OpenSearch** (for RAG pipeline)
   - Vector database for semantic search
   - Better performance than Firestore for embeddings
   - Full-text search + vector search
   - k-NN search for similarity matching
   - Stores: Message embeddings (1536-dim vectors)

4. **AWS ElastiCache (Redis)**
   - AI response caching (1-2 hour TTL)
   - Sub-millisecond response times
   - Reduces OpenAI API costs
   - Stores: Summaries, action items, search results

5. **AWS S3** (optional)
   - Backup storage for large files
   - CloudFront CDN integration

**Why This Hybrid Architecture**:
- Firebase free tier limits: 50K reads/day, 20K writes/day
- Firebase Cloud Functions requires Blaze plan for AI features
- AWS unlimited plan = no cost concerns, better performance
- Firebase excels at real-time sync, AWS excels at compute
- Best of both worlds: Firebase for data, AWS for processing

**Alternative Considered**: Full Firebase (Cloud Functions) would work but requires paid Blaze plan. AWS Lambda is free with unlimited plan.

### AI & Agent Infrastructure

**LLM Provider**: OpenAI  
**Model**: GPT-4-turbo (for quality) and GPT-3.5-turbo (for speed/cost)  
**Agent Framework**: LangChain (for multi-step agent)  
**Compute**: AWS Lambda (serverless)  
**Vector Storage**: AWS OpenSearch  
**Caching**: AWS ElastiCache (Redis)

**AI Architecture**:

```
React Native App
    ↓
AWS API Gateway (auth, rate limiting, caching)
    ↓
AWS Lambda (AI processing)
    ↓
├─ OpenAI API (GPT-4, GPT-3.5, text-embedding-3-small)
├─ AWS OpenSearch (vector embeddings for RAG)
├─ ElastiCache Redis (response caching)
└─ Firebase Firestore (read messages for context)
```

**RAG (Retrieval-Augmented Generation) Pipeline**:
1. User asks AI: "Summarize my conversation with Sarah"
2. AWS Lambda fetches last 100 messages from Firestore
3. Lambda generates embedding for query (OpenAI embeddings)
4. Lambda queries OpenSearch for similar messages (k-NN search)
5. Lambda sends messages + prompt to OpenAI GPT-4
6. OpenAI returns summary
7. Lambda caches result in Redis (1-hour TTL)
8. Lambda returns summary to app

**Vector Embeddings (for Semantic Search)**:
- Model: OpenAI `text-embedding-3-small` (1536 dimensions)
- Storage: AWS OpenSearch (vector database)
- Background job: Lambda generates embeddings on message send
- Firestore trigger → Lambda → OpenAI embeddings → OpenSearch
- Search: Cosine similarity via OpenSearch k-NN

**Function Calling / Tool Use**:
AI agent (scheduling assistant) has access to these "tools":
- `extractSchedulingDetails(messages)` - Parse meeting info
- `findConflicts(participants, proposedTimes)` - Check availability
- `suggestAlternativeTimes(participants, constraints)` - Propose times
- `generateMeetingProposal(details)` - Create calendar invite
- `confirmMeeting(details)` - Finalize meeting

**Why This Stack**:
- AWS Lambda: Free (unlimited plan), no cold starts, faster than Cloud Functions
- AWS OpenSearch: Better vector search performance than Firestore
- ElastiCache Redis: Sub-millisecond caching, reduces OpenAI costs
- OpenAI function calling: Mature and reliable for agents
- LangChain: Simplifies multi-step agent orchestration
- API Gateway: Built-in rate limiting, caching, throttling

**Cost Management**:
- GPT-4: ~$0.03/1K input tokens, ~$0.06/1K output tokens
- GPT-3.5: ~$0.0015/1K input tokens, ~$0.002/1K output tokens
- Embeddings: ~$0.0001/1K tokens
- Strategy: Cache responses in Redis (1-2 hour TTL)
- AWS costs: $0 (unlimited plan)
- OpenAI budget: ~$50-100 for MVP testing

### Data Persistence

**Local Storage**: SQLite (via expo-sqlite) + AsyncStorage  
**Remote Storage**: Cloud Firestore  

**Local Data Model** (TypeScript):
```typescript
// SQLite / AsyncStorage structure
interface Message {
    id: string;
    senderId: string;
    conversationId: string;
    content: string;
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    type: 'text' | 'image';
    imageUrl?: string;
    synced: boolean; // For offline queue
}

interface Conversation {
    id: string;
    participants: string[];
    type: 'dm' | 'group';
    lastMessage?: string;
    lastMessageTime?: number;
    unreadCount: number;
    updatedAt: number;
}
```

**Firestore Schema**:
```
/users/{userId}
  - displayName: String
  - profilePictureUrl: String
  - bio: String
  - createdAt: Timestamp
  - lastSeen: Timestamp
  - isOnline: Boolean

/conversations/{conversationId}
  - type: "dm" | "group"
  - participants: [userId1, userId2, ...]
  - lastMessage: { senderId, content, timestamp }
  - createdAt: Timestamp
  - updatedAt: Timestamp

/conversations/{conversationId}/messages/{messageId}
  - senderId: String
  - content: String
  - timestamp: Timestamp (server timestamp)
  - type: "text" | "image"
  - status: "sending" | "sent" | "delivered" | "read"
  - readBy: { userId: timestamp, ... }
  - imageUrl: String? (if type is image)

/groups/{groupId}
  - name: String
  - iconUrl: String?
  - adminIds: [userId, ...]
  - memberIds: [userId, ...]
  - createdAt: Timestamp
```

**Sync Strategy**:
1. User sends message → saved to SwiftData immediately (optimistic update)
2. Message sent to Firestore → server returns confirmed message
3. SwiftData updates with server-confirmed data
4. Firestore real-time listener pushes new messages to app
5. App saves incoming messages to SwiftData

### Real-Time Communication

**Primary**: Firestore Real-Time Listeners  
**Protocol**: WebSocket (abstracted by Firestore SDK)

**How It Works**:
1. App opens conversation
2. Subscribe to Firestore listener: `.collection("conversations/{id}/messages").order(by: "timestamp").addSnapshotListener`
3. New message arrives → Firestore pushes update via WebSocket
4. App receives update within 100-500ms
5. UI updates with new message

**Reconnection Logic**:
- Firestore SDK handles reconnections automatically
- Exponential backoff on connection failures
- App lifecycle: reconnect when entering foreground

**Presence System**:
- User comes online → update `users/{userId}/isOnline = true`
- User goes offline → Firestore disconnect listener sets `isOnline = false`
- Update `lastSeen` timestamp

**Typing Indicators**:
- User types → write to `conversations/{id}/typing/{userId} = true` with 3-second TTL
- Other users listen to `typing` subcollection
- Display "User is typing..." indicator

### Push Notifications

**Service**: Firebase Cloud Messaging (FCM)  
**iOS Integration**: FCM → Apple Push Notification Service (APNs)

**Flow**:
1. User receives message while app is backgrounded/closed
2. Firestore trigger detects new message
3. Cloud Function sends FCM notification with recipient's device token
4. FCM → APNs → User's device
5. Notification appears on lock screen

**Notification Payload**:
```json
{
  "notification": {
    "title": "John Doe",
    "body": "Hey, are you free for a call?",
    "badge": 3,
    "sound": "default"
  },
  "data": {
    "conversationId": "conv_123",
    "senderId": "user_456",
    "type": "message"
  }
}
```

**Challenges**:
- APNs requires certificates/keys (managed by FCM)
- iOS notification permissions must be requested
- Background notification delivery not guaranteed (iOS throttles)
- For MVP: Focus on foreground notifications, add background later

### Development Environment (Actual Setup - PR #1)

**IDE**: VS Code (with React Native Tools extension)  
**Version Control**: Git + GitHub  
**Package Manager**: npm  
**Node.js**: 18+ required  
**OS**: Windows 10 (development machine)  
**EAS Account**: Required for Expo Go (free tier, no credit card)

**Development Tools**:
- **Expo Go app** (iOS/Android) - Instant testing via QR code
  - Requires EAS account login (both terminal and app)
  - Check Expo Go version before project setup
- **Physical devices** - Recommended for real testing (better than simulators)
- **Network**: Same WiFi required for computer and phone
- **Ports**: 8081 (default), 8082 (backup)
- **Firebase Console** - Manage backend services
- **Firebase Emulator Suite** - Local backend testing (optional)
- **React Native Debugger** - Debugging (optional)

**Environment Configuration**:
- Development: Firebase project `pigeonai-dev` (us-east4 region - Northern Virginia)
- Production: Firebase project `pigeonai-prod` (future)
- Configuration files: 
  - `.env` (Firebase credentials, not committed to Git)
  - `firebaseConfig.ts` (Firebase initialization)
  - `app.config.js` (Expo configuration)

**Setup Requirements Discovered During PR #1**:

1. **SDK Versioning is Critical**
   - Expo Go app version determines project SDK version
   - User had SDK 54 on phone, so we upgraded from SDK 52 to SDK 54
   - Check Expo Go version BEFORE initializing project
   - Upgrade command: `npx expo install expo@latest && npx expo install --fix`
   - Update TypeScript to match SDK: `npm install typescript@~5.9.2 --save-dev`

2. **Firebase Configuration Must Use Web SDK**
   - Register **Web app** in Firebase Console (NOT iOS/Android native)
   - Use Firebase JS SDK (`firebase` package), NOT `@react-native-firebase`
   - Store credentials in `.env` with `EXPO_PUBLIC_` prefix
   - No need for `google-services.json` or `GoogleService-Info.plist`

3. **EAS Account Required (New Requirement)**
   - Even for local development, EAS account needed for Expo Go
   - Free tier is sufficient (no credit card required)
   - Sign up at: https://expo.dev/signup
   - Login: `npx expo login` (terminal) + Expo Go app (Profile tab)

4. **Network Configuration**
   - Computer and phone MUST be on same WiFi network
   - LAN mode is default (use tunnel mode if firewall blocks)
   - Windows Firewall may need exception for Node.js (ports 8081/8082)
   - Manual URL entry more reliable than QR scan sometimes
   - Format: `exp://192.168.1.XXX:8081`

5. **Package Installation Best Practices**
   - Expo managed packages: `npx expo install <package>`
   - NPM packages: `npm install <package>`
   - After major upgrades: `npm install --force`
   - Clean install: Delete `node_modules` + `package-lock.json`, then reinstall

6. **Cache Management**
   - Metro cache can get corrupted after SDK upgrades
   - Clear cache: `npm start --clear`
   - Full reset: Delete `node_modules`, run `npm install --force`
   - Port conflicts: `npx expo start --port 8082`

7. **Critical Dependencies for SDK 54**
   - `babel-preset-expo` - Required for transpiling
   - `expo-asset` - Asset management (required even if not used)
   - `expo-font` - Font loading (required even if not used)
   - Add to `app.config.js` plugins: `['expo-asset', 'expo-font']`

### Deployment Pipeline (Actual Process - PR #1)

**React Native App (Expo Go - Development)**:
1. Start development server: `npm start` or `npm start --clear` (if cache issues)
2. Alternative port: `npx expo start --port 8082` (if 8081 in use)
3. Ensure EAS logged in: `npx expo login`
4. Ensure phone and computer on same WiFi
5. Scan QR code with Expo Go app (iOS/Android)
6. Or enter URL manually in Expo Go: `exp://192.168.1.XXX:8081`
7. First load takes 30-60 seconds (subsequent loads are faster)
8. Instant testing - no build required!

**React Native App (Production - Future)**:
1. For production builds: `eas build` (Expo Application Services)
2. Submit to App Store/Google Play
3. Alternative: OTA updates with `npx expo publish` (for minor updates)

**Backend (Firebase)**:
- Current: Firebase services configured via console (manual for MVP)
- Cloud Functions: `firebase deploy --only functions` (post-MVP for AI features)
- Firestore Rules: `firebase deploy --only firestore:rules`
- Storage Rules: `firebase deploy --only storage`
- Security: API keys in Cloud Functions environment variables

**CI/CD** (Optional for MVP):
- GitHub Actions for automated Expo builds
- EAS Build for creating native builds

**Troubleshooting Common Issues**:
- App won't load: Check same WiFi network, try manual URL entry
- SDK mismatch: Check Expo Go version, upgrade project SDK
- Cache errors: `npm start --clear`
- Missing dependencies: Check terminal warnings, install missing packages
- Port conflicts: Use different port with `--port 8082`
- EAS login: Create account at expo.dev/signup, login on both terminal and phone

### Performance Requirements

**Message Latency**:
- Real-time delivery: <1 second for online users
- Offline → online sync: <5 seconds for 100 messages

**App Performance**:
- Launch time: <2 seconds (cold start)
- Message list scrolling: 60 fps (smooth)
- Image loading: Progressive (show thumbnail immediately)

**AI Response Time**:
- Simple queries (GPT-3.5): 2-5 seconds
- Complex queries (GPT-4): 5-10 seconds
- Timeout: 30 seconds (show error if exceeds)

**Offline Support**:
- All messages from last 30 days cached locally
- Sent messages queue when offline
- App fully functional for reading messages offline

### Security Considerations

**Authentication**:
- Passwords hashed (Firebase Auth handles this)
- Tokens stored in iOS Keychain
- Auto token refresh

**API Security**:
- OpenAI API key never in client code
- All AI requests go through Cloud Functions
- Cloud Functions validate Firebase Auth tokens

**Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Only conversation participants can read messages
    match /conversations/{conversationId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid in request.resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if request.auth.uid == request.resource.data.senderId;
      }
    }
  }
}
```

**Data Privacy**:
- User messages sent to OpenAI for AI features (disclosed in terms)
- No third-party analytics in MVP
- User can delete their account and all data

### Testing Strategy

**Unit Tests** (Nice-to-have for MVP):
- Test message sending logic
- Test offline queue
- Test data models

**Integration Tests** (Priority):
- End-to-end: Send message from User A → appears on User B
- Offline test: Send offline → reconnect → message delivers
- Group chat: 3 users receive same message

**Manual Testing Scenarios**:
1. ✅ Two devices real-time chat
2. ✅ Offline scenario
3. ✅ Force quit app, reopen (persistence)
4. ✅ Poor network (throttled)
5. ✅ Rapid-fire 20 messages
6. ✅ Group chat
7. ✅ Push notifications
8. ✅ AI features (all 6)

**Testing Tools**:
- XCTest for unit tests
- Network Link Conditioner for network simulation
- Firebase Emulator for local backend testing

### Technical Constraints

**iOS Constraints**:
- App size limit: 4GB (not a concern for MVP)
- Background execution limited (15-30 seconds)
- Push notification payload: 4KB max
- Local storage: Unlimited, but large data impacts performance

**Firebase Constraints (Free Tier)**:
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Cloud Functions: 125K invocations, 40K GB-seconds per month
- Storage: 5GB
- Strategy: Monitor usage, upgrade to Blaze (pay-as-you-go) if needed

**OpenAI Constraints**:
- Rate limits: 10K requests per minute (more than enough for MVP)
- Context length: 128K tokens for GPT-4-turbo
- Cost: Budget $50-100 for MVP testing

### Monitoring & Debugging

**Firebase Console**: Monitor database usage, function invocations, crashes  
**Xcode Debugger**: Breakpoints, view hierarchy debugging  
**Logs**: Use `print()` and `os_log` for debugging  
**Crash Reporting**: Firebase Crashlytics (add if time permits)

### Documentation Requirements

**Code Documentation**:
- Inline comments for complex logic
- README with setup instructions
- Architecture diagram

**API Documentation**:
- Cloud Functions endpoints documented
- Request/response formats
- Error codes

### Scalability Considerations (Post-MVP)

Current architecture scales to ~10K users without changes. Beyond that:
- **Firestore**: Scales horizontally automatically
- **Cloud Functions**: Autoscales based on load
- **Images**: Firebase Storage uses CDN, globally distributed
- **AI**: Add caching layer (Redis) to reduce API calls

**Bottlenecks to Watch**:
- AI cost (could get expensive with heavy usage)
- Firestore reads (real-time listeners count as reads)
- Cloud Functions cold starts (2-5 seconds first invocation)

