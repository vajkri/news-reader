import type { Meta, StoryObj } from '@storybook/react';
import { TopicGroup } from '@/components/features/briefing/TopicGroup';
import { StatusBar } from '@/components/features/briefing/StatusBar';
import { CaughtUpState } from '@/components/features/briefing/CaughtUpState';
import { SectionDivider } from '@/components/features/briefing/SectionDivider';
import { ArchiveBanner } from '@/components/features/briefing/ArchiveBanner';
import { DateStepper } from '@/components/features/briefing/DateStepper';
import {
  mockTopicGroups,
  mockTopicGroup,
  mockTopicGroupSingle,
  mockPendingArticles,
} from '@/stories/fixtures';

/**
 * Page-level Briefing composition stories.
 *
 * The actual Briefing page is a Server Component that fetches from Prisma.
 * We compose the client components with fixture data to recreate each
 * meaningful state defined in D-16.
 *
 * 5 required states:
 * 1. Morning visit (fresh articles, not caught up)
 * 2. Evening visit (accumulated articles)
 * 3. Caught up (all articles read)
 * 4. Archive (viewing past date)
 * 5. Pending enrichment (articles without summaries)
 */

function BriefingHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-lg font-semibold text-(--foreground)">Daily Briefing</h1>
      <DateStepper />
    </div>
  );
}

// State 1: Morning visit
function MorningVisitPage() {
  const watermarkLabel = '10:00 PM';
  return (
    <div className="reading-container py-6">
      <BriefingHeader />
      <StatusBar
        newCount={12}
        lastVisit={new Date('2026-04-02T22:00:00.000Z')}
        lastEnrichedAt="2026-04-03T06:00:00.000Z"
        pendingCount={0}
      />
      <SectionDivider label={`New since ${watermarkLabel}`} variant="new" />
      <div className="space-y-16">
        {mockTopicGroups.map((group) => (
          <TopicGroup key={group.topic} group={group} isNew />
        ))}
      </div>
    </div>
  );
}

// State 2: Evening visit (accumulated articles)
function EveningVisitPage() {
  return (
    <div className="reading-container py-6">
      <BriefingHeader />
      <StatusBar
        newCount={27}
        lastVisit={new Date('2026-04-03T08:00:00.000Z')}
        lastEnrichedAt="2026-04-03T18:00:00.000Z"
        pendingCount={0}
      />
      <SectionDivider label="New since 8:00 AM" variant="new" />
      <div className="space-y-16">
        {mockTopicGroups.map((group) => (
          <TopicGroup key={group.topic} group={group} isNew />
        ))}
      </div>
      <SectionDivider label="Already reviewed" variant="reviewed" />
      <div className="space-y-16 text-(--muted-foreground)">
        <TopicGroup group={mockTopicGroupSingle} />
      </div>
    </div>
  );
}

// State 3: Caught up
function CaughtUpPage() {
  return (
    <div className="reading-container py-6">
      <BriefingHeader />
      <StatusBar
        newCount={0}
        lastVisit={new Date('2026-04-03T09:00:00.000Z')}
        lastEnrichedAt="2026-04-03T09:00:00.000Z"
        pendingCount={0}
      />
      <CaughtUpState lastVisit="2026-04-03T09:00:00.000Z" />
      <SectionDivider label="Already reviewed" variant="reviewed" />
      <div className="space-y-16 text-(--muted-foreground)">
        <TopicGroup group={mockTopicGroup} />
      </div>
    </div>
  );
}

// State 4: Archive view
function ArchivePage() {
  const archiveDate = new Date('2026-04-02T00:00:00.000Z');
  return (
    <div className="reading-container py-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="text-lg font-semibold text-(--foreground)">Daily Briefing</h1>
        <DateStepper />
      </div>
      <ArchiveBanner date={archiveDate} />
      <div className="space-y-16">
        {mockTopicGroups.map((group) => (
          <TopicGroup key={group.topic} group={group} />
        ))}
      </div>
    </div>
  );
}

// State 5: Pending enrichment
function PendingEnrichmentPage() {
  return (
    <div className="reading-container py-6">
      <BriefingHeader />
      <StatusBar
        newCount={3}
        lastVisit={new Date('2026-04-02T22:00:00.000Z')}
        lastEnrichedAt="2026-04-03T06:00:00.000Z"
        pendingCount={mockPendingArticles.length}
      />
      <div className="rounded-(--radius) bg-(--muted) border border-(--border) p-4 mb-6">
        <p className="text-sm font-medium text-(--foreground-secondary)">
          {mockPendingArticles.length} articles awaiting enrichment
        </p>
        <ul className="mt-2 space-y-1">
          {mockPendingArticles.map((a) => (
            <li key={a.id} className="text-sm text-(--muted-foreground)">
              {a.source.name}: {a.title}
            </li>
          ))}
        </ul>
      </div>
      <SectionDivider label="New since 10:00 PM" variant="new" />
      <div className="space-y-16">
        <TopicGroup group={mockTopicGroup} isNew />
      </div>
    </div>
  );
}

const meta = {
  title: 'Pages/Briefing',
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: {},
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const MorningVisit: Story = {
  name: '1. Morning visit (fresh articles)',
  render: () => <MorningVisitPage />,
};

export const EveningVisit: Story = {
  name: '2. Evening visit (accumulated)',
  render: () => <EveningVisitPage />,
};

export const CaughtUp: Story = {
  name: '3. Caught up (no new articles)',
  render: () => <CaughtUpPage />,
};

export const ArchiveView: Story = {
  name: '4. Archive (past date)',
  render: () => <ArchivePage />,
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
  render: () => <PendingEnrichmentPage />,
};
