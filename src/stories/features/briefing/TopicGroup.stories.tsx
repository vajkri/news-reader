import type { Meta, StoryObj } from '@storybook/react';
import { TopicGroup } from '@/components/features/briefing/TopicGroup';
import { mockTopicGroup, mockTopicGroupSingle, mockTopicGroups } from '@/stories/fixtures';

const meta = {
  title: 'Features/Briefing/TopicGroup',
  component: TopicGroup,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TopicGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    group: mockTopicGroup,
  },
};

export const SingleArticle: Story = {
  name: 'Single article',
  args: {
    group: mockTopicGroupSingle,
  },
};

export const WithTopicIcon: Story = {
  name: 'With topic icon (model releases)',
  args: {
    group: {
      ...mockTopicGroup,
      topic: 'model releases',
    },
  },
};

export const DeveloperTools: Story = {
  name: 'Developer tools topic icon',
  args: {
    group: {
      ...mockTopicGroupSingle,
      topic: 'developer tools',
    },
  },
};

export const NewArticles: Story = {
  name: 'All articles marked new',
  args: {
    group: mockTopicGroup,
    isNew: true,
  },
};

export const AllGroups: StoryObj = {
  name: 'All topic groups',
  render: () => (
    <div className="space-y-16">
      {mockTopicGroups.map((group) => (
        <TopicGroup key={group.topic} group={group} />
      ))}
    </div>
  ),
};
