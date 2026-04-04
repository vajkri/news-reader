import type { Meta, StoryObj } from '@storybook/react';
import { SectionDivider } from '@/components/features/briefing/SectionDivider';
import { CaughtUpState } from '@/components/features/briefing/CaughtUpState';
import { ArchiveBanner } from '@/components/features/briefing/ArchiveBanner';
import { PendingSection } from '@/components/features/briefing/PendingSection';
import { ONE_HOUR_AGO, YESTERDAY, mockPendingBriefing } from '@/stories/fixtures';

const meta = {
  title: 'Features/Briefing/Building Blocks',
  parameters: { layout: 'padded' },
  decorators: [(Story: React.ComponentType) => <div style={{ maxWidth: 800, margin: '0 auto' }}><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const DividerNew: Story = {
  name: 'SectionDivider: new',
  render: () => <SectionDivider label="New since 7:34 PM" variant="new" />,
};

export const DividerReviewed: Story = {
  name: 'SectionDivider: reviewed',
  render: () => <SectionDivider label="Already reviewed" variant="reviewed" />,
};

export const CaughtUp: Story = {
  name: 'CaughtUpState',
  render: () => <CaughtUpState lastVisit={ONE_HOUR_AGO.toISOString()} />,
};

export const Archive: Story = {
  name: 'ArchiveBanner',
  render: () => <ArchiveBanner date={YESTERDAY} />,
};

export const Pending: Story = {
  name: 'PendingSection',
  render: () => <PendingSection articles={mockPendingBriefing} />,
};
