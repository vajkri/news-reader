import type { Meta, StoryObj } from '@storybook/react';
import { TopicIcon, TOPIC_ICON_MAP } from '@/components/ui/TopicIcon';

const meta = {
  title: 'UI/TopicIcon',
  component: TopicIcon,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    topic: {
      control: 'select',
      options: [...Object.keys(TOPIC_ICON_MAP), 'unknown topic'],
    },
    size: {
      control: 'number',
      defaultValue: 16,
    },
  },
} satisfies Meta<typeof TopicIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Individual topic stories (one per TOPIC_ICON_MAP entry) ---

export const DeveloperTools: Story = {
  name: 'developer tools',
  args: { topic: 'developer tools' },
};

export const ModelReleases: Story = {
  name: 'model releases',
  args: { topic: 'model releases' },
};

export const IndustryMoves: Story = {
  name: 'industry moves',
  args: { topic: 'industry moves' },
};

export const ResearchBreakthroughs: Story = {
  name: 'research & breakthroughs',
  args: { topic: 'research & breakthroughs' },
};

export const AiRegulationPolicy: Story = {
  name: 'ai regulation & policy',
  args: { topic: 'ai regulation & policy' },
};

export const OpenSource: Story = {
  name: 'open source',
  args: { topic: 'open source' },
};

export const AiCodingTools: Story = {
  name: 'ai coding tools',
  args: { topic: 'ai coding tools' },
};

export const UnknownFallback: Story = {
  name: 'Unknown topic (fallback)',
  args: { topic: 'unknown topic' },
};

// --- All topics at a glance ---

export const AllTopics: StoryObj = {
  name: 'All Topics',
  render: () => (
    <div className="flex flex-wrap gap-4">
      {[...Object.keys(TOPIC_ICON_MAP), 'unknown topic'].map((topic) => (
        <div key={topic} className="flex flex-col items-center gap-1.5">
          <TopicIcon topic={topic} size={16} />
          <span className="text-xs text-(--muted-foreground) max-w-[80px] text-center leading-tight">
            {topic}
          </span>
        </div>
      ))}
    </div>
  ),
};
