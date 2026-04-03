import type { Meta, StoryObj } from '@storybook/react';
import { FeedTable } from '@/components/features/feed/FeedTable';
import { mockSources, mockArticles, mockWatermark } from '@/stories/fixtures';

/**
 * FeedTable fetches articles from /api/articles and /api/feed-watermark internally.
 * We mock those fetch calls via the `fetch` parameter using Storybook's mock fetch support,
 * or simply let the component render with a mock fetch stub via a decorator.
 */

const mockArticlesResponse = {
  articles: mockArticles,
  total: mockArticles.length,
};

const mockWatermarkResponse = { watermark: mockWatermark };

function withMockFetch(
  articlesPayload: typeof mockArticlesResponse,
  watermarkPayload: typeof mockWatermarkResponse | null = mockWatermarkResponse,
) {
  return (Story: React.ComponentType) => {
    // Override global fetch within this story
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/feed-watermark')) {
        if (init?.method === 'POST') {
          return new Response(JSON.stringify({ watermark: mockWatermark }), { status: 200 });
        }
        if (watermarkPayload === null) {
          return new Response(null, { status: 404 });
        }
        return new Response(JSON.stringify(watermarkPayload), { status: 200 });
      }
      if (url.includes('/api/articles')) {
        return new Response(JSON.stringify(articlesPayload), { status: 200 });
      }
      return originalFetch(input, init);
    };
    return <Story />;
  };
}

const meta = {
  title: 'Features/Feed/FeedTable',
  component: FeedTable,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    sources: mockSources,
  },
} satisfies Meta<typeof FeedTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [withMockFetch(mockArticlesResponse)],
};

export const Empty: Story = {
  name: 'Empty state',
  args: {
    sources: mockSources,
  },
  decorators: [
    withMockFetch({ articles: [], total: 0 }),
  ],
};

export const NoSources: Story = {
  name: 'No sources (empty feed)',
  args: {
    sources: [],
  },
  decorators: [
    withMockFetch({ articles: [], total: 0 }),
  ],
};

export const WithSearchResults: Story = {
  name: 'With search results (pre-filtered)',
  decorators: [
    withMockFetch({
      articles: mockArticles.filter((a) => a.title.toLowerCase().includes('claude')),
      total: 2,
    }),
  ],
};

export const Loading: Story = {
  name: 'Loading skeleton',
  decorators: [
    (Story) => {
      // Never resolve so loading state persists
      window.fetch = async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('/api/feed-watermark') || url.includes('/api/articles')) {
          return new Promise(() => {}); // hang forever to show skeleton
        }
        return fetch(input);
      };
      return <Story />;
    },
  ],
};
