# Quick Deployment Guide - All 6 AI Features

## ⚡ Quick Deploy (30 Minutes)

### 1. Package Lambda Function (5 min)

```bash
cd aws-lambda/ai-functions

# Install dependencies (if not already done)
npm install

# Create deployment package
zip -r function.zip . -x "*.git*" -x "node_modules/.cache/*" -x "*.md" -x "PR*.md" -x "test-*.js"

# Verify package size (should be ~30-50 MB)
ls -lh function.zip
```

### 2. Deploy to AWS Lambda (5 min)

**Option A: AWS CLI** (Fastest)
```bash
aws lambda update-function-code \
  --function-name pigeonai-send-notification \
  --zip-file fileb://function.zip \
  --region us-east-1

# Wait for deployment
aws lambda wait function-updated \
  --function-name pigeonai-send-notification \
  --region us-east-1

echo "✅ Deployment complete!"
```

**Option B: AWS Console**
1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Select function: `pigeonai-send-notification`
3. Click "Upload from" → ".zip file"
4. Upload `function.zip`
5. Click "Save" and wait for upload

### 3. Verify Lambda Configuration (5 min)

Check that these settings are correct:

```bash
# Timeout: 30 seconds (AI functions need more time)
aws lambda get-function-configuration \
  --function-name pigeonai-send-notification \
  --region us-east-1 \
  --query 'Timeout'

# Memory: 512 MB (sufficient for AI processing)
aws lambda get-function-configuration \
  --function-name pigeonai-send-notification \
  --region us-east-1 \
  --query 'MemorySize'
```

If timeout is not 30s or memory is not 512 MB:

```bash
aws lambda update-function-configuration \
  --function-name pigeonai-send-notification \
  --timeout 30 \
  --memory-size 512 \
  --region us-east-1
```

### 4. Verify Environment Variables (5 min)

**Check all required variables are set:**

```bash
aws lambda get-function-configuration \
  --function-name pigeonai-send-notification \
  --region us-east-1 \
  --query 'Environment.Variables'
```

**Expected output:**
```json
{
  "OPENAI_API_KEY": "sk-proj-...",
  "OPENSEARCH_ENDPOINT": "https://search-pigeonai-embeddings-....us-east-1.es.amazonaws.com",
  "OPENSEARCH_USERNAME": "admin",
  "OPENSEARCH_PASSWORD": "...",
  "REDIS_ENDPOINT": "pigeonai-cache-....serverless.use1.cache.amazonaws.com"
}
```

If any are missing, set them:

```bash
aws lambda update-function-configuration \
  --function-name pigeonai-send-notification \
  --environment "Variables={OPENAI_API_KEY=sk-proj-...,OPENSEARCH_ENDPOINT=https://...,OPENSEARCH_USERNAME=admin,OPENSEARCH_PASSWORD=...,REDIS_ENDPOINT=...}" \
  --region us-east-1
```

### 5. Test All 9 Endpoints (10 min)

**Get your API Gateway URL:**
```bash
https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com
```

**Test each endpoint:**

```bash
# 1. Thread Summarization
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","messageLimit":50}'

# 2. Action Items
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/extract-action-items \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","messageLimit":100}'

# 3. Semantic Search
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query":"database migration","conversationId":"test-123","topK":5}'

# 4. Generate Embedding (single)
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/generate-embedding \
  -H "Content-Type: application/json" \
  -d '{"messageId":"msg-123","content":"Test message","conversationId":"test-123"}'

# 5. Batch Generate Embeddings
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/batch-generate-embeddings \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","limit":100}'

# 6. Priority Detection (single)
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/detect-priority \
  -H "Content-Type: application/json" \
  -d '{"messageId":"msg-123","content":"URGENT: Production is down!","conversationId":"test-123"}'

# 7. Batch Priority Detection
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/batch-detect-priority \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","limit":50}'

# 8. Decision Tracking
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/track-decisions \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","messageLimit":100}'

# 9. Multi-Step Scheduling Agent
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/schedule-meeting \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","userId":"user-123","messageLimit":50}'
```

**Expected: All endpoints return 200 OK**

---

## 🧪 Step 2: Test All 6 AI Features in App (1-2 Hours)

### Test Checklist

#### 1. Thread Summarization (15 min)
- [ ] Open a conversation with 50+ messages
- [ ] Tap sparkles (✨) button in header
- [ ] Verify "Generating summary..." appears
- [ ] Verify summary appears within 2-4 seconds (uncached)
- [ ] Tap again, verify cached response <100ms
- [ ] Verify summary has sections: decisions, actions, blockers, technical details, next steps
- [ ] Test "Copy to clipboard" button
- [ ] Test "Share" button

**Success Criteria**: >90% accuracy, structured output, <3s uncached

#### 2. Action Item Extraction (15 min)
- [ ] Open a conversation with tasks/action items
- [ ] Tap checkbox (☑️) button in header
- [ ] Verify action items modal appears
- [ ] Check items have: task, assignee, deadline, priority
- [ ] Test filters: All / Mine / Active / Done
- [ ] Test "Mark as complete" checkbox
- [ ] Verify priority color coding (🔴🟡🟢)
- [ ] Test deadline urgency badges
- [ ] Test "View in chat" button

**Success Criteria**: >90% extraction accuracy, correct priorities, deadlines parsed

#### 3. Semantic Search (20 min)
- [ ] Tap search (🔍) button in header
- [ ] Try query: "database migration discussion"
- [ ] Verify results appear with relevance scores
- [ ] Check relevance scores 0-100% with color coding
- [ ] Try query: "authentication bug"
- [ ] Try query: "API design decision"
- [ ] Test "View in chat" navigation
- [ ] **Important: Run batch embedding backfill first!**

**Batch Embedding Backfill:**
```bash
# Generate embeddings for all existing messages
curl -X POST https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/batch-generate-embeddings \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"YOUR_CONVERSATION_ID","limit":500}'
```

**Success Criteria**: >90% relevance, finds semantically similar messages

#### 4. Priority Detection (15 min)
- [ ] Tap filter (🔽) button in header
- [ ] Verify priority filter modal appears
- [ ] Check stats bar shows correct counts
- [ ] Test filter: "All"
- [ ] Test filter: "High Priority"
- [ ] Test filter: "Medium & High"
- [ ] Verify badges on message bubbles (🔴 Urgent, 🟡 Important)
- [ ] Send test message: "URGENT: Production is down!"
- [ ] Verify it's marked as high priority

**Success Criteria**: >90% classification accuracy, <1s response time

#### 5. Decision Tracking (15 min)
- [ ] Open a conversation with decisions
- [ ] Tap lightbulb (💡) button in header
- [ ] Verify decision timeline appears
- [ ] Check decisions grouped by date (Today, Yesterday, etc.)
- [ ] Verify decision cards show: decision, context, participants, confidence
- [ ] Test search bar (keyword search)
- [ ] Test filters: All / High Confidence / Medium+
- [ ] Check alternatives section (rejected options)
- [ ] Test "View Context" button

**Success Criteria**: >90% decision extraction, conservative (no false positives)

#### 6. Multi-Step Scheduling Agent (20 min) ⭐ ADVANCED FEATURE
- [ ] Send message: "Let's schedule a meeting to discuss the Q4 roadmap"
- [ ] Tap calendar (📅) button in header
- [ ] Verify "Detecting scheduling intent..." appears
- [ ] Check if proactive suggestion banner appears (if confidence >75%)
- [ ] Click "Yes, help me schedule"
- [ ] Verify scheduling modal opens
- [ ] Check meeting details card (topic, duration, participants, etc.)
- [ ] Verify 3 time slot suggestions appear
- [ ] Check quality badges: ⭐ Best, ✓ Good, ◌ Acceptable
- [ ] Verify timezone chips show all conversions (PST, GMT, IST, EST, CST)
- [ ] Check warning indicators for late times
- [ ] Select a time slot
- [ ] Click "Add to Google Calendar"
- [ ] Verify Google Calendar URL opens

**Success Criteria**: Complete workflow <15s, 3 relevant time slots, calendar integration works

---

## 🐛 Troubleshooting

### Lambda Deployment Issues

**Error: "ResourceConflictException: The operation cannot be performed at this time"**
- Wait 1-2 minutes, Lambda is still updating from previous deployment
- Check status: `aws lambda get-function --function-name pigeonai-send-notification --query 'Configuration.State'`

**Error: "Invalid Lambda function"**
- Verify function name is correct: `pigeonai-send-notification`
- Check region: `us-east-1`

### Environment Variable Issues

**Error: "OPENAI_API_KEY not set"**
- Verify environment variables: `aws lambda get-function-configuration --function-name pigeonai-send-notification --query 'Environment.Variables'`
- Set missing variables (see step 4)

### OpenAI API Issues

**Error: "Incorrect API key provided"**
- Verify your OpenAI API key at: https://platform.openai.com/api-keys
- Check billing: https://platform.openai.com/account/billing
- Update environment variable with correct key

**Error: "Rate limit exceeded"**
- OpenAI free tier: 3 RPM, 200 RPD
- Paid tier: 3500 RPM, 10K RPD
- Wait 1 minute or upgrade to paid tier

### OpenSearch Issues

**Error: "ENOTFOUND" or "Connection refused"**
- Verify OpenSearch endpoint is correct
- Check OpenSearch cluster is running (AWS Console)
- Ensure Lambda can access OpenSearch (security group/VPC)

### Redis Issues

**Error: "ECONNREFUSED"**
- Verify Redis endpoint is correct
- Check ElastiCache cluster is running (AWS Console)
- Ensure Lambda can access Redis (security group/VPC)

### API Gateway Issues

**Error: "Missing Authentication Token"**
- Endpoint path is wrong, check: `https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/ai/summarize`
- Verify API is deployed to `default` stage

**Error: "CORS error"**
- Enable CORS for each endpoint in API Gateway
- Redeploy API after enabling CORS

---

## ✅ Deployment Success Checklist

- [ ] Lambda function.zip created
- [ ] Lambda code deployed successfully
- [ ] Lambda timeout set to 30 seconds
- [ ] Lambda memory set to 512 MB
- [ ] All environment variables configured
- [ ] All 9 endpoints respond with 200 OK
- [ ] Thread Summarization tested in app
- [ ] Action Items tested in app
- [ ] Semantic Search tested in app (with embedding backfill)
- [ ] Priority Detection tested in app
- [ ] Decision Tracking tested in app
- [ ] Scheduling Agent tested in app
- [ ] Caching verified (Redis)
- [ ] CloudWatch logs show no errors
- [ ] Performance meets targets (<3s uncached, <100ms cached)

---

## 📊 Performance Targets

| Feature | Uncached | Cached | Accuracy |
|---------|----------|--------|----------|
| Summarization | <3s | <100ms | >90% |
| Action Items | <4s | <100ms | >90% |
| Search | <3s | <100ms | >90% |
| Priority | <1s | N/A | >90% |
| Decisions | <3s | <100ms | >90% |
| Scheduling | <15s | <100ms | >85% |

---

## 🎯 Next Steps After Testing

1. **Fix Any Bugs** (variable time)
   - Address issues found during testing
   - Optimize prompts if needed
   - Verify caching works correctly

2. **Optional: Polish & Documentation** (PR #22-25)
   - RAG Documentation (2-3h)
   - Testing & QA (4-5h)
   - UI Polish (2-3h)
   - Demo Video + Submission (3-4h)

---

## 🎊 MAJOR MILESTONE ACHIEVED!

**✅ ALL 6 AI FEATURES COMPLETE (100%!)**

- 5 Required Basic Features ✅
- 1 Advanced Feature (Multi-Step Scheduling Agent) ✅
- Total: 30 files created, 29 modified
- ~10,000+ lines of code
- 9 Lambda endpoints
- Ready for deployment & testing!

**Target Score**: 90-95/100 points

You're on the right track! 🚀

