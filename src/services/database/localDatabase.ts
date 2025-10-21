import { Message, Conversation } from '../../types';
import * as SQLiteService from './sqliteService';

/**
 * Local Database Service
 * High-level database operations for messages and conversations
 * Provides offline caching and queue management
 */

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Initialize the local database
 * Creates tables if they don't exist
 * Cache persists across sessions for better performance
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('📦 Initializing local database...');

    // Create messages table
    await SQLiteService.executeQuery(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderId TEXT NOT NULL,
        conversationId TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        imageUrl TEXT,
        readBy TEXT,
        synced INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Create index for faster queries
    await SQLiteService.executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversationId, timestamp DESC)
    `);

    // Create conversations table
    await SQLiteService.executeQuery(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        participants TEXT NOT NULL,
        lastMessage TEXT,
        lastMessageTime INTEGER,
        unreadCount TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        groupName TEXT,
        groupIcon TEXT,
        adminIds TEXT
      )
    `);

    // Create index for faster queries
    await SQLiteService.executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_conversations_updated 
      ON conversations(updatedAt DESC)
    `);

    // Create offline queue table
    await SQLiteService.executeQuery(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operationType TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt INTEGER DEFAULT (strftime('%s', 'now')),
        retryCount INTEGER DEFAULT 0
      )
    `);

    console.log('✅ Local database initialized successfully');
    console.log('💾 Cache will persist across sessions for instant loading');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Insert a message into local database
 */
export async function insertMessage(message: Message, synced: boolean = false): Promise<void> {
  try {
    await SQLiteService.executeQuery(
      `INSERT OR REPLACE INTO messages 
       (id, senderId, conversationId, content, timestamp, status, type, imageUrl, readBy, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.senderId,
        message.conversationId,
        message.content,
        message.timestamp.getTime(),
        message.status,
        message.type,
        message.imageUrl || null,
        JSON.stringify(message.readBy || {}),
        synced ? 1 : 0,
      ]
    );
  } catch (error) {
    console.error('❌ Error inserting message:', error);
    throw error;
  }
}

/**
 * Update a message in local database
 */
export async function updateMessage(
  messageId: string,
  updates: Partial<Message>
): Promise<void> {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.content !== undefined) {
      setClauses.push('content = ?');
      values.push(updates.content);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      values.push(updates.status);
    }
    if (updates.imageUrl !== undefined) {
      setClauses.push('imageUrl = ?');
      values.push(updates.imageUrl);
    }
    if (updates.readBy !== undefined) {
      setClauses.push('readBy = ?');
      values.push(JSON.stringify(updates.readBy));
    }

    if (setClauses.length === 0) {
      return; // No updates to make
    }

    values.push(messageId);

    await SQLiteService.executeQuery(
      `UPDATE messages SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('❌ Error updating message:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const rows = await SQLiteService.executeQueryAll<any>(
      `SELECT * FROM messages 
       WHERE conversationId = ? 
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );

    return rows.map((row) => ({
      id: row.id,
      senderId: row.senderId,
      conversationId: row.conversationId,
      content: row.content,
      timestamp: new Date(row.timestamp),
      status: row.status,
      type: row.type,
      imageUrl: row.imageUrl,
      readBy: row.readBy ? JSON.parse(row.readBy) : {},
    }));
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    return [];
  }
}

/**
 * Get a single message by ID
 */
export async function getMessage(messageId: string): Promise<Message | null> {
  try {
    const row = await SQLiteService.executeQueryFirst<any>(
      'SELECT * FROM messages WHERE id = ?',
      [messageId]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      senderId: row.senderId,
      conversationId: row.conversationId,
      content: row.content,
      timestamp: new Date(row.timestamp),
      status: row.status,
      type: row.type,
      imageUrl: row.imageUrl,
      readBy: row.readBy ? JSON.parse(row.readBy) : {},
    };
  } catch (error) {
    console.error('❌ Error getting message:', error);
    return null;
  }
}

/**
 * Delete a message from local database
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    await SQLiteService.executeQuery('DELETE FROM messages WHERE id = ?', [messageId]);
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error;
  }
}

/**
 * Get unsynced messages
 */
export async function getUnsyncedMessages(): Promise<Message[]> {
  try {
    const rows = await SQLiteService.executeQueryAll<any>(
      'SELECT * FROM messages WHERE synced = 0 ORDER BY timestamp ASC'
    );

    return rows.map((row) => ({
      id: row.id,
      senderId: row.senderId,
      conversationId: row.conversationId,
      content: row.content,
      timestamp: new Date(row.timestamp),
      status: row.status,
      type: row.type,
      imageUrl: row.imageUrl,
      readBy: row.readBy ? JSON.parse(row.readBy) : {},
    }));
  } catch (error) {
    console.error('❌ Error getting unsynced messages:', error);
    return [];
  }
}

/**
 * Mark a message as synced
 */
export async function markMessageAsSynced(messageId: string): Promise<void> {
  try {
    await SQLiteService.executeQuery(
      'UPDATE messages SET synced = 1 WHERE id = ?',
      [messageId]
    );
  } catch (error) {
    console.error('❌ Error marking message as synced:', error);
    throw error;
  }
}

/**
 * Delete old messages (cleanup)
 */
export async function deleteOldMessages(daysToKeep: number = 30): Promise<number> {
  try {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const result = await SQLiteService.executeQuery(
      'DELETE FROM messages WHERE timestamp < ? AND synced = 1',
      [cutoffTime]
    );
    console.log(`🧹 Deleted ${result.changes} old messages`);
    return result.changes;
  } catch (error) {
    console.error('❌ Error deleting old messages:', error);
    return 0;
  }
}

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

/**
 * Insert a conversation into local database
 */
export async function insertConversation(conversation: Conversation): Promise<void> {
  try {
    await SQLiteService.executeQuery(
      `INSERT OR REPLACE INTO conversations 
       (id, type, participants, lastMessage, lastMessageTime, unreadCount, createdAt, updatedAt, groupName, groupIcon, adminIds) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conversation.id,
        conversation.type,
        JSON.stringify(conversation.participants),
        conversation.lastMessage || null,
        conversation.lastMessageTime?.getTime() || null,
        JSON.stringify(conversation.unreadCount),
        conversation.createdAt.getTime(),
        conversation.updatedAt.getTime(),
        conversation.groupName || null,
        conversation.groupIcon || null,
        conversation.adminIds ? JSON.stringify(conversation.adminIds) : null,
      ]
    );
  } catch (error) {
    console.error('❌ Error inserting conversation:', error);
    throw error;
  }
}

/**
 * Update a conversation in local database
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
): Promise<void> {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.lastMessage !== undefined) {
      setClauses.push('lastMessage = ?');
      values.push(updates.lastMessage);
    }
    if (updates.lastMessageTime !== undefined) {
      setClauses.push('lastMessageTime = ?');
      values.push(updates.lastMessageTime?.getTime() || null);
    }
    if (updates.unreadCount !== undefined) {
      setClauses.push('unreadCount = ?');
      values.push(JSON.stringify(updates.unreadCount));
    }
    if (updates.updatedAt !== undefined) {
      setClauses.push('updatedAt = ?');
      values.push(updates.updatedAt.getTime());
    }
    if (updates.groupName !== undefined) {
      setClauses.push('groupName = ?');
      values.push(updates.groupName);
    }
    if (updates.groupIcon !== undefined) {
      setClauses.push('groupIcon = ?');
      values.push(updates.groupIcon);
    }
    if (updates.participants !== undefined) {
      setClauses.push('participants = ?');
      values.push(JSON.stringify(updates.participants));
    }

    if (setClauses.length === 0) {
      return; // No updates to make
    }

    values.push(conversationId);

    await SQLiteService.executeQuery(
      `UPDATE conversations SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    throw error;
  }
}

/**
 * Get all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const rows = await SQLiteService.executeQueryAll<any>(
      'SELECT * FROM conversations ORDER BY updatedAt DESC'
    );

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      participants: JSON.parse(row.participants),
      lastMessage: row.lastMessage,
      lastMessageTime: row.lastMessageTime ? new Date(row.lastMessageTime) : undefined,
      unreadCount: JSON.parse(row.unreadCount),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      groupName: row.groupName,
      groupIcon: row.groupIcon,
      adminIds: row.adminIds ? JSON.parse(row.adminIds) : undefined,
    }));
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    return [];
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const row = await SQLiteService.executeQueryFirst<any>(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      type: row.type,
      participants: JSON.parse(row.participants),
      lastMessage: row.lastMessage,
      lastMessageTime: row.lastMessageTime ? new Date(row.lastMessageTime) : undefined,
      unreadCount: JSON.parse(row.unreadCount),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      groupName: row.groupName,
      groupIcon: row.groupIcon,
      adminIds: row.adminIds ? JSON.parse(row.adminIds) : undefined,
    };
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    return null;
  }
}

/**
 * Delete a conversation from local database
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    // Delete conversation and all its messages in a transaction
    await SQLiteService.executeTransaction([
      { sql: 'DELETE FROM messages WHERE conversationId = ?', params: [conversationId] },
      { sql: 'DELETE FROM conversations WHERE id = ?', params: [conversationId] },
    ]);
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    throw error;
  }
}

// ============================================================================
// OFFLINE QUEUE OPERATIONS
// ============================================================================

export interface QueueOperation {
  id?: number;
  operationType: 'sendMessage' | 'updateMessage' | 'deleteMessage' | 'updateConversation';
  data: any;
  createdAt?: number;
  retryCount?: number;
}

/**
 * Add an operation to the offline queue
 */
export async function enqueueOperation(operation: QueueOperation): Promise<void> {
  try {
    await SQLiteService.executeQuery(
      'INSERT INTO offline_queue (operationType, data, retryCount) VALUES (?, ?, ?)',
      [operation.operationType, JSON.stringify(operation.data), 0]
    );
    console.log('📤 Operation queued:', operation.operationType);
  } catch (error) {
    console.error('❌ Error enqueueing operation:', error);
    throw error;
  }
}

/**
 * Get all queued operations
 */
export async function getQueuedOperations(): Promise<QueueOperation[]> {
  try {
    const rows = await SQLiteService.executeQueryAll<any>(
      'SELECT * FROM offline_queue ORDER BY createdAt ASC'
    );

    return rows.map((row) => ({
      id: row.id,
      operationType: row.operationType,
      data: JSON.parse(row.data),
      createdAt: row.createdAt,
      retryCount: row.retryCount,
    }));
  } catch (error) {
    console.error('❌ Error getting queued operations:', error);
    return [];
  }
}

/**
 * Remove an operation from the queue
 */
export async function dequeueOperation(operationId: number): Promise<void> {
  try {
    await SQLiteService.executeQuery('DELETE FROM offline_queue WHERE id = ?', [operationId]);
    console.log('✅ Operation dequeued:', operationId);
  } catch (error) {
    console.error('❌ Error dequeueing operation:', error);
    throw error;
  }
}

/**
 * Increment retry count for an operation
 */
export async function incrementRetryCount(operationId: number): Promise<void> {
  try {
    await SQLiteService.executeQuery(
      'UPDATE offline_queue SET retryCount = retryCount + 1 WHERE id = ?',
      [operationId]
    );
  } catch (error) {
    console.error('❌ Error incrementing retry count:', error);
    throw error;
  }
}

/**
 * Clear all queued operations
 */
export async function clearQueue(): Promise<void> {
  try {
    await SQLiteService.executeQuery('DELETE FROM offline_queue');
    console.log('🧹 Queue cleared');
  } catch (error) {
    console.error('❌ Error clearing queue:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all data from local database
 */
export async function clearAllData(): Promise<void> {
  try {
    await SQLiteService.executeTransaction([
      { sql: 'DELETE FROM messages' },
      { sql: 'DELETE FROM conversations' },
      { sql: 'DELETE FROM offline_queue' },
    ]);
    console.log('🧹 All local data cleared');
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  return await SQLiteService.getDatabaseStats();
}


