import type { Meta, StoryObj } from '@storybook/react';
import { FeedToolbar } from '@/components/features/feed/FeedToolbar';
import { FeedMobileList } from '@/components/features/feed/FeedMobileList';
import { mockSources, mockArticles, mockWatermark } from '@/stories/fixtures';
import type { ArticleRow } from '@/types';

/**
 * Page-level Feed composition stories.
 *
 * The actual Feed page is a Server Component that passes sources to FeedTable,
 * which fetches articles internally. Here we compose FeedToolbar + FeedMobileList
 * (the core visible parts) with fixture data to show the full page layout.
 */

interface FeedPageCompositionProps {
  articles: ArticleRow[];
  searchQuery?: string;
  feedWatermark?: string | null;
}

function FeedPageComposition({
  articles,
  searchQuery = '',
  feedWatermark = null,
}: FeedPageCompositionProps) {
  return (
    <div className="section-container py-6">
      <FeedToolbar
        sources={mockSources}
        sourceFilter=""
        categoryFilter=""
        readFilter="all"
        sortBy="date"
        isFetching={false}
        searchQuery={searchQuery}
        onSourceChange={() => {}}
        onCategoryChange={() => {}}
        onReadFilterChange={() => {}}
        onSortChange={() => {}}
        onFetch={() => {}}
        onSearchChange={() => {}}
      />
      <div className="flex items-center gap-3 text-sm text-(--muted-foreground) pb-2">
        <span>Showing {articles.length} of {articles.length} articles</span>
        {articles.filter((a) => !a.isRead).length > 0 && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {articles.filter((a) => !a.isRead).length} unread
          </span>
        )}
      </div>
      {articles.length === 0 ? (
        <div className="rounded-lg border border-(--border) px-3 py-16 text-center text-(--muted-foreground)">
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">No articles yet</span>
            <span className="text-xs">Add a source to start collecting articles.</span>
          </div>
        </div>
      ) : (
        /* Mobile list shown as representative layout */
        <FeedMobileList
          articles={articles}
          onToggleRead={() => {}}
          searchQuery={searchQuery}
          feedWatermark={feedWatermark}
        />
      )}
    </div>
  );
}

const meta = {
  title: 'Pages/Feed',
  component: FeedPageComposition,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FeedPageComposition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default feed',
  args: {
    articles: mockArticles,
    feedWatermark: mockWatermark,
  },
};

export const EmptyFeed: Story = {
  name: 'Empty feed',
  args: {
    articles: [],
    feedWatermark: null,
  },
};

export const WithSearchActive: Story = {
  name: 'With search active',
  args: {
    articles: mockArticles.filter((a) =>
      a.title.toLowerCase().includes('claude')
    ),
    searchQuery: 'Claude',
    feedWatermark: mockWatermark,
  },
};

export const AllRead: Story = {
  name: 'All articles read',
  args: {
    articles: mockArticles.map((a) => ({ ...a, isRead: true })),
    feedWatermark: mockWatermark,
  },
};
