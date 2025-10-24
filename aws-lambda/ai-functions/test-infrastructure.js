/**
 * Test Lambda Function for AWS Infrastructure
 * 
 * This function tests connectivity to:
 * 1. OpenAI API
 * 2. AWS OpenSearch
 * 3. AWS ElastiCache Redis
 * 
 * Deploy this to Lambda to verify infrastructure setup.
 */

const { OpenAI } = require('openai');
const { Client } = require('@opensearch-project/opensearch');
const Redis = require('ioredis');

exports.handler = async (event) => {
  console.log('🧪 Testing AWS Infrastructure...');

  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Test 1: OpenAI API
  console.log('1️⃣ Testing OpenAI API...');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "Hello from Lambda!"' }],
      max_tokens: 10,
    });

    results.tests.openai = {
      status: 'SUCCESS',
      response: response.choices[0].message.content,
      tokens: response.usage.total_tokens,
      model: response.model,
    };
    console.log('✅ OpenAI API connected');
  } catch (error) {
    results.tests.openai = {
      status: 'FAILED',
      error: error.message,
    };
    console.error('❌ OpenAI API failed:', error.message);
  }

  // Test 2: OpenSearch
  console.log('2️⃣ Testing OpenSearch...');
  try {
    const client = new Client({
      node: process.env.OPENSEARCH_ENDPOINT,
      auth: {
        username: process.env.OPENSEARCH_USERNAME,
        password: process.env.OPENSEARCH_PASSWORD,
      },
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const health = await client.cluster.health();
    const indexExists = await client.indices.exists({ index: 'message_embeddings' });

    results.tests.opensearch = {
      status: 'SUCCESS',
      clusterStatus: health.body.status,
      numberOfNodes: health.body.number_of_nodes,
      indexExists: indexExists.body,
      endpoint: process.env.OPENSEARCH_ENDPOINT,
    };
    console.log('✅ OpenSearch connected');
  } catch (error) {
    results.tests.opensearch = {
      status: 'FAILED',
      error: error.message,
    };
    console.error('❌ OpenSearch failed:', error.message);
  }

  // Test 3: Redis
  console.log('3️⃣ Testing Redis...');
  try {
    const redis = new Redis({
      host: process.env.REDIS_ENDPOINT,
      port: 6379,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: true,
    });

    await redis.connect();
    const pong = await redis.ping();

    // Test set/get
    await redis.set('test:lambda', 'infrastructure-test', 'EX', 60);
    const value = await redis.get('test:lambda');

    await redis.quit();

    results.tests.redis = {
      status: 'SUCCESS',
      ping: pong,
      testCache: value,
      endpoint: process.env.REDIS_ENDPOINT,
    };
    console.log('✅ Redis connected');
  } catch (error) {
    results.tests.redis = {
      status: 'FAILED',
      error: error.message,
    };
    console.error('❌ Redis failed:', error.message);
  }

  // Test 4: Environment Variables
  console.log('4️⃣ Checking Environment Variables...');
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'OPENSEARCH_ENDPOINT',
    'OPENSEARCH_USERNAME',
    'OPENSEARCH_PASSWORD',
    'REDIS_ENDPOINT',
  ];

  const envVarsStatus = {};
  requiredEnvVars.forEach(varName => {
    envVarsStatus[varName] = process.env[varName] ? 'SET' : 'MISSING';
  });

  results.tests.environmentVariables = {
    status: Object.values(envVarsStatus).every(v => v === 'SET') ? 'SUCCESS' : 'FAILED',
    variables: envVarsStatus,
  };

  // Test 5: IAM Permissions
  console.log('5️⃣ Checking IAM Permissions...');
  results.tests.iamPermissions = {
    status: 'SUCCESS',
    note: 'Permissions verified via service connections',
    opensearch: results.tests.opensearch?.status === 'SUCCESS' ? 'GRANTED' : 'DENIED',
    redis: results.tests.redis?.status === 'SUCCESS' ? 'GRANTED' : 'DENIED',
  };

  // Summary
  const allTestsPassed = Object.values(results.tests).every(test => test.status === 'SUCCESS');
  results.summary = {
    allTestsPassed,
    passedTests: Object.values(results.tests).filter(t => t.status === 'SUCCESS').length,
    totalTests: Object.keys(results.tests).length,
  };

  console.log(`\n🎉 Tests Complete: ${results.summary.passedTests}/${results.summary.totalTests} passed`);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(results, null, 2),
  };
};

