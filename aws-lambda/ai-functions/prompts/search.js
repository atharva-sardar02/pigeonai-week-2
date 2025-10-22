/**
 * Semantic Search Prompts (PR #18)
 * 
 * Purpose: Help AI understand natural language search queries
 * Persona: Remote Team Professional
 * 
 * Use Cases:
 * - "find database migration discussion"
 * - "where did we talk about authentication?"
 * - "what was decided about the deployment strategy"
 */

/**
 * System prompt for semantic search understanding
 * (Currently not used - OpenSearch handles similarity directly)
 * 
 * This is reserved for future enhancements where we might:
 * - Expand user queries ("database" → "database, DB, PostgreSQL, MySQL")
 * - Detect search intent ("who said" vs "what was decided")
 * - Filter by time ("last week", "yesterday")
 */
const SEARCH_UNDERSTANDING_PROMPT = `
You are a search query enhancer for a professional messaging app.

Given a user's natural language search query, improve it for better results.

CONTEXT:
- Users are software engineers discussing technical topics
- Common topics: deployments, bugs, features, code reviews, meetings
- Users often use shorthand (DB = database, API = application programming interface)

YOUR TASK:
Expand and clarify the search query without changing its core meaning.

Examples:
- "DB migration" → "database migration, schema migration, data migration"
- "auth bug" → "authentication bug, login issue, OAuth error"
- "API design" → "API design, endpoint design, REST API, GraphQL API"

Return ONLY the expanded query, no explanations.

USER QUERY:
{query}

EXPANDED QUERY:
`;

/**
 * Generate search query expansion prompt
 * (Not currently used - reserved for future)
 * @param {string} query - User's search query
 * @returns {string} - Formatted prompt
 */
function generateSearchPrompt(query) {
  return SEARCH_UNDERSTANDING_PROMPT.replace('{query}', query);
}

/**
 * Search result reranking prompt
 * (Future enhancement: Use GPT to rerank OpenSearch results for better relevance)
 */
const RERANKING_PROMPT = `
You are helping rerank search results for a professional messaging app.

ORIGINAL QUERY:
{query}

SEARCH RESULTS (sorted by vector similarity):
{results}

YOUR TASK:
Rerank these results by true relevance to the query.
Consider:
1. Semantic match (does it answer the query?)
2. Completeness (full answer vs. partial mention)
3. Recency (more recent is better for time-sensitive queries)

Return ONLY the message IDs in ranked order, comma-separated.

RANKED MESSAGE IDS:
`;

/**
 * Generate reranking prompt
 * @param {string} query - Search query
 * @param {Array} results - Search results from OpenSearch
 * @returns {string} - Formatted prompt
 */
function generateRerankingPrompt(query, results) {
  const resultsText = results.map((r, i) => 
    `${i + 1}. [ID: ${r.messageId}] ${r.content} (Score: ${r.score})`
  ).join('\n');
  
  return RERANKING_PROMPT
    .replace('{query}', query)
    .replace('{results}', resultsText);
}

/**
 * Search explanation prompt
 * (Future: Explain why results were returned)
 */
const EXPLANATION_PROMPT = `
Explain why this message is relevant to the search query.

QUERY: {query}
MESSAGE: {message}

Provide a 1-sentence explanation of relevance.
`;

/**
 * Generate explanation for search result
 * @param {string} query - Search query
 * @param {string} message - Message content
 * @returns {string} - Formatted prompt
 */
function generateExplanationPrompt(query, message) {
  return EXPLANATION_PROMPT
    .replace('{query}', query)
    .replace('{message}', message);
}

module.exports = {
  SEARCH_UNDERSTANDING_PROMPT,
  RERANKING_PROMPT,
  EXPLANATION_PROMPT,
  generateSearchPrompt,
  generateRerankingPrompt,
  generateExplanationPrompt,
};

