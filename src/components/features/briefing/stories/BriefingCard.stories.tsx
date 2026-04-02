import type { Meta, StoryObj } from '@storybook/react';
import { BriefingCard } from '../BriefingCard';
import { DebugProvider } from '@/contexts/debug';
import { CRITICAL_ARTICLE, IMPORTANT_ARTICLE, NOTABLE_ARTICLE } from '../__mocks__/briefing-data';

const meta = {
  title: 'Components/Briefing/BriefingCard',
  component: BriefingCard,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/briefing' } },
  },
  decorators: [
    (Story) => (
      <DebugProvider>
        <div style={{ maxWidth: 700, margin: '0 auto' }}><Story /></div>
      </DebugProvider>
    ),
  ],
} satisfies Meta<typeof BriefingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = { name: 'Critical (red border)', args: { article: CRITICAL_ARTICLE } };
export const Important: Story = { name: 'Important (amber border)', args: { article: IMPORTANT_ARTICLE } };
export const Notable: Story = { name: 'Notable (blue border)', args: { article: NOTABLE_ARTICLE } };
export const NewBadge: Story = { name: 'With "New" badge', args: { article: CRITICAL_ARTICLE, isNew: true } };
