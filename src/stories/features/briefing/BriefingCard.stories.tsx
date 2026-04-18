import type { Meta, StoryObj } from '@storybook/react';
import { BriefingCard } from '@/components/features/briefing/BriefingCard';
import {
  mockBriefingArticleCritical,
  mockBriefingArticleNotable,
  mockBriefingArticles,
} from '@/stories/fixtures';

const meta = {
  title: 'Features/Briefing/BriefingCard',
  component: BriefingCard,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof BriefingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    article: mockBriefingArticles[1], // enriched, no thumbnail
  },
};

export const Critical: Story = {
  name: 'Critical importance (red border)',
  args: {
    article: mockBriefingArticleCritical,
  },
};

export const Important: Story = {
  name: 'Important (amber border)',
  args: {
    article: {
      ...mockBriefingArticles[2],
      importanceTier: 'important' as const,
    },
  },
};

export const Notable: Story = {
  name: 'Notable (no accent border)',
  args: {
    article: mockBriefingArticleNotable,
  },
};

export const NewArticle: Story = {
  name: 'New article badge',
  args: {
    article: mockBriefingArticleCritical,
    isNew: true,
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
  args: {
    article: mockBriefingArticles[1],
    isNew: true,
  },
};
