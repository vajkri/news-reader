import type { Meta, StoryObj } from '@storybook/react';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { mockSources } from '@/stories/fixtures';

const meta = {
  title: 'UI/SourceAvatar',
  component: SourceAvatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
} satisfies Meta<typeof SourceAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sourceName: 'Anthropic Blog',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    sourceName: 'Anthropic Blog',
    size: 'sm',
  },
};

// --- Deterministic color mapping (all palette slots) ---

export const ColorPalette: StoryObj = {
  name: 'Color Palette (all slots)',
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-(--muted-foreground)">
        Colors are deterministic based on the source name character sum.
      </p>
      <div className="flex flex-wrap gap-3 items-center">
        {[
          'Anthropic Blog',   // hash maps to one of 6 palette colors
          'The Verge AI',
          'Hacker News',
          'OpenAI Blog',
          'Google DeepMind',
          'MIT Technology Review',
        ].map((name) => (
          <div key={name} className="flex flex-col items-center gap-1">
            <SourceAvatar sourceName={name} size="md" />
            <span className="text-xs text-(--muted-foreground) max-w-[64px] text-center leading-tight">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- Sizes side by side ---

export const BothSizes: StoryObj = {
  name: 'Both Sizes',
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <SourceAvatar sourceName="Anthropic Blog" size="md" />
        <span className="text-xs text-(--muted-foreground)">md (40px)</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <SourceAvatar sourceName="Anthropic Blog" size="sm" />
        <span className="text-xs text-(--muted-foreground)">sm (32px)</span>
      </div>
    </div>
  ),
};

// --- From fixture data ---

export const FromFixtures: StoryObj = {
  name: 'From Fixture Sources',
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      {mockSources.map((source) => (
        <div key={source.id} className="flex flex-col items-center gap-1">
          <SourceAvatar sourceName={source.name} size="md" />
          <span className="text-xs text-(--muted-foreground) max-w-[64px] text-center leading-tight">
            {source.name}
          </span>
        </div>
      ))}
    </div>
  ),
};
