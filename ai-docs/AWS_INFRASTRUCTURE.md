# AWS Infrastructure for Pigeon AI - Phase 2

**Date**: October 22, 2025  
**Decision**: Use AWS for all AI processing (unlimited plan, zero cost concerns)

---

## Infrastructure Strategy: Hybrid Firebase + AWS

### **Why Hybrid?**

**Firebase (Spark Plan - Free)**:
- ✅ Excellent for: Real-time sync, auth, data storage
- ✅ Already set up and working for MVP
- ❌ Limitations: Cloud Functions require Blaze plan (paid)
- ❌ Limitations: 50K reads/day, 20K writes/day limits

**AWS (Unlimited Plan)**:
- ✅ Zero cost concerns (unlimited plan)
- ✅ Better performance for compute-heavy AI workloads
- ✅ Advanced services: OpenSearch (vectors), ElastiCache (caching)
- ✅ Already working: Push notifications (Lambda + API Gateway)

**Best of Both Worlds**: Firebase handles data, AWS handles processing.

---

## Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│              (Expo, TypeScript, React Native)                │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
┌───────────────┐      ┌──────────────────┐
│   Firebase    │      │   AWS Services   │
│  (Free Tier)  │      │  (Unlimited)     │
└───────────────┘      └──────────────────┘
        │                        │
        │                        │
   ┌────┴────┐          ┌───────┴────────┐
   │         │          │                │
   ▼         ▼          ▼                ▼
┌──────┐ ┌────────┐ ┌────────┐  ┌──────────────┐
│ Auth │ │Firestore│ │Lambda  │  │API Gateway   │
└──────┘ └────────┘ └────────┘  └──────────────┘
   ▲         ▲          │                │
   │         │          │                │
   ▼         ▼          ▼                ▼
┌──────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐
│ FCM  │ │Storage │ │OpenSearch│ │ElastiCache   │
└──────┘ └────────┘ └──────────┘ └──────────────┘
                         │
                         ▼
                  ┌────────────┐
                  │ OpenAI API │
                  └────────────┘
```

---

## Service Breakdown

### Firebase Services (Free Tier)

#### 1. Firebase Authentication
- **Purpose**: User login, JWT tokens
- **Usage**: Already implemented in MVP
- **Cost**: Free (50K MAU)

#### 2. Cloud Firestore
- **Purpose**: Real-time message storage, conversation data
- **Collections**: 
  - `/users/{userId}` - User profiles
  - `/conversations/{convId}` - Conversation metadata
  - `/conversations/{convId}/messages/{msgId}` - Messages
  - `/groups/{groupId}` - Group info
- **Cost**: Free (50K reads/day, 20K writes/day)
- **Usage**: Already implemented in MVP

#### 3. Firebase Cloud Messaging (FCM)
- **Purpose**: Push notification delivery
- **Integration**: AWS Lambda sends to FCM, FCM delivers to devices
- **Cost**: Free (unlimited)
- **Usage**: Already implemented with AWS Lambda

#### 4. Firebase Storage
- **Purpose**: Image/media storage
- **Cost**: Free (5GB storage, 1GB/day bandwidth)
- **Usage**: Ready for PR #14 (Image Sharing)

---

### AWS Services (Unlimited Plan)

#### 1. AWS Lambda
**Purpose**: Serverless compute for all AI processing

**Functions**:
1. **Push Notifications** (already implemented ✅)
   - Triggered by: React Native app via API Gateway
   - Action: Sends FCM notifications to recipients
   - File: `aws-lambda/index.js`

2. **Thread Summarization** (PR #16)
   - Triggered by: User taps "Summarize" button
   - Action: Fetches messages → OpenAI GPT-4 → Returns summary
   - Caching: Redis (1-hour TTL)

3. **Action Item Extraction** (PR #17)
   - Triggered by: User taps "Extract Action Items"
   - Action: Fetches messages → OpenAI GPT-4 (structured output) → Returns tasks

4. **Priority Detection** (PR #19)
   - Triggered by: On message send (background)
   - Action: Analyzes message → OpenAI GPT-3.5 → Updates priority field
   - Speed: <1s per message

5. **Decision Tracking** (PR #20)
   - Triggered by: User taps "Track Decisions"
   - Action: Fetches messages → OpenAI GPT-4 → Returns decisions

6. **Semantic Search** (PR #18)
   - Triggered by: User searches with natural language
   - Action: Generate query embedding → OpenSearch k-NN search → Return results

7. **Embedding Generation** (PR #18 - background)
   - Triggered by: On message send
   - Action: Generate embedding → Store in OpenSearch
   - Async: Doesn't block message delivery

8. **Scheduling Agent** (PR #21)
   - Triggered by: User initiates scheduling workflow
   - Action: Multi-step agent with LangChain → Suggests meeting times
   - Tools: 5 function calls (extract details, check conflicts, suggest times, generate invite)

**Configuration**:
- Runtime: Node.js 20.x
- Memory: 1024 MB (adjust per function)
- Timeout: 30 seconds (60s for scheduling agent)
- Concurrency: Provisioned (no cold starts)
- Environment Variables: OPENAI_API_KEY, FIREBASE_ADMIN_SDK, REDIS_URL, OPENSEARCH_URL

**Cost**: $0 (unlimited plan)

---

#### 2. AWS API Gateway
**Purpose**: REST API for all Lambda functions

**Endpoints**:
- `POST /send-notification` ✅ (already implemented)
- `POST /ai/summarize` (PR #16)
- `POST /ai/extract-action-items` (PR #17)
- `POST /ai/search` (PR #18)
- `POST /ai/detect-priority` (PR #19)
- `POST /ai/track-decisions` (PR #20)
- `POST /ai/schedule-meeting` (PR #21)

**Features**:
- Built-in rate limiting (1000 req/min per user)
- Request/response caching (optional)
- CORS configuration for React Native
- API key authentication
- Request throttling
- CloudWatch logs

**Cost**: $0 (unlimited plan)

---

#### 3. AWS OpenSearch
**Purpose**: Vector database for semantic search (RAG pipeline)

**Use Case**: Store message embeddings for similarity search

**Data Model**:
```json
{
  "messageId": "msg_12345",
  "conversationId": "conv_67890",
  "content": "Let's deploy the new feature by Friday",
  "embedding": [0.023, -0.145, 0.678, ...], // 1536-dim vector
  "timestamp": "2025-10-22T10:30:00Z",
  "senderId": "user_abc"
}
```

**Index Settings**:
- Engine: OpenSearch 2.x
- Index: `message_embeddings`
- Mapping: `embedding` field with type `knn_vector` (dimension 1536)
- k-NN algorithm: HNSW (Hierarchical Navigable Small World)
- Distance metric: Cosine similarity

**Queries**:
- User searches: "deployment discussion"
- Generate query embedding: OpenAI `text-embedding-3-small`
- k-NN search: Find top 5 most similar message embeddings
- Return: Message IDs + similarity scores

**Cluster**:
- Instance: t3.small.search (2 vCPU, 4GB RAM) - enough for MVP
- Nodes: 1 (single-node for development)
- Storage: 10GB EBS
- Scaling: Add nodes if >100K messages

**Cost**: $0 (unlimited plan)

---

#### 4. AWS ElastiCache (Redis)
**Purpose**: Cache AI responses to reduce OpenAI costs

**Cache Strategy**:
- **Thread Summaries**: Cache for 1 hour (conversations don't change much)
- **Action Items**: Cache for 2 hours
- **Search Results**: Cache for 30 minutes
- **Priority Detection**: No caching (real-time)
- **Decisions**: Cache for 2 hours

**Key Format**:
- Summary: `summary:{conversationId}:{messageCount}`
- Action Items: `action-items:{conversationId}:{messageCount}`
- Search: `search:{conversationId}:{queryHash}`
- Decisions: `decisions:{conversationId}:{messageCount}`

**Example**:
```javascript
// Before calling OpenAI, check cache
const cacheKey = `summary:${conversationId}:${messageCount}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached); // Return cached result
}

// If not cached, call OpenAI
const summary = await openai.chat.completions.create(/* ... */);

// Cache the result (1 hour TTL)
await redis.setex(cacheKey, 3600, JSON.stringify(summary));
return summary;
```

**Cluster**:
- Instance: cache.t3.micro (0.5GB RAM) - enough for MVP
- Engine: Redis 7.x
- Replicas: None (single instance for MVP)

**Cost**: $0 (unlimited plan)

---

#### 5. AWS S3 (Optional)
**Purpose**: Backup storage, large file handling

**Use Cases**:
- Export conversation history (ZIP file)
- Backup embeddings (if OpenSearch fails)
- CloudFront CDN integration for media

**Cost**: $0 (unlimited plan)

---

## Data Flow Examples

### Example 1: Thread Summarization

```
1. User taps "Summarize" in ChatScreen
   ↓
2. React Native app calls API Gateway
   POST https://api-gateway-url/ai/summarize
   Body: { conversationId: "conv_123", messageLimit: 100 }
   Headers: { Authorization: "Bearer <firebase-jwt>" }
   ↓
3. API Gateway validates JWT, forwards to Lambda
   ↓
4. Lambda checks Redis cache
   Key: "summary:conv_123:100"
   ↓
5a. If CACHE HIT:
    - Return cached summary immediately (<50ms)
   ↓
5b. If CACHE MISS:
    - Fetch 100 messages from Firestore
    - Build prompt with messages
    - Call OpenAI GPT-4
    - Parse response
    - Cache result in Redis (1 hour TTL)
    - Return summary
   ↓
6. React Native app displays summary in modal
```

**Response Time**: 
- Cached: <100ms
- Uncached: 2-3 seconds

---

### Example 2: Semantic Search (RAG)

```
1. User searches: "database migration decision"
   ↓
2. React Native app calls API Gateway
   POST https://api-gateway-url/ai/search
   Body: { query: "database migration decision", conversationId: "conv_123" }
   ↓
3. API Gateway forwards to Lambda
   ↓
4. Lambda generates query embedding
   - Call OpenAI embeddings API
   - Input: "database migration decision"
   - Output: [0.123, -0.456, 0.789, ...] (1536-dim vector)
   ↓
5. Lambda queries OpenSearch
   - k-NN search with query embedding
   - Filter by conversationId
   - Return top 5 most similar messages
   ↓
6. Lambda fetches full message details from Firestore
   ↓
7. Lambda returns results ranked by similarity
   [
     { messageId: "msg_1", content: "Let's use blue-green deployment", similarity: 0.92 },
     { messageId: "msg_2", content: "Database migration strategy discussion", similarity: 0.89 },
     ...
   ]
   ↓
8. React Native app displays search results with navigation to messages
```

**Response Time**: <2 seconds

---

### Example 3: Background Embedding Generation

```
1. User sends message in ChatScreen
   ↓
2. Message saved to Firestore (via React Native app)
   ↓
3. Firestore trigger (NOT Cloud Function, use AWS Lambda trigger)
   ↓
4. AWS Lambda receives Firestore event
   ↓
5. Lambda generates embedding
   - Call OpenAI embeddings API
   - Input: Message content
   - Output: 1536-dim vector
   ↓
6. Lambda stores embedding in OpenSearch
   Index: message_embeddings
   Document: { messageId, conversationId, content, embedding, timestamp }
   ↓
7. Message is now searchable via semantic search
```

**Note**: This runs asynchronously, doesn't block message delivery.

---

### Example 4: Multi-Step Scheduling Agent (PR #21)

```
1. User messages: "Let's have a meeting next week"
   ↓
2. App detects scheduling intent (client-side keyword check)
   ↓
3. User taps "Schedule with AI" button
   ↓
4. React Native app calls API Gateway
   POST https://api-gateway-url/ai/schedule-meeting
   Body: { conversationId: "conv_123", triggerMessageId: "msg_456" }
   ↓
5. Lambda initializes LangChain agent with 5 tools:
   - extractSchedulingDetails
   - findConflicts
   - suggestAlternativeTimes
   - generateMeetingProposal
   - confirmMeeting
   ↓
6. Agent Step 1: Extract details
   - Fetch recent messages from Firestore
   - Call OpenAI with function: extractSchedulingDetails
   - Result: { topic: "Project sync", duration: 60, participants: ["Alex", "Sarah"] }
   ↓
7. Agent Step 2: Check conflicts (simulated for MVP)
   - Call function: findConflicts
   - Result: { conflicts: [] }
   ↓
8. Agent Step 3: Suggest times
   - Call function: suggestAlternativeTimes
   - Consider timezones (PST, GMT)
   - Result: [
       { time: "2025-10-29 9:00 AM PST", display: "9AM PST / 5PM GMT" },
       { time: "2025-10-29 10:00 AM PST", display: "10AM PST / 6PM GMT" }
     ]
   ↓
9. Agent Step 4: Generate proposal
   - Call function: generateMeetingProposal
   - Create Google Calendar link
   - Result: { title: "Project Sync", times: [...], calendarUrl: "..." }
   ↓
10. Lambda returns proposal to app
    ↓
11. React Native app displays options in modal
    ↓
12. User selects time → app confirms meeting
```

**Response Time**: 10-15 seconds (multi-step workflow)

---

## Implementation Plan

### PR #15: AWS Infrastructure Setup (2-3 hours)

**Tasks**:
1. Set up AWS OpenSearch cluster (t3.small.search)
2. Set up AWS ElastiCache Redis (cache.t3.micro)
3. Create API Gateway REST API
4. Configure CORS for React Native
5. Set up IAM roles for Lambda (access to OpenSearch, Redis, Firestore)
6. Install dependencies in Lambda:
   - `openai` - OpenAI SDK
   - `@opensearch-project/opensearch` - OpenSearch client
   - `redis` - Redis client
   - `firebase-admin` - Firestore access
   - `langchain` - For multi-step agent (PR #21)
7. Create base Lambda function template
8. Test with existing push notification Lambda
9. Document all endpoints and environment variables

**Deliverables**:
- OpenSearch cluster running
- ElastiCache Redis running
- API Gateway with CORS configured
- Lambda template ready for AI functions
- `docs/AWS_INFRASTRUCTURE_SETUP.md` guide

---

## Security & Best Practices

### Authentication
- All API Gateway endpoints require Firebase JWT
- Lambda validates JWT before processing
- User can only access their own conversations

### API Keys
- OpenAI API key stored in Lambda environment variables
- Never exposed to React Native app
- Rotated quarterly

### Rate Limiting
- API Gateway: 1000 requests/min per user (can adjust)
- OpenAI: Track usage, alert if >$100/day
- Redis: TTL on all cache keys to prevent memory bloat

### Monitoring
- CloudWatch logs for all Lambda functions
- CloudWatch metrics: invocation count, duration, errors
- Alarms: Error rate >5%, response time >10s
- OpenSearch: Monitor cluster health, query latency
- Redis: Monitor memory usage, hit rate

---

## Cost Estimates

**AWS (Unlimited Plan)**: $0

**OpenAI API** (only cost):
- Embeddings: ~$0.10 per 10K messages (background job)
- GPT-4 Summaries: ~$0.03 per summary (100 messages)
- GPT-4 Action Items: ~$0.02 per extraction
- GPT-3.5 Priority: ~$0.001 per message (negligible)
- GPT-4 Decisions: ~$0.03 per extraction
- GPT-4 Search: ~$0.02 per query (if using GPT-4, optional)
- Multi-step Agent: ~$0.10 per workflow (5 OpenAI calls)

**Caching Impact**:
- Without cache: 100 summaries/day = $3/day = $90/month
- With cache (70% hit rate): 30 summaries/day = $0.90/day = $27/month

**Total Estimated Cost**: $50-100 for MVP development + testing

---

## Advantages of This Architecture

1. **Zero AWS Cost**: Unlimited plan means no infrastructure costs
2. **Better Performance**: Lambda + OpenSearch faster than Firestore for AI workloads
3. **Scalability**: Auto-scales to millions of users
4. **Flexibility**: Easy to add new AI features (just add new Lambda functions)
5. **Caching**: Redis dramatically reduces OpenAI costs
6. **Already Proven**: Push notifications already working on AWS
7. **Best Practices**: Separation of concerns (Firebase for data, AWS for compute)

---

## Migration Notes

**From**: Firebase Cloud Functions (planned)  
**To**: AWS Lambda (actual)

**Changes Required**:
- ✅ Update `docs/REMOTE_TEAM_PROFESSIONAL_IMPLEMENTATION.md` (Cloud Functions → Lambda)
- ✅ Update `TASK_LIST.md` PR #15 (Lambda setup instead of Cloud Functions)
- ✅ Update `memory-bank/techContext.md` (AWS services added)
- ✅ Update `memory-bank/activeContext.md` (Note infrastructure strategy)
- No changes to React Native app (API calls are the same, just different endpoint)

**Benefits**:
- No Firebase Blaze plan required (saves monthly cost)
- Better performance with OpenSearch and Redis
- More control over infrastructure
- Already familiar with AWS Lambda (push notifications)

---

**END OF AWS INFRASTRUCTURE DOCUMENT**


