/**
 * Create OpenSearch Index for Message Embeddings
 * 
 * This script creates the 'message_embeddings' index with k-NN configuration
 * for storing 1536-dimensional vectors from OpenAI embeddings.
 * 
 * Run this ONCE after OpenSearch cluster is created.
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
    rejectUnauthorized: false, // For development only
  },
});

// Index name
const INDEX_NAME = 'message_embeddings';

// Index mapping configuration
const indexMapping = {
  settings: {
    index: {
      knn: true, // Enable k-NN search
      number_of_shards: 1,
      number_of_replicas: 2, // Multi-AZ cluster needs 2 replicas (3 total copies for 3 AZs)
    },
  },
  mappings: {
    properties: {
      messageId: {
        type: 'keyword', // Exact match for message ID
      },
      conversationId: {
        type: 'keyword', // Exact match for conversation ID
      },
      content: {
        type: 'text', // Full-text search on message content
        analyzer: 'standard',
      },
      embedding: {
        type: 'knn_vector', // Vector field for k-NN search
        dimension: 1536, // OpenAI text-embedding-3-small dimension
        method: {
          name: 'hnsw', // Hierarchical Navigable Small World algorithm
          space_type: 'cosinesimil', // Cosine similarity for distance metric
          engine: 'faiss', // Use FAISS engine (best for OpenSearch 3.x)
        },
      },
      timestamp: {
        type: 'date', // ISO date format
      },
      senderId: {
        type: 'keyword', // User ID
      },
    },
  },
};

// Create the index
async function createIndex() {
  try {
    console.log('🔍 Checking if index already exists...');
    
    // Check if index exists
    const exists = await client.indices.exists({ index: INDEX_NAME });
    
    if (exists.body) {
      console.log(`⚠️  Index '${INDEX_NAME}' already exists. Deleting...`);
      await client.indices.delete({ index: INDEX_NAME });
      console.log('✅ Old index deleted.');
    }
    
    console.log(`📝 Creating index '${INDEX_NAME}'...`);
    
    // Create index with k-NN mapping
    const response = await client.indices.create({
      index: INDEX_NAME,
      body: indexMapping,
    });
    
    console.log('✅ Index created successfully!');
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    // Verify index settings
    console.log('\n🔍 Verifying index settings...');
    const settings = await client.indices.getSettings({ index: INDEX_NAME });
    console.log('Settings:', JSON.stringify(settings.body, null, 2));
    
    console.log('\n🎉 SUCCESS! Index is ready for vector embeddings.');
    console.log('You can now insert message embeddings and perform k-NN searches.');
    
  } catch (error) {
    console.error('❌ Error creating index:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
createIndex();

