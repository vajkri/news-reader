import type { Meta, StoryObj } from '@storybook/react';
import { FeedToolbar } from '@/components/features/feed/FeedToolbar';
import { mockSources } from '@/stories/fixtures';

const meta = {
  title: 'Features/Feed/FeedToolbar',
  component: FeedToolbar,
  parameters: {
    layout: 'padded',
  },
  args: {
    sources: mockSources,
    sourceFilter: '',
    categoryFilter: '',
    readFilter: 'all',
    sortBy: 'date',
    isFetching: false,
    searchQuery: '',
    onSourceChange: () => {},
    onCategoryChange: () => {},
    onReadFilterChange: () => {},
    onSortChange: () => {},
    onFetch: () => {},
    onSearchChange: () => {},
  },
} satisfies Meta<typeof FeedToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveSearch: Story = {
  name: 'With active search',
  args: {
    searchQuery: 'Claude',
  },
};

export const WithCategoryFilter: Story = {
  name: 'With category filter',
  args: {
    categoryFilter: 'announcements',
  },
};

export const UnreadFilter: Story = {
  name: 'Unread filter active',
  args: {
    readFilter: 'unread',
  },
};

export const Fetching: Story = {
  name: 'Fetching state',
  args: {
    isFetching: true,
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
};
