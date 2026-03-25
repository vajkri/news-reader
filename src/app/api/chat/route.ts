import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { CHAT_MODEL } from '@/lib/ai';
import {
  searchArticlesTool,
  articlesByTopicTool,
  recentArticlesTool,
} from '@/lib/chat-tools';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

const ChatRequestSchema = z.object({
  messages: z.array(
    z
      .object({
        role: z.enum(['system', 'user', 'assistant']),
        parts: z.array(z.any()),
      })
      .passthrough()
  ),
  articleContext: z
    .object({
      title: z.string(),
      source: z.string(),
      publishedAt: z.string().nullable(),
    })
    .optional(),
});

const SYSTEM_PROMPT = `You are the news assistant for an AI industry news tracker. You help a frontend developer stay on top of AI news collected from RSS feeds.

## What You Do Well
- Summarize what happened this week in AI (trend analysis across sources).
- Find articles about a specific company, model, or tool.
- Compare how different sources covered the same event.
- Explain the significance of a development in context of recent trends.

## Rules
- Lead with the answer. Do not open with acknowledgment phrases ("Great question!", "Sure!", "I'd be happy to help!").
- ONLY use information returned by your tools. Never fabricate news events, quotes, or details not in tool results.
- When citing articles, include the link as a markdown link: [Article Title](url). Mention the source name and approximate date.
- Keep responses concise and scannable. Use bullet points for multiple items.
- You may call multiple tools if needed for complex questions.

## Tool Selection
- "What's new" / "latest" / "this week" questions: use recentArticles.
- Specific company, product, or keyword: use searchArticles.
- Browse by category: use articlesByTopic.

## When You Cannot Help
- If no tool results match the query, say so in one sentence: "I don't have any articles about that in the database." Do not apologize or pad the response.
- You CANNOT browse the web, access URLs, or fetch live data.
- You CANNOT set up alerts, send emails, or take actions outside searching collected articles.
- If asked something outside your scope, state what you CAN do in one sentence.

## Formatting
- Use markdown: bullet points, bold for emphasis, headers for structure.
- Keep text scannable; no walls of text.`;

export async function POST(request: Request): Promise<Response> {
  let body: z.infer<typeof ChatRequestSchema>;
  try {
    const raw: unknown = await request.json();
    body = ChatRequestSchema.parse(raw);
  } catch {
    return Response.json(
      { error: 'invalid_request', message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { messages, articleContext } = body;

  // Rate limiting (D-04, D-05)
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { allowed, retryAfterMinutes } = await rateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: 'rate_limited', retryAfterMinutes },
      { status: 429 }
    );
  }

  // Build system prompt with optional article context (D-05)
  let systemPrompt = SYSTEM_PROMPT;
  if (articleContext?.title) {
    systemPrompt += `\n\nCONTEXT: The user is asking about a specific article: "${articleContext.title}" from ${articleContext.source}${articleContext.publishedAt ? `, published ${articleContext.publishedAt}` : ''}. Prioritize information about this article. Use the searchArticles tool with relevant keywords from the article title to find it. The user already sees the article title and source in the UI, so do NOT re-introduce or re-cite it at the top of your response. Jump straight into answering their question.`;
  }

  // Stream with tool-calling (D-01, D-02, D-03)
  const result = streamText({
    model: CHAT_MODEL,
    system: systemPrompt,
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
