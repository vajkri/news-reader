import type { Meta, StoryObj } from '@storybook/react';
import { HamburgerMenu } from '@/components/features/layout/HamburgerMenu';

const NAV_ITEMS = [
  { href: '/', label: 'Feed' },
  { href: '/briefing', label: 'Briefing' },
  { href: '/sources', label: 'Sources' },
];

const meta = {
  title: 'Features/Layout/HamburgerMenu',
  component: HamburgerMenu,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    navItems: NAV_ITEMS,
    onClose: () => {},
    pathname: '/',
  },
} satisfies Meta<typeof HamburgerMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    pathname: '/',
  },
};
