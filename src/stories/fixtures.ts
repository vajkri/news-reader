import type { ArticleRow, SourceRow } from '@/types';

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export const mockSources: SourceRow[] = [
  {
    id: 1,
    name: 'Anthropic Blog',
    url: 'https://www.anthropic.com/news',
    category: 'announcements',
    createdAt: '2026-01-01T00:00:00.000Z',
    _count: { articles: 42 },
  },
  {
    id: 2,
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence',
    category: 'news',
    createdAt: '2026-01-02T00:00:00.000Z',
    _count: { articles: 128 },
  },
  {
    id: 3,
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'developer',
    createdAt: '2026-01-03T00:00:00.000Z',
    _count: { articles: 310 },
  },
  {
    id: 4,
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    category: 'announcements',
    createdAt: '2026-01-04T00:00:00.000Z',
    _count: { articles: 37 },
  },
];

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

export const mockWatermark = '2026-04-02T06:00:00.000Z';

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

/** Article with thumbnail, fully enriched, unread, published after watermark (shows NEW badge) */
const articleWithThumbnail: ArticleRow = {
  id: 1,
  guid: 'https://anthropic.com/news/claude-4',
  title: 'Introducing Claude 4: Extended Thinking and Multimodal Reasoning',
  link: 'https://anthropic.com/news/claude-4',
  description: 'Claude 4 brings extended thinking, improved multimodal reasoning, and a new 200K context window.',
  thumbnail: 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2Fplaceholder.png&w=3840&q=75',
  publishedAt: '2026-04-03T08:00:00.000Z',
  readTimeMin: 5,
  isRead: false,
  summary: 'Anthropic announces Claude 4 with extended thinking, 200K context, and better multimodal understanding.',
  topics: ['model releases', 'ai coding tools'],
  importanceScore: 9,
  enrichedAt: '2026-04-03T09:00:00.000Z',
  approvedAt: null,
  duplicateOf: null,
  contentType: 'announcement',
  thinContent: false,
  createdAt: '2026-04-03T08:30:00.000Z',
  sourceId: 1,
  source: { name: 'Anthropic Blog', category: 'announcements' },
};

/** Article without thumbnail, enriched, with topics */
const articleEnrichedNoThumbnail: ArticleRow = {
  id: 2,
  guid: 'https://theverge.com/ai/gpt5-benchmarks',
  title: 'GPT-5 Sets New Benchmarks in Reasoning and Code Generation',
  link: 'https://theverge.com/ai/gpt5-benchmarks',
  description: 'OpenAI releases GPT-5, showing major gains in math reasoning and programming tasks.',
  thumbnail: null,
  publishedAt: '2026-04-02T14:00:00.000Z',
  readTimeMin: 4,
  isRead: false,
  summary: 'GPT-5 outperforms prior models on MATH, HumanEval, and MMLU, with a new 128K context window.',
  topics: ['model releases', 'research & breakthroughs'],
  importanceScore: 8,
  enrichedAt: '2026-04-02T15:00:00.000Z',
  approvedAt: null,
  duplicateOf: null,
  contentType: 'news',
  thinContent: false,
  createdAt: '2026-04-02T14:30:00.000Z',
  sourceId: 2,
  source: { name: 'The Verge AI', category: 'news' },
};

/** Article unenriched (no summary, topics, or importanceScore) */
const articleUnenriched: ArticleRow = {
  id: 3,
  guid: 'https://news.ycombinator.com/item?id=40000001',
  title: 'Ask HN: Best resources for learning Rust in 2026?',
  link: 'https://news.ycombinator.com/item?id=40000001',
  description: null,
  thumbnail: null,
  publishedAt: '2026-04-01T10:00:00.000Z',
  readTimeMin: null,
  isRead: false,
  summary: null,
  topics: null,
  importanceScore: null,
  enrichedAt: null,
  approvedAt: null,
  duplicateOf: null,
  contentType: null,
  thinContent: null,
  createdAt: '2026-04-01T10:30:00.000Z',
  sourceId: 3,
  source: { name: 'Hacker News', category: 'developer' },
};

/** Read article (isRead: true) */
const articleRead: ArticleRow = {
  id: 4,
  guid: 'https://openai.com/blog/operator-update',
  title: 'Operator Agent: Six Months of Real-World Usage',
  link: 'https://openai.com/blog/operator-update',
  description: 'OpenAI shares learnings from six months of Operator deployment across enterprise customers.',
  thumbnail: null,
  publishedAt: '2026-03-28T09:00:00.000Z',
  readTimeMin: 7,
  isRead: true,
  summary: 'OpenAI shares real-world usage data from Operator: 80% task completion rate, common failure modes, and the roadmap.',
  topics: ['industry moves', 'ai coding tools'],
  importanceScore: 6,
  enrichedAt: '2026-03-28T10:00:00.000Z',
  approvedAt: null,
  duplicateOf: null,
  contentType: 'announcement',
  thinContent: false,
  createdAt: '2026-03-28T09:30:00.000Z',
  sourceId: 4,
  source: { name: 'OpenAI Blog', category: 'announcements' },
};

/** Article with very long title for truncation testing */
const articleLongTitle: ArticleRow = {
  id: 5,
  guid: 'https://theverge.com/ai/long-title-test',
  title: 'Google DeepMind Announces Gemini Ultra 2.0 with Native Code Execution, Real-Time Search, and a New 2 Million Token Context Window for Enterprise Customers',
  link: 'https://theverge.com/ai/long-title-test',
  description: 'A comprehensive look at the latest Gemini release targeting enterprise use cases.',
  thumbnail: null,
  publishedAt: '2026-03-25T12:00:00.000Z',
  readTimeMin: 6,
  isRead: false,
  summary: 'Gemini Ultra 2.0 brings 2M context, native code execution, and real-time search for enterprise.',
  topics: ['model releases', 'industry moves'],
  importanceScore: 7,
  enrichedAt: '2026-03-25T13:00:00.000Z',
  approvedAt: null,
  duplicateOf: null,
  contentType: 'news',
  thinContent: false,
  createdAt: '2026-03-25T12:30:00.000Z',
  sourceId: 2,
  source: { name: 'The Verge AI', category: 'news' },
};

/** Article published before watermark, unread (no NEW badge) */
const articleBeforeWatermark: ArticleRow = {
  id: 6,
  guid: 'https://anthropic.com/news/claude-code-update',
  title: 'Claude Code: New Agent Loop and Tool Use Improvements',
  link: 'https://anthropic.com/news/claude-code-update',
  description: 'The latest Claude Code update includes a smarter agent loop and expanded tool use.',
  thumbnail: null,
  publishedAt: '2026-04-01T08:00:00.000Z',
  readTimeMin: 3,
  isRead: false,
  summary: 'Claude Code gets a new agent loop and expanded tool use, reducing multi-step coding task errors.',
  topics: ['developer tools', 'ai coding tools'],
  importanceScore: 5,
  enrichedAt: '2026-04-01T09:00:00.000Z',
  approvedAt: null,
  duplicateOf: null,
  contentType: 'announcement',
  thinContent: false,
  createdAt: '2026-04-01T08:30:00.000Z',
  sourceId: 1,
  source: { name: 'Anthropic Blog', category: 'announcements' },
};

export const mockArticles: ArticleRow[] = [
  articleWithThumbnail,
  articleEnrichedNoThumbnail,
  articleUnenriched,
  articleRead,
  articleLongTitle,
  articleBeforeWatermark,
];
