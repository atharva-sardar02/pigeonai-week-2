# API Gateway Configuration for Pigeon AI

## Overview

API Gateway REST API for all AI features and push notifications.

- **API Name**: `pigeonai-notifications-api`
- **Base URL**: `https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com`
- **Region**: us-east-1
- **Stage**: $default (auto-deploy enabled)

---

## Endpoints

### Push Notifications (Existing)

**POST /send-notification**
- **Purpose**: Send push notifications to users
- **Lambda**: `pigeonai-push-notification`
- **Status**: ✅ Active

---

### AI Features (New)

**POST /ai/summarize**
- **Purpose**: Summarize conversation threads
- **Lambda**: TBD (Task 15.6)
- **Payload**: `{ conversationId, messageCount }`
- **Response**: `{ summary, keyPoints }`

**POST /ai/extract-action-items**
- **Purpose**: Extract action items from messages
- **Lambda**: TBD (Task 15.6)
- **Payload**: `{ conversationId, messageCount }`
- **Response**: `{ actionItems: [{ task, assignee, dueDate }] }`

**POST /ai/search**
- **Purpose**: Semantic search across messages
- **Lambda**: TBD (Task 15.6)
- **Payload**: `{ query, conversationId }`
- **Response**: `{ results: [{ messageId, text, score }] }`

**POST /ai/detect-priority**
- **Purpose**: Detect priority of messages
- **Lambda**: TBD (Task 15.6)
- **Payload**: `{ conversationId }`
- **Response**: `{ priorityMessages: [{ messageId, priority, reason }] }`

**POST /ai/track-decisions**
- **Purpose**: Track decisions made in conversations
- **Lambda**: TBD (Task 15.6)
- **Payload**: `{ conversationId, messageCount }`
- **Response**: `{ decisions: [{ decision, decisionDate, participants }] }`

**POST /ai/schedule-meeting**
- **Purpose**: Multi-step agent for meeting scheduling
- **Lambda**: TBD (Task 15.6)
- **Payload**: `{ conversationId, participants, constraints }`
- **Response**: `{ proposedTimes, availability, recommendation }`

---

## CORS Configuration

**Access-Control-Allow-Origin**: `*`  
**Access-Control-Allow-Headers**: `content-type, authorization`  
**Access-Control-Allow-Methods**: `POST, OPTIONS`  
**Access-Control-Max-Age**: `3600` (1 hour)  
**Access-Control-Allow-Credentials**: `NO`

---

## Integration

### Lambda Integration (To Be Configured)

Each AI endpoint will integrate with a Lambda function:

1. API Gateway receives POST request
2. Validates CORS headers
3. Forwards to Lambda function
4. Lambda processes with OpenAI API
5. Lambda returns response
6. API Gateway returns to React Native app

### Request Format

```json
{
  "conversationId": "string",
  "userId": "string",
  "messageCount": number (optional)
}
```

### Response Format

```json
{
  "success": boolean,
  "data": object,
  "error": string (if error)
}
```

---

## Rate Limiting

**Current**: No rate limiting configured  
**Recommended**: Add throttling in API Gateway settings
- Burst: 100 requests
- Rate: 1000 requests/minute

**Note**: Can be added later in Task 15.8

---

## Testing

### Test Endpoints with cURL

```bash
# Test CORS
curl -X OPTIONS https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/summarize \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"

# Test POST (will fail until Lambda integrated)
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test123","messageCount":50}'
```

### Expected Response (Before Lambda Integration)

```json
{
  "message": "Missing Authentication Token"
}
```

This is expected - we'll integrate Lambda functions in Task 15.6.

---

## Next Steps

1. ✅ Task 15.3 Complete: API Gateway routes created
2. 🔜 Task 15.4: Configure IAM roles for Lambda
3. 🔜 Task 15.5: Install Lambda dependencies
4. 🔜 Task 15.6: Create Lambda functions and integrate with API Gateway
5. 🔜 Task 15.7: Configure environment variables
6. 🔜 Task 15.8: Test all endpoints

---

## Architecture

```
React Native App
      ↓
API Gateway (CORS enabled)
      ↓
AWS Lambda (AI processing)
      ↓
OpenAI API + OpenSearch + Redis
      ↓
Response back to app
```

---

## Monitoring

**CloudWatch Logs**: Enabled by default  
**Metrics**: Available in API Gateway console
- Request count
- Latency
- 4xx/5xx errors

**Dashboard**: Go to API Gateway → Monitor → Metrics

---

## Security

- ✅ CORS configured for React Native
- ✅ HTTPS only
- ⏳ API keys (optional, can add later)
- ⏳ Lambda authorizer (optional, can add later)

For MVP, we'll use basic CORS without API keys.

---

## Cost Estimation

**API Gateway Pricing** (us-east-1):
- First 333 million requests/month: $3.50 per million
- After that: $2.80 per million

**Estimated Cost for MVP** (1000 AI requests/day):
- 30,000 requests/month
- Cost: ~$0.10/month (nearly free!)

**Note**: Main costs will be Lambda execution and OpenAI API calls.

---

## References

- [API Gateway HTTP API vs REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)
- [API Gateway CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [API Gateway Lambda Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-integrations.html)

