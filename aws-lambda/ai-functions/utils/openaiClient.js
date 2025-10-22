/**
 * OpenAI Client for Lambda Functions
 * 
 * Provides:
 * - Chat completions (GPT-4, GPT-3.5-turbo)
 * - Text embeddings (text-embedding-3-small)
 * - Structured outputs
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate chat completion
 * @param {Array} messages - Chat messages [{ role, content }]
 * @param {Object} options - Optional parameters
 * @returns {Promise<string>} - Response content
 */
async function chatCompletion(messages, options = {}) {
  try {
    const {
      model = 'gpt-4-turbo',
      temperature = 0.7,
      maxTokens = 1000,
      responseFormat = null,
    } = options;

    const params = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    // Add response format for structured outputs (JSON)
    if (responseFormat) {
      params.response_format = { type: 'json_object' };
      // Ensure system message includes JSON instruction
      if (messages[0]?.role === 'system') {
        messages[0].content += '\n\nRespond with valid JSON only.';
      } else {
        messages.unshift({
          role: 'system',
          content: 'Respond with valid JSON only.',
        });
      }
    }

    const response = await openai.chat.completions.create(params);
    const content = response.choices[0].message.content;

    console.log(`✅ Chat completion (${model}): ${response.usage.total_tokens} tokens`);

    return responseFormat ? JSON.parse(content) : content;
  } catch (error) {
    console.error('❌ Chat completion error:', error.message);
    throw error;
  }
}

/**
 * Generate text embedding
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} - Embedding vector (1536 dimensions)
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    const embedding = response.data[0].embedding;
    console.log(`✅ Embedding generated: ${embedding.length} dimensions`);

    return embedding;
  } catch (error) {
    console.error('❌ Embedding error:', error.message);
    throw error;
  }
}

/**
 * Generate chat completion with function calling
 * @param {Array} messages - Chat messages
 * @param {Array} tools - Function definitions
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} - Response with function calls
 */
async function chatCompletionWithTools(messages, tools, options = {}) {
  try {
    const {
      model = 'gpt-4-turbo',
      temperature = 0,
    } = options;

    const response = await openai.chat.completions.create({
      model,
      messages,
      tools,
      tool_choice: 'auto',
      temperature,
    });

    const message = response.choices[0].message;
    console.log(`✅ Chat with tools (${model}): ${response.usage.total_tokens} tokens`);

    return {
      content: message.content,
      toolCalls: message.tool_calls || [],
      finishReason: response.choices[0].finish_reason,
    };
  } catch (error) {
    console.error('❌ Chat with tools error:', error.message);
    throw error;
  }
}

module.exports = {
  openai,
  chatCompletion,
  generateEmbedding,
  chatCompletionWithTools,
};

