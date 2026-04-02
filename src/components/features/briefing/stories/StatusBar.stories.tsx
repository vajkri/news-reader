import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from '../StatusBar';
import { NOW, ONE_HOUR_AGO } from '../__mocks__/briefing-data';

const meta = {
  title: 'Components/Briefing/StatusBar',
  component: StatusBar,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/briefing' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 800, margin: '0 auto' }}><Story /></div>],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewArticles: Story = {
  name: 'New articles (green)',
  args: { newCount: 15, lastVisit: ONE_HOUR_AGO, lastEnrichedAt: NOW.toISOString(), pendingCount: 3 },
};
export const CaughtUp: Story = {
  name: 'Caught up (zero)',
  args: { newCount: 0, lastVisit: ONE_HOUR_AGO, lastEnrichedAt: NOW.toISOString(), pendingCount: 0 },
};
export const ManyPending: Story = {
  name: 'Many pending',
  args: { newCount: 5, lastVisit: ONE_HOUR_AGO, lastEnrichedAt: NOW.toISOString(), pendingCount: 47 },
};
export const NeverEnriched: Story = {
  name: 'Never enriched',
  args: { newCount: 0, lastVisit: ONE_HOUR_AGO, lastEnrichedAt: null, pendingCount: 103 },
};
