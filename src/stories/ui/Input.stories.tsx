import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  name: 'With Placeholder',
  args: {
    placeholder: 'Search articles...',
  },
};

export const WithValue: Story = {
  name: 'With Value',
  args: {
    defaultValue: 'Claude Code',
    placeholder: 'Search articles...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Search disabled',
  },
};

// --- All states at a glance ---

export const AllStates: Story = {
  name: 'All States',
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <Input placeholder="Default" />
      <Input placeholder="Search articles..." />
      <Input defaultValue="Claude Code" placeholder="With value" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
};
