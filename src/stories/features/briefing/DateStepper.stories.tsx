import type { Meta, StoryObj } from '@storybook/react';
import { DateStepper } from '@/components/features/briefing/DateStepper';

const meta = {
  title: 'Features/Briefing/DateStepper',
  component: DateStepper,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DateStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = {
  name: 'Today (default)',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: {},
      },
    },
  },
};

export const ArchiveDate: Story = {
  name: 'Archive date (prev day)',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: { date: '2026-04-02' },
      },
    },
  },
};

export const OlderArchive: Story = {
  name: 'Older archive date',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: { date: '2026-03-15' },
      },
    },
  },
};

export const MobileTouchTargets: Story = {
  name: 'Mobile touch targets (44px)',
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    nextjs: {
      navigation: {
        pathname: '/briefing',
        query: {},
      },
    },
  },
};
