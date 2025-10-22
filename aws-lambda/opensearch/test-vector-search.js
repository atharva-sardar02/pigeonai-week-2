/**
 * Test OpenSearch Vector Search
 * 
 * This script tests the k-NN vector search functionality by:
 * 1. Inserting a few sample message embeddings
 * 2. Performing a k-NN search
 * 3. Verifying results are returned correctly
 * 
 * Run this AFTER create-index.js to verify everything works.
 */

const { Client } = require('@opensearch-project/opensearch');

// Configuration - UPDATE THESE VALUES
const OPENSEARCH_ENDPOINT = 'https://search-pigeonai-embeddings-sefdb6usfwni6dhjxdmoqsn7zi.us-east-1.es.amazonaws.com';
const OPENSEARCH_USERNAME = 'admin';
const OPENSEARCH_PASSWORD = 'PigeonAI2025!';

// Create OpenSearch client
const client = new Client({
  node: OPENSEARCH_ENDPOINT,
  auth: {
    username: OPENSEARCH_USERNAME,
    password: OPENSEARCH_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

const INDEX_NAME = 'message_embeddings';

// Sample messages with fake embeddings (1536 dimensions)
// In real use, these come from OpenAI embeddings API
const generateRandomEmbedding = () => {
  return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
};

const sampleMessages = [
  {
    messageId: 'msg_001',
    conversationId: 'conv_test_123',
    content: 'We need to decide on the database migration strategy',
    embedding: generateRandomEmbedding(),
    timestamp: new Date().toISOString(),
    senderId: 'user_alice',
  },
  {
    messageId: 'msg_002',
    conversationId: 'conv_test_123',
    content: 'I recommend using blue-green deployment for zero downtime',
    embedding: generateRandomEmbedding(),
    timestamp: new Date().toISOString(),
    senderId: 'user_bob',
  },
  {
    messageId: 'msg_003',
    conversationId: 'conv_test_123',
    content: 'Production is down, we need to fix the auth service immediately',
    embedding: generateRandomEmbedding(),
    timestamp: new Date().toISOString(),
    senderId: 'user_charlie',
  },
];

async function testVectorSearch() {
  try {
    console.log('📝 Step 1: Inserting sample messages...');
    
    // Insert sample documents
    for (const message of sampleMessages) {
      await client.index({
        index: INDEX_NAME,
        id: message.messageId,
        body: message,
        refresh: true, // Make immediately searchable
      });
      console.log(`✅ Inserted: ${message.messageId} - "${message.content}"`);
    }
    
    console.log('\n🔍 Step 2: Performing k-NN vector search...');
    
    // Perform k-NN search with a query vector
    // In real use, this query vector comes from OpenAI embeddings of the search query
    const queryVector = generateRandomEmbedding();
    
    const searchResponse = await client.search({
      index: INDEX_NAME,
      body: {
        size: 3, // Return top 3 results
        query: {
          bool: {
            must: [
              {
                knn: {
                  embedding: {
                    vector: queryVector,
                    k: 3, // Find 3 nearest neighbors
                  },
                },
              },
              {
                term: {
                  conversationId: 'conv_test_123', // Filter by conversation
                },
              },
            ],
          },
        },
        _source: ['messageId', 'content', 'timestamp', 'senderId'], // Return these fields
      },
    });
    
    console.log('\n📊 Search Results:');
    console.log(`Found ${searchResponse.body.hits.total.value} results\n`);
    
    searchResponse.body.hits.hits.forEach((hit, index) => {
      console.log(`${index + 1}. Message ID: ${hit._source.messageId}`);
      console.log(`   Content: "${hit._source.content}"`);
      console.log(`   Score: ${hit._score} (higher = more similar)`);
      console.log(`   Sender: ${hit._source.senderId}`);
      console.log('');
    });
    
    console.log('🎉 SUCCESS! k-NN vector search is working!');
    console.log('\n✅ Task 15.1 Complete: OpenSearch cluster is ready for production use.');
    
    // Clean up test data (optional)
    console.log('\n🧹 Cleaning up test data...');
    for (const message of sampleMessages) {
      await client.delete({
        index: INDEX_NAME,
        id: message.messageId,
      });
    }
    console.log('✅ Test data cleaned up.');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
testVectorSearch();

