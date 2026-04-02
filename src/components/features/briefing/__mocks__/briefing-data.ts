import type { BriefingArticle, TopicGroupData } from '@/types';

export const NOW = new Date();
export const ONE_HOUR_AGO = new Date(NOW.getTime() - 60 * 60 * 1000);
export const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);

export function mockArticle(overrides: Partial<BriefingArticle> & { id: number }): BriefingArticle {
  return {
    guid: `guid-${overrides.id}`,
    title: 'Untitled',
    link: '#',
    description: null,
    thumbnail: null,
    publishedAt: ONE_HOUR_AGO.toISOString(),
    readTimeMin: 4,
    isRead: false,
    summary: null,
    topics: null,
    importanceScore: 7,
    enrichedAt: NOW.toISOString(),
    contentType: 'news',
    thinContent: false,
    createdAt: ONE_HOUR_AGO.toISOString(),
    sourceId: 1,
    source: { name: 'Hacker News', category: 'tech' },
    parsedTopics: ['Uncategorized'],
    importanceTier: 'important',
    ...overrides,
  };
}

export const CRITICAL_ARTICLE = mockArticle({
  id: 1,
  title: 'OpenAI announces GPT-5.4 with native code execution',
  summary: 'GPT-5.4 can now execute code in a sandboxed environment during inference. This enables real-time data analysis, visualization, and tool use without separate API calls.',
  importanceScore: 9,
  importanceTier: 'critical',
  parsedTopics: ['Model Releases'],
  source: { name: 'TechCrunch', category: 'tech' },
});

export const IMPORTANT_ARTICLE = mockArticle({
  id: 2,
  title: 'Rust 2.0 RFC accepted with first-class async support',
  summary: 'The Rust team accepted the 2.0 RFC introducing native async traits and simplified lifetime syntax. This removes the need for async-trait crate in most use cases.',
  importanceScore: 8,
  importanceTier: 'important',
  parsedTopics: ['Developer Tools'],
});

export const NOTABLE_ARTICLE = mockArticle({
  id: 3,
  title: 'Show HN: A visual debugger for React Server Components',
  summary: 'A Chrome extension that visualizes RSC boundaries, server/client splits, and streaming waterfall. This helps developers identify unnecessary client components and optimize bundle size.',
  importanceScore: 6,
  importanceTier: 'notable',
  parsedTopics: ['Open Source'],
});

export const POLICY_ARTICLE = mockArticle({
  id: 4,
  title: 'EU AI Act enforcement begins: what developers need to know',
  summary: 'The first enforcement wave of the EU AI Act targets high-risk systems in healthcare and finance. This means mandatory risk assessments and documentation for AI models deployed in these sectors.',
  importanceScore: 8,
  importanceTier: 'important',
  parsedTopics: ['AI Regulation & Policy'],
  source: { name: 'The Verge', category: 'tech' },
});

export const MOCK_TOPIC_GROUPS: TopicGroupData[] = [
  { topic: 'Model Releases', articles: [CRITICAL_ARTICLE], maxScore: 9 },
  { topic: 'Developer Tools', articles: [IMPORTANT_ARTICLE], maxScore: 8 },
  { topic: 'AI Regulation & Policy', articles: [POLICY_ARTICLE], maxScore: 8 },
  { topic: 'Open Source', articles: [NOTABLE_ARTICLE], maxScore: 6 },
];

export const MOCK_REVIEWED_GROUPS: TopicGroupData[] = [
  {
    topic: 'Developer Tools',
    articles: [
      mockArticle({
        id: 10,
        title: 'Bun 2.0 ships with native S3 client and SQLite improvements',
        summary: 'Bun 2.0 includes a zero-dependency S3 client and 3x faster SQLite operations. This positions Bun as a full-stack runtime alternative to Node.js for backend services.',
        importanceScore: 7,
        importanceTier: 'important',
        parsedTopics: ['Developer Tools'],
      }),
    ],
    maxScore: 7,
  },
];

export const MOCK_PENDING = [
  { id: 20, title: 'Anthropic releases Claude 5 with extended thinking', publishedAt: ONE_HOUR_AGO.toISOString(), source: { name: 'TechCrunch' } },
  { id: 21, title: 'Deno 5.0 drops Node.js compatibility layer', publishedAt: ONE_HOUR_AGO.toISOString(), source: { name: 'Hacker News' } },
  { id: 22, title: 'Microsoft acquires Figma rival Penpot', publishedAt: ONE_HOUR_AGO.toISOString(), source: { name: 'The Verge' } },
];

export const MOCK_TRIAGE = [
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

export const ENRICHMENT_ARTICLES: SimArticle[] = [
  { id: 100, title: 'Anthropic releases Claude 5 with extended thinking', source: 'TechCrunch', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 101, title: 'Deno 5.0 drops Node.js compatibility layer', source: 'Hacker News', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 102, title: 'Microsoft acquires Figma rival Penpot', source: 'The Verge', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 103, title: 'Show HN: Zero-latency database branching for Postgres', source: 'Hacker News', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
  { id: 104, title: 'WebGPU adoption hits 80% across modern browsers', source: 'Web.dev', status: 'pending', aiOutput: '', score: null, tier: null, progress: 0 },
];

export const AI_OUTPUTS: Record<number, { summary: string; score: number; tier: string }> = {
  100: { summary: 'Claude 5 introduces extended thinking with visible chain-of-thought reasoning, enabling more transparent and accurate responses for complex tasks.', score: 9, tier: 'critical' },
  101: { summary: 'Deno 5.0 removes the Node.js compatibility layer in favor of native APIs, reducing binary size by 40% and improving cold start times.', score: 7, tier: 'important' },
  102: { summary: 'Microsoft acquires open-source design tool Penpot for $400M, signaling renewed competition with Figma after the failed Adobe deal.', score: 8, tier: 'important' },
  103: { summary: 'A new Postgres extension enables copy-on-write database branching in under 50ms, making preview environments instant for CI/CD pipelines.', score: 7, tier: 'important' },
  104: { summary: 'WebGPU now ships in all major browsers including Safari, enabling GPU-accelerated ML inference and real-time 3D rendering on the web.', score: 6, tier: 'notable' },
};
