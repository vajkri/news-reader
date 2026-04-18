import type { Meta, StoryObj } from '@storybook/react';
import { FeedTable } from '@/components/features/feed/FeedTable';
import { mockSources, mockArticles, mockWatermark } from '@/stories/fixtures';

/**
 * Page-level Feed stories.
 *
 * The actual Feed page (src/app/page.tsx) renders FeedTable inside a
 * section-container. We do the same here, mocking fetch so FeedTable
 * gets fixture data without real API calls.
 */

const mockArticlesResponse = {
  articles: mockArticles,
  total: mockArticles.length,
};

const mockWatermarkResponse = { watermark: mockWatermark };

function makeFetchResponse(
  articlesPayload: typeof mockArticlesResponse,
  watermarkPayload: typeof mockWatermarkResponse | null,
) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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
    return window.fetch(input, init);
  };
}

type FetchDecorator = (Story: React.ComponentType) => React.ReactElement;

function withMockFetch(
  articlesPayload: typeof mockArticlesResponse,
  watermarkPayload: typeof mockWatermarkResponse | null = mockWatermarkResponse,
): FetchDecorator {
  function MockFetchDecorator(Story: React.ComponentType): React.ReactElement {
    // eslint-disable-next-line react-hooks/immutability
    window.fetch = makeFetchResponse(articlesPayload, watermarkPayload);
    return (
      <div className="section-container py-6">
        <Story />
      </div>
    );
  }
  MockFetchDecorator.displayName = 'MockFetchDecorator';
  return MockFetchDecorator;
}

const meta = {
  title: 'Pages/Feed',
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
  name: 'Default feed',
  decorators: [withMockFetch(mockArticlesResponse)],
};

export const EmptyFeed: Story = {
  name: 'Empty feed',
  args: { sources: mockSources },
  decorators: [withMockFetch({ articles: [], total: 0 })],
};

export const WithSearchResults: Story = {
  name: 'With search results (pre-filtered)',
  decorators: [
    withMockFetch({
      articles: mockArticles.filter((a) =>
        a.title.toLowerCase().includes('claude')
      ),
      total: 2,
    }),
  ],
};

export const AllRead: Story = {
  name: 'All articles read',
  decorators: [
    withMockFetch({
      articles: mockArticles.map((a) => ({ ...a, isRead: true })),
      total: mockArticles.length,
    }),
  ],
};
