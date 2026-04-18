import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'critical', 'important', 'notable', 'new'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Individual variant stories ---

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Critical: Story = {
  args: { variant: 'critical', children: 'Critical' },
};

export const Important: Story = {
  args: { variant: 'important', children: 'Important' },
};

export const Notable: Story = {
  args: { variant: 'notable', children: 'Notable' },
};

export const New: Story = {
  args: { variant: 'new', children: 'New' },
};

// --- All variants at a glance ---

export const AllVariants: StoryObj = {
  name: 'All Variants',
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="critical">Critical</Badge>
      <Badge variant="important">Important</Badge>
      <Badge variant="notable">Notable</Badge>
      <Badge variant="new">New</Badge>
    </div>
  ),
};

// --- Importance tier context ---

export const ImportanceTiers: StoryObj = {
  name: 'Importance Tiers (in context)',
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge variant="critical">Critical</Badge>
        <span className="text-sm text-(--muted-foreground)">Score 8-10: must-read signal</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="important">Important</Badge>
        <span className="text-sm text-(--muted-foreground)">Score 5-7: worth reading</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="notable">Notable</Badge>
        <span className="text-sm text-(--muted-foreground)">Score 1-4: low priority</span>
      </div>
    </div>
  ),
};
