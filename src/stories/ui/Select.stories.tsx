import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '@/components/ui/select';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select an option',
  },
};

export const WithOptions: StoryObj = {
  name: 'With Options',
  render: () => (
    <Select placeholder="All categories">
      <option value="announcements">Announcements</option>
      <option value="news">News</option>
      <option value="developer">Developer</option>
      <option value="research">Research</option>
    </Select>
  ),
};

export const WithSelectedValue: StoryObj = {
  name: 'With Selected Value',
  render: () => (
    <Select defaultValue="news">
      <option value="announcements">Announcements</option>
      <option value="news">News</option>
      <option value="developer">Developer</option>
      <option value="research">Research</option>
    </Select>
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <Select disabled placeholder="Disabled">
      <option value="news">News</option>
    </Select>
  ),
};

// --- All states at a glance ---

export const AllStates: StoryObj = {
  name: 'All States',
  render: () => (
    <div className="flex flex-col gap-3">
      <Select placeholder="All categories">
        <option value="announcements">Announcements</option>
        <option value="news">News</option>
        <option value="developer">Developer</option>
      </Select>
      <Select defaultValue="news">
        <option value="announcements">Announcements</option>
        <option value="news">News</option>
        <option value="developer">Developer</option>
      </Select>
      <Select disabled placeholder="Disabled" />
    </div>
  ),
};
