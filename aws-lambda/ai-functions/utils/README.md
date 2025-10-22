# Lambda Function Templates & Utilities

## Overview

Shared utility modules for all AI Lambda functions in Pigeon AI.

---

## Utility Modules

### 1. openaiClient.js

**Purpose**: OpenAI API interactions

**Functions**:
- `chatCompletion(messages, options)` - GPT-4/GPT-3.5 completions
- `generateEmbedding(text)` - Generate 1536-dimensional embeddings
- `chatCompletionWithTools(messages, tools, options)` - Function calling

**Usage**:
```javascript
const { chatCompletion, generateEmbedding } = require('./utils/openaiClient');

// Chat completion
const response = await chatCompletion([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Summarize this conversation' },
], {
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 500,
});

// Generate embedding
const embedding = await generateEmbedding('Message text here');
```

---

### 2. opensearchClient.js

**Purpose**: OpenSearch vector database operations

**Functions**:
- `insertEmbedding(messageId, conversationId, text, embedding, metadata)` - Store embedding
- `searchSimilar(queryEmbedding, options)` - k-NN semantic search
- `deleteEmbedding(messageId)` - Delete single embedding
- `deleteConversationEmbeddings(conversationId)` - Delete all embeddings for a conversation
- `indexExists()` - Check if index exists
- `getIndexStats()` - Get index statistics

**Usage**:
```javascript
const { insertEmbedding, searchSimilar } = require('./utils/opensearchClient');

// Insert embedding
await insertEmbedding(
  'msg-123',
  'conv-456',
  'Meeting at 2pm tomorrow',
  embedding, // 1536-dimensional array
  { senderId: 'user-789' }
);

// Search for similar messages
const results = await searchSimilar(queryEmbedding, {
  k: 10,
  conversationId: 'conv-456',
  minScore: 0.7,
});
```

---

### 3. cacheClient.js

**Purpose**: Redis caching for AI responses

**Functions**:
- `get(key)` - Get cached value
- `set(key, value, ttl)` - Set cached value with TTL
- `del(key)` - Delete cached value
- `delPattern(pattern)` - Delete all matching keys
- `exists(key)` - Check if key exists
- `ttl(key)` - Get remaining TTL
- Cache key generators: `summaryCacheKey()`, `actionItemsCacheKey()`, etc.

**Usage**:
```javascript
const { get, set, summaryCacheKey } = require('./utils/cacheClient');

const cacheKey = summaryCacheKey('conv-456');

// Check cache
const cached = await get(cacheKey);
if (cached) {
  return cached; // Cache hit
}

// Cache miss - compute and cache
const result = await computeSummary();
await set(cacheKey, result); // Auto TTL: 1 hour
```

**TTL Configuration**:
- Summaries: 1 hour (3600s)
- Action Items: 2 hours (7200s)
- Search Results: 30 minutes (1800s)
- Decisions: 2 hours (7200s)
- Priority: 1 hour (3600s)
- Meeting: 2 hours (7200s)

---

### 4. responseUtils.js

**Purpose**: Standardized HTTP responses for API Gateway

**Functions**:
- `success(data, statusCode)` - Success response (200)
- `error(message, statusCode, details)` - Error response
- `badRequest(message)` - 400 Bad Request
- `unauthorized(message)` - 401 Unauthorized
- `notFound(message)` - 404 Not Found
- `internalError(err)` - 500 Internal Server Error
- `parseBody(event)` - Parse JSON body
- `validateRequiredFields(body, fields)` - Validate required fields
- `getUserId(event)` - Extract user ID
- `logInvocation(functionName, event)` - Log request details
- `measureTime(fn)` - Measure execution time

**Usage**:
```javascript
const {
  success,
  badRequest,
  internalError,
  parseBody,
  validateRequiredFields,
  logInvocation,
} = require('./utils/responseUtils');

exports.handler = async (event) => {
  logInvocation('MyFunction', event);

  try {
    const body = parseBody(event);
    validateRequiredFields(body, ['conversationId']);

    const result = await processRequest(body);

    return success(result);
  } catch (err) {
    if (err.message.includes('Missing required fields')) {
      return badRequest(err.message);
    }
    return internalError(err);
  }
};
```

---

## Lambda Function Template

See `example-function.js` for a complete Lambda function template that:
1. ✅ Logs invocation
2. ✅ Parses and validates request
3. ✅ Checks cache first
4. ✅ Calls OpenAI API
5. ✅ Caches result
6. ✅ Returns standardized response
7. ✅ Handles errors gracefully

**Copy this template when creating new AI Lambda functions!**

---

## File Structure

```
aws-lambda/ai-functions/
├── package.json              # Dependencies
├── test-connections.js       # Test all connections
├── example-function.js       # Lambda function template
├── utils/
│   ├── openaiClient.js       # OpenAI API wrapper
│   ├── opensearchClient.js   # OpenSearch wrapper
│   ├── cacheClient.js        # Redis cache wrapper
│   └── responseUtils.js      # HTTP response helpers
├── functions/
│   ├── summarize.js          # To be created (PR #16)
│   ├── extract-actions.js    # To be created (PR #17)
│   ├── search.js             # To be created (PR #18)
│   ├── detect-priority.js    # To be created (PR #19)
│   ├── track-decisions.js    # To be created (PR #20)
│   └── schedule-meeting.js   # To be created (PR #21)
└── README.md                 # This file
```

---

## Environment Variables

All Lambda functions require these environment variables:

```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxx

# OpenSearch
OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-xxx.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=PigeonAI2025!

# Redis
REDIS_ENDPOINT=pigeonai-cache-xxx.serverless.use1.cache.amazonaws.com

# Optional
NODE_ENV=production
LANGCHAIN_TRACING_V2=false
```

Configure these in Lambda console → Configuration → Environment variables

---

## Error Handling

All utilities include comprehensive error handling:

1. **OpenAI Errors**: API rate limits, invalid API key, model errors
2. **OpenSearch Errors**: Connection timeouts, index not found, query errors
3. **Redis Errors**: Connection failures (graceful degradation)
4. **Request Errors**: Missing fields, invalid JSON, unauthorized

**Best Practice**: Always wrap AI operations in try-catch and return appropriate HTTP status codes.

---

## Logging

All utilities log to CloudWatch:

- ✅ Connection status
- ✅ Cache hits/misses
- ✅ API calls (tokens used)
- ✅ Search results
- ✅ Execution times
- ❌ Errors with stack traces

**View logs**: Lambda console → Monitor → View logs in CloudWatch

---

## Performance Optimization

### Caching Strategy

```javascript
// Always check cache first
const cached = await cache.get(cacheKey);
if (cached) {
  return success({ ...cached, cached: true });
}

// Cache miss - call OpenAI
const result = await openai.chatCompletion(messages);

// Cache result
await cache.set(cacheKey, result);

return success({ ...result, cached: false });
```

**Benefits**:
- 40-60% reduction in OpenAI API costs
- Sub-100ms response times for cached requests
- Improved user experience

### Connection Pooling

All clients use connection pooling:
- **OpenAI**: HTTP keep-alive
- **OpenSearch**: Connection pooling (10 connections)
- **Redis**: Single persistent connection per Lambda container

**Lambda containers are reused**, so connections persist across invocations!

---

## Testing

### Test All Connections

```bash
cd aws-lambda/ai-functions
export OPENAI_API_KEY=sk-proj-xxxxx
export OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-xxx.us-east-1.es.amazonaws.com
export OPENSEARCH_USERNAME=admin
export OPENSEARCH_PASSWORD=PigeonAI2025!
export REDIS_ENDPOINT=pigeonai-cache-xxx.serverless.use1.cache.amazonaws.com

node test-connections.js
```

### Test Individual Utilities

```bash
node -e "
const { chatCompletion } = require('./utils/openaiClient');
chatCompletion([
  { role: 'user', content: 'Hello!' }
]).then(console.log);
"
```

---

## Deployment

### Create Deployment Package

```bash
cd aws-lambda/ai-functions
npm install --production
zip -r function.zip . -x '*.git*' -x 'node_modules/.cache/*' -x 'test-*'
```

### Upload to Lambda

1. Go to Lambda console → Functions → Create function
2. Name: `pigeonai-ai-summarize` (example)
3. Runtime: Node.js 18.x
4. Execution role: Use `pigeonai-send-notification-role-wtvf11x9`
5. Upload `function.zip`
6. Set handler: `summarize.handler` (or appropriate function name)
7. Configure environment variables
8. Integrate with API Gateway

---

## Cost Estimation

**Per 1000 AI requests**:

| Service | Cost |
|---------|------|
| Lambda execution (1s avg) | $0.002 |
| OpenAI API (GPT-4-turbo) | $2.00 |
| OpenAI API (GPT-3.5-turbo) | $0.50 |
| OpenSearch queries | $0.00 |
| Redis operations | $0.00 |
| **Total (GPT-4)** | **~$2.00** |
| **Total (GPT-3.5)** | **~$0.50** |

**With 60% cache hit rate**:
- GPT-4: $0.80/1000 requests (60% savings!)
- GPT-3.5: $0.20/1000 requests

---

## Next Steps

1. ✅ Task 15.6 Complete: Utility modules created
2. 🔜 Task 15.7: Configure environment variables in Lambda
3. 🔜 Task 15.8: Test with existing push notification Lambda
4. 🔜 Task 15.9: Create React Native AI service
5. 🔜 PR #16-21: Implement individual AI features

---

## References

- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenSearch JavaScript Client](https://opensearch.org/docs/latest/clients/javascript/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

