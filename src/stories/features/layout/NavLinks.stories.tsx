import type { Meta, StoryObj } from '@storybook/react';
import { NavLinks } from '@/components/features/layout/NavLinks';

const meta = {
  title: 'Features/Layout/NavLinks',
  component: NavLinks,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof NavLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FeedActive: Story = {
  name: 'Feed active',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/',
      },
    },
  },
};

export const BriefingActive: Story = {
  name: 'Briefing active',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/briefing',
      },
    },
  },
};

export const SourcesActive: Story = {
  name: 'Sources active',
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/sources',
      },
    },
  },
};
