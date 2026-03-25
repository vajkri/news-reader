/**
 * AI model string for Vercel AI Gateway.
 * Format: "provider/model-name.version"
 * AI_GATEWAY_API_KEY env var is read automatically by the ai package.
 */
export const AI_MODEL = 'google/gemini-2.5-flash-lite';

/**
 * Chat model for the conversational chat endpoint.
 * GPT-5 series quality with best-in-class tool-calling (D-03).
 */
export const CHAT_MODEL = 'openai/gpt-5-mini';
