import type { Meta, StoryObj } from '@storybook/react';
import SourcesPage from '@/app/sources/page';
import { mockSources } from '@/stories/fixtures';

/**
 * Page-level Sources stories.
 *
 * Uses the actual SourcesPage client component from src/app/sources/page.tsx
 * with mock fetch to provide fixture data.
 */

type FetchDecorator = (Story: React.ComponentType) => React.ReactElement;

function withMockSourcesFetch(
  sources: typeof mockSources,
  shouldError = false,
): FetchDecorator {
  function MockFetchDecorator(Story: React.ComponentType): React.ReactElement {
    // eslint-disable-next-line react-hooks/immutability
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/sources')) {
        if (init?.method === 'DELETE') {
          return new Response(null, { status: 200 });
        }
        if (init?.method === 'POST') {
          return new Response(JSON.stringify({ id: 99, name: 'New Source', url: 'https://example.com/feed', category: null, createdAt: new Date().toISOString(), _count: { articles: 0 } }), { status: 201 });
        }
        if (shouldError) {
          return new Response(null, { status: 503, statusText: 'Service Unavailable' });
        }
        return new Response(JSON.stringify(sources), { status: 200 });
      }
      return window.fetch(input, init);
    };
    return <Story />;
  }
  MockFetchDecorator.displayName = 'MockFetchDecorator';
  return MockFetchDecorator;
}

const meta = {
  title: 'Pages/Sources',
  component: SourcesPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/sources',
      },
    },
  },
} satisfies Meta<typeof SourcesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default with sources',
  decorators: [withMockSourcesFetch(mockSources)],
};

export const Empty: Story = {
  name: 'No sources',
  decorators: [withMockSourcesFetch([])],
};

export const WithError: Story = {
  name: 'With load error',
  decorators: [withMockSourcesFetch([], true)],
};
