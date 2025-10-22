# IAM Role Configuration for Lambda Functions

## Overview

IAM role for Lambda functions to access AWS services (OpenSearch, ElastiCache, CloudWatch).

**Role Name**: `pigeonai-send-notification-role-wtvf11x9`

---

## Attached Policies

### 1. AWSLambdaBasicExecutionRole (Existing)
**Purpose**: Write logs to CloudWatch Logs  
**Permissions**:
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`

**ARN**: `arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`

---

### 2. AmazonOpenSearchServiceFullAccess (New)
**Purpose**: Access OpenSearch for vector search  
**Permissions**:
- Full access to OpenSearch domains
- Read/write embeddings
- Perform k-NN searches

**ARN**: `arn:aws:iam::aws:policy/AmazonOpenSearchServiceFullAccess`

**Used For**:
- Storing message embeddings
- Semantic search (RAG)
- Vector similarity search

---

### 3. AmazonElastiCacheFullAccess (New)
**Purpose**: Access ElastiCache Redis for caching  
**Permissions**:
- Full access to ElastiCache clusters
- Read/write cache data

**ARN**: `arn:aws:iam::aws:policy/AmazonElastiCacheFullAccess`

**Used For**:
- Caching AI responses (summaries, action items, etc.)
- Reducing OpenAI API costs
- Improving response times

---

### 4. AWSLambdaVPCAccessExecutionRole (New)
**Purpose**: Network access for VPC resources  
**Permissions**:
- Create/manage network interfaces
- Access VPC resources (ElastiCache)

**ARN**: `arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole`

**Used For**:
- Connecting to ElastiCache Redis (VPC endpoint)
- Network access to private AWS resources

---

## Trust Relationship

The role trusts the Lambda service to assume it:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

## Usage

### Assigning Role to Lambda Functions

When creating a Lambda function:

1. Go to Lambda → Create function
2. **Execution role**: Choose "Use an existing role"
3. Select: `pigeonai-send-notification-role-wtvf11x9`

### Environment Variables (Task 15.7)

Lambda functions using this role will need these environment variables:

```bash
# OpenSearch
OPENSEARCH_ENDPOINT=https://search-pigeonai-embeddings-sefdb6usfwni6dhjxdmoqsn7zi.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=PigeonAI2025!

# Redis
REDIS_ENDPOINT=pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx
```

---

## Security Best Practices

### Current Setup (MVP)
- ✅ Full access policies (simplest for development)
- ✅ Role reused across all Lambda functions
- ✅ Trust relationship limited to Lambda service

### Production Recommendations
- 🔄 Replace `FullAccess` policies with least-privilege custom policies
- 🔄 Separate roles for different Lambda functions
- 🔄 Use AWS Secrets Manager for credentials (not env variables)
- 🔄 Enable AWS CloudTrail for audit logging

---

## Custom Policy Example (Optional - For Production)

Instead of `FullAccess`, create a custom policy with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "es:ESHttpGet",
        "es:ESHttpPost",
        "es:ESHttpPut"
      ],
      "Resource": "arn:aws:es:us-east-1:*:domain/pigeonai-embeddings/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "elasticache:DescribeCacheClusters",
        "elasticache:DescribeReplicationGroups"
      ],
      "Resource": "arn:aws:elasticache:us-east-1:*:serverlesscache:pigeonai-cache"
    }
  ]
}
```

**Note**: For MVP, we're using `FullAccess` for simplicity. Tighten permissions before production.

---

## Testing Permissions

### Verify OpenSearch Access

```javascript
// In Lambda function
const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
});

// Test connection
const health = await client.cluster.health();
console.log('OpenSearch health:', health.body);
```

### Verify Redis Access

```javascript
// In Lambda function
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: 6379,
});

// Test connection
const pong = await redis.ping();
console.log('Redis ping:', pong); // Should return "PONG"
```

---

## Troubleshooting

### Permission Denied Errors

**Error**: `AccessDeniedException` or `UnauthorizedException`

**Solutions**:
1. Verify role is attached to Lambda function
2. Check policy attachments in IAM console
3. Wait 1-2 minutes for IAM changes to propagate

### Network Timeout Errors

**Error**: `Connection timeout` or `ENOTFOUND`

**Solutions**:
1. Verify `AWSLambdaVPCAccessExecutionRole` is attached
2. Check security groups allow Lambda access
3. Ensure endpoints are correct in environment variables

---

## Cost Impact

**IAM Roles**: Free ✅  
**Policy Evaluations**: Free ✅

No additional cost for IAM role configuration.

---

## Next Steps

1. ✅ Task 15.4 Complete: IAM role configured
2. 🔜 Task 15.5: Install Lambda dependencies
3. 🔜 Task 15.6: Create Lambda functions with this role
4. 🔜 Task 15.7: Configure environment variables

---

## References

- [Lambda Execution Roles](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)
- [OpenSearch IAM Policies](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/ac.html)
- [ElastiCache IAM Policies](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/IAM.html)
- [Lambda VPC Networking](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)

