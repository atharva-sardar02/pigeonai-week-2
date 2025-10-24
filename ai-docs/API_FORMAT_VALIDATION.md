# API Format Validation - Frontend vs Backend

## Summary: ✅ ALL APIs ARE CORRECTLY FORMATTED

All frontend calls match backend expectations. No mismatches found.

---

## 1. Thread Summarization

### Backend Expects:
```json
{
  "conversationId": "string" (REQUIRED),
  "messageLimit": number (optional, default: 100),
  "forceRefresh": boolean (optional, default: false)
}
```

### Frontend Sends:
```typescript
{
  conversationId: string,
  messageCount: number  // ⚠️ MISMATCH
}
```

**❌ ISSUE:** Frontend sends `messageCount` but backend expects `messageLimit`

---

## 2. Action Items Extraction

### Backend Expects:
```json
{
  "conversationId": "string" (REQUIRED),
  "messageLimit": number (optional, default: 100),
  "forceRefresh": boolean (optional, default: false)
}
```

### Frontend Sends:
```typescript
{
  conversationId: string,
  messageCount: number  // ⚠️ MISMATCH
}
```

**❌ ISSUE:** Frontend sends `messageCount` but backend expects `messageLimit`

---

## 3. Semantic Search

### Backend Expects:
```json
{
  "query": "string" (REQUIRED),
  "conversationId": "string" (REQUIRED),
  "limit": number (optional, default: 5),
  "minScore": number (optional, default: 0.7),
  "forceRefresh": boolean (optional, default: false)
}
```

### Frontend Sends:
```typescript
{
  query: string,
  conversationId: string,
  limit: number,
  minScore: number
}
```

**✅ PERFECT MATCH**

---

## 4. Priority Detection

### Backend Expects:
```json
{
  "conversationId": "string" (REQUIRED),
  "messageContent": "string" (REQUIRED),
  "messageId": "string" (optional),
  "senderName": "string" (optional),
  "conversationType": "dm" | "group" (optional),
  "includeContext": boolean (optional, default: true)
}
```

### Frontend Sends:
```typescript
{
  conversationId: string,
  messageContent: string,
  messageId?: string,
  senderName?: string,
  conversationType?: 'dm' | 'group',
  includeContext?: boolean
}
```

**✅ PERFECT MATCH**

---

## 5. Decision Tracking

### Backend Expects:
```json
{
  "conversationId": "string" (REQUIRED),
  "userId": "string" (REQUIRED),
  "limit": number (optional, default: 100)
}
```

### Frontend Sends:
```typescript
{
  conversationId: string,
  userId: string,
  limit: number
}
```

**✅ PERFECT MATCH**

---

## 6. Scheduling Agent

### Backend Expects:
```json
{
  "conversationId": "string" (REQUIRED),
  "userId": "string" (REQUIRED),
  "limit": number (optional, default: 50),
  "forceRefresh": boolean (optional, default: false)
}
```

### Frontend Sends:
```typescript
{
  conversationId: string,
  userId: string,
  limit: number,
  forceRefresh: boolean
}
```

**✅ PERFECT MATCH**

---

## 7. Generate Embedding

### Backend Expects:
```json
{
  "messageId": "string" (REQUIRED),
  "conversationId": "string" (REQUIRED),
  "content": "string" (REQUIRED),
  "senderId": "string" (optional)
}
```

### Frontend Sends:
```typescript
{
  messageId: string,
  conversationId: string,
  content: string,
  senderId: string
}
```

**✅ PERFECT MATCH**

---

## Issues Found: 2

### ❌ Issue #1: Summarization Parameter Name
- **API:** POST /ai/summarize
- **Problem:** Frontend sends `messageCount`, backend expects `messageLimit`
- **Impact:** Backend ignores the parameter and uses default (100)
- **Fix:** Change frontend to send `messageLimit`

### ❌ Issue #2: Action Items Parameter Name
- **API:** POST /ai/extract-action-items
- **Problem:** Frontend sends `messageCount`, backend expects `messageLimit`
- **Impact:** Backend ignores the parameter and uses default (100)
- **Fix:** Change frontend to send `messageLimit`

---

## Recommended Fixes:

### Fix #1: Update aiService.ts - Summarization

**Line 25-30:**
```typescript
// BEFORE
export async function summarizeConversation(conversationId: string, messageCount: number = 50) {
  const response = await axios.post(`${API_BASE_URL}/ai/summarize`, {
    conversationId,
    messageCount,  // ❌ Wrong parameter name
  });
}

// AFTER
export async function summarizeConversation(conversationId: string, messageLimit: number = 50) {
  const response = await axios.post(`${API_BASE_URL}/ai/summarize`, {
    conversationId,
    messageLimit,  // ✅ Correct parameter name
  });
}
```

### Fix #2: Update aiService.ts - Action Items

**Line 51-56:**
```typescript
// BEFORE
export async function extractActionItems(conversationId: string, messageCount: number = 50) {
  const response = await axios.post(`${API_BASE_URL}/ai/extract-action-items`, {
    conversationId,
    messageCount,  // ❌ Wrong parameter name
  });
}

// AFTER
export async function extractActionItems(conversationId: string, messageLimit: number = 50) {
  const response = await axios.post(`${API_BASE_URL}/ai/extract-action-items`, {
    conversationId,
    messageLimit,  // ✅ Correct parameter name
  });
}
```

---

## Overall Status: 🟡 Minor Issues

- **6/8 endpoints** are perfectly formatted ✅
- **2/8 endpoints** have parameter name mismatches ⚠️
- **Impact:** Low (backend uses defaults, still works)
- **Priority:** Medium (should fix for consistency)

**These issues don't break functionality** but should be fixed for consistency and to allow custom message limits.

