# Lambda Dependencies Setup

## Overview

Shared dependencies for all AI Lambda functions in Pigeon AI.

---

## Dependencies

### Core AI & ML

**openai** (v4.65.0)
- OpenAI API client for GPT-4, GPT-3.5-turbo, and embeddings
- Used for: Summarization, action items, priority detection, decisions, scheduling
- [Documentation](https://github.com/openai/openai-node)

**langchain** (v0.3.2) + **@langchain/openai** (v0.3.0)
- Framework for building AI agents and chains
- Used for: Multi-step scheduling agent with tools/function calling
- [Documentation](https://js.langchain.com/)

**@langchain/core** (v0.3.0)
- Core LangChain functionality
- Required for agent memory and prompt templates

---

### Database & Caching

**@opensearch-project/opensearch** (v2.12.0)
- OpenSearch client for vector search
- Used for: Storing message embeddings, semantic search (RAG)
- [Documentation](https://opensearch.org/docs/latest/clients/javascript/)

**ioredis** (v5.4.1)
- Redis client for ElastiCache
- Used for: Caching AI responses, reducing OpenAI API costs
- [Documentation](https://github.com/redis/ioredis)

---

### Utilities

**axios** (v1.7.7)
- HTTP client for API calls
- Used for: Calling external APIs if needed

---

## Installation

### Local Installation (for testing)

```bash
cd aws-lambda/ai-functions
npm install
```

This will install all dependencies in `node_modules/`.

### Lambda Deployment

For Lambda deployment, we need to create a deployment package with dependencies:

```bash
cd aws-lambda/ai-functions
npm install --production
zip -r function.zip . -x '*.git*' -x 'node_modules/.cache/*' -x 'test-*'
```

This creates `function.zip` with all dependencies for upload to Lambda.

---

## Testing Connections

Test all services before deploying to Lambda:

```bash
# Set environment variables
export OPENAI_API_KEY=sk-proj-xxxxx
export OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-sefdb6usfwni6dhjxdmoqsn7zi.us-east-1.es.amazonaws.com
export OPENSEARCH_USERNAME=admin
export OPENSEARCH_PASSWORD=PigeonAI2025!
export REDIS_ENDPOINT=pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com

# Run test script
node test-connections.js
```

**Expected Output**:
```
🧪 Testing AWS Service Connections...

1️⃣ Testing OpenAI API...
✅ OpenAI API connected
   Response: Hello from Lambda!

2️⃣ Testing OpenSearch...
✅ OpenSearch connected
   Cluster status: green
   Number of nodes: 3
   Index 'message_embeddings': EXISTS

3️⃣ Testing Redis...
❌ Redis failed: ENOTFOUND
   This is expected if running locally (Redis only accessible from AWS)
   Will work when deployed to Lambda

4️⃣ Testing LangChain...
✅ LangChain connected
   Response: LangChain works!

🎉 Connection tests complete!
```

**Note**: Redis test will fail locally (expected). It will work when deployed to Lambda.

---

## Package Size

**Total installed size**: ~50-60 MB  
**Zipped size**: ~15-20 MB

**Lambda Limits**:
- Max deployment package size: 50 MB (zipped)
- Max unzipped size: 250 MB

✅ **We're well within limits!**

---

## Environment Variables Required

Lambda functions using these dependencies need:

```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxx

# OpenSearch
OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-xxx.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=PigeonAI2025!

# Redis
REDIS_ENDPOINT=pigeonai-cache-xxx.serverless.use1.cache.amazonaws.com

# Optional: LangChain tracing (for debugging agents)
LANGCHAIN_TRACING_V2=false
```

---

## Usage Examples

### OpenAI Client

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat completion
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: 'Summarize this conversation' }],
});

// Embeddings
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Message text here',
});
```

### OpenSearch Client

```javascript
const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
});

// k-NN search
const result = await client.search({
  index: 'message_embeddings',
  body: {
    query: {
      knn: {
        embedding: {
          vector: [0.1, 0.2, ...], // 1536 dimensions
          k: 10,
        },
      },
    },
  },
});
```

### Redis Client

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: 6379,
});

// Cache set/get
await redis.setex('summary:conv123', 3600, JSON.stringify(data));
const cached = await redis.get('summary:conv123');
```

### LangChain Agent

```javascript
const { ChatOpenAI } = require('@langchain/openai');
const { initializeAgentExecutorWithOptions } = require('langchain/agents');
const { Calculator } = require('@langchain/community/tools/calculator');

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4-turbo',
  temperature: 0,
});

const tools = [new Calculator()];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: 'openai-functions',
});

const result = await executor.invoke({
  input: 'Find available meeting times for 3 people',
});
```

---

## Dependency Updates

Check for updates:

```bash
npm outdated
```

Update all dependencies:

```bash
npm update
```

Update specific dependency:

```bash
npm install openai@latest
```

---

## Troubleshooting

### Installation Errors

**Error**: `npm ERR! code ECONNREFUSED`

**Solution**: Check internet connection, try again with `npm install --legacy-peer-deps`

### Module Not Found in Lambda

**Error**: `Cannot find module 'openai'`

**Solution**: 
1. Ensure `node_modules` is included in deployment zip
2. Check Lambda runtime is Node.js 18 or higher
3. Verify zip structure: files should be at root, not in subdirectory

### Version Conflicts

**Error**: `peer dependency conflict`

**Solution**: Use `npm install --legacy-peer-deps` or update conflicting packages

---

## Cost Estimation

**Dependencies are free** ✅

**Usage Costs**:
- **OpenAI API**: ~$0.002/request (GPT-4-turbo), ~$0.0005/request (GPT-3.5-turbo)
- **OpenSearch**: ~$25/month (t3.small.search × 3 nodes)
- **Redis**: ~$3-5/month (Serverless Valkey, pay-per-use)
- **Lambda Execution**: ~$0.0000002 per request

**Total Estimated Cost** (1000 AI requests/day):
- OpenAI: $60/month (majority of cost)
- AWS Services: $30/month
- **Total**: ~$90/month

**Optimization**: Redis caching reduces OpenAI costs by ~40-60%

---

## Next Steps

1. ✅ Task 15.5 Complete: Dependencies configured
2. 🔜 Task 15.6: Create base Lambda function template
3. 🔜 Task 15.7: Configure environment variables
4. 🔜 Task 15.8: Test with existing push notification Lambda

---

## References

- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [LangChain.js Documentation](https://js.langchain.com/)
- [OpenSearch JavaScript Client](https://opensearch.org/docs/latest/clients/javascript/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [AWS Lambda Deployment Packages](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)

