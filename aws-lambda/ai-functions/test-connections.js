/**
 * Test Connections to AWS Services
 * 
 * This script tests connectivity to:
 * 1. OpenAI API
 * 2. AWS OpenSearch
 * 3. AWS ElastiCache Redis
 * 
 * Run with: node test-connections.js
 */

// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';

// OpenSearch Configuration
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT || 'https://search-pigeonai-embeddings-sefdb6usfwni6dhjxdmoqsn7zi.us-east-1.es.amazonaws.com';
const OPENSEARCH_USERNAME = process.env.OPENSEARCH_USERNAME || 'admin';
const OPENSEARCH_PASSWORD = process.env.OPENSEARCH_PASSWORD || 'PigeonAI2025!';

// Redis Configuration
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT || 'pigeonai-cache-ggng2r.serverless.use1.cache.amazonaws.com';

async function testConnections() {
  console.log('\n🧪 Testing AWS Service Connections...\n');

  // Test 1: OpenAI API
  console.log('1️⃣ Testing OpenAI API...');
  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Hello from Lambda!"' }],
      max_tokens: 10,
    });
    
    console.log('✅ OpenAI API connected');
    console.log(`   Response: ${response.choices[0].message.content}`);
    console.log('');
  } catch (error) {
    console.error('❌ OpenAI API failed:', error.message);
    console.log('   Make sure OPENAI_API_KEY is set correctly\n');
  }

  // Test 2: OpenSearch
  console.log('2️⃣ Testing OpenSearch...');
  try {
    const { Client } = require('@opensearch-project/opensearch');
    
    const client = new Client({
      node: OPENSEARCH_ENDPOINT,
      auth: {
        username: OPENSEARCH_USERNAME,
        password: OPENSEARCH_PASSWORD,
      },
      ssl: {
        rejectUnauthorized: false, // For self-signed certs
      },
    });
    
    const health = await client.cluster.health();
    console.log('✅ OpenSearch connected');
    console.log(`   Cluster status: ${health.body.status}`);
    console.log(`   Number of nodes: ${health.body.number_of_nodes}`);
    
    // Check if index exists
    const indexExists = await client.indices.exists({ index: 'message_embeddings' });
    console.log(`   Index 'message_embeddings': ${indexExists.body ? 'EXISTS' : 'NOT FOUND'}`);
    console.log('');
  } catch (error) {
    console.error('❌ OpenSearch failed:', error.message);
    console.log('   Check endpoint, username, and password\n');
  }

  // Test 3: Redis
  console.log('3️⃣ Testing Redis...');
  try {
    const Redis = require('ioredis');
    
    const redis = new Redis({
      host: REDIS_ENDPOINT,
      port: 6379,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
    });
    
    const pong = await redis.ping();
    console.log('✅ Redis connected');
    console.log(`   Ping response: ${pong}`);
    
    // Test set/get
    await redis.set('test:connection', 'success', 'EX', 10);
    const value = await redis.get('test:connection');
    console.log(`   Test cache: ${value}`);
    
    await redis.quit();
    console.log('');
  } catch (error) {
    console.error('❌ Redis failed:', error.message);
    console.log('   This is expected if running locally (Redis only accessible from AWS)');
    console.log('   Will work when deployed to Lambda\n');
  }

  // Test 4: LangChain
  console.log('4️⃣ Testing LangChain...');
  try {
    const { ChatOpenAI } = require('@langchain/openai');
    
    const model = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    });
    
    const response = await model.invoke('Say "LangChain works!"');
    console.log('✅ LangChain connected');
    console.log(`   Response: ${response.content}`);
    console.log('');
  } catch (error) {
    console.error('❌ LangChain failed:', error.message);
    console.log('   Check OPENAI_API_KEY\n');
  }

  console.log('🎉 Connection tests complete!\n');
}

// Run tests
testConnections().catch(console.error);

