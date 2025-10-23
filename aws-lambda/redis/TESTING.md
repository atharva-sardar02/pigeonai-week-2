# Redis Cache Test Setup

## Quick Start

Follow these steps to test the Redis cache connection:

### 1. Install Dependencies

```bash
cd aws-lambda/redis
npm install
```

### 2. Run Test Script

```bash
node test-cache.js
```

### Expected Output

```
🧪 Testing Redis Cache...

1️⃣ Testing connection...
✅ Redis connected
🟢 Redis ready
✅ Connected to Redis

2️⃣ Testing summary cache...
✅ Cached: summary:test-conv-123 (TTL: 3600s)
✅ Cache hit: summary:test-conv-123
Retrieved summary: {
  conversationId: 'test-conv-123',
  summary: 'Team discussed Q4 roadmap. Decided to prioritize mobile app features.',
  keyPoints: [ 'Q4 roadmap', 'Mobile app priority', 'Feature freeze Dec 15' ],
  timestamp: '2025-10-22T...'
}
✅ Summary cache working

3️⃣ Testing action items cache...
✅ Cached: actions:test-conv-123 (TTL: 7200s)
✅ Cache hit: actions:test-conv-123
Retrieved actions: { ... }
✅ Action items cache working

4️⃣ Testing search cache...
✅ Cached: search:deployment-strategy (TTL: 1800s)
✅ Cache hit: search:deployment-strategy
Retrieved search: { ... }
✅ Search cache working

5️⃣ Testing TTL...
Summary TTL: 3599s (expected ~3600s)
Actions TTL: 7199s (expected ~7200s)
Search TTL: 1799s (expected ~1800s)
✅ TTL configured correctly

6️⃣ Testing exists...
Key exists: true (expected true)
Key not exists: false (expected false)
✅ Exists check working

7️⃣ Testing delete...
🗑️ Deleted: search:deployment-strategy
⚠️ Cache miss: search:deployment-strategy
After delete: null (expected null)
✅ Delete working

8️⃣ Testing pattern delete...
✅ Cached: summary:conv-1 (TTL: 3600s)
✅ Cached: summary:conv-2 (TTL: 3600s)
✅ Cached: summary:conv-3 (TTL: 3600s)
🗑️ Deleted 5 keys matching: summary:*
⚠️ Cache miss: summary:conv-1
After pattern delete: null (expected null)
✅ Pattern delete working

9️⃣ Testing cache miss...
⚠️ Cache miss: nonexistent:key
Cache miss result: null (expected null)
✅ Cache miss handled correctly

🎉 All Redis cache tests passed!

👋 Redis connection closed
```

---

## Configuration

**Redis Endpoint**: `pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com:6379`

**Security Group**: Port 6379 open for Lambda access

**TTL Strategy**:
- Summaries: 1 hour (3600s)
- Action Items: 2 hours (7200s)
- Search Results: 30 minutes (1800s)
- Decisions: 2 hours (7200s)

---

## Troubleshooting

### Connection Timeout

If you get a connection timeout:
1. Check security group has port 6379 inbound rule
2. Verify endpoint URL is correct
3. Ensure you're in us-east-1 region

### ENOTFOUND Error

If you get DNS resolution error:
1. Wait 1-2 minutes for DNS propagation
2. Try again

### Authentication Error

Serverless Valkey doesn't require password by default. No auth needed.

---

## Next Steps

After successful test:
1. ✅ Redis cache verified
2. 🔲 Move to Task 15.3 (API Gateway)
3. 🔲 Integrate cache into Lambda functions

