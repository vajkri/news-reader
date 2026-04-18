import type { Meta, StoryObj } from '@storybook/react';
import { CaughtUpState } from '@/components/features/briefing/CaughtUpState';

const meta = {
  title: 'Features/Briefing/CaughtUpState',
  component: CaughtUpState,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CaughtUpState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Caught up',
  args: {
    lastVisit: '2026-04-03T09:00:00.000Z',
  },
};

export const EarlyMorning: Story = {
  name: 'Caught up (early morning visit)',
  args: {
    lastVisit: '2026-04-03T06:30:00.000Z',
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
  args: {
    lastVisit: '2026-04-03T09:00:00.000Z',
  },
};
