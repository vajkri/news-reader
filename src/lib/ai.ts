/**
 * AI model string for Vercel AI Gateway.
 * Format: "provider/model-name.version"
 * Evaluated 2026-03-25: selected over gemini-2.5-flash-lite, gemini-3.1-flash-lite-preview, gpt-4.1-mini.
 * AI_GATEWAY_API_KEY env var is read automatically by the ai package.
 */
export const AI_MODEL = 'deepseek/deepseek-v3.2';

/**
 * Chat model for the conversational chat endpoint.
 * GPT-5 series quality with best-in-class tool-calling (D-03).
 */
export const CHAT_MODEL = 'openai/gpt-5-mini';
