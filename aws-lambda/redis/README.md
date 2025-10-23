# Redis Cache Setup for Pigeon AI

## Overview

Redis cache for AI response caching to reduce OpenAI API costs and improve response times.

- **Service**: AWS ElastiCache - Serverless Valkey
- **Engine**: Valkey 8 (open-source Redis alternative)
- **Deployment**: Serverless (auto-scaling, pay-per-use)
- **Purpose**: Cache AI responses (summaries, action items, search results, decisions)

---

## Cache Strategy

### TTL Configuration

| Cache Type | TTL | Key Prefix | Use Case |
|------------|-----|------------|----------|
| **Summaries** | 1 hour | `summary:` | Conversation summaries |
| **Action Items** | 2 hours | `actions:` | Extracted tasks/assignments |
| **Search Results** | 30 minutes | `search:` | Semantic search results |
| **Decisions** | 2 hours | `decisions:` | Tracked decisions |
| **Priority** | 1 hour | `priority:` | Priority detection results |
| **Meeting** | 2 hours | `meeting:` | Meeting scheduling data |

### Key Naming Convention

```
{type}:{identifier}

Examples:
- summary:conv-abc123
- actions:conv-abc123
- search:deployment-strategy
- decisions:conv-abc123-2025-10-22
- priority:conv-abc123
- meeting:conv-abc123-slot-1
```

---

## Setup Steps

### 1. Create ElastiCache Serverless Cache (AWS Console)

1. Go to **ElastiCache** → **Create cache**
2. Select **"Create Valkey cache"**
3. Configuration:
   - **Engine**: Valkey (recommended)
   - **Deployment**: Serverless
   - **Creation method**: New cache
   - **Name**: `pigeonai-cache`
   - **Description**: `AI response caching for Pigeon AI`
4. **Default settings**: Use default settings
   - Engine version: 8 (latest)
   - Availability Zones: Default AZs
   - Encryption in transit: Always enabled
   - Encryption at rest: AWS owned KMS key
   - Security groups: Default security group (modify after creation)
   - Automatic backups: Off
5. Click **"Create"**
6. Wait 3-5 minutes for cache to be available

### 2. Configure Security Group

1. Go to **ElastiCache** → **Serverless caches** → Click `pigeonai-cache`
2. Find **Security group** → Click security group ID
3. **Add Inbound Rule**:
   - Type: `Custom TCP`
   - Port: `6379`
   - Source: `0.0.0.0/0` (anywhere - for Lambda access)
   - Description: `Redis access for Lambda`
4. Click **"Save rules"**

### 3. Get Redis Endpoint

1. Go to **ElastiCache** → **Serverless caches** → Click `pigeonai-cache`
2. Copy **Endpoint** (format: `xxx.serverless.use1.cache.amazonaws.com`)
3. Save for Lambda environment variables

---

## Installation

```bash
cd aws-lambda/redis
npm install
```

**Dependencies**:
- `ioredis` (v5.4.1) - Redis client for Node.js

---

## Usage

### Basic Operations

```javascript
const cache = require('./redisClient');

// Set cache (auto-detects TTL based on key prefix)
await cache.set('summary:conv-123', {
  summary: 'Team discussed Q4 roadmap...',
  keyPoints: ['Mobile app', 'Feature freeze'],
});

// Get cache
const summary = await cache.get('summary:conv-123');

// Delete cache
await cache.del('summary:conv-123');

// Delete all summaries
await cache.delPattern('summary:*');

// Check if key exists
const exists = await cache.exists('summary:conv-123');

// Get remaining TTL
const ttl = await cache.ttl('summary:conv-123');
```

### Custom TTL

```javascript
// Set cache with custom TTL (5 minutes)
await cache.set('custom:key', { data: 'value' }, 300);
```

### Cache Invalidation

```javascript
// Invalidate all caches for a conversation
await cache.delPattern('*:conv-123');

// Invalidate all summaries
await cache.delPattern('summary:*');

// Invalidate specific cache type
await cache.del('actions:conv-123');
```

---

## Testing

### Run Tests

```bash
cd aws-lambda/redis
node test-cache.js
```

**Tests**:
1. ✅ Connection to Redis
2. ✅ Set/Get summary
3. ✅ Set/Get action items
4. ✅ Set/Get search results
5. ✅ TTL verification
6. ✅ Exists check
7. ✅ Delete single key
8. ✅ Delete pattern
9. ✅ Cache miss handling

**Expected Output**:
```
🧪 Testing Redis Cache...

1️⃣ Testing connection...
✅ Connected to Redis

2️⃣ Testing summary cache...
✅ Cached: summary:test-conv-123 (TTL: 3600s)
✅ Cache hit: summary:test-conv-123
✅ Summary cache working

...

🎉 All Redis cache tests passed!
```

---

## Configuration

### Environment Variables

Add to Lambda environment variables:

```bash
REDIS_ENDPOINT=xxx.serverless.use1.cache.amazonaws.com
REDIS_PASSWORD=  # Optional (Serverless Valkey doesn't require password)
```

### Lambda Layer (Optional)

To reduce Lambda package size, create a Lambda Layer with `ioredis`:

1. Create layer directory:
   ```bash
   mkdir -p nodejs
   cd nodejs
   npm install ioredis
   cd ..
   zip -r redis-layer.zip nodejs
   ```
2. Upload to Lambda Layers
3. Attach layer to Lambda functions

---

## Performance

### Serverless Valkey Benefits

- **Auto-scaling**: Scales with demand (0-200 GB)
- **Cost-effective**: Pay-per-use (~$0.10/GB-hour)
- **High availability**: Multi-AZ by default
- **Low latency**: <5ms average response time
- **No management**: Fully managed by AWS

### Cost Estimation

**Assumptions**:
- 1000 AI requests/day
- Average cache size: 5 KB per entry
- 50% cache hit rate
- TTL: 1-2 hours average

**Monthly Cost**: ~$3-5/month (vs $13/month for traditional Redis)

### Cache Hit Rate

Monitor cache effectiveness:

```javascript
// Track cache hits/misses in Lambda logs
const result = await cache.get(key);
if (result) {
  console.log('✅ Cache hit:', key);
  // Saved ~$0.002 (OpenAI API call)
} else {
  console.log('⚠️ Cache miss:', key);
  // Make OpenAI API call + cache result
}
```

---

## Integration with Lambda

### Example: Summary with Caching

```javascript
const cache = require('./redis/redisClient');
const openai = require('./openaiClient');

async function summarizeConversation(conversationId, messages) {
  // Check cache first
  const cacheKey = `summary:${conversationId}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    console.log('✅ Cache hit - returning cached summary');
    return cached;
  }
  
  // Cache miss - call OpenAI
  console.log('⚠️ Cache miss - calling OpenAI');
  const summary = await openai.summarize(messages);
  
  // Cache result (auto TTL: 1 hour)
  await cache.set(cacheKey, summary);
  
  return summary;
}
```

---

## Monitoring

### CloudWatch Metrics

AWS ElastiCache automatically publishes metrics:

- **BytesUsedForCache**: Current memory usage
- **CacheHits**: Number of successful lookups
- **CacheMisses**: Number of failed lookups
- **NewConnections**: Connection rate
- **NetworkBytesIn/Out**: Network throughput

### Cache Hit Rate Formula

```
Hit Rate = CacheHits / (CacheHits + CacheMisses) × 100%
```

**Target**: >60% cache hit rate for cost-effectiveness

---

## Troubleshooting

### Connection Issues

**Error**: `Connection timeout`

**Solutions**:
1. Check security group allows port 6379
2. Verify endpoint URL is correct
3. Ensure Lambda is in same region (us-east-1)

### Performance Issues

**Error**: `Slow response times`

**Solutions**:
1. Check CloudWatch metrics for high memory usage
2. Reduce TTL values to free up memory
3. Consider upgrading to larger cache size

### Authentication Issues

**Error**: `NOAUTH Authentication required`

**Solution**: Serverless Valkey doesn't require password by default, remove `REDIS_PASSWORD` env variable

---

## Next Steps

After Redis is set up:

1. ✅ Test connection with `test-cache.js`
2. 🔲 Integrate into Lambda functions (PR #16-21)
3. 🔲 Monitor cache hit rate in CloudWatch
4. 🔲 Optimize TTL values based on usage patterns

---

## References

- [AWS ElastiCache Serverless](https://aws.amazon.com/elasticache/features/serverless/)
- [Valkey (Redis Alternative)](https://valkey.io/)
- [ioredis Documentation](https://github.com/redis/ioredis)

