# AWS Lambda Environment Variables

## ⚠️ SECURITY NOTICE

**This file contains sensitive information placeholders. NEVER commit actual API keys or passwords to Git!**

All sensitive credentials are stored in AWS Lambda environment variables (configured in AWS Console), NOT in code or files.

---

## Required Environment Variables

All Lambda AI functions require these environment variables configured in AWS Lambda Console:

### OpenAI API
```bash
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- **Purpose**: Access OpenAI API for GPT-4, GPT-3.5-turbo, and embeddings
- **How to get**: https://platform.openai.com/api-keys
- **Security**: NEVER commit this key to Git!

---

### OpenSearch (Vector Database)
```bash
OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-XXXXX.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=YOUR_OPENSEARCH_PASSWORD
```
- **Purpose**: Store and search message embeddings (RAG)
- **Endpoint**: Found in AWS OpenSearch console
- **Credentials**: Set during OpenSearch cluster creation
- **Security**: Password is sensitive - store only in Lambda environment variables

---

### ElastiCache Redis
```bash
REDIS_ENDPOINT=pigeonai-cache-XXXXX.serverless.use1.cache.amazonaws.com
```
- **Purpose**: Cache AI responses to reduce costs
- **Endpoint**: Found in AWS ElastiCache console
- **No password required**: Serverless Valkey uses VPC security

---

### Optional Variables
```bash
NODE_ENV=production
LANGCHAIN_TRACING_V2=false
AWS_REGION=us-east-1
```

---

## How to Configure in AWS Lambda

1. Go to **AWS Console** → **Lambda** → **Functions**
2. Click on your Lambda function
3. Go to **Configuration** → **Environment variables**
4. Click **"Edit"**
5. Click **"Add environment variable"** for each one
6. **Key**: Variable name (e.g., `OPENAI_API_KEY`)
7. **Value**: Actual value (e.g., `sk-proj-xxxxx`)
8. Click **"Save"**

---

## Security Best Practices

### ✅ DO:
- Store all secrets in AWS Lambda environment variables
- Use IAM roles for AWS service access (OpenSearch, Redis)
- Rotate API keys regularly
- Monitor CloudWatch logs for unauthorized access
- Use AWS Secrets Manager for production (optional)

### ❌ DON'T:
- Commit API keys to Git (EVER!)
- Hardcode secrets in code
- Share API keys in documentation
- Log API keys in CloudWatch
- Include secrets in error messages

---

## Environment Variable Access in Code

```javascript
// utils/openaiClient.js
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ Read from environment
});

// utils/opensearchClient.js
const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
});

// utils/cacheClient.js
const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: 6379,
});
```

---

## Verifying Configuration

After configuring environment variables, test locally with:

```bash
# From aws-lambda/ai-functions directory
export OPENAI_API_KEY=sk-proj-xxxxx
export OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-xxx.us-east-1.es.amazonaws.com
export OPENSEARCH_USERNAME=admin
export OPENSEARCH_PASSWORD=YOUR_PASSWORD
export REDIS_ENDPOINT=pigeonai-cache-xxx.serverless.use1.cache.amazonaws.com

node test-connections.js
```

**Expected output**: All connections successful ✅

---

## References

- [AWS Lambda Environment Variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Security Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html)

