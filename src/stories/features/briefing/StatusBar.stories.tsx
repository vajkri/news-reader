import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from '@/components/features/briefing/StatusBar';

const meta = {
  title: 'Features/Briefing/StatusBar',
  component: StatusBar,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Morning visit: fresh articles since last night */
export const MorningVisit: Story = {
  name: 'Morning visit (new articles)',
  args: {
    newCount: 12,
    lastVisit: new Date('2026-04-02T22:00:00.000Z'),
    lastEnrichedAt: '2026-04-03T06:00:00.000Z',
    pendingCount: 0,
  },
};

/** Evening visit: articles accumulated through the day */
export const EveningVisit: Story = {
  name: 'Evening visit (accumulated)',
  args: {
    newCount: 27,
    lastVisit: new Date('2026-04-03T08:00:00.000Z'),
    lastEnrichedAt: '2026-04-03T18:00:00.000Z',
    pendingCount: 0,
  },
};

/** Caught up: no new articles */
export const CaughtUp: Story = {
  name: 'Caught up (zero new)',
  args: {
    newCount: 0,
    lastVisit: new Date('2026-04-03T09:00:00.000Z'),
    lastEnrichedAt: '2026-04-03T09:00:00.000Z',
    pendingCount: 0,
  },
};

/** Pending enrichment: articles waiting to be processed */
export const PendingEnrichment: Story = {
  name: 'Pending enrichment',
  args: {
    newCount: 5,
    lastVisit: new Date('2026-04-02T22:00:00.000Z'),
    lastEnrichedAt: '2026-04-03T06:00:00.000Z',
    pendingCount: 14,
  },
};

/** Never enriched */
export const NeverEnriched: Story = {
  name: 'Never enriched',
  args: {
    newCount: 0,
    lastVisit: null,
    lastEnrichedAt: null,
    pendingCount: 0,
  },
};
