import * as SQLite from 'expo-sqlite';

/**
 * SQLite Database Service
 * Low-level SQLite operations wrapper
 */

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Open or create the database
 */
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('pigeonai.db');
    console.log('✅ Database opened successfully');
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
}

/**
 * Close the database
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.closeAsync();
      db = null;
      console.log('✅ Database closed successfully');
    } catch (error) {
      console.error('❌ Error closing database:', error);
      throw error;
    }
  }
}

/**
 * Execute a SQL query
 */
export async function executeQuery(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  try {
    const database = await openDatabase();
    const result = await database.runAsync(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Error executing query:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a SQL query and return all rows
 */
export async function executeQueryAll<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const database = await openDatabase();
    const result = await database.getAllAsync<T>(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Error executing query (all):', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a SQL query and return first row
 */
export async function executeQueryFirst<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  try {
    const database = await openDatabase();
    const result = await database.getFirstAsync<T>(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Error executing query (first):', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute multiple SQL statements in a transaction
 */
export async function executeTransaction(
  operations: Array<{ sql: string; params?: any[] }>
): Promise<void> {
  const database = await openDatabase();
  
  try {
    await database.withTransactionAsync(async () => {
      for (const operation of operations) {
        await database.runAsync(operation.sql, operation.params || []);
      }
    });
    console.log('✅ Transaction executed successfully');
  } catch (error) {
    console.error('❌ Error executing transaction:', error);
    throw error;
  }
}

/**
 * Drop all tables (for development/testing)
 */
export async function dropAllTables(): Promise<void> {
  try {
    await executeQuery('DROP TABLE IF EXISTS messages');
    await executeQuery('DROP TABLE IF EXISTS conversations');
    await executeQuery('DROP TABLE IF EXISTS offline_queue');
    console.log('✅ All tables dropped');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  messageCount: number;
  conversationCount: number;
  queueCount: number;
}> {
  try {
    const messageResult = await executeQueryFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM messages'
    );
    const conversationResult = await executeQueryFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM conversations'
    );
    const queueResult = await executeQueryFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM offline_queue'
    );

    return {
      messageCount: messageResult?.count || 0,
      conversationCount: conversationResult?.count || 0,
      queueCount: queueResult?.count || 0,
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return {
      messageCount: 0,
      conversationCount: 0,
      queueCount: 0,
    };
  }
}


