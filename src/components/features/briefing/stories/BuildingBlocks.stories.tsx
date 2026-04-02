import type { Meta, StoryObj } from '@storybook/react';
import { SectionDivider } from '../SectionDivider';
import { CaughtUpState } from '../CaughtUpState';
import { ArchiveBanner } from '../ArchiveBanner';
import { PendingSection } from '../PendingSection';
import { ONE_HOUR_AGO, YESTERDAY, MOCK_PENDING } from '../__mocks__/briefing-data';

const meta = {
  title: 'Components/Briefing/Building Blocks',
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
  render: () => <PendingSection articles={MOCK_PENDING} />,
};
