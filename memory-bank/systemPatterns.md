# System Patterns: Pigeon AI

**Last Updated**: October 20, 2025 - PR #3 COMPLETE ✅

## Architecture Overview

Pigeon AI follows a **client-server architecture** with **real-time sync** and **serverless backend**.

### Current Implementation Status
- ✅ **PR #1**: Project Setup & Configuration (Expo SDK 54, Firebase, Dependencies)
- ✅ **PR #2**: Authentication System (User model, Auth service, Auth UI, Dark Mode)
- ✅ **PR #3**: Core Messaging Infrastructure - Data Layer (COMPLETE)
  - ✅ Message Model (18 helper functions)
  - ✅ Conversation Model (21 helper functions)
  - ✅ Firestore Service (19 functions - real-time messaging)
  - ✅ SQLite Service (8 functions - local database)
  - ✅ Local Database Service (29 functions - offline support)
  - ✅ ChatContext (global state management)
  - ✅ useMessages & useConversations hooks
  - ✅ Security rules deployed to production
  - ✅ Firestore indexes deployed
- 🎯 **NEXT**: PR #4 (Chat UI & Real-Time Sync)

---

```
┌─────────────────────────────────────────────────────────────┐
│           React Native App (Expo SDK 54)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Layer   │  │  Contexts    │  │Local Storage │     │
│  │(Screens/     │◄─┤(Auth, Chat)  │◄─┤  (SQLite)    │     │
│  │ Components)  │  │              │  │              │     │
│  └──────────────┘  └──────┬───────┘  └──────────────┘     │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │Custom Hooks    │                       │
│                    │(useMessages,   │                       │
│                    │ useConversations)│                     │
│                    └───────┬────────┘                       │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │Services Layer  │                       │
│                    │(Firestore,     │                       │
│                    │ SQLite, Auth)  │                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ╔════════▼════════╗
                    ║    Internet     ║
                    ╚════════╤════════╝
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────────┐  ┌──────▼───────┐  ┌────────▼─────────┐
│ Firebase Auth   │  │  Firestore   │  │ Cloud Functions  │
│ (User Sessions) │  │ (Real-time   │  │ (Future: AI)     │
│                 │  │  Database)   │  │                  │
└─────────────────┘  └──────┬───────┘  └────────┬─────────┘
                             │                    │
                     ┌───────▼────────┐   ┌──────▼─────────┐
                     │ Firebase       │   │  OpenAI API    │
                     │ Cloud Messaging│   │  (Future)      │
                     │ (Push Notifs)  │   │                │
                     └────────────────┘   └────────────────┘
```

## Implemented Data Models (PR #3)

### Message Model (`src/models/Message.ts`)

**Purpose**: Encapsulate message data with rich helper functions for business logic.

**Key Functions Implemented**:
- **Create & Convert**: `createMessage()`, `fromFirestore()`, `toFirestore()`
- **Status Management**: `updateStatus()`, `markAsRead()`, `isReadBy()`
- **Status Checks**: `isRead()`, `isDelivered()`, `isSent()`, `isSending()`, `isFailed()`
- **Utilities**: `formatTimestamp()`, `getMessagePreview()`, `isOwnMessage()`, `groupMessagesByDate()`

**Pattern**: Pure functions that operate on Message objects (immutable transforms).

**Example Usage**:
```typescript
import * as MessageModel from '../models/Message';

// Create a new message
const newMessage = MessageModel.createMessage(
  currentUserId,
  conversationId,
  'Hello world!',
  'text'
);

// Convert for Firestore
const firestoreData = MessageModel.toFirestore(newMessage);
await firestore.collection('messages').add(firestoreData);

// Format for display
const timestamp = MessageModel.formatTimestamp(message.timestamp); // "2:30 PM"
const preview = MessageModel.getMessagePreview(message, 50); // "Hello world!"
```

### Conversation Model (`src/models/Conversation.ts`)

**Purpose**: Manage conversation state, participants, and unread counts.

**Key Functions Implemented**:
- **Create & Convert**: `createConversation()`, `fromFirestore()`, `toFirestore()`
- **Message Updates**: `updateLastMessage()`
- **Unread Management**: `incrementUnreadCount()`, `resetUnreadCount()`, `getUnreadCount()`
- **Participant Management**: `addParticipant()`, `removeParticipant()`, `isParticipant()`, `isAdmin()`
- **Type Checks**: `isGroup()`, `isDM()`, `hasUnreadMessages()`
- **Utilities**: `formatLastMessageTime()`, `getDisplayName()`, `sortConversationsByTime()`, `filterUnread()`

**Pattern**: Immutable updates - each function returns a new Conversation object.

**Example Usage**:
```typescript
import * as ConversationModel from '../models/Conversation';

// Create a new DM conversation
const newConvo = ConversationModel.createConversation(
  [userId1, userId2],
  'dm'
);

// Update last message
const updated = ConversationModel.updateLastMessage(
  conversation,
  'Hey there!',
  new Date()
);

// Increment unread count for a user
const withUnread = ConversationModel.incrementUnreadCount(updated, userId2);

// Get display name
const name = ConversationModel.getDisplayName(
  conversation,
  currentUserId,
  (id) => getUserDisplayName(id)
); // "John Doe" or "Work Group"

// Sort conversations by time
const sorted = ConversationModel.sortConversationsByTime(conversations);
```

**Why This Pattern Works**:
- **Type Safety**: TypeScript ensures all fields are handled correctly
- **Testability**: Pure functions are easy to unit test
- **Reusability**: Helper functions used across components
- **Firestore Integration**: Automatic timestamp conversion between JS Date and Firestore Timestamp
- **Immutability**: No side effects, predictable behavior

---

## Implemented Services (PR #3)

### Firestore Service (`src/services/firebase/firestoreService.ts`)

**Purpose**: Interact with Firebase Firestore for real-time messaging and conversation management.

**19 Functions Implemented**:

**Conversation Operations**:
- `createConversation(participantIds, type, groupName?, groupIcon?, adminIds?)` - Create new conversation
- `getConversation(conversationId)` - Fetch single conversation
- `getUserConversations(userId)` - Get all conversations for a user
- `listenToConversations(userId, callback)` - Real-time conversation updates
- `updateConversationUnreadCount(conversationId, userId, increment)` - Manage unread counts

**Message Operations**:
- `sendMessage(conversationId, message)` - Send new message
- `getMessages(conversationId, limit?)` - Fetch messages with pagination
- `listenToMessages(conversationId, callback)` - Real-time message updates
- `updateMessageStatus(messageId, conversationId, status)` - Update message delivery status
- `markMessageAsRead(messageId, conversationId, userId)` - Mark message as read
- `markAllMessagesAsRead(conversationId, userId)` - Bulk mark as read
- `deleteMessage(messageId, conversationId)` - Delete message

**Typing Indicators**:
- `setTypingStatus(conversationId, userId, isTyping)` - Set typing status
- `listenToTypingStatus(conversationId, callback)` - Real-time typing updates

**Utilities**:
- `stopListening(conversationId)` - Clean up listeners
- Plus internal helper functions for error handling and logging

**Pattern**: Async functions with comprehensive error handling and logging.

**Example Usage**:
```typescript
import * as firestoreService from '../services/firebase/firestoreService';

// Send a message
await firestoreService.sendMessage(conversationId, message);

// Listen to messages (real-time)
const unsubscribe = firestoreService.listenToMessages(
  conversationId,
  (messages) => {
    setMessages(messages);
  }
);

// Cleanup
unsubscribe();
```

### Local Database Service (`src/services/database/localDatabase.ts`)

**Purpose**: Provide offline support and local caching using SQLite.

**29 Functions Implemented**:

**Database Management**:
- `initializeDatabase()` - Create tables and indexes
- `closeDatabase()` - Safely close database
- `clearAllData()` - Clear all data
- `getDatabaseStats()` - Get counts of messages, conversations, queue

**Message Operations**:
- `insertMessage(message)` - Save message locally
- `updateMessage(messageId, updates)` - Update existing message
- `getMessages(conversationId, limit?, offset?)` - Fetch messages with pagination
- `getMessageById(messageId)` - Get single message
- `deleteMessage(messageId)` - Delete message
- `markMessageAsSynced(messageId)` - Mark as synced with Firestore

**Conversation Operations**:
- `insertConversation(conversation)` - Save conversation locally
- `updateConversation(conversationId, updates)` - Update conversation
- `getConversations()` - Get all conversations sorted by update time
- `getConversation(conversationId)` - Get single conversation
- `deleteConversation(conversationId)` - Delete conversation and its messages

**Offline Queue Operations**:
- `enqueueOperation(operation)` - Add operation to offline queue
- `getQueuedOperations()` - Get all queued operations
- `dequeueOperation(operationId)` - Remove operation from queue
- `incrementRetryCount(operationId)` - Increment retry count
- `clearQueue()` - Clear all queued operations

**Database Tables**:
- `messages` - id, senderId, conversationId, content, timestamp, status, type, imageUrl, readBy (JSON), synced, createdAt
- `conversations` - id, type, participants (JSON), lastMessage, lastMessageTime, unreadCount (JSON), createdAt, updatedAt, groupName, groupIcon, adminIds (JSON)
- `offline_queue` - id (auto), operationType, data (JSON), createdAt, retryCount

**Indexes for Performance**:
- `idx_messages_conversation` on (conversationId, timestamp DESC)
- `idx_conversations_updated` on (updatedAt DESC)

**Example Usage**:
```typescript
import * as localDatabase from '../services/database/localDatabase';

// Initialize database
await localDatabase.initializeDatabase();

// Save message locally
await localDatabase.insertMessage(message);

// Queue operation for offline sync
await localDatabase.enqueueOperation({
  operationType: 'sendMessage',
  data: { conversationId, message },
});

// Get statistics
const stats = await localDatabase.getDatabaseStats();
console.log(`${stats.messageCount} messages, ${stats.queueLength} queued`);
```

---

## Core Design Patterns

### 1. MVVM (Model-View-ViewModel)

**Why**: SwiftUI works best with MVVM. Clean separation of concerns.

**Structure**:
```
View (SwiftUI) → ViewModel (ObservableObject) → Model (Data)
                        ↕
                 Service Layer (Network, Database)
```

**Example**:
```swift
// Model
struct Message: Identifiable, Codable {
    let id: String
    let senderId: String
    let content: String
    let timestamp: Date
    var status: MessageStatus
}

// ViewModel
@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading = false
    
    private let firestoreService: FirestoreService
    private let localDatabase: LocalDatabaseService
    
    func sendMessage(_ content: String) async {
        // Business logic here
    }
    
    func loadMessages() async {
        // Load from local DB first (fast)
        messages = await localDatabase.fetchMessages()
        // Then sync with Firestore
        await syncWithFirestore()
    }
}

// View
struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    
    var body: some View {
        // UI code
    }
}
```

### 2. Optimistic UI Updates

**Pattern**: Show UI changes immediately, then confirm with server.

**Flow**:
1. User taps send
2. Create local message with status = "sending"
3. Insert into SwiftData (local)
4. Display in UI immediately
5. Send to Firestore
6. On success: Update status to "sent"
7. On failure: Update status to "failed", show retry button

**Why**: Makes app feel instant. WhatsApp uses this pattern.

**Implementation**:
```swift
func sendMessage(_ content: String) async {
    // 1. Create local message
    let localMessage = Message(
        id: UUID().uuidString, // temp local ID
        senderId: currentUserId,
        content: content,
        timestamp: Date(),
        status: .sending
    )
    
    // 2. Save locally & update UI
    localDatabase.insert(localMessage)
    messages.append(localMessage) // UI updates instantly
    
    // 3. Send to server
    do {
        let serverMessage = try await firestoreService.sendMessage(localMessage)
        // 4. Update with server-confirmed data
        localDatabase.update(localMessage.id, with: serverMessage)
        updateMessageStatus(localMessage.id, to: .sent)
    } catch {
        // 5. Handle failure
        updateMessageStatus(localMessage.id, to: .failed)
    }
}
```

### 3. Repository Pattern

**Pattern**: Single source of truth that coordinates between local and remote data.

**Why**: Simplifies data access, handles offline scenarios automatically.

**Structure**:
```swift
protocol MessageRepository {
    func getMessages(conversationId: String) async -> [Message]
    func sendMessage(_ message: Message) async throws -> Message
    func syncMessages(conversationId: String) async throws
}

class MessageRepositoryImpl: MessageRepository {
    private let localDB: SwiftDataService
    private let remoteDB: FirestoreService
    
    func getMessages(conversationId: String) async -> [Message] {
        // Try local first (fast)
        let localMessages = localDB.fetch(conversationId)
        
        // Then sync with remote in background
        Task {
            try? await syncMessages(conversationId)
        }
        
        return localMessages
    }
    
    func sendMessage(_ message: Message) async throws -> Message {
        // Save locally first
        localDB.insert(message)
        
        // If online, send to server
        if NetworkMonitor.shared.isConnected {
            return try await remoteDB.sendMessage(message)
        } else {
            // Queue for later sync
            OfflineQueue.shared.enqueue(message)
            return message
        }
    }
}
```

### 4. Real-Time Listeners with Firestore

**Pattern**: Subscribe to Firestore collection, get live updates.

**Implementation**:
```swift
class FirestoreService {
    private var listeners: [String: ListenerRegistration] = [:]
    
    func listenToMessages(conversationId: String, 
                         onUpdate: @escaping ([Message]) -> Void) {
        let ref = db.collection("conversations")
                    .document(conversationId)
                    .collection("messages")
                    .order(by: "timestamp")
        
        let listener = ref.addSnapshotListener { snapshot, error in
            guard let documents = snapshot?.documents else { return }
            
            let messages = documents.compactMap { doc -> Message? in
                try? doc.data(as: Message.self)
            }
            
            onUpdate(messages)
        }
        
        listeners[conversationId] = listener
    }
    
    func stopListening(conversationId: String) {
        listeners[conversationId]?.remove()
        listeners.removeValue(forKey: conversationId)
    }
}
```

**Lifecycle**:
- Start listener when user opens conversation
- Stop listener when user leaves conversation (saves Firestore reads)
- Automatically reconnects if connection drops

### 5. Offline Queue Pattern

**Pattern**: Queue operations when offline, sync when online.

**Implementation**:
```swift
actor OfflineQueue {
    static let shared = OfflineQueue()
    
    private var queue: [PendingOperation] = []
    
    enum PendingOperation {
        case sendMessage(Message)
        case updateReadReceipt(messageId: String)
        case uploadImage(imageData: Data, messageId: String)
    }
    
    func enqueue(_ operation: PendingOperation) {
        queue.append(operation)
        // Persist to disk
        saveQueueToDisk()
    }
    
    func processQueue() async {
        guard NetworkMonitor.shared.isConnected else { return }
        
        for operation in queue {
            do {
                try await execute(operation)
                queue.removeFirst()
            } catch {
                print("Failed to process: \(error)")
                break // Stop processing on first failure
            }
        }
        
        saveQueueToDisk()
    }
    
    private func execute(_ operation: PendingOperation) async throws {
        switch operation {
        case .sendMessage(let message):
            try await FirestoreService.shared.sendMessage(message)
        case .updateReadReceipt(let messageId):
            try await FirestoreService.shared.markAsRead(messageId)
        case .uploadImage(let data, let messageId):
            try await FirestoreService.shared.uploadImage(data, messageId)
        }
    }
}

// Usage in ViewModel
func sendMessage(_ content: String) async {
    let message = createMessage(content)
    
    if NetworkMonitor.shared.isConnected {
        try? await firestoreService.sendMessage(message)
    } else {
        await OfflineQueue.shared.enqueue(.sendMessage(message))
    }
}

// Process queue when connectivity returns
NetworkMonitor.shared.onConnectivityChange = { isConnected in
    if isConnected {
        Task {
            await OfflineQueue.shared.processQueue()
        }
    }
}
```

### 6. Network Monitoring

**Pattern**: Observe network state, react to changes.

```swift
import Network

class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()
    
    @Published var isConnected = true
    @Published var connectionType: NWInterface.InterfaceType?
    
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    
    var onConnectivityChange: ((Bool) -> Void)?
    
    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                let wasConnected = self?.isConnected ?? false
                self?.isConnected = path.status == .satisfied
                self?.connectionType = path.availableInterfaces.first?.type
                
                if wasConnected != self?.isConnected {
                    self?.onConnectivityChange?(self?.isConnected ?? false)
                }
            }
        }
        monitor.start(queue: queue)
    }
}
```

### 7. AI Agent Pattern (RAG + Function Calling)

**Pattern**: AI agent retrieves context from user data, then responds.

**Architecture**:
```
User Query
    ↓
Cloud Function (Node.js)
    ↓
1. Parse query intent
    ↓
2. Retrieve relevant data (RAG)
    - Get conversation history from Firestore
    - Get user preferences
    ↓
3. Call OpenAI with context + tools
    ↓
4. OpenAI decides to call functions if needed
    ↓
5. Execute functions (e.g., getConversation)
    ↓
6. Send function results back to OpenAI
    ↓
7. OpenAI generates final response
    ↓
Return to client
```

**Implementation** (Cloud Function):
```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const aiSummarize = functions.https.onCall(async (data, context) => {
  const { conversationId } = data;
  const userId = context.auth?.uid;
  
  // 1. Retrieve conversation history (RAG)
  const messages = await getConversationHistory(conversationId, 100);
  
  // 2. Format for AI
  const contextText = messages.map(m => 
    `${m.senderName}: ${m.content}`
  ).join('\n');
  
  // 3. Call OpenAI
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `Summarize this conversation:\n\n${contextText}`,
    maxTokens: 500,
  });
  
  return { summary: text };
});
```

**With Function Calling**:
```typescript
const tools = {
  getConversation: {
    description: 'Get messages from a conversation',
    parameters: z.object({
      conversationId: z.string(),
      limit: z.number().optional(),
    }),
    execute: async ({ conversationId, limit = 50 }) => {
      return await getConversationHistory(conversationId, limit);
    }
  },
  extractActionItems: {
    description: 'Extract action items from messages',
    parameters: z.object({
      messages: z.array(z.string()),
    }),
    execute: async ({ messages }) => {
      // Parse action items from messages
      const actionItems = messages
        .filter(m => /TODO|action item|need to|should/i.test(m))
        .map(parseActionItem);
      return actionItems;
    }
  }
};

export const aiAssistant = functions.https.onCall(async (data, context) => {
  const { query } = data;
  
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: query,
    tools: tools,
    maxSteps: 5, // Allow multi-step reasoning
  });
  
  return { response: text };
});
```

### 8. State Management with Combine

**Pattern**: Reactive state management for complex flows.

**Example**: Chat connection state
```swift
import Combine

class ConnectionStateManager: ObservableObject {
    enum State {
        case disconnected
        case connecting
        case connected
        case reconnecting
        case failed(Error)
    }
    
    @Published var state: State = .disconnected
    @Published var unsentMessageCount: Int = 0
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // React to network changes
        NetworkMonitor.shared.$isConnected
            .sink { [weak self] isConnected in
                if isConnected {
                    self?.connect()
                } else {
                    self?.state = .disconnected
                }
            }
            .store(in: &cancellables)
    }
    
    func connect() {
        state = .connecting
        
        // Attempt connection
        Task {
            do {
                try await FirestoreService.shared.connect()
                state = .connected
                await processOfflineQueue()
            } catch {
                state = .failed(error)
                scheduleReconnect()
            }
        }
    }
    
    private func scheduleReconnect() {
        // Exponential backoff
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { [weak self] in
            self?.state = .reconnecting
            self?.connect()
        }
    }
}
```

### 9. Dependency Injection

**Pattern**: Inject dependencies for testability.

```swift
protocol FirestoreServiceProtocol {
    func sendMessage(_ message: Message) async throws -> Message
    func getMessages(conversationId: String) async throws -> [Message]
}

class ChatViewModel: ObservableObject {
    private let firestoreService: FirestoreServiceProtocol
    private let localDatabase: LocalDatabaseServiceProtocol
    
    // Dependency injection through initializer
    init(firestoreService: FirestoreServiceProtocol = FirestoreService(),
         localDatabase: LocalDatabaseServiceProtocol = LocalDatabaseService()) {
        self.firestoreService = firestoreService
        self.localDatabase = localDatabase
    }
}

// For testing, inject mocks
class MockFirestoreService: FirestoreServiceProtocol {
    func sendMessage(_ message: Message) async throws -> Message {
        // Mock implementation
        return message
    }
}

// In tests
let mockService = MockFirestoreService()
let viewModel = ChatViewModel(firestoreService: mockService)
```

### 10. Error Handling Strategy

**Pattern**: Graceful error handling with user-friendly messages.

```swift
enum AppError: LocalizedError {
    case networkError
    case authenticationFailed
    case messageFailedToSend
    case aiServiceUnavailable
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return "No internet connection. Message will send when you're back online."
        case .authenticationFailed:
            return "Please log in again."
        case .messageFailedToSend:
            return "Failed to send message. Tap to retry."
        case .aiServiceUnavailable:
            return "AI features are temporarily unavailable. Try again in a moment."
        case .unknown(let error):
            return "Something went wrong: \(error.localizedDescription)"
        }
    }
}

class ErrorHandler: ObservableObject {
    @Published var currentError: AppError?
    @Published var showError = false
    
    func handle(_ error: Error) {
        if let appError = error as? AppError {
            currentError = appError
        } else {
            currentError = .unknown(error)
        }
        showError = true
    }
}

// Usage in View
.alert("Error", isPresented: $errorHandler.showError) {
    Button("OK") {
        errorHandler.currentError = nil
    }
} message: {
    Text(errorHandler.currentError?.errorDescription ?? "Unknown error")
}
```

## Data Flow Patterns

### Message Sending Flow
```
User taps send
    ↓
ChatViewModel.sendMessage()
    ↓
1. Create optimistic message (status: sending)
    ↓
2. Save to SwiftData
    ↓
3. Update UI (@Published triggers View update)
    ↓
4. MessageRepository.sendMessage()
    ↓
5. FirestoreService.sendMessage()
    ↓
6. Firestore saves message
    ↓
7. Server returns confirmation
    ↓
8. Update local message (status: sent)
    ↓
9. UI updates with checkmark
```

### Message Receiving Flow
```
Sender sends message
    ↓
Firestore stores message
    ↓
Firestore real-time listener pushes update
    ↓
FirestoreService receives snapshot
    ↓
Parse messages from snapshot
    ↓
Save to SwiftData (local cache)
    ↓
Notify ViewModel (@Published var messages)
    ↓
View automatically re-renders
    ↓
Message appears in UI
    ↓
(If app backgrounded) Trigger push notification
```

### Offline-to-Online Sync Flow
```
User comes back online
    ↓
NetworkMonitor detects connection
    ↓
ConnectionStateManager.connect()
    ↓
OfflineQueue.processQueue()
    ↓
For each queued operation:
    1. Try to execute
    2. On success: Remove from queue
    3. On failure: Keep in queue, retry later
    ↓
Firestore listeners reconnect
    ↓
Pull any missed messages
    ↓
UI updates with new messages
```

## Performance Optimization Patterns

### 1. Lazy Loading
- Load last 50 messages initially
- Load more when user scrolls up
- Use `ScrollViewReader` to maintain scroll position

### 2. Image Optimization
- Compress images before upload (max 1MB)
- Use thumbnails in list view
- Lazy load full-size images
- Cache images in memory (NSCache)

### 3. Database Indexing
```swift
// SwiftData: Add indexes for common queries
@Model
class Message {
    @Attribute(.unique) var id: String
    @Attribute(.indexed) var conversationId: String // Index for fast lookups
    @Attribute(.indexed) var timestamp: Date
    var content: String
}
```

### 4. Debouncing (Typing Indicators)
```swift
private var typingTimer: Timer?

func userIsTyping() {
    // Cancel previous timer
    typingTimer?.invalidate()
    
    // Send "typing" indicator
    firestoreService.setTypingStatus(true)
    
    // Auto-clear after 3 seconds
    typingTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { _ in
        firestoreService.setTypingStatus(false)
    }
}
```

## Security Patterns

### 1. Input Validation
```swift
func sendMessage(_ content: String) async {
    // Validate input
    guard !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
        return
    }
    
    guard content.count <= 10000 else {
        errorHandler.handle(.messageTooLong)
        return
    }
    
    // Sanitize content (remove potentially dangerous characters)
    let sanitized = content.filter { !$0.isNewline || content.count < 100 }
    
    // Proceed with sending
    await messagingService.sendMessage(sanitized)
}
```

### 2. Authentication Check
```swift
func requireAuthentication() async throws {
    guard let user = Auth.auth().currentUser else {
        throw AppError.authenticationFailed
    }
    
    // Verify token is still valid
    try await user.getIDToken(forcingRefresh: false)
}
```

## Testing Patterns

### 1. Protocol-Oriented Testing
```swift
// Production
class RealFirestoreService: FirestoreServiceProtocol { }

// Testing
class MockFirestoreService: FirestoreServiceProtocol {
    var messagesToReturn: [Message] = []
    var sendMessageShouldFail = false
    
    func getMessages(conversationId: String) async throws -> [Message] {
        return messagesToReturn
    }
}
```

### 2. Snapshot Testing (UI)
- Capture UI state at key points
- Compare against golden snapshots
- Detect unintended UI changes

## Architectural Decisions

### Decision 1: SwiftData over Core Data
**Rationale**: SwiftData is modern, type-safe, and simpler API. Core Data is legacy.

### Decision 2: Firestore over Custom WebSockets
**Rationale**: Firestore provides real-time out of the box. Building WebSocket infrastructure would take days.

### Decision 3: Cloud Functions over Custom Server
**Rationale**: Serverless = no infrastructure management. Faster to MVP.

### Decision 4: OpenAI over Local LLM
**Rationale**: OpenAI GPT-4 is higher quality. Running local LLM (Llama) on device is slow and large model size.

### Decision 5: Dedicated AI Chat over Contextual UI (for MVP)
**Rationale**: Faster to build. Can add contextual features later. User intent is clearer with explicit chat.

