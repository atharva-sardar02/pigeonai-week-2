# OpenSearch Setup for Pigeon AI

This directory contains scripts for setting up and testing AWS OpenSearch for vector embeddings.

---

## What is OpenSearch Used For?

**Purpose**: Store and search message embeddings for semantic search (PR #18)

**How it works**:
1. User sends message → Lambda generates embedding (1536-dim vector)
2. Vector stored in OpenSearch
3. User searches "database migration discussion" → Lambda generates query embedding
4. OpenSearch finds most similar message vectors using k-NN search
5. Returns top 5 relevant messages

---

## Files in This Directory

1. **`create-index.js`** - Creates the `message_embeddings` index with k-NN configuration
2. **`test-vector-search.js`** - Tests vector search functionality
3. **`README.md`** - This file

---

## Setup Instructions (After Cluster is Active)

### Prerequisites

1. OpenSearch cluster is created and status = **Active**
2. Install dependencies:
   ```bash
   cd aws-lambda
   npm install @opensearch-project/opensearch
   ```

### Step 1: Get Your OpenSearch Endpoint

1. Go to AWS OpenSearch console
2. Click on your domain: `pigeonai-embeddings`
3. Copy the **Domain endpoint** (looks like: `https://search-pigeonai-embeddings-xxxxx.us-east-1.es.amazonaws.com`)
4. Update `OPENSEARCH_ENDPOINT` in both scripts

### Step 2: Create the Index

```bash
cd aws-lambda/opensearch
node create-index.js
```

**Expected output**:
```
🔍 Checking if index already exists...
📝 Creating index 'message_embeddings'...
✅ Index created successfully!
🎉 SUCCESS! Index is ready for vector embeddings.
```

### Step 3: Test Vector Search

```bash
node test-vector-search.js
```

**Expected output**:
```
📝 Step 1: Inserting sample messages...
✅ Inserted: msg_001 - "We need to decide on the database..."
✅ Inserted: msg_002 - "I recommend using blue-green..."
✅ Inserted: msg_003 - "Production is down..."

🔍 Step 2: Performing k-NN vector search...

📊 Search Results:
Found 3 results

1. Message ID: msg_002
   Content: "I recommend using blue-green deployment..."
   Score: 0.85 (higher = more similar)
   Sender: user_bob

2. Message ID: msg_001
   Content: "We need to decide on the database..."
   Score: 0.78
   Sender: user_alice

3. Message ID: msg_003
   Content: "Production is down..."
   Score: 0.42
   Sender: user_charlie

🎉 SUCCESS! k-NN vector search is working!
✅ Task 15.1 Complete
```

---

## Index Configuration Details

**Index Name**: `message_embeddings`

**Mapping**:
- `messageId` (keyword) - Unique message ID
- `conversationId` (keyword) - Conversation/group ID
- `content` (text) - Message content (searchable)
- `embedding` (knn_vector) - 1536-dim vector from OpenAI
- `timestamp` (date) - When message was sent
- `senderId` (keyword) - Who sent the message

**k-NN Settings**:
- Algorithm: HNSW (Hierarchical Navigable Small World)
- Distance metric: Cosine similarity
- Dimension: 1536 (matches OpenAI text-embedding-3-small)

---

## Troubleshooting

### Error: "Connection refused"
- Check: OpenSearch domain status is **Active**
- Check: Endpoint URL is correct (copy from AWS console)
- Check: You're using HTTPS (not HTTP)

### Error: "Authentication failed"
- Check: Username is `admin`
- Check: Password matches what you set during domain creation

### Error: "Index already exists"
- The script will auto-delete and recreate
- Or manually delete: `await client.indices.delete({ index: 'message_embeddings' })`

---

## Next Steps (After This Works)

1. ✅ Task 15.1 Complete: OpenSearch cluster created and tested
2. ⏳ Task 15.2: Set up ElastiCache Redis
3. ⏳ Task 15.3: Configure API Gateway endpoints
4. ⏳ Task 15.4-15.10: Lambda setup and integration

---

**Save this README for reference during implementation!**


