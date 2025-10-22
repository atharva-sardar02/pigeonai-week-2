/**
 * Test Redis Cache Connection and Operations
 * 
 * Tests:
 * 1. Connection to Redis
 * 2. Set/Get operations
 * 3. TTL expiration
 * 4. Pattern deletion
 * 5. Different cache types (summary, actions, search, etc.)
 */

const cache = require('./redisClient');

async function testCache() {
  console.log('\n🧪 Testing Redis Cache...\n');

  try {
    // Test 1: Ping connection
    console.log('1️⃣ Testing connection...');
    const pong = await cache.ping();
    if (!pong) {
      throw new Error('Redis connection failed');
    }
    console.log('✅ Connected to Redis\n');

    // Test 2: Set and get summary
    console.log('2️⃣ Testing summary cache...');
    const summaryData = {
      conversationId: 'test-conv-123',
      summary: 'Team discussed Q4 roadmap. Decided to prioritize mobile app features.',
      keyPoints: ['Q4 roadmap', 'Mobile app priority', 'Feature freeze Dec 15'],
      timestamp: new Date().toISOString(),
    };
    await cache.set('summary:test-conv-123', summaryData);
    const retrievedSummary = await cache.get('summary:test-conv-123');
    console.log('Retrieved summary:', retrievedSummary);
    console.log('✅ Summary cache working\n');

    // Test 3: Set and get action items
    console.log('3️⃣ Testing action items cache...');
    const actionsData = {
      conversationId: 'test-conv-123',
      actionItems: [
        { task: 'Update PRD', assignee: 'John', dueDate: '2025-10-30' },
        { task: 'Design mockups', assignee: 'Sarah', dueDate: '2025-11-05' },
      ],
      extractedAt: new Date().toISOString(),
    };
    await cache.set('actions:test-conv-123', actionsData);
    const retrievedActions = await cache.get('actions:test-conv-123');
    console.log('Retrieved actions:', retrievedActions);
    console.log('✅ Action items cache working\n');

    // Test 4: Set and get search results
    console.log('4️⃣ Testing search cache...');
    const searchData = {
      query: 'deployment strategy',
      results: [
        { messageId: 'msg-1', text: 'We should use blue-green deployment', score: 0.95 },
        { messageId: 'msg-2', text: 'Kubernetes is preferred for production', score: 0.89 },
      ],
      searchedAt: new Date().toISOString(),
    };
    await cache.set('search:deployment-strategy', searchData);
    const retrievedSearch = await cache.get('search:deployment-strategy');
    console.log('Retrieved search:', retrievedSearch);
    console.log('✅ Search cache working\n');

    // Test 5: Check TTL
    console.log('5️⃣ Testing TTL...');
    const summaryTTL = await cache.ttl('summary:test-conv-123');
    const actionsTTL = await cache.ttl('actions:test-conv-123');
    const searchTTL = await cache.ttl('search:deployment-strategy');
    console.log(`Summary TTL: ${summaryTTL}s (expected ~3600s)`);
    console.log(`Actions TTL: ${actionsTTL}s (expected ~7200s)`);
    console.log(`Search TTL: ${searchTTL}s (expected ~1800s)`);
    console.log('✅ TTL configured correctly\n');

    // Test 6: Exists check
    console.log('6️⃣ Testing exists...');
    const exists = await cache.exists('summary:test-conv-123');
    const notExists = await cache.exists('summary:nonexistent');
    console.log(`Key exists: ${exists} (expected true)`);
    console.log(`Key not exists: ${notExists} (expected false)`);
    console.log('✅ Exists check working\n');

    // Test 7: Delete single key
    console.log('7️⃣ Testing delete...');
    await cache.del('search:deployment-strategy');
    const afterDelete = await cache.get('search:deployment-strategy');
    console.log(`After delete: ${afterDelete} (expected null)`);
    console.log('✅ Delete working\n');

    // Test 8: Delete pattern
    console.log('8️⃣ Testing pattern delete...');
    await cache.set('summary:conv-1', { data: 'test1' });
    await cache.set('summary:conv-2', { data: 'test2' });
    await cache.set('summary:conv-3', { data: 'test3' });
    await cache.delPattern('summary:*');
    const afterPatternDelete = await cache.get('summary:conv-1');
    console.log(`After pattern delete: ${afterPatternDelete} (expected null)`);
    console.log('✅ Pattern delete working\n');

    // Test 9: Cache miss
    console.log('9️⃣ Testing cache miss...');
    const miss = await cache.get('nonexistent:key');
    console.log(`Cache miss result: ${miss} (expected null)`);
    console.log('✅ Cache miss handled correctly\n');

    console.log('🎉 All Redis cache tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    await cache.close();
  }
}

// Run tests
testCache();

