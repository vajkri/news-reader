import type { ArticleRow } from '@/types';

export type ImportanceTier = 'critical' | 'important' | 'notable';

export interface BriefingArticle extends ArticleRow {
  parsedTopics: string[];
  importanceTier: ImportanceTier;
}

export interface TopicGroupData {
  topic: string;
  articles: BriefingArticle[];
  maxScore: number;
}

export function parseTopics(raw: string | null): string[] {
  if (!raw) return ['Uncategorized'];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['Uncategorized'];
  } catch {
    return ['Uncategorized'];
  }
}

export function scoreToTier(score: number | null): ImportanceTier {
  if (!score || score <= 6) return 'notable';
  if (score >= 9) return 'critical';
  return 'important'; // 7-8
}

export function groupArticlesByTopic(articles: ArticleRow[]): TopicGroupData[] {
  const groups = new Map<string, BriefingArticle[]>();

  for (const article of articles) {
    const topics = parseTopics(article.topics);
    const primaryTopic = topics[0];
    const enriched: BriefingArticle = {
      ...article,
      parsedTopics: topics,
      importanceTier: scoreToTier(article.importanceScore),
    };
    if (!groups.has(primaryTopic)) groups.set(primaryTopic, []);
    groups.get(primaryTopic)!.push(enriched);
  }

  return Array.from(groups.entries())
    .map(([topic, items]) => ({
      topic,
      articles: items,
      maxScore: Math.max(...items.map((a) => a.importanceScore ?? 0)),
    }))
    .sort((a, b) => b.maxScore - a.maxScore);
}
