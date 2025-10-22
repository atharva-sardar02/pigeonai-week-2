# AWS Infrastructure - Complete Setup Guide

## Overview

Pigeon AI uses a hybrid Firebase + AWS infrastructure for optimal performance and cost:

- **Firebase (Spark Plan - Free)**: Auth, Firestore, FCM, Storage
- **AWS (Unlimited Plan)**: Lambda (AI processing), OpenSearch (vector search), ElastiCache (caching), API Gateway

---

## Architecture Diagram

```
React Native App
      ↓
API Gateway (https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com)
      ↓
AWS Lambda (6 AI functions)
      ↓
  ┌───────────────┬──────────────┬─────────────┐
  ↓               ↓              ↓             ↓
OpenAI API   OpenSearch    Redis Cache   Firestore
(GPT-4)      (Vectors)     (Responses)   (Messages)
```

---

## Components Setup Summary

### ✅ 1. AWS OpenSearch (Vector Database)
- **Domain**: `pigeonai-embeddings`
- **Version**: OpenSearch 3.1
- **Configuration**: 3-node Multi-AZ, t3.small.search
- **Endpoint**: `https://search-pigeonai-embeddings-sefdb6usfwni6dhjxdmoqsn7zi.us-east-1.es.amazonaws.com`
- **Index**: `message_embeddings` (1536-dimensional vectors, FAISS engine, cosine similarity)
- **Purpose**: Store and search message embeddings for semantic search (RAG)

### ✅ 2. AWS ElastiCache (Redis Cache)
- **Cluster**: `pigeonai-cache`
- **Engine**: Serverless Valkey 8
- **Endpoint**: `pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com:6379`
- **Purpose**: Cache AI responses to reduce OpenAI API costs by 40-60%
- **TTL**: Summaries (1h), Actions (2h), Search (30m), Decisions (2h)

### ✅ 3. AWS API Gateway (REST API)
- **API**: `pigeonai-notifications-api`
- **Base URL**: `https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com`
- **Endpoints**: 7 total (1 push notifications + 6 AI features)
- **CORS**: Enabled for React Native
- **Auto-deploy**: Enabled

### ✅ 4. AWS Lambda (Serverless Compute)
- **Runtime**: Node.js 18.x
- **Role**: `pigeonai-send-notification-role-wtvf11x9`
- **Permissions**: OpenSearch, ElastiCache, CloudWatch Logs
- **Environment Variables**: OpenAI key, OpenSearch credentials, Redis endpoint

### ✅ 5. IAM Roles & Permissions
- **Role**: `pigeonai-send-notification-role-wtvf11x9`
- **Policies**:
  - `AWSLambdaBasicExecutionRole` (CloudWatch Logs)
  - `AmazonOpenSearchServiceFullAccess` (Vector search)
  - `AmazonElastiCacheFullAccess` (Redis caching)
  - `AWSLambdaVPCAccessExecutionRole` (Network access)

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/send-notification` | POST | Push notifications (existing) |
| `/ai/summarize` | POST | Thread summarization |
| `/ai/extract-action-items` | POST | Action item extraction |
| `/ai/search` | POST | Semantic search |
| `/ai/detect-priority` | POST | Priority detection |
| `/ai/track-decisions` | POST | Decision tracking |
| `/ai/schedule-meeting` | POST | Meeting scheduling agent |

---

## Testing Results

### Local Test (OpenAI + OpenSearch)
```
✅ OpenAI API connected
✅ OpenSearch connected (green, 6 nodes)
✅ LangChain connected
❌ Redis failed (expected - only accessible from Lambda)
```

### Lambda Test (All Services)
```
✅ OpenAI API: Working
✅ OpenSearch: green status, index exists
✅ Redis: Working from Lambda
✅ Environment variables: All set
✅ IAM permissions: Granted
```

---

## Cost Estimation

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| OpenSearch | 3x t3.small.search (10GB each) | ~$75 |
| ElastiCache | Serverless Valkey | ~$3-5 |
| Lambda | 1000 invocations/day | ~$0.10 |
| API Gateway | 30K requests/month | ~$0.10 |
| OpenAI API | 1000 requests/day (GPT-4) | ~$60 |
| **Total** | | **~$140/month** |

**With caching**: ~$90/month (40% savings on OpenAI costs)

---

## Implementation Status

### PR #15: AWS Infrastructure Setup (COMPLETE ✅)
- [x] Task 15.1: AWS OpenSearch cluster
- [x] Task 15.2: AWS ElastiCache Redis
- [x] Task 15.3: API Gateway REST API
- [x] Task 15.4: IAM Roles configured
- [x] Task 15.5: Lambda dependencies installed
- [x] Task 15.6: Base Lambda function template
- [x] Task 15.7: Environment variables configured
- [x] Task 15.8: Infrastructure tested
- [x] Task 15.9: React Native AI service created
- [x] Task 15.10: Documentation complete

### Next PRs (Ready to Implement)
- [ ] PR #16: Thread Summarization (3-4 hours)
- [ ] PR #17: Action Item Extraction (3-4 hours)
- [ ] PR #18: Semantic Search + RAG (3-4 hours)
- [ ] PR #19: Priority Detection (3 hours)
- [ ] PR #20: Decision Tracking (3-4 hours)
- [ ] PR #21: Multi-Step Scheduling Agent (5-6 hours)

---

## Files Created

### AWS Lambda
```
aws-lambda/
├── opensearch/
│   ├── create-index.js
│   ├── test-vector-search.js
│   └── README.md
├── redis/
│   ├── redisClient.js
│   ├── test-cache.js
│   ├── package.json
│   └── README.md
├── api-gateway/
│   └── README.md
├── iam/
│   └── README.md
└── ai-functions/
    ├── package.json (93 packages)
    ├── test-connections.js
    ├── test-infrastructure.js
    ├── example-function.js
    ├── ENV_VARIABLES.md
    ├── TESTING_INFRASTRUCTURE.md
    └── utils/
        ├── openaiClient.js
        ├── opensearchClient.js
        ├── cacheClient.js
        ├── responseUtils.js
        └── README.md
```

### React Native
```
src/services/ai/
└── aiService.ts (6 AI functions)
```

### Documentation
```
docs/
├── AWS_INFRASTRUCTURE.md (this file)
├── PERSONA_BRAINLIFT.md
├── REMOTE_TEAM_PROFESSIONAL_IMPLEMENTATION.md
├── PERSONA_SELECTION_GUIDE.md
└── TASK_15.1_COMPLETION_GUIDE.md
```

---

## Security

### ✅ Implemented
- API keys stored in Lambda environment variables (not in code)
- `.gitignore` configured to prevent credential leaks
- IAM roles for service access
- HTTPS only (API Gateway)
- CORS configured for React Native

### 🔜 Production Recommendations
- Use AWS Secrets Manager for key rotation
- Implement API Gateway authorizers
- Add rate limiting per user
- Enable CloudWatch alarms
- Set up AWS CloudTrail for auditing

---

## Monitoring

### CloudWatch Logs
- **Lambda logs**: `/aws/lambda/pigeonai-*`
- **API Gateway logs**: Enabled
- **Retention**: 7 days (default)

### Metrics to Monitor
- Lambda invocations and errors
- API Gateway 4xx/5xx errors
- OpenSearch cluster health
- Redis cache hit/miss rate
- OpenAI API usage and costs

---

## Troubleshooting

### Lambda Function Errors
**Check**: CloudWatch Logs → `/aws/lambda/function-name`

### API Gateway 502 Errors
**Cause**: Lambda function timeout or error
**Solution**: Check Lambda logs, increase timeout

### OpenSearch Connection Timeout
**Cause**: Security group or network issue
**Solution**: Verify security group allows Lambda access

### Redis Connection Failed
**Cause**: Only accessible from Lambda, not locally
**Solution**: Normal - will work when deployed

---

## Next Steps

1. ✅ PR #15 Complete: Infrastructure ready
2. 🔜 Implement AI features (PR #16-21)
3. 🔜 Test end-to-end from React Native
4. 🔜 Monitor costs and optimize
5. 🔜 Production hardening

---

## References

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS OpenSearch Documentation](https://docs.aws.amazon.com/opensearch-service/)
- [AWS ElastiCache Documentation](https://docs.aws.amazon.com/elasticache/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

**Last Updated**: October 22, 2025
**Status**: ✅ Infrastructure Complete, Ready for AI Feature Implementation

