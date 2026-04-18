import type { Meta, StoryObj } from '@storybook/react';
import { BriefingPageContent } from '@/components/features/briefing';
import type { BriefingPageContentProps } from '@/components/features/briefing';
import {
  mockTopicGroups,
  mockTopicGroup,
  mockTopicGroupSingle,
  mockTriage,
  mockPendingArticles,
} from '@/stories/fixtures';

/**
 * Page-level Briefing composition stories.
 *
 * Uses BriefingPageContent (the same component the RSC page renders)
 * with fixture data to recreate each meaningful state.
 *
 * 5 required states:
 * 1. Morning visit (fresh articles, not caught up)
 * 2. Evening visit (accumulated articles)
 * 3. Caught up (all articles read)
 * 4. Archive (viewing past date)
 * 5. Pending enrichment (articles without summaries)
 */

const meta = {
  title: 'Pages/Briefing',
  component: BriefingPageContent,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: {},
      },
    },
  },
} satisfies Meta<typeof BriefingPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const liveDefaults: BriefingPageContentProps & { isArchiveMode: false } = {
  isArchiveMode: false,
  watermark: new Date('2026-04-02T22:00:00.000Z'),
  watermarkLabel: '10:00 PM',
  newTopicGroups: mockTopicGroups,
  reviewedTopicGroups: [],
  pendingArticles: [],
  triageArticles: [],
  lastEnrichedAt: '2026-04-03T06:00:00.000Z',
};

export const MorningVisit: Story = {
  name: '1. Morning visit (fresh articles)',
  args: {
    ...liveDefaults,
  },
};

export const EveningVisit: Story = {
  name: '2. Evening visit (accumulated)',
  args: {
    ...liveDefaults,
    watermark: new Date('2026-04-03T08:00:00.000Z'),
    watermarkLabel: '8:00 AM',
    lastEnrichedAt: '2026-04-03T18:00:00.000Z',
    reviewedTopicGroups: [mockTopicGroupSingle],
  },
};

export const CaughtUp: Story = {
  name: '3. Caught up (no new articles)',
  args: {
    ...liveDefaults,
    watermark: new Date('2026-04-03T09:00:00.000Z'),
    watermarkLabel: '9:00 AM',
    lastEnrichedAt: '2026-04-03T09:00:00.000Z',
    newTopicGroups: [],
    reviewedTopicGroups: [mockTopicGroup],
  },
};

export const ArchiveView: Story = {
  name: '4. Archive (past date)',
  args: {
    isArchiveMode: true,
    archiveDate: new Date('2026-04-02T00:00:00.000Z'),
    topicGroups: mockTopicGroups,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: { date: '2026-04-02' },
      },
    },
  },
};

export const PendingEnrichment: Story = {
  name: '5. Pending enrichment',
  args: {
    ...liveDefaults,
    newTopicGroups: [mockTopicGroup],
    pendingArticles: mockPendingArticles,
    triageArticles: mockTriage,
  },
};
