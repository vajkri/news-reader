import type { Meta, StoryObj } from '@storybook/react';
import { TriageCard } from '../TriageCard';
import { MOCK_TRIAGE } from '../__mocks__/briefing-data';

const meta = {
  title: 'Components/Briefing/TriageCard',
  component: TriageCard,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/briefing' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 700, margin: '0 auto' }}><Story /></div>],
} satisfies Meta<typeof TriageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};
export const Critical: Story = { name: 'Critical (9/10)', args: { article: MOCK_TRIAGE[0], score: 9, onScoreChange: noop, onDismiss: noop } };
export const Important: Story = { name: 'Important (8/10)', args: { article: MOCK_TRIAGE[2], score: 8, onScoreChange: noop, onDismiss: noop } };
export const Notable: Story = { name: 'Notable (7/10)', args: { article: MOCK_TRIAGE[1], score: 7, onScoreChange: noop, onDismiss: noop } };
