# Infrastructure Testing Guide

## Quick Test (Recommended)

Test your infrastructure locally before deploying to Lambda.

### Step 1: Set Environment Variables

```bash
cd aws-lambda/ai-functions

# Windows PowerShell
$env:OPENAI_API_KEY="YOUR_KEY_HERE"
$env:OPENSEARCH_ENDPOINT="https://search-pigeonai-embeddings-sefdb6usfwni6dhjxdmoqsn7zi.us-east-1.es.amazonaws.com"
$env:OPENSEARCH_USERNAME="admin"
$env:OPENSEARCH_PASSWORD="PigeonAI2025!"
$env:REDIS_ENDPOINT="pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com"
```

### Step 2: Run Test

```bash
node test-connections.js
```

### Expected Output

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

**Note**: Redis test will fail locally (expected). It works from Lambda.

---

## What This Verifies

✅ **Test 1 - OpenAI API**:
- API key is valid
- Can make API calls
- Model access works

✅ **Test 2 - OpenSearch**:
- Endpoint reachable
- Credentials correct
- Index exists
- Cluster healthy

⚠️ **Test 3 - Redis** (Expected to fail locally):
- Will only work from Lambda (VPC access)
- Verifies when we deploy actual Lambda functions

✅ **Test 4 - LangChain**:
- Framework initialized correctly
- OpenAI integration works

---

## Interpreting Results

### All Tests Pass (Except Redis)
✅ **Infrastructure is ready!**
- Move to Task 15.9 (Create React Native AI Service)
- Redis will work when Lambda functions are deployed

### OpenAI Test Fails
❌ **Fix needed**:
1. Check API key is correct
2. Verify API key has credits
3. Check for rate limits

### OpenSearch Test Fails
❌ **Fix needed**:
1. Verify endpoint URL is correct
2. Check username/password
3. Ensure security group allows access
4. Check cluster is running (AWS Console → OpenSearch)

### Redis Test Fails Locally
✅ **This is normal!**
- Redis only accessible from AWS Lambda
- Will work when deployed

---

## Next Steps

After successful testing:

1. ✅ Task 15.8 Complete (if tests pass)
2. 🔜 Task 15.9: Create React Native AI Service
3. 🔜 Task 15.10: Document AWS Infrastructure
4. 🔜 PR #16-21: Implement individual AI features

---

## Troubleshooting

### Connection Timeout
```
Error: ETIMEDOUT
```
**Solution**: Check firewall/network settings

### Authentication Failed
```
Error: 401 Unauthorized
```
**Solution**: Verify credentials in environment variables

### Index Not Found
```
Error: index_not_found_exception
```
**Solution**: Run `node aws-lambda/opensearch/create-index.js`

---

## Deploy to Lambda (Optional - For Full Test)

If you want to test from Lambda:

1. Create deployment package:
```bash
cd aws-lambda/ai-functions
zip -r test-function.zip test-infrastructure.js utils/ node_modules/
```

2. Create Lambda function:
   - Name: `pigeonai-test-infrastructure`
   - Runtime: Node.js 18.x
   - Handler: `test-infrastructure.handler`
   - Role: Use existing `pigeonai-send-notification-role-wtvf11x9`
   - Upload: `test-function.zip`
   - Environment variables: Already configured ✅

3. Test Lambda:
   - Click "Test" button
   - Create test event (empty JSON: `{}`)
   - Click "Invoke"

4. Check results in response:
```json
{
  "tests": {
    "openai": { "status": "SUCCESS" },
    "opensearch": { "status": "SUCCESS" },
    "redis": { "status": "SUCCESS" },
    "environmentVariables": { "status": "SUCCESS" },
    "iamPermissions": { "status": "SUCCESS" }
  },
  "summary": {
    "allTestsPassed": true,
    "passedTests": 5,
    "totalTests": 5
  }
}
```

---

## What Success Looks Like

### Local Test (OpenAI + OpenSearch only)
```
✅ OpenAI API connected
✅ OpenSearch connected
❌ Redis failed (expected locally)
✅ LangChain connected
```

### Lambda Test (All services)
```
✅ OpenAI API connected
✅ OpenSearch connected
✅ Redis connected
✅ Environment variables set
✅ IAM permissions granted
```

---

**Ready to run the test? Let me know the results!** 🧪

