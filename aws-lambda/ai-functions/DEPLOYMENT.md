# Lambda Function Deployment Guide

This guide covers deploying the AI Lambda functions to AWS.

## Prerequisites

- AWS CLI installed and configured
- AWS Account with Lambda, API Gateway, OpenSearch, and Redis access
- OpenAI API key
- Firebase service account key

## Environment Variables

Before deploying, ensure these environment variables are set in Lambda:

```bash
OPENAI_API_KEY=sk-...
OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-....us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=...
REDIS_ENDPOINT=pigeonai-cache-....serverless.use1.cache.amazonaws.com
```

## Deployment Steps

### 1. Install Dependencies

```bash
cd aws-lambda/ai-functions
npm install
```

### 2. Create Deployment Package

```bash
# Create ZIP file with all dependencies
zip -r function.zip . -x "*.git*" -x "node_modules/.cache/*" -x "*.md"
```

### 3. Update Lambda Function

#### Option A: Using AWS CLI

```bash
aws lambda update-function-code \
  --function-name pigeonai-send-notification \
  --zip-file fileb://function.zip \
  --region us-east-1
```

#### Option B: Using AWS Console

1. Go to AWS Lambda Console
2. Select function: `pigeonai-send-notification`
3. Click "Upload from" → ".zip file"
4. Upload `function.zip`
5. Click "Save"

### 4. Set Environment Variables (First Time Only)

```bash
aws lambda update-function-configuration \
  --function-name pigeonai-send-notification \
  --environment "Variables={OPENAI_API_KEY=sk-...,OPENSEARCH_ENDPOINT=https://...,OPENSEARCH_USERNAME=admin,OPENSEARCH_PASSWORD=...,REDIS_ENDPOINT=...}" \
  --region us-east-1
```

Or via AWS Console:
1. Go to Lambda → Configuration → Environment variables
2. Add each variable
3. Click "Save"

### 5. Increase Lambda Timeout (First Time Only)

AI functions need more time than push notifications:

```bash
aws lambda update-function-configuration \
  --function-name pigeonai-send-notification \
  --timeout 30 \
  --memory-size 512 \
  --region us-east-1
```

Or via AWS Console:
1. Go to Lambda → Configuration → General configuration
2. Edit settings:
   - Timeout: 30 seconds
   - Memory: 512 MB
3. Click "Save"

## API Gateway Configuration

### Add POST /ai/summarize Endpoint

1. Go to API Gateway Console
2. Select API: `pigeonai-notifications-api`
3. Click "Create Resource"
   - Resource Name: `ai`
   - Resource Path: `/ai`
4. With `/ai` selected, click "Create Resource" again
   - Resource Name: `summarize`
   - Resource Path: `/ai/summarize`
5. With `/ai/summarize` selected, click "Create Method"
   - Method type: `POST`
   - Integration type: Lambda Function
   - Lambda Function: `pigeonai-send-notification`
   - Enable Lambda Proxy Integration: YES
6. Click "Create Method"
7. Enable CORS:
   - Select `/ai/summarize` POST method
   - Click "Enable CORS"
   - Allow headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key`
   - Click "Save"
8. Deploy API:
   - Click "Deploy API"
   - Stage: `default`
   - Click "Deploy"

### Test Endpoint

```bash
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conv-123",
    "messageLimit": 50
  }'
```

Expected response:
```json
{
  "statusCode": 200,
  "data": {
    "summary": "📋 Thread Summary...",
    "conversationId": "test-conv-123",
    "messageCount": 50,
    "generatedAt": "2025-10-22T...",
    "cached": false,
    "duration": 2500
  }
}
```

## Lambda Handler Configuration

The Lambda function now routes requests based on the API Gateway path:

```javascript
// In index.js
exports.handler = async (event) => {
  const path = event.path || event.requestContext?.http?.path;
  
  if (path === '/ai/summarize') {
    return require('./ai-functions/summarize').handler(event);
  }
  
  // Default: push notification handler
  return originalHandler(event);
};
```

## Verification

1. **Check Lambda Logs**:
   ```bash
   aws logs tail /aws/lambda/pigeonai-send-notification --follow
   ```

2. **Test from React Native App**:
   - Open ChatScreen
   - Tap sparkles (✨) button in header
   - Should see "Generating summary..." then results

3. **Verify Redis Cache**:
   ```bash
   # Check cache hit rate
   redis-cli -h pigeonai-cache-....serverless.use1.cache.amazonaws.com
   > KEYS summary:*
   > TTL summary:conv-123:100
   ```

## Cost Estimates

Per 1000 summarization requests:

- Lambda compute: $0.03 (512MB, 3s avg)
- OpenAI GPT-4: $3.00 (avg 1000 tokens)
- Redis cache: $0.001
- API Gateway: $0.01

**Total: ~$3.04 per 1000 requests**

With 40-60% cache hit rate after deployment:
- Cached requests: <100ms, $0.00004 each
- Uncached requests: 2-4s, $0.003 each

## Troubleshooting

### Error: "Missing required fields"
- Check request body includes `conversationId`

### Error: "Failed to fetch messages"
- Verify Firebase service account key is in `serviceAccountKey.json`
- Check Firestore security rules allow Lambda to read messages

### Error: "Failed to generate summary"
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota/billing

### Error: "ENOTFOUND" (Redis)
- Verify `REDIS_ENDPOINT` is correct
- Check Lambda is in same VPC as Redis (or Redis has public access)
- Ensure security group allows port 6379

### Timeout after 3 seconds
- Increase Lambda timeout to 30 seconds
- Check OpenAI API is responding

## Next Steps

After deploying summarization:
- Deploy Action Item Extraction (PR #17)
- Deploy Semantic Search (PR #18)
- Deploy Priority Detection (PR #19)
- Deploy Decision Tracking (PR #20)
- Deploy Scheduling Agent (PR #21)

All functions use the same Lambda and deployment process.

