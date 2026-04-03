import type { Meta, StoryObj } from '@storybook/react';
import { FeedMobileList } from '@/components/features/feed/FeedMobileList';
import { mockArticles, mockWatermark } from '@/stories/fixtures';

const meta = {
  title: 'Features/Feed/FeedMobileList',
  component: FeedMobileList,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile375' },
  },
  args: {
    onToggleRead: () => {},
  },
} satisfies Meta<typeof FeedMobileList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    articles: mockArticles,
    feedWatermark: mockWatermark,
  },
};

export const WithNewBadges: Story = {
  name: 'With NEW badges',
  args: {
    articles: mockArticles.filter((a) => !a.isRead),
    feedWatermark: '2026-01-01T00:00:00.000Z', // very old watermark so all are "new"
  },
};

export const ReadUnreadMix: Story = {
  name: 'Read/unread mix',
  args: {
    articles: mockArticles,
    feedWatermark: null,
  },
};

export const Empty: Story = {
  args: {
    articles: [],
    feedWatermark: null,
  },
};

export const WithSearchHighlight: Story = {
  name: 'With search highlight',
  args: {
    articles: mockArticles,
    searchQuery: 'Claude',
    feedWatermark: null,
  },
};
