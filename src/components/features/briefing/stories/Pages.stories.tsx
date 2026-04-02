import type { Meta, StoryObj } from '@storybook/react';
import { SectionDivider } from '../SectionDivider';
import { CaughtUpState } from '../CaughtUpState';
import { ArchiveBanner } from '../ArchiveBanner';
import { PendingSection } from '../PendingSection';
import { TriageSection } from '../TriageSection';
import { TopicGroup } from '../TopicGroup';
import { StatusBar } from '../StatusBar';
import { DebugProvider } from '@/contexts/debug';
import {
  NOW, ONE_HOUR_AGO, YESTERDAY,
  MOCK_TOPIC_GROUPS, MOCK_REVIEWED_GROUPS, MOCK_PENDING, MOCK_TRIAGE,
} from '../__mocks__/briefing-data';

const meta = {
  title: 'Pages/Briefing',
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/briefing' } },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DebugProvider>
        <div style={{ maxWidth: 800, margin: '0 auto' }}><Story /></div>
      </DebugProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const LiveNewArticles: Story = {
  name: 'Live: new + reviewed',
  render: () => (
    <>
      <StatusBar newCount={4} lastVisit={ONE_HOUR_AGO} lastEnrichedAt={NOW.toISOString()} pendingCount={0} />
      <SectionDivider label="New since 7:34 PM" variant="new" />
      <div className="space-y-16">
        {MOCK_TOPIC_GROUPS.map((g) => <TopicGroup key={g.topic} group={g} isNew />)}
      </div>
      <SectionDivider label="Already reviewed" variant="reviewed" />
      <div className="space-y-16 opacity-50">
        {MOCK_REVIEWED_GROUPS.map((g) => <TopicGroup key={g.topic} group={g} />)}
      </div>
    </>
  ),
};

export const LiveCaughtUp: Story = {
  name: 'Live: caught up',
  render: () => (
    <>
      <StatusBar newCount={0} lastVisit={ONE_HOUR_AGO} lastEnrichedAt={NOW.toISOString()} pendingCount={0} />
      <CaughtUpState lastVisit={ONE_HOUR_AGO.toISOString()} />
      <SectionDivider label="Already reviewed" variant="reviewed" />
      <div className="space-y-16 opacity-50">
        {MOCK_REVIEWED_GROUPS.map((g) => <TopicGroup key={g.topic} group={g} />)}
      </div>
    </>
  ),
};

export const LiveWithTriage: Story = {
  name: 'Live: triage queue',
  render: () => (
    <>
      <StatusBar newCount={0} lastVisit={ONE_HOUR_AGO} lastEnrichedAt={NOW.toISOString()} pendingCount={0} />
      <TriageSection articles={MOCK_TRIAGE} />
      <CaughtUpState lastVisit={ONE_HOUR_AGO.toISOString()} />
    </>
  ),
};

export const LiveTriageAndNew: Story = {
  name: 'Live: triage + approved',
  render: () => (
    <>
      <StatusBar newCount={4} lastVisit={ONE_HOUR_AGO} lastEnrichedAt={NOW.toISOString()} pendingCount={0} />
      <TriageSection articles={MOCK_TRIAGE.slice(0, 1)} />
      <SectionDivider label="New since 7:34 PM" variant="new" />
      <div className="space-y-16">
        {MOCK_TOPIC_GROUPS.slice(0, 2).map((g) => <TopicGroup key={g.topic} group={g} isNew />)}
      </div>
    </>
  ),
};

export const LiveFullFlow: Story = {
  name: 'Live: full flow',
  render: () => (
    <>
      <StatusBar newCount={4} lastVisit={ONE_HOUR_AGO} lastEnrichedAt={NOW.toISOString()} pendingCount={3} />
      <TriageSection articles={MOCK_TRIAGE} />
      <SectionDivider label="New since 7:34 PM" variant="new" />
      <div className="space-y-16">
        {MOCK_TOPIC_GROUPS.slice(0, 2).map((g) => <TopicGroup key={g.topic} group={g} isNew />)}
      </div>
      <SectionDivider label="Already reviewed" variant="reviewed" />
      <div className="space-y-16 opacity-50">
        {MOCK_REVIEWED_GROUPS.map((g) => <TopicGroup key={g.topic} group={g} />)}
      </div>
      <PendingSection articles={MOCK_PENDING} />
    </>
  ),
};

export const ArchiveMode: Story = {
  name: 'Archive',
  render: () => (
    <>
      <ArchiveBanner date={YESTERDAY} />
      <div className="space-y-16">
        {MOCK_TOPIC_GROUPS.slice(0, 2).map((g) => <TopicGroup key={g.topic} group={g} />)}
      </div>
    </>
  ),
};

export const EmptyDay: Story = {
  name: 'Empty day',
  render: () => (
    <>
      <StatusBar newCount={0} lastVisit={ONE_HOUR_AGO} lastEnrichedAt={null} pendingCount={0} />
      <CaughtUpState lastVisit={ONE_HOUR_AGO.toISOString()} />
    </>
  ),
};
