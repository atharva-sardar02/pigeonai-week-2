# Pigeon AI - Architecture Diagram

## Complete System Architecture

### Frontend Architecture (Mobile Client)

```mermaid
graph TB
    subgraph Frontend["Mobile Client - React Native + Expo"]
        UI[UI Components]
        AuthScreens[Auth Screens]
        ChatScreens[Chat Screens]
        ProfileScreens[Profile Screens]
        
        AuthContext[Auth Context]
        ChatContext[Chat Context]
        NetworkContext[Network Context]
        PresenceContext[Presence Context]
        
        Hooks[Custom Hooks]
        OfflineQueue[Offline Queue Manager]
        
        AuthService[Auth Service]
        FirestoreService[Firestore Service]
        StorageService[Storage Service]
        NotificationService[Notification Service]
        NetworkMonitor[Network Monitor]
        
        SQLite[(SQLite Database)]
        AsyncStorage[(AsyncStorage)]
        
        Validators[Validators]
        DateFormatter[Date Formatter]
        ImageCompressor[Image Compressor]
    end
    
    AuthScreens --> AuthContext
    ChatScreens --> ChatContext
    ChatScreens --> NetworkContext
    ChatScreens --> PresenceContext
    
    AuthContext --> Hooks
    ChatContext --> Hooks
    NetworkContext --> OfflineQueue
    PresenceContext --> Hooks
    
    Hooks --> AuthService
    Hooks --> FirestoreService
    Hooks --> StorageService
    Hooks --> NotificationService
    
    FirestoreService --> SQLite
    OfflineQueue --> AsyncStorage
    Hooks --> SQLite
    
    OfflineQueue --> FirestoreService
    NetworkMonitor --> OfflineQueue
    NetworkMonitor --> NetworkContext
    
    AuthService --> Validators
    ChatScreens --> DateFormatter
    StorageService --> ImageCompressor
    
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px
    classDef database fill:#4caf50,stroke:#333,stroke-width:2px
    
    class UI,AuthScreens,ChatScreens,ProfileScreens,AuthContext,ChatContext,NetworkContext,PresenceContext,Hooks,OfflineQueue,AuthService,FirestoreService,StorageService,NotificationService,NetworkMonitor,Validators,DateFormatter,ImageCompressor frontend
    class SQLite,AsyncStorage database
```

### Backend Architecture (Firebase)

```mermaid
graph TB
    subgraph Backend["Firebase Backend"]
        FirebaseAuth[Firebase Authentication]
        Firestore[Cloud Firestore]
        FirebaseStorage[Firebase Storage]
        FCM[Firebase Cloud Messaging]
        
        UsersCol["/users/"]
        ConversationsCol["/conversations/"]
        MessagesCol["/messages/"]
        GroupsCol["/groups/"]
        TypingCol["/typing/"]
        
        FirestoreRules[Firestore Rules]
        StorageRules[Storage Rules]
    end
    
    subgraph External["External Services"]
        APNs[Apple Push Notifications]
        FCMService[FCM Service]
    end
    
    Firestore --> UsersCol
    Firestore --> ConversationsCol
    Firestore --> MessagesCol
    Firestore --> GroupsCol
    Firestore --> TypingCol
    
    FirestoreRules -.-> Firestore
    StorageRules -.-> FirebaseStorage
    
    FCM --> APNs
    FCM --> FCMService
    
    classDef backend fill:#FFA611,stroke:#333,stroke-width:2px
    classDef database fill:#4caf50,stroke:#333,stroke-width:2px
    classDef external fill:#9c27b0,stroke:#333,stroke-width:2px
    
    class FirebaseAuth,Firestore,FirebaseStorage,FCM,FirestoreRules,StorageRules backend
    class UsersCol,ConversationsCol,MessagesCol,GroupsCol,TypingCol database
    class APNs,FCMService external
```

### Complete System Integration

```mermaid
graph LR
    subgraph Client["React Native App"]
        App[Mobile App]
        LocalDB[(Local SQLite)]
    end
    
    subgraph Firebase["Firebase Services"]
        Auth[Authentication]
        DB[Firestore]
        Storage[Storage]
        Messaging[Cloud Messaging]
    end
    
    subgraph Push["Push Services"]
        APNs[Apple Push]
        GoogleFCM[Google FCM]
    end
    
    App -->|Auth| Auth
    App -->|Read/Write| DB
    App -->|Upload| Storage
    App -->|Receive| Messaging
    App -->|Cache| LocalDB
    
    Messaging --> APNs
    Messaging --> GoogleFCM
    APNs -.->|Notify| App
    GoogleFCM -.->|Notify| App
    
    classDef client fill:#61dafb,stroke:#333,stroke-width:2px
    classDef firebase fill:#FFA611,stroke:#333,stroke-width:2px
    classDef push fill:#9c27b0,stroke:#333,stroke-width:2px
    
    class App,LocalDB client
    class Auth,DB,Storage,Messaging firebase
    class APNs,GoogleFCM push
```

---

## Data Flow Diagrams

### 1. Message Sending Flow (Online)

```mermaid
sequenceDiagram
    actor UserA as User A
    participant UI as Chat Screen
    participant Hook as useMessages Hook
    participant FS as Firestore Service
    participant LDB as Local SQLite
    participant Firestore as Cloud Firestore
    participant Listener as User B Listener
    actor UserB as User B
    
    UserA->>UI: Types message & taps Send
    UI->>Hook: sendMessage(content)
    
    Note over Hook: Optimistic Update
    Hook->>LDB: Save locally (status: sending)
    Hook->>UI: Update UI immediately
    UI-->>UserA: Message appears instantly
    
    Hook->>FS: sendMessage(message)
    FS->>Firestore: Create document in messages collection
    Firestore-->>FS: Confirmation + messageId
    FS->>LDB: Update status to "sent"
    FS->>Hook: Return success
    Hook->>UI: Update checkmark (sent)
    
    Note over Firestore,Listener: Real-time Sync
    Firestore->>Listener: onSnapshot update
    Listener->>UserB: Display message
    UserB-->>Firestore: Mark as delivered
    Firestore->>Hook: Update status
    UI-->>UserA: Double checkmark (delivered)
    
    UserB->>Listener: Opens chat
    Listener->>Firestore: markAsRead()
    Firestore->>Hook: Update readBy
    UI-->>UserA: Blue checkmarks (read)
```

### 2. Message Sending Flow (Offline)

```mermaid
sequenceDiagram
    actor User as User
    participant UI as Chat Screen
    participant Hook as useMessages Hook
    participant Queue as Offline Queue
    participant LDB as Local SQLite
    participant Network as Network Monitor
    participant FS as Firestore Service
    participant Firestore as Cloud Firestore
    
    User->>UI: Types message & taps Send
    UI->>Hook: sendMessage(content)
    
    Note over Network: Device is Offline
    Network-->>Hook: isConnected = false
    
    Hook->>LDB: Save locally (status: pending)
    Hook->>Queue: enqueue(sendMessage operation)
    Queue->>AsyncStorage: Persist queue
    Hook->>UI: Show "pending" status
    UI-->>User: Clock icon (waiting to send)
    
    Note over Network: Connection Restored
    Network->>Queue: onConnect() event
    Queue->>AsyncStorage: Load queued operations
    
    loop Process Queue
        Queue->>FS: Execute operation
        FS->>Firestore: Send message
        Firestore-->>FS: Success
        FS->>LDB: Update status to "sent"
        Queue->>AsyncStorage: Remove from queue
        FS->>UI: Update checkmark
    end
    
    UI-->>User: Message sent successfully
```

### 3. Real-Time Presence & Typing

```mermaid
sequenceDiagram
    participant UserA as User A App
    participant PresenceA as Presence Context
    participant Firestore as Cloud Firestore
    participant ListenerB as User B Listener
    participant UserB as User B App
    
    Note over UserA,PresenceA: User A opens app
    UserA->>PresenceA: App enters foreground
    PresenceA->>Firestore: updatePresence(isOnline: true)
    Firestore->>ListenerB: Real-time update
    ListenerB->>UserB: Show "Online" indicator
    
    Note over UserA,UserB: User A types
    UserA->>Firestore: setTypingStatus(true)
    Firestore->>ListenerB: Real-time update
    ListenerB->>UserB: Show "User A is typing..."
    
    Note over UserA: 3 seconds pass
    UserA->>Firestore: setTypingStatus(false)
    Firestore->>ListenerB: Real-time update
    ListenerB->>UserB: Hide typing indicator
    
    Note over UserA,PresenceA: User A backgrounds app
    UserA->>PresenceA: App enters background
    PresenceA->>Firestore: updatePresence(isOnline: false, lastSeen: now)
    Firestore->>ListenerB: Real-time update
    ListenerB->>UserB: Show "Last seen 2m ago"
```

### 4. Image Upload Flow

```mermaid
sequenceDiagram
    actor User as User
    participant UI as Chat Screen
    participant Picker as Image Picker
    participant Compressor as Image Compressor
    participant Storage as Storage Service
    participant FBStorage as Firebase Storage
    participant FS as Firestore Service
    participant Firestore as Cloud Firestore
    
    User->>UI: Taps camera icon
    UI->>Picker: Open image picker
    Picker-->>UI: Returns image URI
    
    UI->>Compressor: compressImage(uri, quality: 0.7)
    Note over Compressor: Resize & compress to <1MB
    Compressor-->>UI: Compressed image data
    
    UI->>Storage: uploadImage(imageData, path)
    Note over Storage,FBStorage: Optimistic UI shows thumbnail
    Storage->>FBStorage: Upload to /images/{userId}/{timestamp}
    FBStorage-->>Storage: Download URL
    
    Storage->>FS: sendMessage(type: image, imageUrl)
    FS->>Firestore: Create message document
    Firestore-->>FS: Success
    FS-->>UI: Update message with final URL
    
    UI-->>User: Image appears in chat
```

### 5. Push Notification Flow

```mermaid
sequenceDiagram
    participant UserA as User A App
    participant FS as Firestore Service
    participant Firestore as Cloud Firestore
    participant FCM as Firebase Cloud Messaging
    participant APNs as Apple/Google Push Service
    participant UserB as User B Device
    participant NotifService as Notification Service
    
    UserA->>FS: sendMessage(to: UserB)
    FS->>Firestore: Save message
    
    Note over FS,Firestore: Get recipient's FCM token
    Firestore-->>FS: UserB FCM token
    
    FS->>FCM: Send notification payload
    Note over FCM: {<br/>title: "User A",<br/>body: "Message preview",<br/>data: { conversationId }<br/>}
    
    FCM->>APNs: Route to platform service
    APNs->>UserB: Deliver notification
    
    alt App in Foreground
        UserB->>NotifService: Handle foreground notification
        NotifService->>UserB: Show in-app banner
    else App in Background
        UserB->>UserB: System notification appears
    end
    
    UserB->>NotifService: Tap notification
    NotifService->>UserB: Navigate to conversation
```

### 6. Group Chat Message Flow

```mermaid
sequenceDiagram
    participant UserA as User A
    participant FS as Firestore Service
    participant Firestore as Cloud Firestore
    participant ListenerB as User B Listener
    participant ListenerC as User C Listener
    participant ListenerD as User D Listener
    
    UserA->>FS: sendMessage(groupId, content)
    FS->>Firestore: Save to /conversations/{groupId}/messages
    
    Note over Firestore: Broadcast to all participants
    
    par Parallel Delivery
        Firestore->>ListenerB: onSnapshot update
        ListenerB->>ListenerB: Display message
        ListenerB->>Firestore: Mark as delivered
        
        Firestore->>ListenerC: onSnapshot update
        ListenerC->>ListenerC: Display message
        ListenerC->>Firestore: Mark as delivered
        
        Firestore->>ListenerD: onSnapshot update
        ListenerD->>ListenerD: Display message
        ListenerD->>Firestore: Mark as delivered
    end
    
    Note over FS: Calculate read status
    FS->>FS: Check readBy: { userB, userC }
    FS->>UserA: Update status: "Read by 2/3"
```

---

## Technology Stack Map

```mermaid
graph LR
    subgraph "Frontend Technologies"
        RN[React Native<br/>Cross-platform Framework]
        Expo[Expo<br/>Development Platform]
        TS[TypeScript<br/>Type Safety]
        RNav[React Navigation<br/>Routing]
    end
    
    subgraph "State Management"
        Context[React Context<br/>Global State]
        Hooks[Custom Hooks<br/>Business Logic]
    end
    
    subgraph "Local Storage"
        SQLiteDB[Expo SQLite<br/>Structured Data]
        AsyncStor[AsyncStorage<br/>Key-Value Store]
    end
    
    subgraph "Firebase Services"
        FBAuth[Firebase Auth<br/>Authentication]
        FBFirestore[Cloud Firestore<br/>Real-time DB]
        FBStorage[Firebase Storage<br/>File Storage]
        FBMessaging[Firebase Cloud Messaging<br/>Push Notifications]
    end
    
    subgraph "Expo APIs"
        ExpoCam[expo-image-picker<br/>Camera & Gallery]
        ExpoNotif[expo-notifications<br/>Local & Push]
        ExpoSQL[expo-sqlite<br/>Database]
        ExpoNet[@react-native-community/netinfo<br/>Network Status]
    end
    
    subgraph "UI Libraries"
        GiftedChat[react-native-gifted-chat<br/>Chat UI Components]
        SafeArea[react-native-safe-area-context<br/>Safe Areas]
    end
    
    subgraph "Testing"
        Jest[Jest<br/>Test Runner]
        RTL[React Testing Library<br/>Component Tests]
    end
    
    RN --> Expo
    RN --> TS
    RN --> RNav
    RN --> Context
    Context --> Hooks
    
    Hooks --> SQLiteDB
    Hooks --> AsyncStor
    Hooks --> FBAuth
    Hooks --> FBFirestore
    Hooks --> FBStorage
    Hooks --> FBMessaging
    
    Expo --> ExpoCam
    Expo --> ExpoNotif
    Expo --> ExpoSQL
    Expo --> ExpoNet
    
    RN --> GiftedChat
    RN --> SafeArea
    
    TS --> Jest
    Jest --> RTL
```

---

## Component Interaction Map

```mermaid
graph TB
    subgraph "Screen Components"
        Login[LoginScreen]
        Signup[SignupScreen]
        ConvList[ConversationListScreen]
        Chat[ChatScreen]
        NewChat[NewChatScreen]
        CreateGroup[CreateGroupScreen]
        Profile[ProfileScreen]
    end
    
    subgraph "Feature Components"
        MsgBubble[MessageBubble]
        MsgList[MessageList]
        MsgInput[MessageInput]
        ChatHeader[ChatHeader]
        ConvItem[ConversationListItem]
        TypingInd[TypingIndicator]
        Avatar[Avatar]
    end
    
    subgraph "Common Components"
        Loading[LoadingSpinner]
        Error[ErrorMessage]
        Offline[OfflineIndicator]
        EmptyState[EmptyState]
    end
    
    subgraph "Hooks"
        useAuth[useAuth]
        useMessages[useMessages]
        useConversations[useConversations]
        usePresence[usePresence]
        useTyping[useTypingIndicator]
        useNetwork[useNetworkStatus]
    end
    
    Login --> useAuth
    Signup --> useAuth
    
    ConvList --> useConversations
    ConvList --> ConvItem
    ConvList --> EmptyState
    
    Chat --> useMessages
    Chat --> usePresence
    Chat --> useTyping
    Chat --> ChatHeader
    Chat --> MsgList
    Chat --> MsgInput
    Chat --> TypingInd
    Chat --> Offline
    
    MsgList --> MsgBubble
    MsgBubble --> Avatar
    
    ChatHeader --> Avatar
    ChatHeader --> usePresence
    
    ConvItem --> Avatar
    ConvItem --> usePresence
    
    NewChat --> useConversations
    CreateGroup --> useConversations
    Profile --> useAuth
    
    useNetwork --> Offline
    
    Loading -.-> ConvList
    Loading -.-> Chat
    Error -.-> ConvList
    Error -.-> Chat
```

---

## Offline Queue Architecture

```mermaid
graph TB
    subgraph "Online State"
        Send1[Send Message] --> Check1{Network?}
        Check1 -->|Online| Firestore1[Send to Firestore]
        Firestore1 --> Success1[Update Status: Sent]
    end
    
    subgraph "Offline State"
        Send2[Send Message] --> Check2{Network?}
        Check2 -->|Offline| Local[Save Locally]
        Local --> Queue[Add to Queue]
        Queue --> Storage[Persist to AsyncStorage]
        Storage --> UI[Show Pending Status]
    end
    
    subgraph "Reconnection Flow"
        Network[Network Restored] --> Monitor[Network Monitor]
        Monitor --> Trigger[Trigger processQueue]
        Trigger --> Load[Load from AsyncStorage]
        Load --> Process[Process Operations]
        
        Process --> Op1[Operation 1]
        Op1 --> Try1{Success?}
        Try1 -->|Yes| Remove1[Remove from Queue]
        Try1 -->|No| Retry1[Retry with Backoff]
        
        Retry1 --> Try2{Success?}
        Try2 -->|Yes| Remove1
        Try2 -->|No| Retry2[Retry Again]
        
        Retry2 --> Try3{Success?}
        Try3 -->|Yes| Remove1
        Try3 -->|No| Fail[Mark as Failed]
        
        Remove1 --> Next[Next Operation]
        Next --> SaveQueue[Update Queue]
    end
    
    UI --> Network
```

---

## Security & Access Control Flow

```mermaid
graph TB
    Request[Client Request] --> Auth{Authenticated?}
    Auth -->|No| Reject[401 Unauthorized]
    Auth -->|Yes| Rules[Firestore Security Rules]
    
    Rules --> UserCheck{User in<br/>participants?}
    UserCheck -->|No| Deny[403 Forbidden]
    UserCheck -->|Yes| Action{Action Type?}
    
    Action -->|Read| ReadCheck[Check read permissions]
    Action -->|Write| WriteCheck[Check write permissions]
    Action -->|Delete| DeleteCheck[Check delete permissions]
    
    ReadCheck --> Allow[Allow Access]
    WriteCheck --> Validate{Data Valid?}
    DeleteCheck --> Owner{Is Owner?}
    
    Validate -->|Yes| Allow
    Validate -->|No| Deny
    
    Owner -->|Yes| Allow
    Owner -->|No| Deny
```

---

## Notes

- **Real-time Updates**: Firestore onSnapshot listeners provide <1 second latency
- **Offline-First**: All data written to local SQLite before Firestore
- **Optimistic UI**: UI updates immediately, then syncs with server
- **Queue Persistence**: AsyncStorage ensures queued operations survive app restarts
- **Security**: All Firebase access controlled by security rules
- **Scalability**: Firebase auto-scales; client handles offline scenarios gracefully


