import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { CHAT_MODEL } from '@/lib/ai';
import {
  searchArticlesTool,
  articlesByTopicTool,
  recentArticlesTool,
} from '@/lib/chat-tools';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a news assistant for an AI industry news tracker. You answer questions about AI news articles collected from RSS feeds.

RULES:
- ONLY use information returned by your tools. Never fabricate news events, quotes, company announcements, or details not present in the tool results.
- If no articles match the user's question, say so clearly: "I don't have any articles about that topic in the database."
- When citing articles, mention the source name and approximate date.
- Keep answers concise and scannable. Use bullet points for multiple items.
- For "what's new" or "latest" questions, use the recentArticles tool.
- For specific topics or keywords, use the searchArticles tool.
- For topic-based browsing, use the articlesByTopic tool.
- You may call multiple tools if needed to answer a complex question.`;

export async function POST(request: Request): Promise<Response> {
  const { messages } = await request.json();

  // Rate limiting (D-04, D-05)
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const retryAfter = await checkRateLimit(ip);
  if (retryAfter !== null) {
    return Response.json(
      { error: 'rate_limited', retryAfterMinutes: retryAfter },
      { status: 429 }
    );
  }
  await incrementRateLimit(ip);

  // Stream with tool-calling (D-01, D-02, D-03)
  const result = streamText({
    model: CHAT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages.slice(-10)), // D-05: 10-turn history
    tools: {
      searchArticles: searchArticlesTool,
      articlesByTopic: articlesByTopicTool,
      recentArticles: recentArticlesTool,
    },
    stopWhen: stepCountIs(3), // tool-call -> tool-result -> final answer
  });

  return result.toUIMessageStreamResponse();
}
