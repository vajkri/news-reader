import type { ArticleRow, SourceRow, BriefingArticle, TopicGroupData } from '@/types';

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
  thumbnail: null,
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

// ---------------------------------------------------------------------------
// Pending articles (unenriched, fetched within 48h)
// ---------------------------------------------------------------------------

export const mockPendingArticles = [
  {
    id: 10,
    title: 'Google I/O 2026: All the AI announcements',
    publishedAt: '2026-04-03T07:00:00.000Z',
    source: { name: 'The Verge AI' },
  },
  {
    id: 11,
    title: 'Meta releases Llama 4 with 1M context window',
    publishedAt: '2026-04-03T06:00:00.000Z',
    source: { name: 'Hacker News' },
  },
];

// ---------------------------------------------------------------------------
// BriefingArticles (ArticleRow + parsedTopics + importanceTier)
// ---------------------------------------------------------------------------

const briefingBase = (article: ArticleRow): BriefingArticle => ({
  ...article,
  parsedTopics: Array.isArray(article.topics) ? (article.topics as string[]) : ['Uncategorized'],
  importanceTier: !article.importanceScore || article.importanceScore <= 6
    ? 'notable'
    : article.importanceScore >= 9
      ? 'critical'
      : 'important',
});

export const mockBriefingArticles: BriefingArticle[] = [
  briefingBase(articleWithThumbnail),
  briefingBase(articleEnrichedNoThumbnail),
  briefingBase(articleLongTitle),
];

export const mockBriefingArticleCritical: BriefingArticle = briefingBase(articleWithThumbnail); // importanceScore: 9

export const mockBriefingArticleNotable: BriefingArticle = briefingBase(articleBeforeWatermark); // importanceScore: 5

// ---------------------------------------------------------------------------
// TopicGroupData
// ---------------------------------------------------------------------------

export const mockTopicGroup: TopicGroupData = {
  topic: 'model releases',
  articles: [
    briefingBase(articleWithThumbnail),
    briefingBase(articleEnrichedNoThumbnail),
  ],
  maxScore: 9,
};

export const mockTopicGroupSingle: TopicGroupData = {
  topic: 'developer tools',
  articles: [briefingBase(articleBeforeWatermark)],
  maxScore: 5,
};

export const mockTopicGroups: TopicGroupData[] = [
  mockTopicGroup,
  {
    topic: 'industry moves',
    articles: [briefingBase(articleLongTitle)],
    maxScore: 7,
  },
  mockTopicGroupSingle,
];

// ---------------------------------------------------------------------------
// Relative time anchors
// ---------------------------------------------------------------------------

export const NOW = new Date();
export const ONE_HOUR_AGO = new Date(NOW.getTime() - 60 * 60 * 1000);
export const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// Triage mock data
// ---------------------------------------------------------------------------

export const mockTriage = [
  {
    id: 30,
    title: 'Anthropic releases Claude 5 with extended thinking',
    summary: 'Claude 5 introduces extended thinking with visible chain-of-thought reasoning, enabling more transparent and accurate responses for complex tasks.',
    importanceScore: 9,
    source: { name: 'TechCrunch' },
  },
  {
    id: 31,
    title: 'Deno 5.0 drops Node.js compatibility layer',
    summary: 'Deno 5.0 removes the Node.js compatibility layer in favor of native APIs, reducing binary size by 40% and improving cold start times.',
    importanceScore: 7,
    source: { name: 'Hacker News' },
  },
  {
    id: 32,
    title: 'Microsoft acquires Figma rival Penpot',
    summary: 'Microsoft acquires open-source design tool Penpot for $400M, signaling renewed competition with Figma after the failed Adobe deal.',
    importanceScore: 8,
    source: { name: 'The Verge' },
  },
];

// ---------------------------------------------------------------------------
// Pending articles (for BuildingBlocks PendingSection story)
// ---------------------------------------------------------------------------

export const mockPendingBriefing = [
  { id: 20, title: 'Anthropic releases Claude 5 with extended thinking', publishedAt: ONE_HOUR_AGO.toISOString(), source: { name: 'TechCrunch' } },
  { id: 21, title: 'Deno 5.0 drops Node.js compatibility layer', publishedAt: ONE_HOUR_AGO.toISOString(), source: { name: 'Hacker News' } },
  { id: 22, title: 'Microsoft acquires Figma rival Penpot', publishedAt: ONE_HOUR_AGO.toISOString(), source: { name: 'The Verge' } },
];

// ---------------------------------------------------------------------------
// Enrichment simulation data (for Flows story)
// ---------------------------------------------------------------------------

export interface SimArticle {
  id: number;
  title: string;
  source: string;
  status: 'pending' | 'analyzing' | 'scoring' | 'done';
  aiOutput: string;
  score: number | null;
  tier: string | null;
  progress: number;
}

export const enrichmentArticles: SimArticle[] = [
  { id: 100, title: 'Anthropic releases Claude 5 with extended thinking', source: 'TechCrunch', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 101, title: 'Deno 5.0 drops Node.js compatibility layer', source: 'Hacker News', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 102, title: 'Microsoft acquires Figma rival Penpot', source: 'The Verge', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 103, title: 'Show HN: Zero-latency database branching for Postgres', source: 'Hacker News', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 104, title: 'WebGPU adoption hits 80% across modern browsers', source: 'Web.dev', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
];

export const aiOutputs: Record<number, { summary: string; score: number; tier: string }> = {
  100: { summary: 'Claude 5 introduces extended thinking with visible chain-of-thought reasoning, enabling more transparent and accurate responses for complex tasks.', score: 9, tier: 'critical' },
  101: { summary: 'Deno 5.0 removes the Node.js compatibility layer in favor of native APIs, reducing binary size by 40% and improving cold start times.', score: 7, tier: 'important' },
  102: { summary: 'Microsoft acquires open-source design tool Penpot for $400M, signaling renewed competition with Figma after the failed Adobe deal.', score: 8, tier: 'important' },
  103: { summary: 'A new Postgres extension enables copy-on-write database branching in under 50ms, making preview environments instant for CI/CD pipelines.', score: 7, tier: 'important' },
  104: { summary: 'WebGPU now ships in all major browsers including Safari, enabling GPU-accelerated ML inference and real-time 3D rendering on the web.', score: 6, tier: 'notable' },
};
