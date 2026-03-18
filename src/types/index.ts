export interface ArticleRow {
  id: number;
  guid: string;
  title: string;
  link: string;
  description: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  readTimeMin: number | null;
  isRead: boolean;
  sourceId: number;
  source: {
    name: string;
    category: string | null;
  };
}

export interface SourceRow {
  id: number;
  name: string;
  url: string;
  category: string | null;
  createdAt: string;
  _count: { articles: number };
}
